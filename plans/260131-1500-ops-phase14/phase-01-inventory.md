# Phase 1: Inventory Logic

**Status:** Completed
**Goal:** Manage stock levels for menu items.

## Schema Changes
```sql
ALTER TABLE public.menu_items
ADD COLUMN stock_quantity INTEGER DEFAULT NULL; -- NULL = Unlimited
```

## Logic (Trigger)
Create `decrement_stock_on_order` trigger on `order_items`.
-   For each item in order:
    -   Check if `menu_items.stock_quantity` is not null.
    -   If `stock_quantity < quantity`, raise exception (or handle gracefully?).
    -   Update `menu_items`: `stock_quantity = stock_quantity - quantity`.
    -   If `stock_quantity == 0`, set `is_available = false`.

## Frontend Updates
-   **Admin Menu**: Allow editing `stock_quantity`.
-   **Customer Menu**:
    -   Display "Sold Out" if `is_available` is false.
    -   Display "Just [x] left!" if `stock_quantity < 10`.

## Implementation
1.  Create migration `20260131_inventory_schema.sql`.
2.  Update `menu_items` RLS if needed (Staff need update access).
