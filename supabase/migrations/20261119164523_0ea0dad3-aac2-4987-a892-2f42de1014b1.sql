CREATE TABLE public.referral_notification_receipts (
 user_id uuid PRIMARY KEY,
 source text,
 other text,
 signup_at timestamptz,
 status text NOT NULL DEFAULT 'pending',
 first_attempt_at timestamptz,
 lease_until timestamptz,
 sent_at timestamptz,
 provider_id text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.referral_notification_receipts TO service_role;
REVOKE ALL ON public.referral_notification_receipts FROM anon, authenticated;
ALTER TABLE public.referral_notification_receipts ENABLE ROW LEVEL SECURITY;
INSERT INTO public.referral_notification_receipts (user_id, status)
SELECT id, 'excluded' FROM auth.users;
CREATE OR REPLACE FUNCTION public.claim_referral_notifications()
RETURNS TABLE(user_id uuid, source text, other text, signup_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 INSERT INTO public.referral_notification_receipts(user_id, source, other, signup_at)
 SELECT u.id, u.raw_user_meta_data->>'referral_source',
 CASE WHEN u.raw_user_meta_data->>'referral_source' = 'Other' THEN left(trim(u.raw_user_meta_data->>'referral_source_other'), 120) ELSE '' END,
 u.created_at FROM auth.users u
 WHERE u.raw_user_meta_data->>'referral_source' IN ('A friend or family member','LinkedIn','Reddit','Facebook group','Google search','Product Hunt','Other')
 ON CONFLICT DO NOTHING;
 RETURN QUERY
 WITH candidates AS (
 SELECT r.user_id FROM public.referral_notification_receipts r
 WHERE r.status = 'pending' AND (r.lease_until IS NULL OR r.lease_until < now())
 AND (r.first_attempt_at IS NULL OR r.first_attempt_at > now() - interval '23 hours')
 ORDER BY r.created_at LIMIT 50 FOR UPDATE SKIP LOCKED
 )
 UPDATE public.referral_notification_receipts r
 SET first_attempt_at = coalesce(r.first_attempt_at, now()), lease_until = now() + interval '5 minutes', updated_at = now()
 FROM candidates c WHERE r.user_id = c.user_id
 RETURNING r.user_id, r.source, r.other, r.signup_at;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_referral_notifications() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_referral_notifications() TO service_role;