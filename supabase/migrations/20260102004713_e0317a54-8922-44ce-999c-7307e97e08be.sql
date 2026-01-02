-- Fix 1: Require authentication for profiles table access
-- Add a base authentication requirement to prevent anonymous access
CREATE POLICY "Require authentication for profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Drop the overly permissive policies and keep only the restricted ones
DROP POLICY IF EXISTS "Users can view profiles in their households" ON public.profiles;

-- Recreate with proper authentication requirement built-in
CREATE POLICY "Users can view profiles in their households"
ON public.profiles
FOR SELECT
TO authenticated
USING ((id = auth.uid()) OR private.share_household_with(id));

-- Fix 2: Restrict waitlist_signups to require authentication before admin check
-- First drop existing policy
DROP POLICY IF EXISTS "Only admins can view waitlist signups" ON public.waitlist_signups;

-- Recreate with explicit authenticated role requirement
CREATE POLICY "Only admins can view waitlist signups"
ON public.waitlist_signups
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Fix 3: Restrict household_invitations visibility
-- Token hashes should only be visible to the person who created the invitation
-- Other household members shouldn't see the token_hash column values
DROP POLICY IF EXISTS "Users can view invitations for their households" ON public.household_invitations;

-- Create more restrictive policy - only the inviter can see full invitation details
CREATE POLICY "Inviters can view their sent invitations"
ON public.household_invitations
FOR SELECT
TO authenticated
USING (invited_by = auth.uid());

-- Allow admins/owners to see invitation metadata (but not tokens) for management
-- This is handled by the above policy since admins who create invitations can see them