
-- 1. Restrict plaid_items household visibility: drop the household SELECT policy
-- so only the owning user can read their access_token. Households don't need
-- to see Plaid credentials directly; shared data flows through accounts/transactions.
DROP POLICY IF EXISTS "Members can view household plaid items" ON public.plaid_items;

-- 2. Tighten household_members INSERT: scope to authenticated and prevent
-- self-elevation when there's no existing owner/admin row for the caller.
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.household_members;

CREATE POLICY "Owners and admins can add members"
ON public.household_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND private.get_user_household_role(household_id, auth.uid())
      = ANY (ARRAY['owner'::household_role, 'admin'::household_role])
);

-- Also restrict the other public-role policies on household_members to authenticated
DROP POLICY IF EXISTS "Members can leave their households" ON public.household_members;
CREATE POLICY "Members can leave their households"
ON public.household_members
FOR DELETE
TO authenticated
USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Members can view members of their households" ON public.household_members;
CREATE POLICY "Members can view members of their households"
ON public.household_members
FOR SELECT
TO authenticated
USING (private.user_in_household(household_id));

DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.household_members;
CREATE POLICY "Owners and admins can remove members"
ON public.household_members
FOR DELETE
TO authenticated
USING (
  private.get_user_household_role(household_id, auth.uid())
    = ANY (ARRAY['owner'::household_role, 'admin'::household_role])
);

DROP POLICY IF EXISTS "Owners and admins can update members" ON public.household_members;
CREATE POLICY "Owners and admins can update members"
ON public.household_members
FOR UPDATE
TO authenticated
USING (
  private.get_user_household_role(household_id, auth.uid())
    = ANY (ARRAY['owner'::household_role, 'admin'::household_role])
);

-- 3. Ensure invitation raw token is never readable: clear any legacy plaintext tokens.
UPDATE public.household_invitations SET token = NULL WHERE token IS NOT NULL;
