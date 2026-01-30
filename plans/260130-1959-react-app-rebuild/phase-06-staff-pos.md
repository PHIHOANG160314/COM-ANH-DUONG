---
title: "Phase 06: Staff POS"
description: "Implement the Staff Point of Sale interface for on-site ordering and table management."
status: in-progress
priority: P1
effort: 4 days
branch: feat/staff-pos
tags: [pos, staff, table-management, printing]
created: 2026-01-30
---

# Phase 06: Staff POS

## Context Links
- [POS Architecture 2026](../reports/researcher-260130-1958-pos-architecture-2026.md)

## Overview
The Staff POS is used by waiters and cashiers. It shares many features with the Customer App (Menu, Cart) but adds specific capabilities like Table Selection, Manual Order Entry, Guest Info editing, and Payment processing.

## Key Insights
- **Efficiency**: Minimal clicks to create an order.
- **Shared Components**: Reuse `MenuGrid` and `ProductCard` from Customer App but potentially with a denser layout.
- **Table Map**: Visual representation of tables (optional, or list view).

## Requirements
### Functional
- Select Table or "Takeaway".
- Add items to order.
- Modify existing orders (Add items to open table).
- Process Payment (Cash/Transfer).
- Print Receipt (Integration with browser print or specific logic).

## Architecture
- **Page**: `pages/staff-mobile-pos-page.tsx`.
- **Features**:
  - `features/pos`: TableGrid, OrderEditor, PaymentModal.
- **Reused**: `features/menu`, `features/cart`.

## Related Code Files
- `src/pages/staff-mobile-pos-page.tsx`
- `src/features/pos/components/TableSelection.tsx`
- `src/features/pos/components/OrderEditor.tsx`

## Implementation Steps
1.  **Table Management**: Create Tables schema/data if not exists, or just use Table Numbers.
2.  **POS Layout**: Two-column layout (Menu on left, Current Order/Cart on right) for Tablet/Desktop.
3.  **Order Modification**: Logic to load an existing "Open" order into the Cart state for editing.
4.  **Payment Flow**: Modal to select payment method and calculate change.
5.  **Receipt**: Create a printable component/route for the receipt.

## Todo List
- [ ] Build `TableSelection` UI
- [ ] Create POS Layout (Split Screen)
- [ ] Implement "Load Order" functionality (Edit Mode)
- [ ] Build `PaymentModal`
- [ ] Create `ReceiptTemplate` for printing
- [ ] Integrate "Complete Order" logic

## Success Criteria
- Staff can create an order for Table 5.
- Staff can add items to Table 5's existing order.
- Staff can checkout and mark order as Paid.

## Risk Assessment
- **Risk**: Complex state management when editing orders.
  - **Mitigation**: Clearly separate "New Order" mode and "Edit Order" mode in the Store.

## Next Steps
- Proceed to [Phase 07: Shipper Delivery](./phase-07-shipper-delivery.md).
