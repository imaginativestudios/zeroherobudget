import { Transaction } from '@/types/transactions';
import { SubscriptionSuggestion } from '@/types/subscriptions';
import { findProviderByKeyword } from './providerDirectory';

export const normalizeDescription = (description: string): string => {
  return description
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

interface TransactionGroup {
  key: string;
  merchantName: string;
  amount: number;
  transactions: Transaction[];
  accountId: string;
}

export const groupByMerchantAndAmount = (
  transactions: Transaction[], 
  tolerance: number = 1.0
): TransactionGroup[] => {
  const groups: { [key: string]: TransactionGroup } = {};

  transactions.forEach(transaction => {
    if (transaction.flow !== 'out') return; // Only consider outgoing transactions

    const normalizedDesc = normalizeDescription(transaction.description);
    const amount = Math.abs(transaction.amount);
    
    // Create a key based on merchant name and amount (with tolerance)
    const amountKey = Math.round(amount / tolerance) * tolerance;
    const key = `${normalizedDesc.split(' ')[0]}-${amountKey}-${transaction.accountId}`;

    if (!groups[key]) {
      groups[key] = {
        key,
        merchantName: transaction.description,
        amount: amount,
        transactions: [],
        accountId: transaction.accountId
      };
    }

    groups[key].transactions.push(transaction);
  });

  return Object.values(groups);
};

export const findRecurringPatterns = (group: TransactionGroup): SubscriptionSuggestion | null => {
  const { transactions } = group;
  
  if (transactions.length < 3) return null; // Need at least 3 occurrences

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate intervals between transactions
  const intervals: number[] = [];
  for (let i = 1; i < sortedTransactions.length; i++) {
    const prevDate = new Date(sortedTransactions[i - 1].date);
    const currDate = new Date(sortedTransactions[i].date);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    intervals.push(diffDays);
  }

  // Check for recurring patterns
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const intervalVariance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  
  // Determine cycle type based on average interval
  let cycle: 'monthly' | 'yearly' | 'weekly' | null = null;
  let confidence = 0;

  if (avgInterval >= 28 && avgInterval <= 34) {
    cycle = 'monthly';
    confidence = Math.max(0, 1 - (intervalVariance / 100)); // Lower variance = higher confidence
  } else if (avgInterval >= 350 && avgInterval <= 380) {
    cycle = 'yearly';
    confidence = Math.max(0, 1 - (intervalVariance / 1000));
  } else if (avgInterval >= 6 && avgInterval <= 8) {
    cycle = 'weekly';
    confidence = Math.max(0, 1 - (intervalVariance / 10));
  }

  if (!cycle || confidence < 0.6) return null; // Require minimum confidence

  // Extract merchant keywords
  const normalizedDesc = normalizeDescription(group.merchantName);
  const keywords = normalizedDesc.split(' ').filter(word => word.length > 2);

  return {
    id: crypto.randomUUID(),
    merchantName: group.merchantName,
    merchantKeywords: keywords,
    expectedAmount: group.amount,
    cycle,
    matchingTransactions: sortedTransactions.map(t => t.id),
    confidence,
    accountId: group.accountId
  };
};

export const autoDetectSubscriptions = (
  transactions: Transaction[],
  tolerance: number = 1.0
): SubscriptionSuggestion[] => {
  // Only consider transactions from the last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const recentTransactions = transactions.filter(t => 
    new Date(t.date) >= twelveMonthsAgo
  );

  const groups = groupByMerchantAndAmount(recentTransactions, tolerance);
  const suggestions: SubscriptionSuggestion[] = [];

  groups.forEach(group => {
    const suggestion = findRecurringPatterns(group);
    if (suggestion) {
      // Enhance with known provider data
      const knownProvider = findProviderByKeyword(group.merchantName);
      if (knownProvider) {
        suggestion.merchantName = knownProvider.name;
        suggestion.merchantKeywords = knownProvider.keywords;
        suggestion.confidence = Math.min(1, suggestion.confidence + 0.2); // Boost confidence for known providers
      }
      
      suggestions.push(suggestion);
    }
  });

  // Sort by confidence (highest first)
  return suggestions.sort((a, b) => b.confidence - a.confidence);
};

export const calculateNextChargeDate = (
  lastCharge: string,
  cycle: 'monthly' | 'yearly' | 'weekly' | 'custom',
  everyN: number = 1
): string => {
  const lastDate = new Date(lastCharge);
  const nextDate = new Date(lastDate);

  switch (cycle) {
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + everyN);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + everyN);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * everyN));
      break;
    case 'custom':
      nextDate.setDate(nextDate.getDate() + everyN);
      break;
  }

  return nextDate.toISOString().split('T')[0];
};