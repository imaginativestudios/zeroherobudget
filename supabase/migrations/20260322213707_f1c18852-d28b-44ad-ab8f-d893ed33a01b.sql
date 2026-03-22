
-- Create a SECURITY DEFINER function that returns only safe profile fields for household members
CREATE OR REPLACE FUNCTION public.get_household_member_profiles(_household_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  display_name text,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.email, p.display_name, p.first_name, p.last_name, p.avatar_url, p.created_at, p.updated_at
  FROM profiles p
  INNER JOIN household_members hm ON hm.profile_id = p.id
  WHERE hm.household_id = _household_id
    AND EXISTS (
      SELECT 1 FROM household_members caller
      WHERE caller.household_id = _household_id
        AND caller.profile_id = auth.uid()
    )
$$;

-- Drop the overly permissive household SELECT policy
DROP POLICY IF EXISTS "Users can view profiles in their households" ON profiles;
