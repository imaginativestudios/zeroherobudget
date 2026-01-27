-- Add debt_id column to transactions table for linking payments to specific debts
ALTER TABLE public.transactions 
ADD COLUMN debt_id uuid REFERENCES public.debts(id) ON DELETE SET NULL;

-- Create index for efficient lookups
CREATE INDEX idx_transactions_debt_id ON public.transactions(debt_id);

-- Comment for documentation
COMMENT ON COLUMN public.transactions.debt_id IS 
  'Optional link to debt for automatic balance updates on debt payments';