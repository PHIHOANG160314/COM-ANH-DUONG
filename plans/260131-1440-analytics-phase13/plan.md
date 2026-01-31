# Phase 13: Advanced Reporting & Analytics Plan

**Status:** Completed
**Priority:** Medium
**Context:** Empowering business owners with data-driven insights through visual dashboards and exportable reports.

## Goals
1.  **Revenue Analytics:** Visual charts showing daily/weekly/monthly revenue.
2.  **Product Performance:** Identify best-selling items and low performers.
3.  **Staff Performance:** Track order processing times and delivery efficiency.
4.  **Data Export:** Allow downloading order history as CSV/Excel for accounting.

## Architecture

### Backend (Supabase)
-   **Database Views/RPC**:
    -   `get_daily_revenue(start_date, end_date)`: Returns revenue aggregated by day.
    -   `get_product_sales(start_date, end_date)`: Returns quantity/revenue by menu item.
    -   `get_staff_performance(start_date, end_date)`: Returns avg completion time per staff.
-   **Security**: Restricted to `admin` and `manager` roles.

### Frontend (React)
-   **Library**: `recharts` for visualization.
-   **Components**:
    -   `RevenueChart`: Bar/Line chart.
    -   `TopProductsTable`: Sortable list with progress bars.
    -   `DateRangePicker`: Filter controls.
    -   `ExportButton`: Generates CSV.
-   **Page**: `AdminAnalyticsPage`.

## Phases

### Phase 1: Backend Aggregation Logic
-   Create SQL functions for heavy lifting (aggregations) to avoid fetching all rows to client.
-   **Deliverable**: SQL Migration file.

### Phase 2: Analytics UI Components
-   Install `recharts`.
-   Build Chart components.
-   Build Dashboard layout.
-   **Deliverable**: React Components.

### Phase 3: Export Functionality
-   Implement client-side CSV generation from data arrays.
-   **Deliverable**: `useExport` hook.

## References
-   Existing `orders` and `order_items` tables.
