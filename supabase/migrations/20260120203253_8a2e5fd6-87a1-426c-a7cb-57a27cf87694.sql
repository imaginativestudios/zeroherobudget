-- Enable pg_cron and pg_net extensions for scheduled edge function calls
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule trial reminder to run daily at 9 AM UTC
SELECT cron.schedule(
  'trial-ending-reminder-daily',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://ukpejgrghpewwdfztryg.supabase.co/functions/v1/trial-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcGVqZ3JnaHBld3dkZnp0cnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDg2MjksImV4cCI6MjA3MTYyNDYyOX0.1gSlaPh9Og4xCqrL31RfNw6L2yy6kA0qUpXRNhXML4A"}'::jsonb,
        body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);