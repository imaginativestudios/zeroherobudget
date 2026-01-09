-- Allow household owners and admins to view all invitations for their household
CREATE POLICY "Owners and admins can view household invitations"
ON public.household_invitations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM household_members
    WHERE household_members.household_id = household_invitations.household_id
      AND household_members.profile_id = auth.uid()
      AND household_members.role IN ('owner', 'admin')
  )
);