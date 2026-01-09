-- Add household-level data sharing: SELECT policies for financial tables
-- Allows household members to view each other's data while keeping write ops owner-only

-- accounts: Allow household members to view
CREATE POLICY "Members can view household accounts"
ON public.accounts
FOR SELECT
TO authenticated
USING (
  household_id IS NOT NULL 
  AND private.user_in_household(household_id)
);

-- transactions: Allow household members to view
CREATE POLICY "Members can view household transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  household_id IS NOT NULL 
  AND private.user_in_household(household_id)
);

-- expenses: Allow household members to view
CREATE POLICY "Members can view household expenses"
ON public.expenses
FOR SELECT
TO authenticated
USING (
  household_id IS NOT NULL 
  AND private.user_in_household(household_id)
);

-- debts: Allow household members to view
CREATE POLICY "Members can view household debts"
ON public.debts
FOR SELECT
TO authenticated
USING (
  household_id IS NOT NULL 
  AND private.user_in_household(household_id)
);

-- subscriptions: Allow household members to view
CREATE POLICY "Members can view household subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  household_id IS NOT NULL 
  AND private.user_in_household(household_id)
);

-- subscription_matches: Allow household members to view
CREATE POLICY "Members can view household subscription matches"
ON public.subscription_matches
FOR SELECT
TO authenticated
USING (
  household_id IS NOT NULL 
  AND private.user_in_household(household_id)
);