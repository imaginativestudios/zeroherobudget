-- Explicitly deny all access for anonymous users (defense in depth)
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);