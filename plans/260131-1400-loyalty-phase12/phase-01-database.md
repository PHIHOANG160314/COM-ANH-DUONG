# Phase 1: Database Foundation for Loyalty

**Status:** Completed
**Goal:** Create necessary tables and schema updates for the loyalty system.

## Schema Changes

### 1. `loyalty_transactions`
Tracks every point change.
-   `id` (UUID)
-   `customer_id` (UUID)
-   `order_id` (UUID, nullable) - Linked if earned from order
-   `type` (VARCHAR): 'earn', 'redeem', 'adjustment', 'expire'
-   `points` (INTEGER): Positive for earn, negative for redeem
-   `description` (TEXT)
-   `created_at` (TIMESTAMPTZ)

### 2. `customer_addresses`
Saved addresses for quick checkout.
-   `id` (UUID)
-   `customer_id` (UUID)
-   `label` (VARCHAR): 'Home', 'Office', etc.
-   `address` (TEXT)
-   `is_default` (BOOLEAN)
-   `created_at` (TIMESTAMPTZ)

### 3. `saved_items` (Favorites)
-   `id` (UUID)
-   `customer_id` (UUID)
-   `menu_item_id` (INTEGER)
-   `created_at` (TIMESTAMPTZ)

### 4. Updates to `customers` table
-   Ensure `tier`, `points`, `total_spent` columns exist and are correct types.
-   Add `next_tier_progress` (computed? or handle in FE).

## Implementation Steps
1.  Create migration file `20260131_loyalty_schema.sql`.
2.  Define tables with appropriate Foreign Keys.
3.  Enable RLS policies:
    -   Customers can view their own loyalty history.
    -   Customers can CRUD their addresses.
    -   Customers can CRUD their favorites.

## Security
-   Strict RLS: `auth.uid() = customer.auth_user_id` (via `customers` table link).
