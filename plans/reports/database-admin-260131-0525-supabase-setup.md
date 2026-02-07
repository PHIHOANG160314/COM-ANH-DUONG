# Supabase Setup & Migration Report

**Date:** 2026-01-31
**Topic:** Supabase Backend Setup for React App

## Executive Summary
Successfully created a comprehensive Supabase setup for the Cơm Ánh Dương React application. This includes a consolidated database schema, rigorous Row Level Security (RLS) policies, and developer tooling for type safety. The setup bridges the gap between the existing SQL scripts and the modern React 19 frontend requirements.

## Deliverables

### 1. Database Migrations
- **Schema:** `react-app/supabase/migrations/20260131_initial_schema.sql`
  - Consolidated all necessary tables (Users, Menu, Orders, Staff, Shippers).
  - Implemented `uuid` primary keys and standardized timestamps.
  - Added triggers for `updated_at`, `order_number` generation, and Auth profile creation.
  - Included `daily_menu_config` and `featured_items_config` for realtime controls.

- **Security (RLS):** `react-app/supabase/migrations/20260131_rls_policies.sql`
  - Enabled RLS on ALL tables.
  - Defined granular policies for Public (read-only menu), Customers (own data), and Staff/Admins (operational access).
  - Addressed specific roles: Kitchen, Shipper, Manager.

### 2. Documentation & Tooling
- **Setup Guide:** `react-app/SUPABASE_SETUP.md`
  - Step-by-step instructions for Supabase Dashboard and CLI usage.
  - detailed guides for creating initial Admin and Staff users.
- **Environment:** Updated `react-app/.env.example` with required Supabase variables.
- **Scripts:** Updated `react-app/package.json` with `supabase:types` script for TypeScript integration.

## Technical Details

### Key Architectural Decisions
- **Auth Integration:** Uses a `profiles` table linked to `auth.users` via trigger for standard users (Admin, Manager, Customer).
- **POS Auth:** Retained `staff` table with PIN-based authentication (`verify_staff_pin` function) for quick POS access, independent of email/password flows.
- **Realtime:** Enabled Supabase Realtime for critical operational tables (`orders`, `order_items`, `delivery_assignments`, `menu_items`).
- **Data Integrity:** Enforced foreign key constraints and proper indexing on frequently queried columns (`status`, `customer_id`, `created_at`).

### Schema Highlights
- `orders`: Central hub with snapshots of customer info.
- `menu_items`: Supports options (size, sugar, etc.) via JSONB.
- `delivery_assignments`: Dedicated table for shipper workflow logic.

## Action Plan

1.  **Apply Migrations:** Run the SQL files in Supabase Dashboard SQL Editor.
2.  **Configure Env:** Create `.env.local` using `.env.example`.
3.  **Generate Types:** Run `npm run supabase:types` (requires Supabase Project ID).
4.  **Seed Users:** Create initial Admin user and Staff PINs as per the Setup Guide.

## Unresolved Questions
- **POS Authentication:** The current `verify_staff_pin` function verifies credentials but does not issue a JWT. The frontend will need to handle session state for POS mode or use a generic "device" account for Supabase connection if Realtime RLS requires it. Current policies allow "Authenticated" users access; anonymous POS access may need further configuration if not logging in via Supabase Auth.
