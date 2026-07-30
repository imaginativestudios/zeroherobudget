-- Restore the intent of 20260112165033, which revoked EXECUTE on has_role from
-- PUBLIC/anon/authenticated. That revoke was undone wholesale by 20260605183759:
--
--   GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role)
--     TO authenticated, anon, service_role;
--
-- The `authenticated` grant is genuinely required: RLS policies invoke has_role as
-- the querying role, so admin policies on user_roles, waitlist_signups, email_logs,
-- and beta_invite_codes all break without it. That is almost certainly why the
-- blanket re-grant happened.
--
-- The `anon` grant is not required. Every policy calling has_role is scoped
-- TO authenticated, and edge functions that need it hold the service role key.
-- Leaving it granted lets an unauthenticated caller probe has_role(<uuid>, 'admin')
-- and enumerate which account IDs are administrators.
--
-- Revoke anon only; leave authenticated and service_role intact.

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
