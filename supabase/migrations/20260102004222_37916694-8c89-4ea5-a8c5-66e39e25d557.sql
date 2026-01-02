-- Step 1: Add token_hash column
ALTER TABLE public.household_invitations 
ADD COLUMN token_hash TEXT;

-- Step 2: Make token column nullable
ALTER TABLE public.household_invitations 
ALTER COLUMN token DROP NOT NULL;

-- Step 3: Hash existing tokens and clear plain text
UPDATE public.household_invitations
SET token_hash = crypt(token, gen_salt('bf')), token = NULL
WHERE token IS NOT NULL;

-- Step 4: Create trigger function to hash tokens on insert
CREATE OR REPLACE FUNCTION public.hash_invitation_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Hash the token and store it, clear plain text
  IF NEW.token IS NOT NULL THEN
    NEW.token_hash := crypt(NEW.token, gen_salt('bf'));
    NEW.token := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Step 5: Create trigger
DROP TRIGGER IF EXISTS hash_invitation_token_trigger ON public.household_invitations;
CREATE TRIGGER hash_invitation_token_trigger
BEFORE INSERT ON public.household_invitations
FOR EACH ROW
EXECUTE FUNCTION public.hash_invitation_token();