# Phase 4: Trust Badges & Signals

## Context
- **Plan**: `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/260201-0540-sea-sops-transformation/plan.md`
- **Research**: `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/reports/researcher-260201-0540-trust-badges.md`

## Overview
Add visual trust signals to the Order Success page and Checkout to reassure customers about quality and safety.

## Key Insights
-   **Critical Badges**: Food Safety (VSATTP), COD accepted, Fresh Ingredients.
-   **Placement**: Near "Call to Action" buttons or Confirmation screens.

## Requirements
1.  **Component**: `TrustBadges` component.
2.  **Content**:
    -   Icon: 🛡️ An toàn thực phẩm (Food Safety).
    -   Icon: 🥬 100% Nguyên liệu tươi (Fresh).
    -   Icon: 💵 Thanh toán khi nhận hàng (COD).
    -   Icon: 🔒 Bảo mật SSL (SSL Secure).

## Architecture
-   **New Component**: `src/shared/ui/trust-badges.tsx`
-   **Assets**: Use Lucide React icons or SVG assets.

## Related Code Files
-   `react-app/src/shared/ui/trust-badges.tsx` (New)
-   `react-app/src/pages/customer/order-success-page.tsx`
-   `react-app/src/pages/customer/checkout-page.tsx`

## Implementation Steps
1.  **Create `TrustBadges`**:
    -   Flex layout, recognizable icons, short trustworthy text.
    -   Variant props (horizontal, vertical, minimal).
2.  **Integrate**:
    -   Add to `CheckoutPage` (below submit button).
    -   Add to `OrderSuccessPage` (reassurance that order is safe).
3.  **Tech Debt Audit**:
    -   Verify no hardcoded strings (use constants if possible, but hardcoded text for simple badges is fine).
    -   Ensure responsive layout.

## Todo List
-   [ ] Design `TrustBadges` using Lucide icons.
-   [ ] Implement component.
-   [ ] Insert into Checkout and Order Success pages.
-   [ ] Verify mobile layout (stacking if needed).

## Success Criteria
-   Badges visible and aligned.
-   Increases perceived trustworthiness of the page.

## Risk Assessment
-   **Risk**: Clutter.
-   **Mitigation**: Use clean, minimal design. Don't oversize icons.

## Security
-   None.
