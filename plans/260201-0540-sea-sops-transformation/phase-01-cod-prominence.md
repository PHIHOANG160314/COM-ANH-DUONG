# Phase 1: Cash on Delivery (COD) Prominence

## Context
- **Plan**: `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/260201-0540-sea-sops-transformation/plan.md`
- **Research**: `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/reports/researcher-260201-0540-sea-ux-best-practices.md`

## Overview
COD is the preferred payment method (~80%). We must remove friction by making it default, visually prominent, and reassuring.

## Key Insights
- **Default Selection**: Don't force users to click to select payment. Default to COD.
- **Visual Trust**: Green color association with "Safe/Cash".
- **Social Proof**: "Phổ biến" badge validates the choice.

## Requirements
1.  **Default State**: COD is selected by default when entering checkout.
2.  **Visual Enhancement**:
    -   Add "Phổ biến" (Popular) badge next to COD label.
    -   Highlight selected COD option with Green border/background.
    -   Add 💵 emoji or icon.
3.  **Checkout Button**: Change text to "Đặt đơn - Trả tiền mặt" when COD is active.

## Architecture
-   **Component**: `PaymentMethodSelector` controls the selection state.
-   **Page**: `CheckoutPage` orchestrates the form submission.
-   **State**: `checkout-store` or local state needs to initialize payment method to `COD`.

## Related Code Files
-   `react-app/src/features/payment/components/payment-method-selector.tsx`
-   `react-app/src/pages/customer/checkout-page.tsx`

## Implementation Steps
1.  **Refactor `PaymentMethodSelector`**:
    -   Accept `defaultMethod` prop.
    -   Render "Phổ biến" badge for COD option.
    -   Style selected state with green theme (#2E7D32).
2.  **Update `CheckoutPage`**:
    -   Initialize payment method state to 'COD'.
    -   Update submit button label dynamically based on payment method.
3.  **Tech Debt Cleanup**:
    -   Remove any console logs in these files.
    -   Ensure strict typing (no `any`).

## Todo List
-   [ ] Modify `PaymentMethodSelector` to include badge support.
-   [ ] Implement "Phổ biến" badge styles.
-   [ ] Update `CheckoutPage` initial state.
-   [ ] Update "Place Order" button text logic.
-   [ ] Verify mobile responsiveness of payment list.

## Success Criteria
-   COD is selected automatically on load.
-   "Phổ biến" badge is visible.
-   Submit button text reflects payment method.
-   0 Console logs in modified files.

## Risk Assessment
-   **Risk**: Users might miss other payment options.
-   **Mitigation**: Keep other options visible, just not pre-selected (or pre-selected but clearly changeable).

## Security
-   No sensitive data handling changes.
