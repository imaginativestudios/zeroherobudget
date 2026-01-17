-- Force RLS on household_invitations to ensure no bypass
ALTER TABLE public.household_invitations FORCE ROW LEVEL SECURITY;

-- Revoke default SELECT grant from authenticated role
-- This ensures only explicit RLS policies control access
REVOKE SELECT ON public.household_invitations FROM authenticated;

-- Re-grant SELECT so RLS policies can work (RLS still applies)
GRANT SELECT ON public.household_invitations TO authenticated;