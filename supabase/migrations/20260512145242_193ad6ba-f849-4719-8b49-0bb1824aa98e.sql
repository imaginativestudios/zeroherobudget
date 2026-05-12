
-- 1. Remove profiles from Realtime publication (sensitive data was being broadcast)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles';
  END IF;
END $$;

-- 2. Block anonymous INSERTs on waitlist_signups (signups must go through edge function)
DROP POLICY IF EXISTS "Deny anonymous inserts on waitlist" ON public.waitlist_signups;
CREATE POLICY "Deny anonymous inserts on waitlist"
ON public.waitlist_signups
AS RESTRICTIVE
FOR INSERT
TO anon
WITH CHECK (false);

-- 3. Restrict user_settings UPDATE policy to prevent tampering with deletion-code keys
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
CREATE POLICY "Users can update their own non-security settings"
ON public.user_settings
FOR UPDATE
USING (
  user_id = auth.uid()
  AND setting_key <> ALL (ARRAY['deletion_code_attempts', 'deletion_code'])
)
WITH CHECK (
  user_id = auth.uid()
  AND setting_key <> ALL (ARRAY['deletion_code_attempts', 'deletion_code'])
);

-- 4. user_roles: allow users to view their own role; allow admins to delete roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
