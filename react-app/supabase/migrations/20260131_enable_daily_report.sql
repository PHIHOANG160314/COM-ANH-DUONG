-- =====================================================
-- DAILY REPORT AUTOMATION
-- Created: 2026-01-31
-- =====================================================

-- 1. Enable pg_cron if not exists (Requires Supabase Extension to be toggled in Dashboard,
-- but we can try creating extension here. Note: pg_cron often requires superuser or dashboard toggle).
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule Job
-- Run at 23:00 (11 PM) every day
-- Calls the Edge Function 'daily-report'
-- Note: Replace PROJECT_REF and ANON_KEY/SERVICE_KEY placeholders in real deployment.
-- Since we can't easily put secrets in SQL, standard practice is to use `pg_net` or similar.
-- Or just rely on Supabase Dashboard UI for Cron.
-- However, we can use `SELECT cron.schedule(...)`

SELECT cron.schedule(
    'daily-report-job', -- name
    '0 23 * * *',       -- schedule (11:00 PM daily)
    $$
    SELECT
        net.http_post(
            url:='https://PROJECT_REF.supabase.co/functions/v1/daily-report',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
            body:='{}'::jsonb
        ) as request_id;
    $$
);

-- Note: The user will need to replace PROJECT_REF and SERVICE_ROLE_KEY manually
-- or set this up via the Supabase Dashboard UI.
-- For now, this migration serves as the template/documentation.
