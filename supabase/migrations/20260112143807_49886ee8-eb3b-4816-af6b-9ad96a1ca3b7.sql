-- Drop the existing unrestricted delete policy for user_settings
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.user_settings;

-- Create a new delete policy that prevents users from deleting security-sensitive settings
-- (rate limiting and deletion codes - these should only be managed by the admin/service role)
CREATE POLICY "Users can delete their own non-security settings"
ON public.user_settings
FOR DELETE
USING (
  user_id = auth.uid() 
  AND setting_key NOT IN ('deletion_code_attempts', 'deletion_code')
);