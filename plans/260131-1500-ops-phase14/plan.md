# Phase 14: Operations Optimization Plan

**Status:** Completed
**Priority:** Medium
**Context:** streamlining daily operations with inventory controls and automated reporting.

## Goals
1.  **Stock Management**: Track quantity for limited items (e.g., promotional combos, desserts).
2.  **Notification System**: Persist alerts for Staff/Admin (New Order, Low Stock).
3.  **End-of-Day Automation**: Send daily summary email to management.

## Architecture

### Database Schema Updates
-   **Update `menu_items`**: Add `stock_quantity` (Integer, Nullable).
-   **New Table `notifications`**:
    -   `id`, `user_id` (or `role`), `title`, `message`, `is_read`, `created_at`.
-   **Trigger**: `check_stock_levels` on `order_items` insert -> Decrement stock.

### Backend (Supabase)
-   **Edge Function**: `send-daily-report`.
    -   Triggered by `pg_cron` daily at 23:00.
    -   Calculates total revenue, orders.
    -   Sends Email (Mock/Log for now).

### Frontend (React)
-   **Menu Management**: UI to set stock levels.
-   **Notification Center**: Bell icon in Admin/Staff header with dropdown.
-   **Stock Indicators**: Show "Only X left" on Customer Menu.

## Phases

### Phase 1: Inventory Logic
-   Migration: Add `stock_quantity` to `menu_items`.
-   Trigger: Decrement stock on order. Auto-set `is_available = false` when 0.
-   **Deliverable**: SQL Migration.

### Phase 2: Daily Report Automation
-   Create `functions/daily-report`.
-   Setup Cron job.
-   **Deliverable**: Edge Function & Cron SQL.

### Phase 3: Notification System
-   Create `notifications` table.
-   UI Component `NotificationBell`.
-   **Deliverable**: Full Notification feature.

## References
-   Existing `menu_items` table.
