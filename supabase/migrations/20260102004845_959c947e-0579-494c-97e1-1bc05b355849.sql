-- Fix profiles: Drop overly permissive policies and recreate with authenticated only
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Require authentication for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their households" ON public.profiles;

-- Recreate with proper authenticated role requirement
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in their households"
ON public.profiles FOR SELECT
TO authenticated
USING (private.share_household_with(id));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Fix household_invitations: Restrict all operations to authenticated users only
DROP POLICY IF EXISTS "Only owners and admins can create invitations" ON public.household_invitations;
DROP POLICY IF EXISTS "Only owners and admins can update invitations" ON public.household_invitations;
DROP POLICY IF EXISTS "Owners and admins can delete invitations" ON public.household_invitations;

CREATE POLICY "Only owners and admins can create invitations"
ON public.household_invitations FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM household_members
  WHERE household_members.household_id = household_invitations.household_id
    AND household_members.profile_id = auth.uid()
    AND household_members.role IN ('owner', 'admin')
));

CREATE POLICY "Only owners and admins can update invitations"
ON public.household_invitations FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM household_members
  WHERE household_members.household_id = household_invitations.household_id
    AND household_members.profile_id = auth.uid()
    AND household_members.role IN ('owner', 'admin')
));

CREATE POLICY "Owners and admins can delete invitations"
ON public.household_invitations FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM household_members
  WHERE household_members.household_id = household_invitations.household_id
    AND household_members.profile_id = auth.uid()
    AND household_members.role IN ('owner', 'admin')
));