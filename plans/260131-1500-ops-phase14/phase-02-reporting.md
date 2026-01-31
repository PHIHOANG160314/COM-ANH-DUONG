# Phase 2: Daily Report Automation

**Status:** Completed
**Goal:** Automate end-of-day reporting.

## Components

### 1. Edge Function `daily-report`
-   Query `get_revenue_analytics` for today.
-   Format a text/HTML summary:
    ```
    Date: 2026-01-31
    Revenue: 5,000,000 VND
    Orders: 120
    Avg Value: 41,600 VND
    Top Item: Com Tam Suon
    ```
-   Call Email Provider (or just `console.log` for MVP).

### 2. Cron Job
-   Use `pg_cron` (available in Supabase).
-   Schedule: `0 23 * * *` (11 PM daily).
-   Command: `select net.http_post(...)` to call Edge Function.

## Implementation
1.  Scaffold function `supabase/functions/daily-report`.
2.  Create migration `20260131_enable_daily_report.sql` for Cron.
