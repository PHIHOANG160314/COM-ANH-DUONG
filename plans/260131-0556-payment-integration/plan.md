# Payment Gateway Integration Plan

**Status:** Completed
**Priority:** High
**Context:** Integration of VNPay and MoMo payment gateways into the Restaurant POS.

## Research
- [x] Architecture Research: `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/reports/researcher-260131-0556-payment-gateway-architecture.md`

## Overview
This plan implements a multi-gateway payment system using the Strategy pattern. It involves database schema updates, Supabase Edge Functions for secure processing, and frontend updates for the payment flow.

## Phases

### Phase 1: Database & Backend Foundation
- **Goal:** Setup data storage and secure processing environment.
- **Status:** Completed
- **Plan:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/260131-0600-payment-phase1/phase-01-database-backend.md`
- **Tasks:**
  - [x] Design `payment_transactions` table schema.
  - [x] Design Edge Function structure.
  - [x] Create `payment_transactions` table migration in Supabase.
  - [x] Configure RLS policies for transactions (in migration).
  - [x] Setup Supabase Vault/Env vars for VNPay/MoMo secrets (documented).
  - [x] Initialize Edge Function `create-payment`.
  - [x] Initialize Edge Function `handle-webhook` (IPN).

### Phase 2: Payment Strategies Implementation
- **Goal:** Implement the logic for specific providers.
- **Status:** Completed
- **Plan:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/260131-0610-payment-phase2/phase-02-strategies.md`
- **Tasks:**
  - [x] Implement `PaymentStrategy` interface.
  - [x] Implement VNPay Strategy (URL generation, Signature verification).
  - [x] Implement MoMo Strategy (URL generation, Signature verification).
  - [x] Integrate strategies into Edge Functions.

### Phase 3: Frontend Integration
- **Goal:** Allow users to select payment methods and complete transactions.
- **Status:** Completed
- **Plan:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/260131-0615-payment-phase3/phase-03-frontend.md`
- **Tasks:**
  - [x] Update `CheckoutPage` to include payment method selection.
  - [x] Create Payment Method Selection UI (Cash, VNPay, MoMo).
  - [x] Implement API call to `create-payment` Edge Function.
  - [x] Create `/checkout/result` page to handle return from gateway.
  - [ ] Implement polling/status check for POS (deferred to Phase 4).

### Phase 4: Reliability & Reconciliation
- **Goal:** Ensure data consistency and handle edge cases.
- **Status:** Completed
- **Plan:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/260131-0620-payment-phase4/phase-04-reliability.md`
- **Tasks:**
  - [x] Implement Idempotency in Webhook receiver.
  - [x] Setup `pg_cron` job for reconciliation (check pending txns).
  - [x] Handle failed/expired transactions in UI.
  - [x] Implement Active Inquiry strategies (VNPay QueryDR, MoMo TransactionStatus).

## Dependencies
- VNPay Sandbox Credentials
- MoMo Sandbox Credentials
- Supabase Edge Functions environment

## Unresolved Questions
- Refund policy requirements? (Deferred to future phase)
- Split payment requirements? (Deferred to future phase)
- Production domain for whitelist? (Needed before Go Live)
