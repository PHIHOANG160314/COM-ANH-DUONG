# Project Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-30

### Added
- **React 19 Architecture**: Complete rebuild of the application using React 19, TypeScript, and Vite.
- **Project Structure**: Established comprehensive folder structure with strict separation of concerns (shadcn/ui, atomic design).
- **Authentication**: Integrated Supabase Auth with Role-Based Access Control (RBAC) for Customers, Staff, Kitchen, and Shippers.
- **Database**: Implemented Supabase Database schema with tables for `daily_menu`, `orders`, `order_items`, `profiles`.
- **Landing Page**: Responsive home page with featured items, daily menu display, and cart management.
- **Ordering System**: Full customer ordering flow including cart manipulation, checkout, and order tracking.
- **Kitchen Display System (KDS)**: Real-time order monitoring dashboard for kitchen staff with status updates (Pending -> Cooking -> Ready).
- **Staff Portal**: POS-like interface for staff to manage orders, view menu items, and process walk-in customers.
- **Shipper Portal**: dedicated interface for delivery drivers to view assigned orders and update delivery status.
- **Real-time Updates**: Implemented Supabase Realtime subscriptions for instant order status updates across all portals.
- **UI/UX**: Material Design 3 implementation using Tailwind CSS and `shadcn/ui` components.
- **Documentation**: Comprehensive project roadmap, architecture diagrams, and deployment guides.

### Changed
- Migrated legacy frontend to React 19.
- Updated build system to Vite for faster development and production builds.
- Standardized code style and linting rules using ESLint and Prettier.

### Fixed
- Resolved ID parsing issues (stripping leading zeros).
- Fixed daily menu filtering logic.
- improved error handling and logging for database operations.
