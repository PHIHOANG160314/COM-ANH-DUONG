-- Enable pg_cron extension (Must be done by Superuser/Dashboard)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the reconciliation job to run every 15 minutes
-- Adjust the URL to your deployed Edge Function URL
-- Requires 'net' extension for http requests usually, or pg_net

-- Note: In standard Supabase, use the UI "Database > Cron" or SQL editor if permissions allow.
-- This script is for documentation/manual execution.

/*
SELECT cron.schedule(
    'reconcile_payments',
    '*/15 * * * *',
    $$
    select
        net.http_post(
            url:='https://your-project.supabase.co/functions/v1/reconcile-transactions',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
            body:='{}'::jsonb
        ) as request_id;
    $$
);
*/
