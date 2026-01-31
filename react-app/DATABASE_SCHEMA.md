# Database Schema - Cơm Ánh Dương POS System

This document describes the database schema for the restaurant POS system.

## Overview

The system uses **Supabase (PostgreSQL)** with Row Level Security (RLS) policies for data protection.

---

## Tables

### 1. `profiles`
User profile information linked to Supabase Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | User ID (matches auth.users.id) |
| `full_name` | text | NOT NULL | User's full name |
| `phone` | text | | Phone number |
| `address` | text | | Delivery address |
| `role` | text | NOT NULL | User role: customer, staff, shipper, admin |
| `created_at` | timestamptz | DEFAULT now() | Account creation timestamp |
| `updated_at` | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
- `profiles_role_idx` on `role`

**RLS Policies:**
- Public read for all profiles
- Users can update their own profile
- Only admins can change roles

---

### 2. `menu_items`
Restaurant menu items (dishes, drinks, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Item ID (e.g., M001, M002) |
| `name` | text | NOT NULL | Item name (Vietnamese) |
| `name_en` | text | | Item name (English) |
| `description` | text | | Item description |
| `price` | integer | NOT NULL | Price in VND |
| `category` | text | NOT NULL | Category: main, side, drink, dessert |
| `image_url` | text | | Product image URL |
| `available` | boolean | DEFAULT true | Is currently available |
| `featured` | boolean | DEFAULT false | Show on featured list |
| `preparation_time` | integer | | Est. prep time in minutes |
| `created_at` | timestamptz | DEFAULT now() | Item creation timestamp |
| `updated_at` | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
- `menu_items_category_idx` on `category`
- `menu_items_available_idx` on `available`
- `menu_items_featured_idx` on `featured`

**RLS Policies:**
- Public read for all menu items
- Only staff/admin can insert/update/delete

---

### 3. `orders`
Customer orders

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Order ID |
| `order_number` | serial | UNIQUE NOT NULL | Human-readable order number |
| `customer_id` | uuid | FK → profiles.id | Customer who placed order |
| `customer_name` | text | NOT NULL | Customer name |
| `customer_phone` | text | NOT NULL | Customer phone |
| `delivery_address` | text | | Delivery address (if delivery) |
| `order_type` | text | NOT NULL | dine_in, takeaway, delivery |
| `status` | text | NOT NULL | pending, preparing, ready, delivering, completed, cancelled |
| `payment_method` | text | NOT NULL | cash, vnpay, momo |
| `payment_status` | text | NOT NULL | pending, paid, failed |
| `total_amount` | integer | NOT NULL | Total price in VND |
| `notes` | text | | Customer notes |
| `created_at` | timestamptz | DEFAULT now() | Order creation timestamp |
| `updated_at` | timestamptz | DEFAULT now() | Last update timestamp |
| `completed_at` | timestamptz | | Order completion timestamp |

**Indexes:**
- `orders_customer_id_idx` on `customer_id`
- `orders_status_idx` on `status`
- `orders_payment_status_idx` on `payment_status`
- `orders_created_at_idx` on `created_at DESC`

**RLS Policies:**
- Public can insert new orders (anonymous ordering)
- Customers can read their own orders
- Staff/admin can read all orders
- Staff/admin can update order status

---

### 4. `order_items`
Individual items within an order

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Order item ID |
| `order_id` | uuid | FK → orders.id | Parent order |
| `menu_item_id` | text | FK → menu_items.id | Menu item reference |
| `quantity` | integer | NOT NULL | Quantity ordered |
| `price` | integer | NOT NULL | Unit price at time of order |
| `notes` | text | | Special requests |
| `created_at` | timestamptz | DEFAULT now() | Item creation timestamp |

**Indexes:**
- `order_items_order_id_idx` on `order_id`
- `order_items_menu_item_id_idx` on `menu_item_id`

**RLS Policies:**
- Public can insert order items
- Customers can read items of their orders
- Staff/admin can read all order items

---

### 5. `deliveries`
Delivery tracking for orders

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Delivery ID |
| `order_id` | uuid | FK → orders.id UNIQUE | Associated order |
| `shipper_id` | uuid | FK → profiles.id | Assigned shipper |
| `status` | text | NOT NULL | pending, assigned, picked_up, in_transit, delivered, failed |
| `pickup_time` | timestamptz | | Time shipper picked up order |
| `delivery_time` | timestamptz | | Time order was delivered |
| `notes` | text | | Delivery notes |
| `created_at` | timestamptz | DEFAULT now() | Delivery creation timestamp |
| `updated_at` | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
- `deliveries_order_id_idx` on `order_id`
- `deliveries_shipper_id_idx` on `shipper_id`
- `deliveries_status_idx` on `status`

**RLS Policies:**
- Staff can create deliveries
- Shippers can read/update their assigned deliveries
- Admin can read all deliveries

---

### 6. `payment_transactions` (Optional - for VNPay/MoMo)
Payment transaction records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Transaction ID |
| `order_id` | uuid | FK → orders.id | Associated order |
| `provider` | text | NOT NULL | vnpay, momo, cash |
| `amount` | integer | NOT NULL | Amount in VND |
| `status` | text | NOT NULL | pending, success, failed, expired |
| `transaction_code` | text | UNIQUE | Provider transaction code |
| `provider_response` | jsonb | | Full response from provider |
| `created_at` | timestamptz | DEFAULT now() | Transaction creation |
| `updated_at` | timestamptz | DEFAULT now() | Last update |

**Indexes:**
- `payment_transactions_order_id_idx` on `order_id`
- `payment_transactions_status_idx` on `status`
- `payment_transactions_transaction_code_idx` on `transaction_code`

**RLS Policies:**
- Staff/admin can read all transactions
- Customers can read their own order transactions

---

## Enums and Constants

### Order Types
- `dine_in` - Eat at restaurant
- `takeaway` - Take away
- `delivery` - Home delivery

### Order Status Flow
```
pending → preparing → ready → delivering → completed
              ↓
          cancelled
```

### Payment Methods
- `cash` - Cash on Delivery (COD)
- `vnpay` - VNPay gateway
- `momo` - MoMo wallet

### Payment Status
- `pending` - Waiting for payment
- `paid` - Successfully paid
- `failed` - Payment failed

### User Roles
- `customer` - Regular customer
- `staff` - Restaurant staff
- `shipper` - Delivery person
- `admin` - System administrator

---

## Row Level Security (RLS) Policies

All tables have RLS enabled for security. Key policies:

1. **Public Access:**
   - Read `menu_items` (available items only)
   - Insert `orders`, `order_items` (anonymous ordering)

2. **Authenticated Users:**
   - Read/update own `profiles`
   - Read own `orders` and `order_items`

3. **Staff Role:**
   - Read all `orders`, `order_items`, `deliveries`
   - Update `orders.status`, `menu_items`
   - Create `deliveries`

4. **Shipper Role:**
   - Read/update assigned `deliveries`
   - Read associated `orders`

5. **Admin Role:**
   - Full access to all tables
   - Manage user `roles` in `profiles`

---

## Seed Data

To populate with sample data:

1. Open Supabase SQL Editor
2. Run `supabase/seed.sql`

This creates:
- Sample menu items (10+ dishes)
- Test user profiles (customer, staff, shipper, admin)
- Sample orders for testing

---

## Migrations

Located in `supabase/migrations/`:

1. `20260131_initial_schema.sql` - Create all tables
2. `20260131_rls_policies.sql` - Configure RLS policies
3. `20260131_create_payment_transactions.sql` - Payment tables (optional)

Run migrations in Supabase SQL Editor in order.

---

**Last Updated:** 2026-01-31
