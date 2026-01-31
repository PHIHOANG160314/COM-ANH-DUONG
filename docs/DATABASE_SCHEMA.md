# Database Schema Reference
**Generated:** 2026-01-23
**Source:** `sql/schema.sql`

## Tables

### `categories`
- `id` (VARCHAR): Primary Key.
- `name` (VARCHAR): Display name.
- `parent_id`: Recursive relationship for subcategories.
- `is_active`: Soft delete flag.

### `menu_items`
- `id` (SERIAL): Primary Key.
- `name` (VARCHAR): Item name.
- `price` (INT): Selling price.
- `cost` (INT): Cost of goods sold (COGS).
- `category_id`: FK to categories.
- `is_available`: Availability toggle.

### `orders`
- `id` (UUID): Primary Key.
- `order_number`: Human-readable ID (e.g., AD231001-1234).
- `items` (JSONB): Snapshot of items in the order.
- `total` (INT): Final amount.
- `status`: `pending`, `confirmed`, `preparing`, `ready`, `completed`, `cancelled`.
- `order_type`: `dinein`, `takeaway`, `delivery`.

### `customers`
- `id` (UUID): Primary Key.
- `phone` (VARCHAR): Unique identifier for loyalty.
- `points`: Loyalty points balance.
- `tier`: Bronze, Silver, Gold, etc.

### `attendance_log` (New)
- `id` (UUID): Primary Key.
- `staff_id`: Reference to staff.
- `check_in`, `check_out`: Timestamps.
- `total_hours`: Calculated work duration.

### `loyalty_transactions` (New)
- `id` (UUID): Primary Key.
- `customer_id`: Reference to customer.
- `order_id`: Reference to order (optional).
- `type`: 'earn', 'redeem', 'adjustment', 'expire', 'bonus'.
- `points`: +/- amount.
- `description`: Text details.

### `customer_addresses` (New)
- `id` (UUID): Primary Key.
- `customer_id`: Reference to customer.
- `label`: 'Home', 'Office'.
- `address`: Full address text.
- `is_default`: Boolean.

### `saved_items` (New)
- `id` (UUID): Primary Key.
- `customer_id`: Reference to customer.
- `menu_item_id`: Reference to menu item.

## Features
- **RLS:** Enabled on all major tables.
- **Triggers:** Auto-update `updated_at`.
- **Extensions:** `uuid-ossp` enabled.
