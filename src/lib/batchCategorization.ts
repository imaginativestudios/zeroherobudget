/**
 * Batch AI Categorization Utility
 * 
 * Handles batch categorization of transactions using the categorize-transaction edge function.
 * Processes sequentially with delays to respect rate limits.
 */

import { supabase } from '@/integrations/supabase/client';
import { getAllCategoryNames } from '@/lib/categoryRegistry';

export interface CategorizationResult {
  duplicateKey: string;
  suggestedCategory: string;
  error?: string;
}

const DELAY_BETWEEN_REQUESTS_MS = 200;

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

export async function batchCategorizeTransactions(
  transactions: TransactionToCategorize[],
  onProgress?: (progress: BatchCategorizationProgress) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const toCategorize = transactions.filter(t => t.flow === 'out');
  
  for (let i = 0; i < toCategorize.length; i++) {
    const transaction = toCategorize[i];
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: toCategorize.length,
        currentDescription: transaction.description.slice(0, 30),
      });
    }
    const textForCategorization = transaction.rawText || transaction.description;
    const suggestedCategory = await categorizeSingleTransaction(
      textForCategorization,
      transaction.amount
    );
    if (suggestedCategory) {
      results.set(transaction.duplicateKey, suggestedCategory);
    }
    if (i < toCategorize.length - 1) {
      await delay(DELAY_BETWEEN_REQUESTS_MS);
    }
  }
  return results;
}

/**
 * Categories available in the system — derived from the central registry.
 */
export const BUDGET_CATEGORIES = getAllCategoryNames();

export type BudgetCategory = string;
