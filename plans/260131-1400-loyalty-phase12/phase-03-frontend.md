# Phase 3: Frontend Profile & Loyalty

**Status:** Completed
**Goal:** User interface for managing profile and viewing loyalty status.

## Components

### 1. Profile Layout
-   Sidebar navigation: Info, Orders, Addresses, Loyalty, Favorites.
-   Responsive design (Bottom tabs on mobile?).

### 2. Loyalty Dashboard
-   **Tier Card**: Shows current tier, icon, and next tier progress bar.
-   **Points Balance**: Large display of available points.
-   **History**: List of recent transactions (Earned +X, Redeemed -Y).
-   **Benefits List**: What they get with current tier.

### 3. Order History
-   List of past orders with status chips.
-   "Reorder" button: Adds all items from past order to cart.
-   "Rate Order" button (for Review system later).

### 4. Favorites
-   Heart icon on Menu Items.
-   Favorites page listing saved items.

## Implementation Steps
1.  Create `src/features/profile` module.
2.  Implement `useLoyalty` hook (fetching Supabase data).
3.  Build UI pages.
4.  Update `CheckoutPage` to allow using saved addresses.
