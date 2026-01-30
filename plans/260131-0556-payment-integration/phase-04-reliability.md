# Phase 4: Reliability & Reconciliation

**Overview**
Ensure the system is robust against network failures and missing webhooks through background reconciliation jobs.

**Requirements**
- No double charges.
- Recover from lost webhooks (IPN).
- Mark timed-out transactions as failed.

**Architecture**
- **Idempotency:** Database constraints and logic checks.
- **Scheduling:** `pg_cron` extension in Supabase.

**Related Code Files**
- `supabase/functions/reconcile-transactions/index.ts`
- `sql/cron-jobs.sql`

**Implementation Steps**

1.  **Webhook Idempotency**
    - In `handle-webhook`:
      - Check if `provider_txn_id` exists in `payment_transactions`.
      - If status is already 'success', ignore update.
      - If not, process and update order status.

2.  **Reconciliation Logic**
    - Create Edge Function `reconcile-transactions`:
      - Query `payment_transactions` where status = 'pending' AND created_at < NOW() - 15 mins.
      - For each, call Provider Query API (VNPay/MoMo have APIs to check status).
      - Update DB based on API result.

3.  **Cron Job**
    - Enable `pg_cron` extension.
    - Schedule job to run every 10-30 minutes:
      - `SELECT cron.schedule('*/15 * * * *', 'select net.http_post(...)');` (Calling the Edge Function).

**Success Criteria**
- Webhook endpoints handle duplicate requests gracefully.
- Cron job runs successfully.
- Pending transactions are auto-resolved after 15 minutes.
