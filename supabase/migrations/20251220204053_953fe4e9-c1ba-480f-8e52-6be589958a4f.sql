-- Fix waitlist_signups table security by revoking direct INSERT from anon role
-- This ensures the edge function (using service role) is the only entry point
-- which provides email validation, rate limiting context, and proper upsert logic

-- Revoke INSERT permission from anonymous users on waitlist_signups
-- The edge function uses service_role key which bypasses RLS, so it will still work
REVOKE INSERT ON public.waitlist_signups FROM anon;
REVOKE INSERT ON public.waitlist_signups FROM authenticated;