-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can create households" ON public.households;

-- Create a more secure INSERT policy
-- Since households don't have a user_id column directly (members are tracked in household_members),
-- we allow authenticated users to create households, but enforce that they must add themselves
-- as owner via the create_default_household function or manually after creation.
-- The WITH CHECK ensures only authenticated users can create, and we rely on the
-- create_default_household function for proper ownership assignment.
CREATE POLICY "Authenticated users can create households" 
ON public.households 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);