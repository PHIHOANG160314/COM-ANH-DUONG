# Phase 3: Operating Hours & Status

## Context
- **Plan**: `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/260201-0540-sea-sops-transformation/plan.md`
- **Research**: `/Users/macbookprom1/mekong-cli/com-anh-duong-10x/plans/reports/researcher-260201-0540-sea-ux-best-practices.md`

## Overview
Display store operating status (Open/Closed/Closing Soon) to manage customer expectations and prevent orders when closed.

## Key Insights
-   **Traffic Light System**: Simple visual indicators (Green/Yellow/Red) work best.
-   **Logic**: 10:00 - 22:00 Daily.
-   **Prevention**: Disable checkout if closed.

## Requirements
1.  **Component**: `OperatingHours` badge/widget.
2.  **Logic**:
    -   **Open**: 10:00 - 21:30 (Last order cutoff).
    -   **Closing Soon**: 21:30 - 22:00.
    -   **Closed**: 22:00 - 10:00.
3.  **UI**:
    -   Green dot: "Đang mở cửa"
    -   Yellow dot: "Sắp đóng cửa"
    -   Red dot: "Đã đóng cửa"

## Architecture
-   **New Component**: `src/shared/ui/operating-hours.tsx`
-   **Utils**: Time checking logic (date-fns or native Date).

## Related Code Files
-   `react-app/src/shared/ui/operating-hours.tsx` (New)
-   `react-app/src/pages/customer/checkout-page.tsx` (To disable button)

## Implementation Steps
1.  **Create Time Logic**:
    -   Helper function to determine status based on current time.
    -   Hardcode 10:00 - 22:00 for now (or config constant).
2.  **Create `OperatingHours` Component**:
    -   Display status with dot and text.
    -   Tooltip or subtitle for full hours: "10:00 - 22:00 daily".
3.  **Integrate**:
    -   Place in Header or Footer (or Checkout summary).
4.  **Enforce in Checkout**:
    -   If status is CLOSED, disable "Place Order" button and show warning.

## Todo List
-   [ ] Implement `getStoreStatus()` logic.
-   [ ] Build `OperatingHours` UI component.
-   [ ] Add to Layout/Header.
-   [ ] Add validation check in `CheckoutPage`.

## Success Criteria
-   Correct status shown based on system time.
-   Checkout disabled when outside operating hours.

## Risk Assessment
-   **Risk**: Timezone issues.
-   **Mitigation**: Use store's timezone (Vietnam GMT+7), not necessarily user's local time if they are traveling (though likely same). Force VN time calculation.

## Security
-   Client-side check only. Server-side validation should also exist (out of scope for frontend plan, but noted).
