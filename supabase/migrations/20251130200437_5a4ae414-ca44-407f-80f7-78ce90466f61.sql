-- Create table to store transaction categorization history for learning
CREATE TABLE IF NOT EXISTS public.transaction_categorization_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  household_id UUID,
  transaction_description TEXT NOT NULL,
  ai_suggested_category TEXT,
  user_selected_category TEXT NOT NULL,
  transaction_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transaction_categorization_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own categorization history" 
ON public.transaction_categorization_history 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own categorization history" 
ON public.transaction_categorization_history 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create index for faster lookups by user and description similarity
CREATE INDEX idx_categorization_history_user_id ON public.transaction_categorization_history(user_id);
CREATE INDEX idx_categorization_history_description ON public.transaction_categorization_history USING gin(to_tsvector('english', transaction_description));