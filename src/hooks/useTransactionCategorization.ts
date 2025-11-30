import { supabase } from '@/integrations/supabase/client';

export const useTransactionCategorization = () => {
  const recordCategorization = async (
    transactionDescription: string,
    aiSuggested: string | null,
    userSelected: string,
    transactionAmount?: number
  ) => {
    try {
      await supabase.from('transaction_categorization_history').insert({
        transaction_description: transactionDescription,
        ai_suggested_category: aiSuggested,
        user_selected_category: userSelected,
        transaction_amount: transactionAmount,
      });
    } catch (error) {
      console.error('Error recording categorization:', error);
      // Don't show error to user, this is background learning
    }
  };

  return { recordCategorization };
};
