-- Create enums for roles and invitation status
CREATE TYPE public.household_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create households table
CREATE TABLE public.households (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create household_members table
CREATE TABLE public.household_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.household_role NOT NULL DEFAULT 'member',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(household_id, profile_id)
);

-- Create household_invitations table
CREATE TABLE public.household_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.household_role NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE,
  status public.invitation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_invitations ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to create a default household for new users
CREATE OR REPLACE FUNCTION public.create_default_household(user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to accept household invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to check user's role in a household
CREATE OR REPLACE FUNCTION public.get_user_household_role(household_id UUID, user_id UUID)
RETURNS public.household_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.household_members
  WHERE household_id = $1 AND profile_id = $2;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for households
CREATE POLICY "Users can view households they belong to"
  ON public.households FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = households.id AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Only owners and admins can update households"
  ON public.households FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = households.id 
        AND profile_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can create households"
  ON public.households FOR INSERT
  WITH CHECK (TRUE);

-- RLS Policies for household_members
CREATE POLICY "Users can view members of their households"
  ON public.household_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = household_members.household_id 
        AND hm.profile_id = auth.uid()
    )
  );

CREATE POLICY "Only owners and admins can manage members"
  ON public.household_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = household_members.household_id
        AND profile_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Only owners and admins can update member roles"
  ON public.household_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = household_members.household_id
        AND profile_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Only owners and admins can remove members"
  ON public.household_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = household_members.household_id
        AND profile_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for household_invitations
CREATE POLICY "Users can view invitations for their households"
  ON public.household_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = household_invitations.household_id
        AND profile_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Only owners and admins can create invitations"
  ON public.household_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = household_invitations.household_id
        AND profile_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Only owners and admins can update invitations"
  ON public.household_invitations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = household_invitations.household_id
        AND profile_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );