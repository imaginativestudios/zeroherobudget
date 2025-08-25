
-- Allow owners and admins of a household to delete (cancel) invitations
create policy "Owners and admins can delete invitations"
on public.household_invitations
for delete
using (
  exists (
    select 1
    from public.household_members
    where household_members.household_id = household_invitations.household_id
      and household_members.profile_id = auth.uid()
      and household_members.role = any (array['owner'::household_role, 'admin'::household_role])
  )
);
