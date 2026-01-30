---
title: "Phase 04: Customer Interface"
description: "Build the public-facing customer ordering interface including Menu, Cart management, and Checkout flow."
status: in-progress
priority: P1
effort: 5 days
branch: feat/customer-interface
tags: [customer, menu, cart, checkout, ui]
created: 2026-01-30
---

# Phase 04: Customer Interface

## Context Links
- [POS Architecture 2026](../reports/researcher-260130-1958-pos-architecture-2026.md)
- [MUI v6 + MD3 Patterns](../reports/researcher-260130-1958-mui-v6-md3-pos-research.md)

## Overview
Develop the primary revenue-generating interface: the Customer Ordering App. This includes browsing the daily menu, filtering by category, adding items to a local cart, and submitting orders.

## Key Insights
- **Optimistic UI**: Cart additions should feel instant.
- **Mobile First**: Most customers will use mobile devices.
- **Daily Menu**: Menu changes daily; data fetching must respect the current date.

## Requirements
### Functional
- View Daily Menu (filtered by date).
- Filter items by category (Rice, Drink, Side).
- Search for items.
- Add/Remove items from Cart.
- View Cart summary.
- Checkout with delivery details.

### Non-Functional
- Fast initial load (LCP < 2.5s).
- Responsive design (Mobile, Tablet, Desktop).

## Architecture
- **Page**: `pages/customer/HomePage`, `pages/customer/CartPage`.
- **Features**:
  - `features/menu`: MenuGrid, MenuFilter, ProductCard.
  - `features/cart`: CartProvider (Local State), CartDrawer, AddToCartButton.
  - `features/order`: CheckoutForm.
- **State**:
  - Menu: React Query (Server state).
  - Cart: Zustand (Client state, persisted to localStorage).

## Related Code Files
- `src/features/menu/components/MenuGrid.tsx`
- `src/features/cart/model/cartStore.ts`
- `src/features/order/components/CheckoutForm.tsx`
- `src/pages/customer-ordering-page.tsx`

## Implementation Steps
1.  **Cart Store**: Setup Zustand store for Cart (addItem, removeItem, updateQty, clearCart).
2.  **Menu API**: Create API hook `useDailyMenu(date)` to fetch products from Supabase.
3.  **Product Card**: Build UI for displaying food items (Image, Name, Price, Add Button).
4.  **Menu Grid**: Implement grid layout with Category filters.
5.  **Cart UI**: Build Floating Action Button (FAB) for Cart and a Cart Drawer/Page.
6.  **Checkout Logic**: Create form for Name, Address, Phone.
7.  **Order Submission**: Implement `createOrder` transaction (create order + order items) in Supabase.

## Todo List
- [ ] Create Zustand `cartStore`
- [ ] Implement `useDailyMenu` React Query hook
- [ ] Build `ProductCard` Component
- [ ] Build `MenuGrid` & `CategoryFilter` Component
- [ ] Build `CartDrawer` Component
- [ ] Build `CheckoutForm` (React Hook Form)
- [ ] Implement Order Submission Logic (RPC/Transaction)
- [ ] Add "Order Success" Confirmation Page

## Success Criteria
- User can browse menu.
- User can add items to cart and see total price update.
- Order is successfully saved to Supabase `orders` table.

## Risk Assessment
- **Risk**: Concurrent ordering (item out of stock).
  - **Mitigation**: Check stock before submission (optional for food, maybe just strictly daily menu).

## Next Steps
- Proceed to [Phase 05: Kitchen Display](./phase-05-kitchen-display.md).
