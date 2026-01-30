# Phase 3: Frontend Integration

**Overview**
Integrate payment selection into the React application's checkout flow and handle the redirection logic.

**Requirements**
- User can select between Cash, VNPay, and MoMo.
- UI reflects the selection.
- Seamless redirection to payment gateway.
- Handling of return flow (Success/Failure page).

**Architecture**
- **Component:** `PaymentMethodSelector` component.
- **State:** React Query for managing API calls to Edge Functions.
- **Routing:** New route `/checkout/result`.

**Related Code Files**
- `react-app/src/components/checkout/PaymentMethodSelector.tsx`
- `react-app/src/hooks/useCreatePayment.ts`
- `react-app/src/pages/CheckoutResultPage.tsx`

**Implementation Steps**

1.  **UI Components**
    - Create `PaymentMethodSelector`:
      - Radio group or Card grid.
      - Icons for VNPay, MoMo.
    - Update Cart/Order summary to include selector.

2.  **API Integration**
    - Create `useCreatePayment` hook:
      - Calls `supabase.functions.invoke('create-payment')`.
      - Handles redirection on success (`window.location.href`).

3.  **Return Handling**
    - Create `CheckoutResultPage`:
      - Read query params (status code).
      - Display "Success" or "Failure" message.
      - If Success, clear cart and show Order Status.
      - **Important:** Don't rely solely on URL params for order status update (handled by webhook), but use them for UI feedback. Verify with `useOrder(id)` to see real status.

**Success Criteria**
- User can select payment method.
- Clicking "Place Order" redirects to correct gateway.
- Returning from gateway shows appropriate result page.
