-- Remove the broken trial-ending-reminder cron job (the trial-reminder edge function has been deleted)
SELECT cron.unschedule('trial-ending-reminder-daily');