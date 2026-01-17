-- Add RLS policy for household members to view shared transaction categorization history
CREATE POLICY "Household members can view shared categorization history"
ON public.transaction_categorization_history
FOR SELECT
TO authenticated
USING (
  household_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.household_members hm
    WHERE hm.household_id = transaction_categorization_history.household_id
    AND hm.profile_id = auth.uid()
  )
);