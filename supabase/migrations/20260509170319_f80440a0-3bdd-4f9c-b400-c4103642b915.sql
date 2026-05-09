
-- 1. plaid_items table
CREATE TABLE public.plaid_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  household_id UUID,
  item_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT,
  cursor TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plaid_items_user_id ON public.plaid_items(user_id);
CREATE INDEX idx_plaid_items_household_id ON public.plaid_items(household_id);

ALTER TABLE public.plaid_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own items (access_token column exposure is handled by app code never selecting it)
CREATE POLICY "Users can view their own plaid items"
  ON public.plaid_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Members can view household plaid items"
  ON public.plaid_items FOR SELECT
  TO authenticated
  USING (household_id IS NOT NULL AND private.user_in_household(household_id));

CREATE POLICY "Users can delete their own plaid items"
  ON public.plaid_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Note: no INSERT/UPDATE policies for users — only service role (edge functions) can write.

CREATE TRIGGER update_plaid_items_updated_at
  BEFORE UPDATE ON public.plaid_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Link accounts to Plaid
ALTER TABLE public.accounts
  ADD COLUMN plaid_account_id TEXT,
  ADD COLUMN plaid_item_id UUID REFERENCES public.plaid_items(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX idx_accounts_plaid_account_id
  ON public.accounts(plaid_account_id)
  WHERE plaid_account_id IS NOT NULL;

-- 3. Add plaid_transaction_id to transactions for idempotent sync
ALTER TABLE public.transactions
  ADD COLUMN plaid_transaction_id TEXT;

CREATE UNIQUE INDEX idx_transactions_plaid_transaction_id
  ON public.transactions(plaid_transaction_id)
  WHERE plaid_transaction_id IS NOT NULL;
