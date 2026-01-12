-- Add CHECK constraint for transaction description length (matches edge function validation)
ALTER TABLE public.transactions 
ADD CONSTRAINT transaction_description_length 
CHECK (length(description) <= 500);

-- Revoke EXECUTE permissions on has_role function to prevent role enumeration
-- The function will still work within RLS policies (which run as the function owner)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;