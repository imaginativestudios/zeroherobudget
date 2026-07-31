-- Close two bypasses of the account-deletion email verification.
--
-- `delete-account` gates an irreversible action on a `deletion_verified` flag
-- stored in `user_settings` -- a table users can write to directly through the
-- REST API with their own session token. Two independent bypasses existed:
--
--   1. READ THE CODE. "Users can view their own settings" is
--      USING (user_id = auth.uid()) with no key restriction. The UPDATE and
--      DELETE policies exclude 'deletion_code' and 'deletion_code_attempts',
--      but SELECT does not. A session holder could request a deletion code and
--      then read it straight out of the table, never opening the email.
--
--   2. SKIP THE CODE. "Users can create their own settings" is
--      WITH CHECK (user_id = auth.uid()) with no key restriction at all, and
--      the UPDATE denylist omits 'deletion_verified'. A session holder could
--      insert setting_key='deletion_verified', setting_value='true' directly.
--      The update_user_settings_updated_at trigger stamps updated_at = now(),
--      satisfying the 10-minute freshness window in delete-account/index.ts:54.
--
-- Either path lets anyone holding a valid session JWT permanently destroy the
-- account and all financial history, without control of the email account that
-- the confirmation code exists to prove. Sessions are stored in localStorage,
-- so the realistic vectors -- stolen device, leaked token, XSS -- are exactly
-- the ones the code was added to defend against.
--
-- A single RESTRICTIVE policy closes both. RESTRICTIVE policies are ANDed with
-- the permissive ones, so this constrains every existing policy at once rather
-- than needing each to be patched. `service_role` bypasses RLS entirely, so
-- send-deletion-code, verify-deletion-code, and delete-account keep working.
--
-- Uses a prefix test rather than a denylist deliberately: an enumerated list is
-- what let 'deletion_verified' slip through when it was added, and a prefix
-- test covers any future deletion_* key automatically.

CREATE POLICY "Users cannot access deletion control settings"
ON public.user_settings
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (left(setting_key, 9) <> 'deletion_')
WITH CHECK (left(setting_key, 9) <> 'deletion_');
