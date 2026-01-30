---
title: "Phase 3: Frontend Integration"
description: "Implement payment method selection and gateway integration in the React frontend"
status: pending
priority: P1
effort: 3d
branch: feat/payment-frontend
tags: [frontend, react, payment, vnpay, momo]
created: 2026-01-31
---

## Context Links
- **Phase 1 Plan:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/260131-0600-payment-phase1/phase-01-database-backend.md`
- **Phase 2 Plan:** `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/260131-0610-payment-phase2/phase-02-strategies.md`

## Overview
**Date:** 2026-01-31
**Priority:** High
**Status:** Pending

This phase connects the backend payment infrastructure (Edge Functions) to the user interface. We will add a payment method selection step to the checkout flow, implement the API calls to initiate payments, and create a result page to handle users returning from payment gateways.

## Key Insights
- **User Experience:** The transition to the payment gateway should be smooth. Users should know they are being redirected.
- **Mobile Support:** On mobile, MoMo might try to open the app (Deep Link). We need to handle this if possible (though for Phase 1/2 we relied on standard redirect URL).
- **Return Flow:** The return page must handle parameters from both VNPay (query params) and MoMo (query params), verify them (conceptually, or rely on the backend webhook which updates status), and show the final result.
- **Polling:** Since webhooks might take a few seconds, the return page (or POS screen) should poll the order status to confirm payment success if the immediate return params aren't sufficient or secure enough.

## Requirements

### Functional Requirements
- **Selection UI:** Allow user to choose between "Cash", "VNPay", and "MoMo".
- **Initiation:** Clicking "Place Order" (or "Pay Now") with an online method should call `create-payment` and redirect the user.
- **Return Handling:** A dedicated page `/checkout/result` to display "Success", "Failed", or "Processing".
- **Realtime Updates:** The UI should update when the payment status changes (via Supabase Realtime or polling).

### Non-Functional Requirements
- **Security:** Do not handle raw credit card info. Rely on redirects.
- **Responsiveness:** UI must look good on mobile and desktop.

## Architecture

### Component Structure
```
src/features/payment/
├── components/
│   ├── payment-method-selector.tsx
│   └── payment-status-badge.tsx
├── api/
│   └── payment-api.ts  # Calls Edge Function
└── hooks/
    └── use-payment.ts  # Logic for initiating payment
```

### Page Flow
1.  **Checkout Page:**
    - User selects items -> specific "Payment Method" section.
    - If "Cash" -> Create Order -> Success Page.
    - If "VNPay/MoMo" -> Create Order -> Call `create-payment` -> Redirect to Gateway.
2.  **Payment Gateway:** User pays.
3.  **Return Page (`/checkout/result`):**
    - Parses query params (e.g. `vnp_ResponseCode` or `resultCode`).
    - Displays status.
    - Checks `orders` table for final `payment_status` (confirmed by webhook).

## Related Code Files
- **Create:** `src/features/payment/` (and subdirectories)
- **Modify:** `src/pages/customer/checkout-page.tsx`
- **Create:** `src/pages/customer/payment-result-page.tsx` (New route)
- **Modify:** `src/app/router/router.tsx`

## Implementation Steps

1.  **Payment Feature Setup**
    - Create `src/features/payment/api/payment-api.ts` to interact with `create-payment` Edge Function.
    - Create `src/features/payment/components/payment-method-selector.tsx`.

2.  **Checkout Page Integration**
    - Update `CheckoutPage` state to track selected payment method.
    - Update "Place Order" handler:
        - Save order to DB first (status: pending).
        - If online payment: Call `createPayment`.
        - If success, redirect `window.location.href = response.paymentUrl`.

3.  **Return Page Implementation**
    - Create `src/pages/customer/payment-result-page.tsx`.
    - Implement logic to read URL params.
        - VNPay: `vnp_ResponseCode` ('00' = success).
        - MoMo: `resultCode` ('0' = success).
    - *Crucial:* Even if params say success, we should ideally verify with our backend or wait for the Webhook to update the DB. For MVP, we can trust the return params *for display*, but the actual order processing relies on the webhook.
    - Display success/failure message.
    - Provide "Back to Home" or "View Order" buttons.

4.  **Route Configuration**
    - Add `/checkout/result` to `router.tsx`.

## Todo List
- [x] Create `src/features/payment` structure
- [x] Implement `payment-api.ts`
- [x] Implement `PaymentMethodSelector`
- [x] Update `CheckoutPage` logic
- [x] Create `PaymentResultPage`
- [x] Register new route
- [ ] Test flow with "Cash" (regression test)
- [ ] Test flow with "VNPay" (redirects and returns)

## Success Criteria
- [x] User can select payment method. (Implemented)
- [x] Selecting VNPay/MoMo and submitting redirects to the Sandbox. (Logic implemented)
- [x] Completing (or canceling) on Sandbox redirects back to `/checkout/result`. (Route configured)
- [x] `/checkout/result` correctly identifies success/failure based on params. (Implemented)

## Risk Assessment
- **Risk:** Pop-up blockers.
  - *Mitigation:* Ensure redirect happens as a direct result of a user click (in the promise chain of the button click).
- **Risk:** Lost state on return.
  - *Mitigation:* The return URL contains params, but we might lose local app state (cart, user session if not persisted). Ensure Supabase Auth persists.

## Next Steps
- **Phase 4:** Reliability & Reconciliation (if needed).
