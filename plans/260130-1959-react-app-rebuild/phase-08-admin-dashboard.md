---
title: "Phase 08: Admin Dashboard"
description: "Create the management dashboard for menu planning, reporting, and user management."
status: completed
priority: P2
effort: 4 days
branch: feat/admin-dashboard
tags: [admin, dashboard, charts, management]
created: 2026-01-30
---

# Phase 08: Admin Dashboard

## Context Links
- [POS Architecture 2026](../reports/researcher-260130-1958-pos-architecture-2026.md)

## Overview
The control center for the restaurant owner. This includes managing the Product Catalog, setting the Daily Menu, viewing Sales Reports, and managing Staff accounts.

## Key Insights
- **Data Density**: Admin needs tables, charts, and forms. Desktop-optimized.
- **Daily Menu Logic**: The core business logic revolves around selecting which products are available *today*.

## Requirements
### Functional
- Product Management (CRUD).
- Daily Menu Planning (Select items for Date).
- Order History/Management (View all, Cancel/Refund).
- Sales Reports (Daily/Weekly revenue).
- Staff Management.

## Architecture
- **Page**: `pages/admin/*`.
- **Features**:
  - `features/admin/products`: ProductTable, ProductForm.
  - `features/admin/menu`: DailyMenuPlanner.
  - `features/admin/reports`: RevenueChart.

## Related Code Files
- `src/pages/home-landing-page.tsx` (Admin might be a sub-route or separate layout)
- `src/features/admin/*`

## Implementation Steps
1.  **Layout**: Admin Sidebar Layout (Dashboard, Products, Menu, Orders, Settings).
2.  **Product CRUD**: Table to view products, Modal to Add/Edit (Supabase `products` table).
3.  **Daily Menu**: Interface to pick products and assign to a date (Supabase `daily_menu` table).
4.  **Order Management**: Full table of all orders with filters.
5.  **Reporting**: Basic aggregation queries (Total Revenue, Top Selling).

## Todo List
- [x] Create Admin Layout (Sidebar)
- [x] Implement Product CRUD
- [x] Implement Daily Menu Planner
- [x] Build Order History Table
- [x] Build Basic Revenue Chart (Recharts or similar)

## Success Criteria
- Admin can add a new dish.
- Admin can set tomorrow's menu.
- Admin can see total sales for today.

## Risk Assessment
- **Risk**: Heavy reporting queries slow down DB.
  - **Mitigation**: Use Supabase Views or Edge Functions for aggregation if data grows large.

## Next Steps
- Proceed to [Phase 09: PWA & Offline](./phase-09-pwa-offline.md).
