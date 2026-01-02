-- Fix waitlist_signups: Ensure all operations are properly restricted
-- INSERT is handled by edge function with service role, so deny direct inserts
CREATE POLICY "Deny public inserts on waitlist"
ON public.waitlist_signups FOR INSERT
TO authenticated
WITH CHECK (false);  -- Only service role (edge function) can insert

-- Deny UPDATE and DELETE for everyone except admins
CREATE POLICY "Only admins can update waitlist"
ON public.waitlist_signups FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete waitlist"
ON public.waitlist_signups FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Fix household_invitations: Clear the deprecated plain text token column for all records
-- The token_hash is the secure version, and token should always be NULL
UPDATE public.household_invitations 
SET token = NULL 
WHERE token IS NOT NULL;

-- Add a comment to document that token column is deprecated
COMMENT ON COLUMN public.household_invitations.token IS 'DEPRECATED: Plain text tokens are no longer stored. Use token_hash for verification.';