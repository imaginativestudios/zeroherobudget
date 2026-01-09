-- 1. Drop the existing "Deny anonymous access" policy (uses FOR ALL)
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- 2. Add explicit per-operation deny policies for anonymous users
CREATE POLICY "Deny anonymous SELECT on profiles"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

CREATE POLICY "Deny anonymous INSERT on profiles"
ON public.profiles
AS RESTRICTIVE
FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Deny anonymous UPDATE on profiles"
ON public.profiles
AS RESTRICTIVE
FOR UPDATE
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous DELETE on profiles"
ON public.profiles
AS RESTRICTIVE
FOR DELETE
TO anon
USING (false);

-- 3. Add INSERT policy for authenticated users
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);