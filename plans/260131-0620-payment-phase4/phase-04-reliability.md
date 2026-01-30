---
title: "Phase 4: Reliability & Reconciliation"
description: "Implement background jobs and querying logic to ensure payment consistency"
status: pending
priority: P2
effort: 3d
branch: feat/payment-reliability
tags: [backend, cron, reliability, vnpay, momo]
created: 2026-01-31
---

## Context Links
- **Phase 1 Plan:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/260131-0600-payment-phase1/phase-01-database-backend.md`
- **Phase 2 Plan:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/260131-0610-payment-phase2/phase-02-strategies.md`

## Overview
**Date:** 2026-01-31
**Priority:** Medium
**Status:** Pending

This phase ensures the system is robust against network failures (e.g., missed webhooks) and user drop-offs. We will implement a "Reconciliation Loop" that periodically checks "pending" transactions against the Payment Gateway's API to determine their final status. We will also enable `pg_cron` to schedule this check automatically.

## Key Insights
- **Active Inquiry:** We cannot rely solely on Webhooks (Passive). If a webhook is lost, the order remains pending forever.
- **Provider APIs:** Both VNPay and MoMo provide "Query Status" APIs. We need to implement these in our Strategy pattern.
- **Batch Processing:** The reconciliation job should handle batches of stale pending transactions (e.g., created > 15 mins ago).

## Requirements

### Functional Requirements
- **Query Status:** Extend `IPaymentStrategy` to support querying transaction status from the provider.
- **Background Job:** A scheduled task running every 15 minutes to check pending transactions.
- **Auto-Update:** If the provider says "Success", update DB and Order status. If "Failed", mark as failed.

### Non-Functional Requirements
- **Performance:** Do not overwhelm the provider API. Process in small batches (e.g., 10 at a time).
- **Security:** Use the same secure credentials managed in Phase 1/2.

## Architecture

### Strategy Extension
Update `IPaymentStrategy` to include:
```typescript
checkTransactionStatus(params: any): Promise<TransactionStatusUpdate>;
```

### Edge Function: `reconcile-transactions`
- **Trigger:** Scheduled via `pg_cron` (HTTP POST).
- **Logic:**
  1. Query `payment_transactions` for `status = 'pending'` AND `created_at < NOW() - 15 min`.
  2. Loop through results.
  3. Call `strategy.checkTransactionStatus`.
  4. Update DB.

### Database
- Enable `pg_cron` extension.
- Create a schedule.

## Related Code Files
- **Modify:** `react-app/supabase/functions/_shared/strategies/interface.ts`
- **Modify:** `react-app/supabase/functions/_shared/strategies/vnpay.ts`
- **Modify:** `react-app/supabase/functions/_shared/strategies/momo.ts`
- **Create:** `react-app/supabase/functions/reconcile-transactions/index.ts`
- **Create:** `react-app/supabase/migrations/20260131_enable_cron.sql`

## Implementation Steps

1.  **Extend Strategies**
    - Add `checkTransactionStatus` to interface.
    - **VNPay:** Implement "QueryDR" (Command: `querydr`). Needs `vnp_RequestId`, `vnp_OrderInfo`, `vnp_TransDate`.
    - **MoMo:** Implement "Query Transaction Status" (RequestType: `transactionStatus`). Needs `orderId`, `requestId`.

2.  **Implement Reconciliation Function**
    - Scaffold `reconcile-transactions`.
    - Implement the batch query logic using Supabase Admin Client.
    - Implement the iteration and update logic.

3.  **Setup Cron Job**
    - Create SQL migration to enable `pg_cron` (requires Supabase Pro or local setup, might be limited on free tier projects - *Note: On free tier, we might need to rely on GitHub Actions or external cron if pg_cron is not available. For this plan, we assume pg_cron availability or provide HTTP endpoint for external trigger.*).
    - *Alternative:* Use a `curl` command in a local cron or GitHub Action to hit the function URL.

## Todo List
- [x] Update `IPaymentStrategy` interface
- [x] Implement `checkTransactionStatus` in VNPay Strategy
- [x] Implement `checkTransactionStatus` in MoMo Strategy
- [x] Implement `reconcile-transactions` Edge Function
- [x] Create SQL for `pg_cron` setup
- [ ] Test reconciliation logic manually (create pending txn -> wait -> run function)

## Success Criteria
- [x] Function finds "stale" pending transactions. (Logic implemented)
- [x] Function correctly queries provider and updates status. (Strategy logic implemented)
- [x] System handles "Transaction not found" at provider (mark as failed/expired). (Implemented in strategy return)

## Risk Assessment
- **Risk:** `pg_cron` availability.
  - *Mitigation:* Expose function as secure HTTP endpoint; can be triggered by any scheduler.
- **Risk:** Rate limits on Provider Query API.
  - *Mitigation:* Limit batch size.

## Next Steps
- Final System Acceptance Testing.
