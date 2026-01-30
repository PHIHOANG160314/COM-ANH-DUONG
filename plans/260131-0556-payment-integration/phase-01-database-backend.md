# Phase 1: Database & Backend Foundation

**Overview**
Set up the necessary database schema to track payment transactions and configure the server-less environment (Supabase Edge Functions) to handle secure payment processing logic.

**Requirements**
- Store transaction details separately from orders.
- Securely store API keys for payment providers.
- Establish endpoints for payment creation and webhook handling.

**Architecture**
- **Database:** New `payment_transactions` table linked to `orders`.
- **Security:** RLS to allow users to view their own transactions; Service role for updates via Webhook.
- **Compute:** Supabase Edge Functions.

**Related Code Files**
- `sql/schema.sql` (or new migration file)
- `supabase/functions/create-payment/index.ts` (New)
- `supabase/functions/handle-webhook/index.ts` (New)

**Implementation Steps**

1.  **Database Migration**
    - Create `payment_transactions` table:
      - `id` (UUID, PK)
      - `order_id` (UUID, FK to orders)
      - `provider` (varchar: 'vnpay', 'momo')
      - `amount` (int)
      - `status` (varchar: 'pending', 'success', 'failed')
      - `provider_txn_id` (varchar, for idempotency)
      - `raw_response` (jsonb)
    - Enable RLS.
    - Add policy: `Select` for auth users where `order_id` belongs to them.

2.  **Environment Setup**
    - Set Supabase Secrets:
      - `VNP_TMN_CODE`, `VNP_HASH_SECRET`, `VNP_URL`
      - `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`

3.  **Edge Functions Scaffold**
    - Initialize `create-payment` function.
    - Initialize `handle-webhook` function.
    - Configure CORS for functions.

**Success Criteria**
- Table exists and is queryable.
- Edge functions are deployed and respond to simple `curl` requests.
- Secrets are accessible inside Edge Functions.
