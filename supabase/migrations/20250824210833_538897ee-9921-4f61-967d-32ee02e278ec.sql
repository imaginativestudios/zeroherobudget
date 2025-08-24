
-- 1) Helper functions to avoid policy recursion on household_members
create or replace function public.is_household_member(_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = _household_id
      and hm.profile_id = auth.uid()
  );
$$;

create or replace function public.is_household_admin(_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = _household_id
      and hm.profile_id = auth.uid()
      and hm.role in ('owner','admin')
  );
$$;

-- 2) Rewrite household_members policies (remove recursive patterns)

-- Ensure RLS is enabled (no-op if already enabled)
alter table public.household_members enable row level security;

-- Drop existing policies to avoid conflicts and recursion
drop policy if exists "Only owners and admins can manage members" on public.household_members;
drop policy if exists "Only owners and admins can remove members" on public.household_members;
drop policy if exists "Only owners and admins can update member roles" on public.household_members;
drop policy if exists "Users can view members of their households" on public.household_members;

-- SELECT: users can view members of households they belong to
create policy "Users can view members of their households"
on public.household_members
for select
using ( public.is_household_member(household_id) );

-- INSERT: only owners/admins can add members
create policy "Only owners and admins can add members"
on public.household_members
for insert
with check ( public.is_household_admin(household_id) );

-- UPDATE: only owners/admins can update member roles
create policy "Only owners and admins can update member roles"
on public.household_members
for update
using ( public.is_household_admin(household_id) );

-- DELETE: only owners/admins can remove members
create policy "Only owners and admins can remove members"
on public.household_members
for delete
using ( public.is_household_admin(household_id) );

-- 3) Allow seeing profile info for members in the same household
-- Keep the existing "Users can view their own profile" policy; add another for household context
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
