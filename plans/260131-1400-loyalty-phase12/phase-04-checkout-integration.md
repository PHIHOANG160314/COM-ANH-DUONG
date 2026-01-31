# Phase 4: Checkout Integration (Loyalty & Addresses)

**Status:** Completed
**Goal:** Allow users to use their loyalty benefits during checkout.

## Objectives
1.  **Address Selection**: Replace manual address entry with "Select from Address Book".
2.  **Point Redemption**:
    -   Show available points.
    -   Input field to redeem points.
    -   Calculate discount.
    -   Update `Order` total.

## Implementation Steps

### 1. Update `CheckoutPage` State
-   Add `discount` state.
-   Add `selectedAddressId` state.

### 2. Address Selection UI
-   Fetch addresses using `supabase.from('customer_addresses')`.
-   Render as Cards/Radio group.
-   "Add New Address" button -> Open Dialog or Expand Form.

### 3. Point Redemption UI
-   Use `useLoyalty` hook.
-   Show "You have X points".
-   "Redeem" button -> Call `loyaltyApi.redeemPoints` (Wait, this RPC commits the transaction immediately!).
    -   *Issue*: If user redeems points but doesn't complete checkout, points are lost?
    -   *Correction*: The current `redeem_loyalty_points` RPC deducts points immediately.
    -   *Refinement*: We should probably deduct points *during* the Order Creation transaction, OR use a "Voucher" system where points are converted to a voucher code first, then applied.
    -   *Simpler Approach for MVP*:
        -   Option A: Points are deducted when Order is created (Backend trigger?). No, user needs to choose.
        -   Option B: Update RPC to "lock" points? Too complex.
        -   Option C: Client sends `points_to_redeem` in `create_order` payload. Trigger handles deduction.

### 4. Revised Backend Logic (for Point Redemption)
-   Modify `orders` table: Add `points_redeemed` column.
-   Update `process_loyalty_rewards` trigger (or a new trigger `before_order_insert`) to:
    -   Check if `NEW.points_redeemed > 0`.
    -   Check if customer has enough points.
    -   Deduct points from customer.
    -   Log redemption in `loyalty_transactions`.

Let's go with **Option C** (Server-side validation during Order Insert) as it's transactional and safe.

### 5. Revised Plan
1.  **Migration**: Add `points_redeemed` to `orders`. Update Triggers.
2.  **Frontend**:
    -   Add `pointsToRedeem` to `CheckoutFormData`.
    -   Display potential discount.
    -   Pass `points_redeemed` to `orders.insert`.

## Deliverables
-   Updated SQL Migration.
-   Updated `CheckoutPage`.
