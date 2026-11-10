DROP INDEX IF EXISTS public.idx_accounts_plaid_account_id;
CREATE UNIQUE INDEX idx_accounts_plaid_account_id ON public.accounts (plaid_account_id);

DROP INDEX IF EXISTS public.idx_transactions_plaid_transaction_id;
CREATE UNIQUE INDEX idx_transactions_plaid_transaction_id ON public.transactions (plaid_transaction_id);