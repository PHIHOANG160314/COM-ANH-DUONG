import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseAdminClient } from '../_shared/database.ts';
import { PaymentRequest } from '../_shared/types.ts';
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
    const requestData = (await req.json()) as PaymentRequest;
    const { orderId, amount, provider } = requestData;

    if (!orderId || !amount || !provider) {
      throw new Error('Missing required fields: orderId, amount, provider');
    }

    const requestId = crypto.randomUUID();
    let paymentStrategy: IPaymentStrategy;

    // Select Strategy
    if (provider === 'vnpay') {
      paymentStrategy = new VNPayStrategy();
    } else if (provider === 'momo') {
      paymentStrategy = new MoMoStrategy();
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // 1. Create Pending Transaction Record
    const { data: txn, error: insertError } = await supabase
      .from('payment_transactions')
      .insert({
        order_id: orderId,
        provider: provider,
        amount: amount,
        status: 'pending',
        request_id: requestId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('DB Insert Error:', insertError);
      throw new Error('Failed to create transaction record');
    }

    // 2. Generate Payment URL
    const response = await paymentStrategy.createPaymentUrl({
      ...requestData,
      // Ensure requestId used in DB matches what we send to provider
      // Note: Some strategies might override this if they use orderId as ref
    });

    // 3. Update Transaction with Payment URL and Gateway Transaction ID (if available immediately)
    await supabase
      .from('payment_transactions')
      .update({
        payment_url: response.paymentUrl,
        transaction_id: response.transactionId,
        // If the strategy generated a specific return URL (e.g. including params), update it
        // Otherwise it defaults to what was in the strategy config
      })
      .eq('id', txn.id);

    return new Response(
      JSON.stringify({
        paymentUrl: response.paymentUrl,
        transactionId: txn.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
