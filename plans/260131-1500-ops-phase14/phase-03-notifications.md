# Phase 3: Notification System

**Status:** Completed
**Goal:** In-app alerts for staff.

## Schema
```sql
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_role VARCHAR(20), -- 'admin', 'kitchen', 'staff'
    title TEXT,
    message TEXT,
    link TEXT, -- e.g., '/admin/orders/123'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Logic
-   **New Order**: Trigger inserts notification for `admin`, `kitchen`, `staff`.
-   **Low Stock**: Trigger inserts notification for `admin` when `stock < 5`.

## Frontend
-   `NotificationProvider`: Subscribes to `notifications` table.
-   `NotificationBell`: Component in `AdminLayout` and `MainLayout`.
-   `NotificationList`: Dropdown showing unread items.

## Implementation
1.  Migration `20260131_notifications_schema.sql`.
2.  React Context & UI.
