# Phase 1: Backend Aggregation Logic

**Status:** Completed
**Goal:** Efficiently query summarized data from the database.

## SQL Functions needed

### 1. `get_revenue_analytics`
-   **Input**: `date_from`, `date_to`, `interval` ('day', 'week', 'month').
-   **Output**:
    -   `period`: Date/Timestamp.
    -   `total_revenue`: Sum of `total`.
    -   `order_count`: Count of orders.
    -   `avg_order_value`: `total_revenue` / `order_count`.

### 2. `get_top_selling_items`
-   **Input**: `date_from`, `date_to`, `limit` (default 10).
-   **Output**:
    -   `item_name`: Name.
    -   `quantity_sold`: Sum of quantity.
    -   `revenue`: Sum of total_price.

### 3. `get_order_status_distribution`
-   **Input**: `date_from`, `date_to`.
-   **Output**:
    -   `status`: 'completed', 'cancelled', etc.
    -   `count`: Number of orders.

## Implementation Steps
1.  Create migration `20260131_analytics_functions.sql`.
2.  Implement functions using `GROUP BY`.
3.  Secure functions with `SECURITY DEFINER` and check `auth.role()`.

## Security
-   Ensure only `admin` and `manager` can execute these functions.
