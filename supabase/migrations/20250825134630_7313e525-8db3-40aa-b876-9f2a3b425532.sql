-- Fix RLS for household members and enable safe access patterns using security definer functions
-- and broaden profile visibility to members within the same household.

BEGIN;

-- 1) Helper functions (security definer) to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.user_in_household(hh_id uuid, uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members
    WHERE household_id = hh_id AND profile_id = uid
  );
$$;

CREATE OR REPLACE FUNCTION public.share_household_with(other_profile_id uuid, uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members hm1
    JOIN public.household_members hm2
      ON hm1.household_id = hm2.household_id
    WHERE hm1.profile_id = uid
      AND hm2.profile_id = other_profile_id
  );
$$;

-- 2) household_members policies
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- Drop old/recursive/conflicting policies
DROP POLICY IF EXISTS "Only owners and admins can manage members" ON public.household_members;
DROP POLICY IF EXISTS "Only owners and admins can remove members" ON public.household_members;
DROP POLICY IF EXISTS "Only owners and admins can update member roles" ON public.household_members;
DROP POLICY IF EXISTS "Users can view members of their households" ON public.household_members;
DROP POLICY IF EXISTS "Users can view their own membership rows" ON public.household_members;
DROP POLICY IF EXISTS "Users can add themselves as members" ON public.household_members;
DROP POLICY IF EXISTS "Users can update their own membership row" ON public.household_members;
DROP POLICY IF EXISTS "Users can delete their own membership row" ON public.household_members;

-- Read: Any member can view all members in their household
CREATE POLICY "Members can view members of their households"
ON public.household_members
FOR SELECT
USING (
  public.user_in_household(household_members.household_id)
);

-- Insert: Only owners/admins can add members
CREATE POLICY "Owners and admins can add members"
ON public.household_members
FOR INSERT
WITH CHECK (
  public.get_user_household_role(household_members.household_id, auth.uid()) IN ('owner','admin')
);

-- Update: Only owners/admins can update member roles
CREATE POLICY "Owners and admins can update members"
ON public.household_members
FOR UPDATE
USING (
  public.get_user_household_role(household_members.household_id, auth.uid()) IN ('owner','admin')
);

-- Delete: Only owners/admins can remove members
CREATE POLICY "Owners and admins can remove members"
ON public.household_members
FOR DELETE
USING (
  public.get_user_household_role(household_members.household_id, auth.uid()) IN ('owner','admin')
);

-- Delete: Members can leave their own household
CREATE POLICY "Members can leave their households"
ON public.household_members
FOR DELETE
USING (
  profile_id = auth.uid()
);

-- 3) profiles policies: allow viewing profiles of members who share a household
-- (keeps existing self-view policy; this is an additional permissive policy)
DROP POLICY IF EXISTS "Users can view profiles in their households" ON public.profiles;
CREATE POLICY "Users can view profiles in their households"
ON public.profiles
FOR SELECT
USING (
  profiles.id = auth.uid() OR public.share_household_with(profiles.id)
);

COMMIT;