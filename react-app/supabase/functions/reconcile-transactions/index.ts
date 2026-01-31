import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseAdminClient } from '../_shared/database.ts';
import { VNPayStrategy } from '../_shared/strategies/vnpay.ts';
import { MoMoStrategy } from '../_shared/strategies/momo.ts';
import { IPaymentStrategy } from '../_shared/strategies/interface.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseAdminClient();

    // 1. Find stale pending transactions
    // "Stale" = created more than 15 minutes ago (and less than 24h to avoid checking ancient history)
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: txns, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', fifteenMinsAgo)
      .gt('created_at', twentyFourHoursAgo)
      .limit(20); // Process in batches

    if (fetchError) {
      throw fetchError;
    }

    if (!txns || txns.length === 0) {
      return new Response(JSON.stringify({ message: 'No stale transactions found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${txns.length} stale transactions to reconcile`);
    const results = [];

    // 2. Iterate and Check Status
    for (const txn of txns) {
      try {
        let strategy: IPaymentStrategy;
        if (txn.provider === 'vnpay') {
          strategy = new VNPayStrategy();
        } else if (txn.provider === 'momo') {
          strategy = new MoMoStrategy();
        } else {
          console.warn(`Unknown provider ${txn.provider} for txn ${txn.id}`);
          continue;
        }

        // VNPay needs transDate (YYYYMMDDHHmmss).
        // We can try to derive it from created_at or look in metadata if we stored it (we didn't explicitly store it in Phase 1 create-payment logic).
        // But created_at is standard ISO. We can format it to VN time.
        // Important: Use the same logic as create-payment to match the time sent to provider.
        // In create-payment: const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
        const txnDate = new Date(txn.created_at);
        const vnTime = new Date(txnDate.getTime() + 7 * 60 * 60 * 1000);
        const transDate = vnTime
          .toISOString()
          .replace(/[^0-9]/g, '')
          .slice(0, 14);

        const statusUpdate = await strategy.checkTransactionStatus({
          orderId: txn.order_id, // We used order_id as the ref
          transDate: transDate,
          ipAddr: '127.0.0.1', // Fallback IP
        });

        // 3. Update DB if status changed
        if (statusUpdate.status !== 'pending' && statusUpdate.status !== txn.status) {
          const { error: updateError } = await supabase
            .from('payment_transactions')
            .update({
              status: statusUpdate.status,
              transaction_id: statusUpdate.transactionId,
              updated_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
              metadata: { ...txn.metadata, reconciliation: statusUpdate.metadata },
            })
            .eq('id', txn.id);

          if (!updateError && statusUpdate.status === 'success') {
            // Update Order
            await supabase
              .from('orders')
              .update({
                payment_status: 'paid',
                status: 'confirmed',
              })
              .eq('id', txn.order_id);
          }
          results.push({ id: txn.id, status: statusUpdate.status });
        } else {
          results.push({ id: txn.id, status: 'unchanged' });
        }
      } catch (err) {
        console.error(`Error reconciling txn ${txn.id}:`, err);
        results.push({ id: txn.id, error: err.message });
      }
    }

    return new Response(JSON.stringify({ message: 'Reconciliation complete', results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Reconciliation Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
