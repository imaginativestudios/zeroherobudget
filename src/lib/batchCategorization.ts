/**
 * Batch AI Categorization Utility
 * 
 * Handles batch categorization of transactions using the categorize-transaction edge function.
 * Processes sequentially with delays to respect rate limits.
 */

import { supabase } from '@/integrations/supabase/client';

export interface CategorizationResult {
  duplicateKey: string;
  suggestedCategory: string;
  error?: string;
}

const DELAY_BETWEEN_REQUESTS_MS = 200; // Delay to respect rate limits

/**
 * Categorize a single transaction via the edge function
 */
async function categorizeSingleTransaction(
  description: string,
  amount?: number
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('categorize-transaction', {
      body: { description, amount },
    });

    if (error) {
      console.error('Categorization error:', error);
      return null;
    }

    return data?.category || null;
  } catch (error) {
    console.error('Error calling categorization function:', error);
    return null;
  }
}

/**
 * Helper to delay between requests
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface TransactionToCategorize {
  duplicateKey: string;
  description: string;
  rawText: string;
  amount: number;
  flow: 'in' | 'out';
}

export interface BatchCategorizationProgress {
  current: number;
  total: number;
  currentDescription: string;
}

/**
 * Batch categorize multiple transactions
 * Processes sequentially with delays to respect rate limits
 * 
 * @param transactions - Array of transactions to categorize
 * @param onProgress - Optional callback for progress updates
 * @returns Map of duplicateKey -> suggested category
 */
export async function batchCategorizeTransactions(
  transactions: TransactionToCategorize[],
  onProgress?: (progress: BatchCategorizationProgress) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  // Filter out income transactions (they don't need categorization)
  const toCategorize = transactions.filter(t => t.flow === 'out');
  
  for (let i = 0; i < toCategorize.length; i++) {
    const transaction = toCategorize[i];
    
    // Report progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: toCategorize.length,
        currentDescription: transaction.description.slice(0, 30),
      });
    }
    
    // Use rawText for better categorization (more context)
    const textForCategorization = transaction.rawText || transaction.description;
    
    const suggestedCategory = await categorizeSingleTransaction(
      textForCategorization,
      transaction.amount
    );
    
    if (suggestedCategory) {
      results.set(transaction.duplicateKey, suggestedCategory);
    }
    
    // Add delay between requests (except for the last one)
    if (i < toCategorize.length - 1) {
      await delay(DELAY_BETWEEN_REQUESTS_MS);
    }
  }
  
  return results;
}

/**
 * Categories available in the system
 */
export const BUDGET_CATEGORIES = [
  "Housing",
  "Utilities",
  "Transportation",
  "Food",
  "Insurance & Healthcare",
  "Personal Care",
  "Entertainment",
  "Savings & Investments",
  "Debt Payments",
  "Miscellaneous"
] as const;

export type BudgetCategory = typeof BUDGET_CATEGORIES[number];
