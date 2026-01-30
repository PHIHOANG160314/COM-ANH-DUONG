import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseAdminClient } from "../_shared/database.ts";
import { VNPayStrategy } from "../_shared/strategies/vnpay.ts";
import { MoMoStrategy } from "../_shared/strategies/momo.ts";
import { IPaymentStrategy } from "../_shared/strategies/interface.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const url = new URL(req.url);
    const provider = url.searchParams.get("provider");

    if (!provider) {
        throw new Error("Missing provider parameter");
    }

    let paymentStrategy: IPaymentStrategy;
    if (provider === "vnpay") {
      paymentStrategy = new VNPayStrategy();
    } else if (provider === "momo") {
      paymentStrategy = new MoMoStrategy();
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Get parameters based on Content-Type
    // VNPay sends GET query params usually (for return URL), but IPN is often GET too?
    // Actually VNPay IPN is GET with query params.
    // MoMo IPN is POST with JSON body.
    let params: any = {};
    const contentType = req.headers.get("content-type") || "";

    if (req.method === "GET") {
        const searchParams = url.searchParams;
        searchParams.forEach((value, key) => {
            params[key] = value;
        });
        // Remove 'provider' from params if it was mixed in, though usually it's our own param
        delete params['provider'];
    } else if (req.method === "POST") {
        if (contentType.includes("application/json")) {
            params = await req.json();
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
            const formData = await req.formData();
            formData.forEach((value, key) => {
                params[key] = value.toString();
            });
        }
    }

    console.log(`Received ${provider} IPN:`, JSON.stringify(params));

    // 1. Verify Signature
    const isValid = await paymentStrategy.verifyWebhook(params);
    if (!isValid) {
        console.error("Invalid Signature");
        return new Response(
            JSON.stringify({ message: "Invalid Signature", RspCode: "97" }), // 97 is VNPay code for invalid signature
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200, // Return 200 even for error to acknowledge receipt, but with error code payload
            }
        );
    }

    // 2. Parse Status
    const statusUpdate = paymentStrategy.parseWebhookData(params);
    console.log("Parsed Status:", statusUpdate);

    // 3. Update Database
    // We need to find the transaction.
    // VNPay sends vnp_TxnRef which is our orderId (or transaction request_id depending on how we set it).
    // In create-payment, we set vnp_TxnRef = orderId.
    // MoMo sends requestId or orderId.

    // Let's try to find by order_id first, as that's what we used for Ref.
    // Ideally we should use the internal transaction ID or request_id to avoid ambiguity if multiple attempts.
    // But for Phase 1/2 we used orderId as the ref key.

    // Better: In strategy, we should return the identifier used for lookup.
    // For now, let's assume transactionId in statusUpdate maps to something we stored,
    // OR we look at the raw params again if needed.
    // VNPay: vnp_TxnRef = orderId
    // MoMo: orderId = orderId

    let dbQuery = supabase.from("payment_transactions").select("id, status, order_id");

    if (provider === 'vnpay') {
        // vnp_TxnRef was set to orderId
        dbQuery = dbQuery.eq("order_id", params['vnp_TxnRef']).eq("status", "pending");
        // Note: Using order_id might be risky if multiple pending payments for same order.
        // But usually only one pending payment active.
    } else if (provider === 'momo') {
        // orderId was set to orderId
        dbQuery = dbQuery.eq("order_id", params['orderId']).eq("status", "pending");
    }

    // Order by created_at desc to get latest attempt
    const { data: txns, error: findError } = await dbQuery.order('created_at', { ascending: false }).limit(1);

    if (findError || !txns || txns.length === 0) {
        console.error("Transaction not found for update");
        // Proceed to return success to gateway to stop retries, but log error
    } else {
        const txn = txns[0];
        if (txn.status === 'pending') {
             const { error: updateError } = await supabase
                .from("payment_transactions")
                .update({
                    status: statusUpdate.status,
                    transaction_id: statusUpdate.transactionId, // Update with actual Gateway ID (e.g. VNPay TransactionNo)
                    ipn_data: params,
                    updated_at: new Date().toISOString(),
                    completed_at: statusUpdate.status === 'success' ? new Date().toISOString() : null
                })
                .eq("id", txn.id);

             if (updateError) console.error("DB Update Error:", updateError);

             // If success, we should also update the ORDER status
             if (statusUpdate.status === 'success') {
                 await supabase
                    .from("orders")
                    .update({
                        payment_status: 'paid',
                        status: 'confirmed' // Auto-confirm paid orders? Or just keep pending but paid?
                    })
                    .eq("id", txn.order_id);
             }
        }
    }

    // 4. Return Success Response
    let responseBody = {};
    if (provider === 'vnpay') {
        responseBody = { RspCode: '00', Message: 'Confirm Success' };
    } else if (provider === 'momo') {
        responseBody = { message: 'Success', resultCode: 0 }; // or just 204 No Content
    }

    return new Response(
      JSON.stringify(responseBody),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
