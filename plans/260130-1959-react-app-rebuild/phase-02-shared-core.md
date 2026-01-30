---
title: "Phase 02: Shared Core Library"
description: "Implement shared UI components, core types, API clients, theme system, and utility libraries."
status: completed
priority: P1
effort: 3 days
branch: feat/shared-core
tags: [core, ui-kit, types, supabase, mui]
created: 2026-01-30
completed: 2026-01-30
---

# Phase 02: Shared Core Library

## Context Links
- [MUI v6 + MD3 Patterns](../reports/researcher-260130-1958-mui-v6-md3-pos-research.md)
- [Supabase Integration](../reports/researcher-260130-1958-supabase-react-integration.md)

## Overview
Build the foundational "Shared" layer of FSD. This includes the implementation of the Design System (using MUI v6), the Database Types (Supabase), the API Client (Supabase JS), and core utility functions. This layer will be used by all features and pages.

## Key Insights
- **MUI v6**: Use the new styling engine and theme structure.
- **Supabase Types**: Generate TypeScript types from the database schema automatically or define them manually if the DB isn't ready.
- **Atomic Design**: Build small, reusable atoms (Buttons, Inputs) first.

## Requirements
### Functional
- Consistent Design System applied across the app.
- Type-safe database interactions.
- Reusable UI components for common POS elements (Cards, Lists, Buttons).

### Non-Functional
- 100% Type safety for API responses.
- Accessibility (A11y) compliance for UI components.

## Architecture
- **Theme**: `src/shared/theme/*` - MUI theme configuration (palette, typography, components).
- **UI Kit**: `src/shared/ui/*` - Atomic components (Button, Card, Input).
- **API**: `src/shared/api/*` - Supabase client instance and helper functions.
- **Types**: `src/shared/types/*` - Global types (User, Order, Product).
- **Lib**: `src/shared/lib/*` - Formatters (currency, date), validators.

## Related Code Files
- `src/shared/theme/theme.ts`
- `src/shared/api/supabase.ts`
- `src/shared/ui/*`
- `src/lib/database.types.ts` (Supabase generated types)

## Implementation Steps
1.  **Supabase Client**: Initialize `supabaseClient` in `src/shared/api/supabase.ts`.
2.  **Database Types**: Generate or define TS interfaces for `products`, `orders`, `profiles` in `src/shared/types/database.ts`.
3.  **MUI Theme**: Configure the Material Design 3 theme (colors, typography) in `src/shared/theme/`.
4.  **UI Components**: Create base wrappers for MUI components:
    - `AppButton` (Custom variants for POS)
    - `AppCard` (Standardized shadows/radius)
    - `AppInput` (Form integration)
    - `AppLoading` (Spinners/Skeletons)
5.  **Utilities**: Implement helpers:
    - `formatCurrency` (VND formatting)
    - `formatDate` (DayJS or date-fns)
6.  **Layouts**: Create `MainLayout`, `AuthLayout` in `src/shared/layouts/`.

## Todo List
- [x] Configure Supabase Client
- [x] Define Database Types (Tables: profiles, products, orders, order_items)
- [x] Setup MUI v6 Theme (Palette, Typography, Component Overrides)
- [x] Create UI Kit: Button, Input, Card, Modal, Badge
- [x] Implement Currency Formatter (VND)
- [x] Implement Date Formatter
- [x] Create Layouts (MainLayout, BlankLayout)

## Success Criteria
- Theme applies correctly to components.
- Supabase client connects successfully.
- Basic UI components render with correct styles.
- Types provide autocomplete for database queries.

## Risk Assessment
- **Risk**: Theme inconsistency with legacy design.
  - **Mitigation**: Review legacy CSS and map closely to MUI Palette.

## Next Steps
- Proceed to [Phase 03: Routing & Auth](./phase-03-routing-auth.md).
