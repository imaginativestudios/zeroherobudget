-- Add unsubscribed_at column to track when users unsubscribe from the waitlist
ALTER TABLE public.waitlist_signups 
ADD COLUMN unsubscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;