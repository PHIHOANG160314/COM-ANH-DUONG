---
title: "Phase 1: Database & Backend Foundation"
description: "Setup database schema and Supabase Edge Functions infrastructure for payment integration"
status: pending
priority: P1
effort: 3d
branch: feat/payment-backend-foundation
tags: [backend, database, payment, supabase]
created: 2026-01-31
---

## Context Links
- **Architecture Research:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/reports/researcher-260131-0556-payment-gateway-architecture.md`
- **VNPay Integration:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/reports/researcher-260131-0556-vnpay-integration.md`
- **MoMo Integration:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/reports/researcher-260131-0556-momo-payment-integration.md`

## Overview
**Date:** 2026-01-31
**Priority:** High
**Status:** Pending

This phase establishes the foundational infrastructure for the payment system. We will create the database schema to track transactions, configure the serverless environment using Supabase Edge Functions, and set up the necessary security policies and environment variables. This foundation supports the "Strategy Pattern" architecture where different payment providers (VNPay, MoMo) can be plugged in.

## Key Insights
- **Separation of Concerns:** Payment logic should reside in the backend (Edge Functions) to keep API secrets secure. The frontend should only receive a payment URL.
- **Idempotency:** Reconciling webhooks (IPNs) requires a robust database design that can handle duplicate notifications without processing the same transaction twice.
- **Shared Logic:** Both VNPay and MoMo require cryptographic signing, so a shared `crypto.ts` module in Edge Functions is essential.

## Requirements

### Functional Requirements
- **Data Storage:** Persist payment attempts, status changes, and provider responses.
- **Payment Creation:** API endpoint to initiate a payment and return a redirect URL.
- **Webhook Handling:** Secure endpoint to receive IPN (Instant Payment Notification) from providers.
- **Environment Config:** Secure management of sandbox credentials.

### Non-Functional Requirements
- **Security:** RLS policies must strictly control access. API keys must never be exposed to the client.
- **Performance:** Edge functions should handle requests with low latency.
- **Scalability:** Schema should support adding more providers (e.g., ZaloPay) in the future without major migrations.

## Architecture

### Database Schema
**Table:** `payment_transactions`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key (default: gen_random_uuid()) |
| `order_id` | UUID | FK to `orders.id` |
| `provider` | text | 'vnpay' \| 'momo' \| 'cash' |
| `amount` | integer | Amount in VND |
| `status` | text | 'pending' \| 'success' \| 'failed' \| 'expired' |
| `transaction_id` | text | Transaction ID from Gateway (nullable initially) |
| `request_id` | text | Unique key for idempotency |
| `payment_url` | text | The generated redirect URL |
| `return_url` | text | Where to redirect user after payment |
| `ipn_data` | jsonb | Raw webhook data for debugging/audit |
| `metadata` | jsonb | Extra info (e.g., bank code, user agent) |
| `created_at` | timestamptz | Creation time |
| `updated_at` | timestamptz | Last update |
| `completed_at` | timestamptz | When status became final |

**Indexes:**
- `idx_payment_transactions_order_id` (for UI lookups)
- `idx_payment_transactions_request_id` (for idempotency checks)
- `idx_payment_transactions_status` (for reconciliation jobs)

### Edge Functions Structure
```
react-app/supabase/functions/
├── create-payment/           # Public endpoint called by Client
│   ├── index.ts              # Entry point
│   └── strategies/           # Payment logic (stubbed for Phase 1)
│       ├── vnpay.ts
│       └── momo.ts
├── handle-webhook/           # Public endpoint called by Gateways
│   └── index.ts              # Entry point (validates signature & updates DB)
└── _shared/                  # Shared code
    ├── types.ts              # DB interfaces and API types
    ├── database.ts           # Supabase Admin Client setup
    └── crypto.ts             # Hashing/Signing utilities
```

## Related Code Files
- **Create:** `react-app/supabase/migrations/20260131_create_payment_transactions.sql`
- **Create:** `react-app/supabase/functions/create-payment/*`
- **Create:** `react-app/supabase/functions/handle-webhook/*`
- **Create:** `react-app/supabase/functions/_shared/*`
- **Modify:** `react-app/src/types/supabase-database-types.ts` (Auto-generated later, but noted)

## Implementation Steps

1.  **Database Migration Setup**
    - Create a new migration file `20260131_create_payment_transactions.sql`.
    - Define the `payment_transactions` table with constraints.
    - Add RLS policies:
        - `SELECT`: Authenticated users can see their own order's payments.
        - `INSERT`: Authenticated users can initiate (via service function, or restrict to service role if strictly using Edge Functions). *Decision: Service Role via Edge Function preferred.*
        - `UPDATE`: Service Role only (Webhooks).

2.  **Environment Configuration**
    - Define list of required secrets.
    - Create a script or manual instructions to set secrets in Supabase Dashboard/CLI.
    - **Variables:**
        - `VNP_TMN_CODE`, `VNP_HASH_SECRET`, `VNP_URL`, `VNP_RETURN_URL`
        - `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`, `MOMO_ENDPOINT`, `MOMO_RETURN_URL`

3.  **Shared Module Implementation**
    - Create `_shared/types.ts`: Define `PaymentRequest`, `PaymentResponse`, `TransactionStatus`.
    - Create `_shared/database.ts`: Setup Supabase Client with `SUPABASE_SERVICE_ROLE_KEY`.
    - Create `_shared/crypto.ts`: Stub functions for `hmacSHA512` (VNPay) and `hmacSHA256` (MoMo).

4.  **Create Payment Function Scaffold**
    - Implement `create-payment/index.ts`.
    - Setup CORS headers handling.
    - Implement basic request validation (amount, orderId, provider).
    - Insert initial "pending" record into `payment_transactions`.

5.  **Webhook Function Scaffold**
    - Implement `handle-webhook/index.ts`.
    - Setup CORS headers.
    - Implement logic to look up transaction by `request_id` or `order_id`.
    - Add placeholder for signature verification.

6.  **Testing Setup**
    - Create a test script `test-payment-flow.sh` using `curl`.
    - Verify database insertion upon `create-payment` call.

## Todo List
- [x] Create migration file for `payment_transactions` table
- [ ] Apply migration to local/remote Supabase instance
- [ ] Set up RLS policies for `payment_transactions` (Included in migration file)
- [x] Define and document all Environment Variables
- [x] Create `_shared` directory with `types.ts`, `database.ts`, `crypto.ts`
- [x] Implement `create-payment` Edge Function (scaffold)
- [x] Implement `handle-webhook` Edge Function (scaffold)
- [x] Create test script `test-payment-flow.sh`
- [ ] Deploy Edge Functions to project
- [ ] Verify End-to-End flow with `curl` (Create -> DB Entry)

## Success Criteria
- [ ] `payment_transactions` table exists with correct schema.
- [ ] RLS prevents a user from reading another user's payment info.
- [ ] `create-payment` function successfully creates a `pending` DB record.
- [ ] `handle-webhook` function is reachable and logs requests.
- [ ] All sensitive keys are stored in Supabase Secrets, not in code.

## Risk Assessment
- **Risk:** Edge Function cold starts affecting UX.
  - *Mitigation:* Keep functions lightweight; lightweight dependencies.
- **Risk:** Webhook delivery failures.
  - *Mitigation:* Ensure `handle-webhook` is idempotent and fast; return 200 OK quickly.

## Security Considerations
- **API Keys:** Never check in `.env` files with real keys. Use `supabase secrets set`.
- **Signature Verification:** Critical for Webhooks to prevent spoofing (will be fully implemented in Phase 2, but infrastructure set here).
- **HTTPS:** Enforce HTTPS for all function calls.
- **Idempotency:** Ensure `request_id` is unique and checked before creating new transactions.

## Next Steps
- Proceed to **Phase 2: Payment Strategies Implementation** to implement the actual VNPay and MoMo logic within the scaffolded functions.
