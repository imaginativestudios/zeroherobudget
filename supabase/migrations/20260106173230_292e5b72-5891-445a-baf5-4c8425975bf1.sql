-- Fix accept_invitation to use token_hash with constant-time comparison via crypt()
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record RECORD;
  current_user_email TEXT;
  result JSONB;
BEGIN
  -- Get invitation using secure hash comparison with crypt()
  -- This provides constant-time comparison to prevent timing attacks
  SELECT * INTO invitation_record
  FROM public.household_invitations
  WHERE token_hash = crypt(invitation_token, token_hash)
    AND status = 'pending'
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Get current user's email from profiles
  SELECT email INTO current_user_email
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF current_user_email IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'User profile not found');
  END IF;
  
  -- Validate that the authenticated user's email matches the invitation email
  IF LOWER(current_user_email) != LOWER(invitation_record.email) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'This invitation was sent to a different email address');
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = invitation_record.household_id
      AND profile_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Already a member of this household');
  END IF;
  
  -- Add user to household
  INSERT INTO public.household_members (household_id, profile_id, role)
  VALUES (invitation_record.household_id, auth.uid(), invitation_record.role);
  
  -- Update invitation status
  UPDATE public.household_invitations
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = invitation_record.id;
  
  RETURN jsonb_build_object('success', TRUE, 'household_id', invitation_record.household_id);
END;
$function$;