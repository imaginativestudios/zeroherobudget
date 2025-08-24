-- Fix security warnings by setting proper search_path on all functions

-- Update the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Update the create_default_household function
CREATE OR REPLACE FUNCTION public.create_default_household(user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  household_id UUID;
BEGIN
  -- Create default household
  INSERT INTO public.households (name, description)
  VALUES ('My Household', 'Default household')
  RETURNING id INTO household_id;
  
  -- Add user as owner and primary member
  INSERT INTO public.household_members (household_id, profile_id, role, is_primary)
  VALUES (household_id, user_id, 'owner', TRUE);
  
  RETURN household_id;
END;
$$;

-- Update the accept_invitation function
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
  result JSONB;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM public.household_invitations
  WHERE token = invitation_token
    AND status = 'pending'
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Invalid or expired invitation');
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
$$;

-- Update the get_user_household_role function
CREATE OR REPLACE FUNCTION public.get_user_household_role(household_id UUID, user_id UUID)
RETURNS public.household_role
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.household_members
  WHERE household_id = $1 AND profile_id = $2;
$$;