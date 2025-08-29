-- Create tables for financial data with RLS policies
-- This migrates all localStorage financial data to secure Supabase storage

-- Create accounts table
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'cash', 'investment')),
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL,
  flow TEXT NOT NULL CHECK (flow IN ('in', 'out')),
  expense_id UUID NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table (budget items)
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  is_income BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create debts table
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance DECIMAL(12,2) NOT NULL,
  minimum_payment DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,4) NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  next_billing_date DATE,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription matches table
CREATE TABLE public.subscription_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user settings table for things like income, strategy, etc.
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, household_id, setting_key)
);

-- Enable RLS on all tables
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for accounts
CREATE POLICY "Users can view their own accounts" ON public.accounts
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own accounts" ON public.accounts
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own accounts" ON public.accounts
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own accounts" ON public.accounts
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own transactions" ON public.transactions
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own transactions" ON public.transactions
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for expenses
CREATE POLICY "Users can view their own expenses" ON public.expenses
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own expenses" ON public.expenses
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own expenses" ON public.expenses
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own expenses" ON public.expenses
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for debts
CREATE POLICY "Users can view their own debts" ON public.debts
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own debts" ON public.debts
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own debts" ON public.debts
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own debts" ON public.debts
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own subscriptions" ON public.subscriptions
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for subscription matches
CREATE POLICY "Users can view their own subscription matches" ON public.subscription_matches
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own subscription matches" ON public.subscription_matches
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own subscription matches" ON public.subscription_matches
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own subscription matches" ON public.subscription_matches
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for user settings
CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own settings" ON public.user_settings
  FOR DELETE USING (user_id = auth.uid());

-- Create updated_at triggers
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();