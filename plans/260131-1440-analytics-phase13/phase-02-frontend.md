# Phase 2: Analytics UI Components

**Status:** Completed
**Goal:** Visualize data for decision making.

## Dependencies
-   `recharts`: Lightweight charting library for React.
-   `date-fns`: Date manipulation.

## Components

### 1. `AnalyticsDashboard`
-   Layout container.
-   Header with `DateRangePicker`.
-   Summary Cards (Total Revenue, Total Orders, Avg Value).

### 2. `RevenueChart`
-   Line Chart showing revenue trends over time.
-   Tooltip with detailed info.

### 3. `ProductPerformance`
-   Bar chart or Table showing top items.

### 4. `OrderStatusPie`
-   Pie chart showing success vs cancellation rate.

## Implementation Steps
1.  Install dependencies (simulated).
2.  Create `src/features/analytics` module.
3.  Implement `useAnalytics` hook to call RPC functions.
4.  Build UI components.
5.  Add route `/admin/analytics`.
