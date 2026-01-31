# Report: Phase 12.2 - Backend Logic & Triggers

**Date:** 2026-01-31
**Author:** Project Manager
**Status:** Complete

## Deliverables
1.  **Migration File:** `react-app/supabase/migrations/20260131_loyalty_triggers.sql` created.
    -   **Function `calculate_tier_percentage`**: Returns decimal rate based on tier.
    -   **Trigger `process_loyalty_rewards`**: Handles point calculation, stats update, and tier progression when Order Status -> 'completed'.
    -   **RPC `redeem_loyalty_points`**: Secure function for clients to spend points.

## Logic Verified
-   **Tiers**: Bronze (5%), Silver (8%), Gold (10%).
-   **Progression**: >5 visits -> Silver, >15 visits -> Gold.
-   **Redemption**: 1 Point = 100 VND.

## Next Steps (Phase 12.3 - Frontend)
-   Implement Profile Page UI.
-   Implement Loyalty Dashboard.
-   Update Checkout to allow point redemption.
