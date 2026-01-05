-- Add DELETE policy for households - only owners can delete their household
CREATE POLICY "Owners can delete their households"
ON public.households FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM household_members
  WHERE household_members.household_id = households.id
    AND household_members.profile_id = auth.uid()
    AND household_members.role = 'owner'::household_role
));

-- Add DELETE policy for profiles - users can delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);