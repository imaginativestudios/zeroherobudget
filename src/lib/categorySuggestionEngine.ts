import { subDays } from 'date-fns';

export interface CategorySuggestion {
  category: string;
  transactionCount: number;
  totalAmount: number;
  avgMonthlySpend: number;
}

interface TransactionLike {
  date: string;
  category: string;
  flow: 'in' | 'out';
  amount: number;
}

interface ExpenseLike {
  category: string;
}

/**
 * Detects spending categories from transactions that aren't covered
 * by existing budget items. Returns suggestions sorted by total amount.
 */
export function detectUncoveredCategories(
  transactions: TransactionLike[],
  expenses: ExpenseLike[],
  options: { lookbackDays?: number; minTransactions?: number; minTotalAmount?: number } = {}
): CategorySuggestion[] {
  const { lookbackDays = 90, minTransactions = 2, minTotalAmount = 20 } = options;

  const cutoff = subDays(new Date(), lookbackDays);

  // Existing budget categories (lowercase for comparison)
  const existingCategories = new Set(
    expenses.map(e => e.category.toLowerCase())
  );

  // Aggregate outflow transactions within the lookback window
  const categoryStats = new Map<string, { count: number; total: number }>();

  for (const t of transactions) {
    if (t.flow !== 'out') continue;
    if (new Date(t.date) < cutoff) continue;

    const cat = t.category?.trim();
    if (!cat || existingCategories.has(cat.toLowerCase())) continue;

    const stats = categoryStats.get(cat) ?? { count: 0, total: 0 };
    stats.count += 1;
    stats.total += t.amount;
    categoryStats.set(cat, stats);
  }

  const months = lookbackDays / 30;

  const suggestions: CategorySuggestion[] = [];
  for (const [category, stats] of categoryStats) {
    if (stats.count >= minTransactions && stats.total >= minTotalAmount) {
      suggestions.push({
        category,
        transactionCount: stats.count,
        totalAmount: stats.total,
        avgMonthlySpend: Math.round(stats.total / months),
      });
    }
  }

  return suggestions.sort((a, b) => b.totalAmount - a.totalAmount);
}
