-- Fix 1: Secure the create_default_household function
-- Remove user_id parameter and use auth.uid() internally
CREATE OR REPLACE FUNCTION public.create_default_household()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  household_id UUID;
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();
  
  -- Ensure user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Create default household
  INSERT INTO public.households (name, description)
  VALUES ('My Household', 'Default household')
  RETURNING id INTO household_id;
  
  -- Add current user as owner and primary member
  INSERT INTO public.household_members (household_id, profile_id, role, is_primary)
  VALUES (household_id, current_user_id, 'owner', TRUE);
  
  RETURN household_id;
END;
$function$;

-- Fix 2: Revoke RPC access from helper security definer functions
-- These should only be used internally by policies and other functions
REVOKE EXECUTE ON FUNCTION public.user_in_household(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.share_household_with(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_household_role(uuid, uuid) FROM anon, authenticated;

-- Ensure accept_invitation remains callable by authenticated users
GRANT EXECUTE ON FUNCTION public.accept_invitation(text) TO authenticated;