---
title: "Phase 05: Kitchen Display System (KDS)"
description: "Develop the Real-time Kitchen Display System to receive and manage incoming orders."
status: completed
priority: P1
effort: 3 days
branch: feat/kitchen-display
tags: [kds, realtime, supabase, kitchen]
created: 2026-01-30
completed: 2026-01-30
---

# Phase 05: Kitchen Display System (KDS)

## Context Links
- [Supabase React Integration](../reports/researcher-260130-1958-supabase-react-integration.md)

## Overview
The KDS is the heartbeat of the kitchen. It displays new orders in real-time, allowing kitchen staff to mark items as "Cooking" or "Ready". It replaces the need for printed tickets in some workflows or works alongside them.

## Key Insights
- **Real-time is Critical**: Latency must be minimal. Use Supabase Realtime subscriptions.
- **Visual Clarity**: High contrast, large text, clear status indicators.
- **Audio Cues**: Sound notification on new order.

## Requirements
### Functional
- Receive new orders automatically without refresh.
- View order details (Items, Notes, Quantity).
- Update order status (Pending -> Cooking -> Ready -> Delivered/Cancelled).
- Filter orders by status.

### Non-Functional
- High reliability (auto-reconnect).
- Sound alerts.

## Architecture
- **Page**: `pages/kitchen-display-system-page.tsx`.
- **Features**:
  - `features/kds`: OrderTicket, OrderList, StatusToggle.
- **State**:
  - `useOrdersSubscription`: Custom hook wrapping Supabase Realtime channel.

## Related Code Files
- `src/pages/kitchen-display-system-page.tsx`
- `src/features/kds/components/OrderTicket.tsx`
- `src/features/kds/hooks/useOrdersSubscription.ts`

## Implementation Steps
1.  **Realtime Hook**: Create `useOrdersSubscription` to listen for `INSERT` and `UPDATE` on `orders` table.
2.  **Order API**: Create `useKitchenOrders` to fetch initial state (active orders).
3.  **Ticket UI**: Design `OrderTicket` component (Table #, Items, Time elapsed).
4.  **Status Logic**: Implement functions to update order status in DB.
5.  **Sound**: Add audio element to play sound on new `INSERT` event.
6.  **Layout**: Grid layout for tickets, likely masonry or simple flex wrap.

## Todo List
- [x] Create `useOrdersSubscription` Hook (Realtime)
- [x] Implement `useKitchenOrders` Query (Initial fetch)
- [x] Build `OrderTicket` Component
- [x] Implement Status Change Handlers
- [x] Add Sound Notification
- [x] Create KDS Dashboard Layout
- [x] Test Real-time Sync (Multi-tab test)

## Success Criteria
- Creating an order in Customer App appears on KDS within 2 seconds.
- Changing status updates UI immediately.

## Risk Assessment
- **Risk**: Internet disconnection in kitchen.
  - **Mitigation**: Show "Offline" banner if Supabase connection drops.

## Next Steps
- Proceed to [Phase 06: Staff POS](./phase-06-staff-pos.md).
