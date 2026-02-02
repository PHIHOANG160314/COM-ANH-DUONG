# Project Changelog

## [Unreleased]

## [1.0.0] - 2026-02-02

### Added
- **Admin Dashboard**: Comprehensive statistics dashboard with real-time updates.
  - Daily Revenue Chart (Last 7 days revenue vs orders) using Recharts.
  - Top Selling Items table (Top 5 items by revenue).
  - Key Performance Indicators (KPI) cards: Today's Revenue, Orders, Pending Count, Average Order Value.
  - Trend indicators comparing today vs yesterday.
- **Order Notifications**: Real-time sound and toast notifications for new orders (Admin/Kitchen/Staff only).
- **Receipt Printing**: Thermal printer-friendly (80mm) receipt generation feature in Order Management.
- **Store Status**: Automated "Open/Closing/Closed" badge based on operating hours (08:00 - 22:00) with visual countdown.

### Fixed
- **Timezone Handling**: Fixed CI/CD test failures by enforcing explicit timezone offsets in tests.
- **Type Safety**: Resolved TypeScript errors in Recharts tooltip formatters.
- **Tech Debt**: Removed console logs and explicit `any` types in newly added features.

### Changed
- Refactored `useAdminStats` to aggregate data client-side from Supabase `orders` table.
- Updated `OperatingHours` component to strictly follow Vietnam timezone logic for opening/closing status.
