-- Explicitly revoke all permissions from anon role on sensitive tables
-- This ensures unauthenticated users cannot access these tables at all

-- Revoke all from profiles for anon
REVOKE ALL ON public.profiles FROM anon;

-- Revoke all from waitlist_signups for anon  
REVOKE ALL ON public.waitlist_signups FROM anon;

-- Revoke all from household_invitations for anon
REVOKE ALL ON public.household_invitations FROM anon;

-- Ensure RLS is forced even for table owners
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_signups FORCE ROW LEVEL SECURITY;
ALTER TABLE public.household_invitations FORCE ROW LEVEL SECURITY;