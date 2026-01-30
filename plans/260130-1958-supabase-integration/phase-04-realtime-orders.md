# Phase 4: Real-time Orders & Optimistic UI

**Status:** Pending
**Priority:** Medium

## Overview
Implement real-time order tracking for the Kitchen Display System (KDS) and optimistic updates for smoother user experience.

## Objectives
- [ ] Subscribe to `orders` table changes.
- [ ] Update local state immediately on mutation (Optimistic UI).
- [ ] Handle subscription cleanup.

## Implementation Steps

1.  **TanStack Query Setup**
    - Install `@tanstack/react-query`.
    - Setup `QueryClientProvider` in `main.tsx`.

2.  **Real-time Hook**
    - Create `useRealtimeOrders` hook.
    - Use `supabase.channel` to listen for `INSERT` and `UPDATE` on `orders`.
    - Invalidate/Refetch queries on event.

3.  **Optimistic Mutations**
    - Create `useUpdateOrderStatus` hook using `useMutation`.
    - Implement `onMutate` to update cache immediately.
    - Implement `onError` to rollback.
    - Implement `onSettled` to refetch.

## Success Criteria
- [ ] New orders appear instantly without page refresh.
- [ ] Status updates reflect immediately in UI.
- [ ] Network errors revert the UI state gracefully.
