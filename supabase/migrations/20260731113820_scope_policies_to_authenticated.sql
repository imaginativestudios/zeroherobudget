-- Rescope 20 policies from the PUBLIC role to `authenticated`.
--
-- These were created without a TO clause, which in Postgres silently defaults
-- to PUBLIC -- a role that includes `anon`. Confirmed against production:
--
--   select tablename, policyname, cmd, roles::text from pg_policies
--   where schemaname = 'public' and ('anon' = any(roles) or 'public' = any(roles));
--
-- returned 20 rows with roles = {public}, covering accounts, transactions,
-- debts, expenses, subscriptions, subscription_matches, user_settings,
-- transaction_categorization_history, and households -- every table holding
-- financial data.
--
-- NOT currently exploitable. Each policy carries an auth.uid()-based qualifier,
-- and for an anonymous request auth.uid() is NULL, so `user_id = NULL` evaluates
-- to NULL. RLS requires TRUE to pass, so anonymous callers get zero rows. The
-- qualifier is doing the work, not the role scoping.
--
-- That margin is thinner than it should be, and inconsistent with hardening
-- already applied: 20260512163741 and 20260709184322 deliberately rewrote
-- household_members, accounts, and transactions policies as TO authenticated.
-- These were missed.
--
-- The companion migration in this PR is the argument for fixing it: one missing
-- predicate on one user_settings policy defeated the account-deletion email
-- verification entirely. Narrower default roles limit the blast radius of the
-- next such mistake.
--
-- Role scoping only -- every USING and WITH CHECK expression below is copied
-- verbatim from the production pg_policies output, so behavior for logged-in
-- users is unchanged. ALTER POLICY cannot change roles, hence DROP + CREATE.

-- accounts
DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;
CREATE POLICY "Users can view their own accounts"
ON public.accounts FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.accounts;
CREATE POLICY "Users can delete their own accounts"
ON public.accounts FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- debts
DROP POLICY IF EXISTS "Users can view their own debts" ON public.debts;
CREATE POLICY "Users can view their own debts"
ON public.debts FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own debts" ON public.debts;
CREATE POLICY "Users can delete their own debts"
ON public.debts FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- expenses
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
CREATE POLICY "Users can view their own expenses"
ON public.expenses FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;
CREATE POLICY "Users can delete their own expenses"
ON public.expenses FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- households
DROP POLICY IF EXISTS "Users can view households they belong to" ON public.households;
CREATE POLICY "Users can view households they belong to"
ON public.households FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM household_members
  WHERE household_members.household_id = households.id
    AND household_members.profile_id = auth.uid()
));

DROP POLICY IF EXISTS "Only owners and admins can update households" ON public.households;
CREATE POLICY "Only owners and admins can update households"
ON public.households FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM household_members
  WHERE household_members.household_id = households.id
    AND household_members.profile_id = auth.uid()
    AND household_members.role = ANY (ARRAY['owner'::household_role, 'admin'::household_role])
));

-- subscription_matches
DROP POLICY IF EXISTS "Users can view their own subscription matches" ON public.subscription_matches;
CREATE POLICY "Users can view their own subscription matches"
ON public.subscription_matches FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own subscription matches" ON public.subscription_matches;
CREATE POLICY "Users can update their own subscription matches"
ON public.subscription_matches FOR UPDATE TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own subscription matches" ON public.subscription_matches;
CREATE POLICY "Users can delete their own subscription matches"
ON public.subscription_matches FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can delete their own subscriptions"
ON public.subscriptions FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- transaction_categorization_history
DROP POLICY IF EXISTS "Users can view their own categorization history" ON public.transaction_categorization_history;
CREATE POLICY "Users can view their own categorization history"
ON public.transaction_categorization_history FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
CREATE POLICY "Users can delete their own transactions"
ON public.transactions FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- user_settings
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own settings" ON public.user_settings;
CREATE POLICY "Users can create their own settings"
ON public.user_settings FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own non-security settings" ON public.user_settings;
CREATE POLICY "Users can update their own non-security settings"
ON public.user_settings FOR UPDATE TO authenticated
USING (
  user_id = auth.uid()
  AND setting_key <> ALL (ARRAY['deletion_code_attempts'::text, 'deletion_code'::text])
)
WITH CHECK (
  user_id = auth.uid()
  AND setting_key <> ALL (ARRAY['deletion_code_attempts'::text, 'deletion_code'::text])
);

DROP POLICY IF EXISTS "Users can delete their own non-security settings" ON public.user_settings;
CREATE POLICY "Users can delete their own non-security settings"
ON public.user_settings FOR DELETE TO authenticated
USING (
  user_id = auth.uid()
  AND setting_key <> ALL (ARRAY['deletion_code_attempts'::text, 'deletion_code'::text])
);
