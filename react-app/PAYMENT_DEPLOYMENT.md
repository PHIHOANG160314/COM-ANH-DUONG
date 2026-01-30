# Payment Deployment Checklist

## Pre-Deployment
- [ ] **Supabase Project:** Ensure Supabase project is active and "Blaze" plan (or equivalent) is enabled if needed for Edge Functions.
- [ ] **Payment Accounts:** Have valid Merchant accounts for VNPay and MoMo (Sandbox or Production).
- [ ] **Secrets:** Gather all API Keys, Secret Keys, and Merchant Codes.

## 1. Supabase Edge Functions Setup

The payment system relies on 3 Edge Functions: `create-payment`, `handle-webhook`, and `reconcile-transactions`.

### Deploy Functions
Run from the root of the repo (or `react-app` depending on your structure, adjust path accordingly):
```bash
npx supabase functions deploy create-payment --project-ref <project-id>
npx supabase functions deploy handle-webhook --project-ref <project-id>
npx supabase functions deploy reconcile-transactions --project-ref <project-id>
```

### Configure Secrets (Production)
Set these in Supabase Dashboard > Edge Functions > Secrets, or via CLI:
```bash
npx supabase secrets set --project-ref <project-id> \
  VNPAY_TMN_CODE=... \
  VNPAY_HASH_SECRET=... \
  VNPAY_URL=https://pay.vnpay.vn/vpcpay.html \
  MOMO_PARTNER_CODE=... \
  MOMO_ACCESS_KEY=... \
  MOMO_SECRET_KEY=... \
  MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create
```
*Note: For Sandbox, use the sandbox URLs provided by VNPay/MoMo.*

## 2. Environment Variables (Vercel)

Add the following to Vercel Project Settings > Environment Variables:

| Variable | Value (Example) |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://<project-id>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `<your-anon-key>` |
| `VITE_PAYMENT_SANDBOX_MODE` | `false` (for Production) or `true` (for Testing) |

## 3. Webhook Registration (IPN)

You must tell the payment gateways where to send transaction results.
**URL:** `https://<project-id>.supabase.co/functions/v1/handle-webhook`

- **VNPay:** Email support or configure in Merchant Portal.
- **MoMo:** Configure in MoMo Business Portal.

## 4. Post-Deployment Testing

1.  **Frontend Check:** Go to Checkout. Is "Pay with VNPay" / "Pay with MoMo" visible?
2.  **Order Creation:** Place an order. Does it redirect to the payment gateway?
3.  **Payment Success:** Complete payment (or simulate success). Does it redirect back to the "Order Success" page?
4.  **Status Update:** Check Supabase `orders` table. Does `payment_status` change to `paid`? (This confirms Webhook is working).

## Troubleshooting

-   **Redirects to 404:** Check Vercel `rewrites` configuration.
-   **Payment Fails:** Check Supabase Edge Function logs in the Dashboard.
-   **"Order Pending" forever:** Webhook failed. Check `handle-webhook` logs and IPN configuration.
