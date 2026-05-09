DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-plaid-transactions-daily') THEN
    PERFORM cron.unschedule('sync-plaid-transactions-daily');
  END IF;
END $$;

SELECT cron.schedule(
  'sync-plaid-transactions-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ukpejgrghpewwdfztryg.supabase.co/functions/v1/sync-plaid-transactions',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcGVqZ3JnaHBld3dkZnp0cnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDg2MjksImV4cCI6MjA3MTYyNDYyOX0.1gSlaPh9Og4xCqrL31RfNw6L2yy6kA0qUpXRNhXML4A',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)
    ),
    body := jsonb_build_object('source', 'cron', 'time', now())
  );
  $$
);