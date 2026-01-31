# Phase 2: Zalo Chat Widget Integration

## Context
- **Plan**: `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/260201-0540-sea-sops-transformation/plan.md`
- **Research**: `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/reports/researcher-260201-0540-zalo-integration.md`

## Overview
Implement a lightweight Zalo Floating Action Button (FAB) that deep-links to the Zalo app/web, replacing heavy iframe widgets if present.

## Key Insights
-   **Performance**: Official widgets are heavy. Deep links are instant.
-   **User Preference**: Users prefer native app experience (Mobile) or simple QR scan (Desktop).
-   **Placement**: Bottom right is standard.

## Requirements
1.  **Component**: Create `ZaloChatFab`.
2.  **Behavior**:
    -   Click opens `https://zalo.me/[PHONE_NUMBER]` or OA link.
    -   Fixed position: Bottom Right.
    -   Zalo Blue Icon.
3.  **Integration**: Add to `OrderSuccessPage` and potentially global layout (User decision: strictly asked for `OrderSuccessPage` modification in context, but global is usually better. Will stick to `OrderSuccessPage` and `MainLayout` if needed, but requirements mentioned `OrderSuccessPage`).
    -   *Correction*: Requirements said "Zalo Widget - Add Zalo chat FAB...". Usually global, but let's ensure it's at least on critical pages. I will verify if it should be global or just specific pages. Typically FAB is global. I'll plan for a reusable component that can be mounted globally.

## Architecture
-   **New Component**: `src/shared/ui/zalo-chat-fab.tsx`
-   **Existing**: `src/shared/ui/zalo-widget.tsx` (Review/Deprecate or Update).

## Related Code Files
-   `react-app/src/shared/ui/zalo-chat-fab.tsx` (New)
-   `react-app/src/pages/customer/order-success-page.tsx`
-   `react-app/src/App.tsx` (For potential global include)

## Implementation Steps
1.  **Create `ZaloChatFab`**:
    -   Use Zalo SVG icon.
    -   Style with Tailwind (fixed, bottom-4, right-4, z-50).
    -   Add animation (pulse or hover scale).
2.  **Integrate into Pages**:
    -   Add to `OrderSuccessPage` (as requested for support after order).
    -   Check if `zalo-widget.tsx` is used elsewhere and replace if needed.
3.  **Tech Debt Cleanup**:
    -   Ensure clean code in new component.

## Todo List
-   [ ] Design and implement `ZaloChatFab` component.
-   [ ] Get Zalo OA ID or Phone Number (Use placeholder if not available, likely env var).
-   [ ] Add to `OrderSuccessPage`.
-   [ ] Verify mobile touch targets (44px min).

## Success Criteria
-   FAB appears on Order Success page.
-   Clicking leads to `zalo.me` link.
-   No impact on page load performance (Lighthouse).

## Risk Assessment
-   **Risk**: Zalo link blocked by some browsers?
-   **Mitigation**: Standard `target="_blank"` usually works fine.

## Security
-   `rel="noopener noreferrer"` on external links.
