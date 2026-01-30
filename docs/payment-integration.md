# Payment Integration Guide (VNPay & MoMo)

**Status:** Implementation Complete
**Last Updated:** 2026-01-31

This guide details the integration of VNPay and MoMo payment gateways into the Cơm Ánh Dương POS system.

## 1. Architecture

The payment system follows the **Strategy Pattern** to support multiple providers while maintaining a consistent internal API.

### Components
- **Database:** `payment_transactions` table stores all attempts, linked to `orders`.
- **Backend (Supabase Edge Functions):**
  - `create-payment`: Initiates a transaction and returns a redirect URL.
  - `handle-webhook`: Receives IPN (Instant Payment Notification) from providers to update status.
  - `reconcile-transactions`: Background job to actively check transaction status (reliability).
- **Frontend (React):**
  - `PaymentMethodSelector`: UI for choosing provider.
  - `/checkout/result`: Return page for handling redirects from gateways.

## 2. Setup & Configuration

### Prerequisites
- Supabase Project with Edge Functions enabled.
- VNPay Sandbox Account.
- MoMo Business/Sandbox Account.

### Environment Variables (Supabase Secrets)
Run the following commands to set up your environment:

```bash
# VNPay
supabase secrets set VNP_TMN_CODE="your_tmn_code"
supabase secrets set VNP_HASH_SECRET="your_hash_secret"
supabase secrets set VNP_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
supabase secrets set VNP_RETURN_URL="http://localhost:5173/checkout/result"

# MoMo
supabase secrets set MOMO_PARTNER_CODE="your_partner_code"
supabase secrets set MOMO_ACCESS_KEY="your_access_key"
supabase secrets set MOMO_SECRET_KEY="your_secret_key"
supabase secrets set MOMO_ENDPOINT="https://test-payment.momo.vn/v2/gateway/api/create"
supabase secrets set MOMO_RETURN_URL="http://localhost:5173/checkout/result"
# For MoMo IPN, this must be your deployed function URL
supabase secrets set MOMO_IPN_URL="https://[project-ref].supabase.co/functions/v1/handle-webhook?provider=momo"
```

### Database Migration
Apply the migration to create tables and RLS policies:
```bash
supabase migration up
```

## 3. Testing

### Manual Testing (Sandbox)
1.  **Checkout:** Go to `/checkout`, select "VNPay" or "MoMo".
2.  **Redirect:** You should be redirected to the provider's sandbox page.
    - **VNPay Sandbox Cards:**
      - Card Number: `9704198526191432198`
      - Name: `NGUYEN VAN A`
      - Date: `07/15`
      - OTP: `123456`
    - **MoMo Sandbox:** Use the MoMo App (Dev mode) or simulate success on the provided web interface.
3.  **Return:** After payment, you are redirected to `/checkout/result`.
4.  **Verification:** Check the `payment_transactions` table in Supabase. Status should be `success`.

### Automated Reconciliation
The system includes a `pg_cron` job that runs every 15 minutes to check for "pending" transactions that may have missed the webhook.
- It calls `reconcile-transactions` Edge Function.
- It uses the provider's Query API to verify the actual status.

## 4. Troubleshooting

### "Invalid Signature" Error
- **VNPay:** Ensure `VNP_HASH_SECRET` is correct. Ensure parameters are sorted alphabetically before signing (handled by `VNPayStrategy`).
- **MoMo:** Ensure `MOMO_SECRET_KEY` is correct. Check if `MOMO_IPN_URL` matches exactly what was sent in the create request.

### CORS Errors
- Edge Functions are configured with CORS headers. Ensure your frontend domain is allowed if you restrict `Access-Control-Allow-Origin` (currently set to `*`).

## 5. Adding New Providers
To add a new provider (e.g., ZaloPay):
1.  Create `react-app/supabase/functions/_shared/strategies/zalopay.ts` implementing `IPaymentStrategy`.
2.  Update `react-app/supabase/functions/create-payment/index.ts` to select the new strategy.
3.  Update `react-app/supabase/functions/handle-webhook/index.ts` to handle the new provider's callback format.
4.  Add Frontend UI option in `PaymentMethodSelector`.
