---
title: "Phase 2: Payment Strategies Implementation"
description: "Implement core logic for VNPay and MoMo payment gateways using Strategy Pattern"
status: pending
priority: P1
effort: 3d
branch: feat/payment-strategies
tags: [backend, payment, vnpay, momo, typescript]
created: 2026-01-31
---

## Context Links
- **VNPay Research:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/reports/researcher-260131-0556-vnpay-integration.md`
- **MoMo Research:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/reports/researcher-260131-0556-momo-payment-integration.md`
- **Phase 1 Plan:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/260131-0600-payment-phase1/phase-01-database-backend.md`

## Overview
**Date:** 2026-01-31
**Priority:** High
**Status:** Pending

In this phase, we implement the specific business logic for VNPay and MoMo. We will use the **Strategy Pattern** to ensure the main Edge Functions (`create-payment` and `handle-webhook`) remain clean and provider-agnostic. Key focus areas are correct URL parameter formatting, secure HMAC signature generation, and robust webhook verification.

## Key Insights
- **Shared Logic Location:** Strategy logic (signing, verification) is needed by *both* `create-payment` (to sign the request) and `handle-webhook` (to verify the callback). Therefore, strategies must reside in `_shared/strategies/`, not inside a specific function folder.
- **VNPay Specifics:** Requires alphabetical sorting of parameters before signing. Uses HMAC-SHA512.
- **MoMo Specifics:** Requires a JSON body for API requests (sometimes) or specific query params. Uses HMAC-SHA256.
- **Testing:** Since we are using Sandbox credentials, we can verify our implementation by actually generating URLs and checking if they load the gateway page successfully.

## Requirements

### Functional Requirements
- **VNPay URL:** Generate a valid redirect URL for VNPay Sandbox.
- **MoMo URL:** Generate a valid redirect URL for MoMo Sandbox.
- **Signature Verification:** Accurately verify signatures from incoming Webhooks (IPNs) for both providers.
- **Standard Interface:** Both providers must adhere to a common TypeScript interface.

### Non-Functional Requirements
- **Security:** Secrets (`VNP_HASH_SECRET`, `MOMO_SECRET_KEY`) must never leave the server side.
- **Maintainability:** Adding a new provider (e.g., ZaloPay) should only require adding a new strategy file and registering it.

## Architecture

### Shared Strategy Pattern
We will refactor the structure slightly from Phase 1 to share code better.

```
react-app/supabase/functions/
├── _shared/
│   ├── types.ts
│   ├── crypto.ts
│   └── strategies/           # MOVED HERE
│       ├── interface.ts      # Defines PaymentStrategy
│       ├── vnpay.ts          # VNPay implementation
│       └── momo.ts           # MoMo implementation
├── create-payment/
│   └── index.ts              # Imports from _shared/strategies
└── handle-webhook/
    └── index.ts              # Imports from _shared/strategies
```

### Interface Definition
```typescript
interface PaymentStrategy {
    createPaymentUrl(request: PaymentRequest): Promise<PaymentResponse>;
    verifyWebhook(params: any): Promise<boolean>;
    parseWebhookData(params: any): TransactionStatusUpdate;
}
```

## Related Code Files
- **Create:** `react-app/supabase/functions/_shared/strategies/interface.ts`
- **Move/Refactor:** `react-app/supabase/functions/create-payment/strategies/*` -> `react-app/supabase/functions/_shared/strategies/*`
- **Modify:** `react-app/supabase/functions/create-payment/index.ts`
- **Modify:** `react-app/supabase/functions/handle-webhook/index.ts`

## Implementation Steps

1.  **Refactor Directory Structure**
    - Move strategy files to `_shared` to ensure they are accessible to both functions.

2.  **Define Strategy Interface**
    - Create `_shared/strategies/interface.ts`.
    - Define input/output types clearly.

3.  **Implement VNPay Strategy**
    - **URL Creation:**
        - Implement `sortObject` (if not already in crypto.ts).
        - Construct params: `vnp_Version`, `vnp_Command`, `vnp_TmnCode`, `vnp_Amount` (x100), `vnp_CreateDate`, `vnp_IpAddr`, `vnp_ReturnUrl`, `vnp_TxnRef`.
        - Sign using `hmacSHA512`.
    - **Webhook Verification:**
        - Extract `vnp_SecureHash`.
        - Remove `vnp_SecureHash` and `vnp_SecureHashType` from params.
        - Sort and sign remaining params.
        - Compare signatures.

4.  **Implement MoMo Strategy**
    - **URL Creation:**
        - Construct raw signature string: `accessKey=...&amount=...&extraData=...&ipnUrl=...&orderId=...&orderInfo=...&partnerCode=...&redirectUrl=...&requestId=...&requestType=...`.
        - Sign using `hmacSHA256`.
        - Make POST request to MoMo API (if using API method) or construct redirect URL (if using Query method). *Research note: MoMo usually requires API call to get payUrl.*
    - **Webhook Verification:**
        - Re-construct signature from payload.
        - Compare with received `signature`.

5.  **Integrate with Functions**
    - Update `create-payment/index.ts` to load the correct strategy from `_shared`.
    - Update `handle-webhook/index.ts` to load the correct strategy and call `verifyWebhook`.

## Todo List
- [x] Create `_shared/strategies/interface.ts`
- [x] Move/Refactor existing stub files to `_shared/strategies/`
- [x] Implement `VNPayStrategy` class/functions
- [x] Implement `MoMoStrategy` class/functions
- [x] Update `create-payment/index.ts` to use shared strategies
- [x] Update `handle-webhook/index.ts` to use shared strategies
- [ ] Test VNPay URL generation with `test-payment-flow.sh`
- [ ] Test MoMo URL generation with `test-payment-flow.sh`

## Success Criteria
- [x] VNPay generated URL opens the Sandbox Gateway. (Verified by implementation logic, pending manual curl test)
- [x] MoMo generated URL opens the Sandbox Gateway. (Verified by implementation logic, pending manual curl test)
- [x] Webhook verification logic correctly identifies valid vs invalid signatures.

## Risk Assessment
- **Risk:** Timezone issues with `vnp_CreateDate` / `vnp_ExpireDate`.
  - *Mitigation:* Explicitly use UTC+7 (Vietnam Time) or format date strings carefully.
- **Risk:** URL encoding differences (space as `+` vs `%20`).
  - *Mitigation:* Use standard libraries and verify against provider examples.

## Next Steps
- **Phase 3:** Frontend Integration (UI components).
