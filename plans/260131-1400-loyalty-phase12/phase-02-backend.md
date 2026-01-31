# Phase 2: Backend Logic & Triggers

**Status:** Completed
**Goal:** Automate point earning and tier progression.

## Logic Definition

### 1. Earning Points
Trigger: When `orders.status` changes to 'completed'.
Formula from `PROMOTIONAL_CAMPAIGNS.md`:
-   **Silver (BẠC)** (Default/Bronze in DB?): 5%
-   **Gold (VÀNG)**: 8%
-   **Diamond (KIM CƯƠNG)**: 10%

*Note: Database uses 'Bronze', 'Silver', 'Gold'. Marketing uses 'Bạc', 'Vàng', 'Kim Cương'. We need to map these.*
Mapping:
-   Bronze -> Bạc (Tier 1)
-   Silver -> Vàng (Tier 2)
-   Gold -> Kim Cương (Tier 3)

### 2. Tier Progression
Trigger: After `points` or `orders` count update.
Rules:
-   **Tier 1 (Bạc)**: 0-5 orders
-   **Tier 2 (Vàng)**: 6-15 orders
-   **Tier 3 (Kim Cương)**: 16+ orders

### 3. Functions
-   `calculate_loyalty_points(order_total, tier)`
-   `update_customer_tier(customer_id)`

## Implementation Steps
1.  Create migration file `20260131_loyalty_triggers.sql`.
2.  Write PL/PGSQL function `handle_order_completion`.
    -   Check if order is completed.
    -   Check if points already awarded (idempotency).
    -   Calculate points based on customer tier.
    -   Insert into `loyalty_transactions`.
    -   Update `customers.points`.
3.  Write PL/PGSQL function `check_tier_upgrade`.
    -   Called after order completion count increases.
    -   Check `visits` (order count) in `customers`.
    -   Update `tier` if threshold crossed.

## Testing
-   Create a mock order, set status to completed.
-   Verify points added.
-   Verify tier changes after N orders.
