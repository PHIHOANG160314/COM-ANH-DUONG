# Cơm Ánh Dương - Seed Data Documentation

This document describes the test data available for local development and testing.

## 🚀 Quick Start

```bash
# Install dependencies (first time only)
npm install

# Seed database (additive - keeps existing data safe)
npm run seed

# Reset & Seed (WARNING: Deletes all existing data)
npm run seed:reset
```

## 👥 Test Accounts

### Admin
- **Email:** `admin@anhduong.com`
- **Password:** `password123`
- **Role:** Full system access

### Staff (POS Access)
- **Email:** `staff@anhduong.com` / `password123`
- **PIN:** `123456`
- **Roles:**
  - Manager: `Nguyễn Văn Quản Lý`
  - Cashier: `Trần Thị Thu Ngân`
  - Waiter: `Lê Văn Phục Vụ`
  - Chef: `Phạm Thị Bếp`

### Shipper (Delivery App)
- **Email:** `shipper@anhduong.com` / `password123`
- **PIN:** `123456`
- **Names:** `Nguyễn Văn Giao`, `Trần Văn Tốc`

### Customer
- **Email:** `customer@anhduong.com` / `password123`
- **Phone:** `0987654321`

## 🥘 Menu Data
- **Categories:** Phở, Cơm, Bánh Mì, Drinks, Desserts
- **Items:** ~20 items including "Phở Bò Tái", "Cơm Tấm", "Cà Phê Sữa Đá"
- **Images:** Unsplash placeholders (food related)

## 📦 Sample Orders
The `seed.sql` script creates:
- 1 Completed Dine-in order (Paid)
- 1 Processing Dine-in order (Unpaid)

## 🛠️ How It Works
- **SQL Seed (`supabase/seed.sql`)**: Raw SQL inserts for structure, categories, menu items, and complex relationships. Used by Supabase CLI automatically on `supabase start` or reset.
- **TypeScript Seed (`scripts/seed-database.ts`)**: Programmatic seeder using `supabase-js` and `dotenv`. Creates Auth Users (admin/staff) which requires Admin API access.

## ⚠️ Notes
- The `seed:reset` command will **WIPE** the following tables: `order_items`, `orders`, `menu_items`, `categories`, `staff`, `shippers`.
- Auth Users are created via Supabase Admin API in the TypeScript script.
