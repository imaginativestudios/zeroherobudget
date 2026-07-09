
-- 1) Household role escalation guard: only owners can create/keep owner rows
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.household_members;
CREATE POLICY "Owners and admins can add members"
ON public.household_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND private.get_user_household_role(household_id, auth.uid())
      = ANY (ARRAY['owner'::household_role, 'admin'::household_role])
  AND (
    role <> 'owner'::household_role
    OR private.get_user_household_role(household_id, auth.uid()) = 'owner'::household_role
  )
);

DROP POLICY IF EXISTS "Owners and admins can update members" ON public.household_members;
CREATE POLICY "Owners and admins can update members"
ON public.household_members
FOR UPDATE
TO authenticated
USING (
  private.get_user_household_role(household_id, auth.uid())
    = ANY (ARRAY['owner'::household_role, 'admin'::household_role])
)
WITH CHECK (
  private.get_user_household_role(household_id, auth.uid())
    = ANY (ARRAY['owner'::household_role, 'admin'::household_role])
  AND (
    role <> 'owner'::household_role
    OR private.get_user_household_role(household_id, auth.uid()) = 'owner'::household_role
  )
);

-- 2) Invite owner escalation guard
DROP POLICY IF EXISTS "Only owners and admins can create invitations" ON public.household_invitations;
CREATE POLICY "Only owners and admins can create invitations"
ON public.household_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM household_members hm
    WHERE hm.household_id = household_invitations.household_id
      AND hm.profile_id = auth.uid()
      AND hm.role IN ('owner', 'admin')
  )
  AND (
    role <> 'owner'::household_role
    OR EXISTS (
      SELECT 1 FROM household_members hm2
      WHERE hm2.household_id = household_invitations.household_id
        AND hm2.profile_id = auth.uid()
        AND hm2.role = 'owner'
    )
  )
);

DROP POLICY IF EXISTS "Only owners and admins can update invitations" ON public.household_invitations;
CREATE POLICY "Only owners and admins can update invitations"
ON public.household_invitations
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM household_members hm
  WHERE hm.household_id = household_invitations.household_id
    AND hm.profile_id = auth.uid()
    AND hm.role IN ('owner', 'admin')
))
WITH CHECK (
  EXISTS (
    SELECT 1 FROM household_members hm
    WHERE hm.household_id = household_invitations.household_id
      AND hm.profile_id = auth.uid()
      AND hm.role IN ('owner', 'admin')
  )
  AND (
    role <> 'owner'::household_role
    OR EXISTS (
      SELECT 1 FROM household_members hm2
      WHERE hm2.household_id = household_invitations.household_id
        AND hm2.profile_id = auth.uid()
        AND hm2.role = 'owner'
    )
  )
);

-- 3) household_id insert gap: caller must be a member of the household when household_id is set
DROP POLICY IF EXISTS "Users can create their own accounts" ON public.accounts;
CREATE POLICY "Users can create their own accounts"
ON public.accounts
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (household_id IS NULL OR private.user_in_household(household_id))
);

DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
CREATE POLICY "Users can update their own accounts"
ON public.accounts
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND (household_id IS NULL OR private.user_in_household(household_id))
);

DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
CREATE POLICY "Users can create their own transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (household_id IS NULL OR private.user_in_household(household_id))
);

DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
CREATE POLICY "Users can update their own transactions"
ON public.transactions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND (household_id IS NULL OR private.user_in_household(household_id))
);

DROP POLICY IF EXISTS "Users can create their own expenses" ON public.expenses;
CREATE POLICY "Users can create their own expenses"
ON public.expenses
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (household_id IS NULL OR private.user_in_household(household_id))
);

DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
CREATE POLICY "Users can update their own expenses"
ON public.expenses
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND (household_id IS NULL OR private.user_in_household(household_id))
);

DROP POLICY IF EXISTS "Users can create their own debts" ON public.debts;
CREATE POLICY "Users can create their own debts"
ON public.debts
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (household_id IS NULL OR private.user_in_household(household_id))
);

DROP POLICY IF EXISTS "Users can update their own debts" ON public.debts;
CREATE POLICY "Users can update their own debts"
ON public.debts
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND (household_id IS NULL OR private.user_in_household(household_id))
);

DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can create their own subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (household_id IS NULL OR private.user_in_household(household_id))
);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update their own subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND (household_id IS NULL OR private.user_in_household(household_id))
);

DROP POLICY IF EXISTS "Users can create their own subscription matches" ON public.subscription_matches;
CREATE POLICY "Users can create their own subscription matches"
ON public.subscription_matches
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (household_id IS NULL OR private.user_in_household(household_id))
);

DROP POLICY IF EXISTS "Users can create their own categorization history" ON public.transaction_categorization_history;
CREATE POLICY "Users can create their own categorization history"
ON public.transaction_categorization_history
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (household_id IS NULL OR private.user_in_household(household_id))
);

-- 4) Waitlist unsubscribe token
ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_signups_unsubscribe_token_key
  ON public.waitlist_signups(unsubscribe_token);
