-- Phase 1: Critical database hardening (fixed approach)

-- 1. Remove the abusable function variant that accepts user_id parameter
DROP FUNCTION IF EXISTS public.create_default_household(user_id uuid);

-- 2. Create private schema for helper functions
CREATE SCHEMA IF NOT EXISTS private;

-- 3. Drop all dependent policies first
DROP POLICY IF EXISTS "Members can view members of their households" ON public.household_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.household_members;
DROP POLICY IF EXISTS "Owners and admins can update members" ON public.household_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.household_members;
DROP POLICY IF EXISTS "Users can view households they belong to" ON public.households;
DROP POLICY IF EXISTS "Only owners and admins can update households" ON public.households;
DROP POLICY IF EXISTS "Users can view invitations for their households" ON public.household_invitations;
DROP POLICY IF EXISTS "Only owners and admins can create invitations" ON public.household_invitations;
DROP POLICY IF EXISTS "Only owners and admins can update invitations" ON public.household_invitations;
DROP POLICY IF EXISTS "Owners and admins can delete invitations" ON public.household_invitations;
DROP POLICY IF EXISTS "Users can view profiles in their households" ON public.profiles;

-- 4. Now drop the old public functions
DROP FUNCTION IF EXISTS public.user_in_household(uuid, uuid);
DROP FUNCTION IF EXISTS public.share_household_with(uuid, uuid);  
DROP FUNCTION IF EXISTS public.get_user_household_role(uuid, uuid);

-- 5. Create helper functions in private schema
CREATE OR REPLACE FUNCTION private.user_in_household(hh_id uuid, uid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members
    WHERE household_id = hh_id AND profile_id = uid
  );
$function$;

CREATE OR REPLACE FUNCTION private.share_household_with(other_profile_id uuid, uid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members hm1
    JOIN public.household_members hm2
      ON hm1.household_id = hm2.household_id
    WHERE hm1.profile_id = uid
      AND hm2.profile_id = other_profile_id
  );
$function$;

CREATE OR REPLACE FUNCTION private.get_user_household_role(household_id uuid, user_id uuid)
 RETURNS household_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.household_members
  WHERE household_id = $1 AND profile_id = $2;
$function$;

-- 6. Recreate RLS policies using private functions

-- household_members policies
CREATE POLICY "Members can view members of their households" 
ON public.household_members 
FOR SELECT 
USING (private.user_in_household(household_id));

CREATE POLICY "Owners and admins can add members" 
ON public.household_members 
FOR INSERT 
WITH CHECK (private.get_user_household_role(household_id, auth.uid()) = ANY (ARRAY['owner'::household_role, 'admin'::household_role]));

CREATE POLICY "Owners and admins can update members" 
ON public.household_members 
FOR UPDATE 
USING (private.get_user_household_role(household_id, auth.uid()) = ANY (ARRAY['owner'::household_role, 'admin'::household_role]));

CREATE POLICY "Owners and admins can remove members" 
ON public.household_members 
FOR DELETE 
USING (private.get_user_household_role(household_id, auth.uid()) = ANY (ARRAY['owner'::household_role, 'admin'::household_role]));

CREATE POLICY "Members can leave their households" 
ON public.household_members 
FOR DELETE 
USING (profile_id = auth.uid());

-- households policies  
CREATE POLICY "Users can view households they belong to" 
ON public.households 
FOR SELECT 
USING (EXISTS (
  SELECT 1
  FROM household_members
  WHERE household_members.household_id = households.id AND household_members.profile_id = auth.uid()
));

CREATE POLICY "Only owners and admins can update households" 
ON public.households 
FOR UPDATE 
USING (EXISTS (
  SELECT 1
  FROM household_members
  WHERE household_members.household_id = households.id 
    AND household_members.profile_id = auth.uid() 
    AND household_members.role = ANY (ARRAY['owner'::household_role, 'admin'::household_role])
));

CREATE POLICY "Users can create households" 
ON public.households 
FOR INSERT 
WITH CHECK (true);

-- household_invitations policies
CREATE POLICY "Users can view invitations for their households" 
ON public.household_invitations 
FOR SELECT 
USING (EXISTS (
  SELECT 1
  FROM household_members
  WHERE household_members.household_id = household_invitations.household_id 
    AND household_members.profile_id = auth.uid() 
    AND household_members.role = ANY (ARRAY['owner'::household_role, 'admin'::household_role])
));

CREATE POLICY "Only owners and admins can create invitations" 
ON public.household_invitations 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1
  FROM household_members
  WHERE household_members.household_id = household_invitations.household_id 
    AND household_members.profile_id = auth.uid() 
    AND household_members.role = ANY (ARRAY['owner'::household_role, 'admin'::household_role])
));

CREATE POLICY "Only owners and admins can update invitations" 
ON public.household_invitations 
FOR UPDATE 
USING (EXISTS (
  SELECT 1
  FROM household_members
  WHERE household_members.household_id = household_invitations.household_id 
    AND household_members.profile_id = auth.uid() 
    AND household_members.role = ANY (ARRAY['owner'::household_role, 'admin'::household_role])
));

CREATE POLICY "Owners and admins can delete invitations" 
ON public.household_invitations 
FOR DELETE 
USING (EXISTS (
  SELECT 1
  FROM household_members
  WHERE household_members.household_id = household_invitations.household_id 
    AND household_members.profile_id = auth.uid() 
    AND household_members.role = ANY (ARRAY['owner'::household_role, 'admin'::household_role])
));

-- profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in their households" 
ON public.profiles 
FOR SELECT 
USING ((id = auth.uid()) OR private.share_household_with(id));

-- 7. Restrict RPC access to operational functions - only authenticated users
REVOKE EXECUTE ON FUNCTION public.create_default_household() FROM anon;
GRANT EXECUTE ON FUNCTION public.create_default_household() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.accept_invitation(text) FROM anon;  
GRANT EXECUTE ON FUNCTION public.accept_invitation(text) TO authenticated;