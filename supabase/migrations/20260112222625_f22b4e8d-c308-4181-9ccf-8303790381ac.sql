-- Add subscription status columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free'
CHECK (subscription_status IN ('free', 'trialing', 'active', 'canceled', 'past_due'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_amount INTEGER;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ;

-- Enable realtime for profiles table (for subscription status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;