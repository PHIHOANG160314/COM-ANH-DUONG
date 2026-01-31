# Phase 12: Customer Loyalty & Profile Implementation Plan

**Status:** Completed
**Priority:** High
**Context:** Implementing the "Thành Viên Nhà" loyalty program, customer profiles, and order history to increase retention.

## Goals
1.  **Customer Profile:** Allow users to manage their personal info and saved addresses.
2.  **Order History:** View past orders and easily reorder favorite items.
3.  **Loyalty System:**
    -   Track points (5-10% based on tier).
    -   Manage Tiers (Bronze, Silver, Diamond).
    -   Redeem points for discounts.
4.  **Favorites:** Save menu items for quick access.

## Architecture

### Database Schema Updates
-   **New Table**: `loyalty_transactions` (history of points earned/spent).
-   **New Table**: `customer_addresses` (saved delivery locations).
-   **New Table**: `saved_items` (favorites).
-   **Updates**: Triggers on `orders` table to calculate points and update `customers` tier.

### Backend Logic (Supabase)
-   **Trigger**: `on_order_completed` -> Calculates points based on `total` and `tier`.
-   **Trigger**: `on_points_update` -> Checks for Tier upgrade eligibility.
-   **Edge Function**: `redeem-points` (optional, or handle via RLS/Policy if simple).

### Frontend (React)
-   **Profile Module**:
    -   `ProfilePage`: Info form.
    -   `AddressBook`: CRUD addresses.
    -   `OrderHistory`: List and Detail view.
    -   `LoyaltyDashboard`: Progress bar, current tier, benefits, point history.
    -   `FavoritesList`: Grid of saved items.

## Phases

### Phase 1: Database Foundation
-   Create `loyalty_transactions` table.
-   Create `customer_addresses` table.
-   Create `saved_items` table.
-   Implement PL/PGSQL function for point calculation and tier updates.
-   **Deliverable**: SQL Migration file.

### Phase 2: Backend Logic & Triggers
-   Implement the logic to award points when order status becomes 'completed'.
-   Implement logic to update tiers based on `visits` or `total_spent` (or `points`).
-   **Deliverable**: SQL Functions and Triggers.

### Phase 3: Frontend Implementation
-   Create Profile Layout and Pages.
-   Integrate "Reorder" button in Order History.
-   Display Loyalty status in Header/Profile.
-   **Deliverable**: Working UI in React App.

## References
-   Marketing Logic: `plans/marketing/PROMOTIONAL_CAMPAIGNS.md`
-   Existing Schema: `docs/DATABASE_SCHEMA.md`
