-- lovable-cron-fallback-reviewed: event-driven delivery; retry checks only while pending, up to 288/day during failures, unscheduled after drain.
CREATE OR REPLACE FUNCTION public.wake_referral_notifications() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$ BEGIN
 PERFORM net.http_post(url := 'https://ukpejgrghpewwdfztryg.supabase.co/functions/v1/referral-notifications', headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)), body := '{}'::jsonb);
END; $$;
REVOKE ALL ON FUNCTION public.wake_referral_notifications() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.wake_referral_notifications() TO service_role;
CREATE OR REPLACE FUNCTION public.finish_referral_notification_batch() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$ BEGIN
 PERFORM pg_catalog.pg_advisory_xact_lock(7191944);
 IF NOT EXISTS (SELECT 1 FROM public.referral_notification_receipts WHERE status = 'pending' AND (first_attempt_at IS NULL OR first_attempt_at > now() - interval '23 hours')) THEN
 IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'referral-notifications-retry') THEN PERFORM cron.unschedule('referral-notifications-retry'); END IF;
 END IF;
END; $$;
REVOKE ALL ON FUNCTION public.finish_referral_notification_batch() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_referral_notification_batch() TO service_role;
CREATE OR REPLACE FUNCTION public.enqueue_signup_referral_notification() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE meta jsonb; registered_at timestamptz;
BEGIN
 SELECT raw_user_meta_data, created_at INTO meta, registered_at FROM auth.users WHERE id = NEW.id;
 IF meta->>'referral_source' IN ('A friend or family member','LinkedIn','Reddit','Facebook group','Google search','Product Hunt','Other') THEN
 INSERT INTO public.referral_notification_receipts(user_id,source,other,signup_at) VALUES(NEW.id,meta->>'referral_source',CASE WHEN meta->>'referral_source' = 'Other' THEN left(trim(meta->>'referral_source_other'),120) ELSE '' END,registered_at) ON CONFLICT DO NOTHING;
 IF FOUND THEN
 PERFORM pg_catalog.pg_advisory_xact_lock(7191944);
 IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'referral-notifications-retry') THEN PERFORM cron.schedule('referral-notifications-retry','*/5 * * * *','SELECT public.wake_referral_notifications();'); END IF;
 PERFORM public.wake_referral_notifications();
 END IF;
 END IF;
 RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Referral notification enqueue failed [%]', SQLSTATE; RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.enqueue_signup_referral_notification() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER enqueue_signup_referral_notification AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.enqueue_signup_referral_notification();