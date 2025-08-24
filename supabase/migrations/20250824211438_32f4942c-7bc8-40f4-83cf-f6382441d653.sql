
-- Ensure RLS is enabled (no-op if already enabled)
alter table public.household_members enable row level security;

-- Drop any existing household_members policies that may be recursive or conflicting
drop policy if exists "Only owners and admins can manage members" on public.household_members;
drop policy if exists "Only owners and admins can remove members" on public.household_members;
drop policy if exists "Only owners and admins can update member roles" on public.household_members;
drop policy if exists "Users can view members of their households" on public.household_members;
drop policy if exists "Only owners and admins can add members" on public.household_members;
drop policy if exists "Users can view their own membership rows" on public.household_members;

-- Non-recursive, safe policies on household_members
-- 1) Users can read their own membership rows (fixes the loading query)
create policy "Users can view their own membership rows"
on public.household_members
for select
using (profile_id = auth.uid());

-- 2) Users can add themselves (works for default household creation and accepting invites)
create policy "Users can add themselves as members"
on public.household_members
for insert
with check (profile_id = auth.uid());

-- 3) Users can update only their own membership row (temporary safe default)
create policy "Users can update their own membership row"
on public.household_members
for update
using (profile_id = auth.uid());

-- 4) Users can delete only their own membership row (temporary safe default)
create policy "Users can delete their own membership row"
on public.household_members
for delete
using (profile_id = auth.uid());

-- Allow seeing profile info for members in the same household
-- (keeps existing self-view policy; adds a household-scoped view)
create policy if not exists "Users can view profiles in their households"
on public.profiles
for select
using (
  exists (
    select 1
    from public.household_members hm_self
    join public.household_members hm_other
      on hm_self.household_id = hm_other.household_id
    where hm_self.profile_id = auth.uid()
      and hm_other.profile_id = profiles.id
  )
);
