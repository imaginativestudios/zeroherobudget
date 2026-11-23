import { useCallback, useEffect, useState } from 'react';
import { usePriorityLocalStorage } from './usePriorityLocalStorage';
import { useProgressiveLoad, useShouldLoad } from './useProgressiveLoad';
import { useAuth } from './useAuth';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { DEMO_USER_ID } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  account_id: string | null;
  flow: 'in' | 'out';
  expense_id?: string;
  debt_id?: string;
  notes?: string;
  user_id: string;
  household_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyActuals {
  [expenseId: string]: number;
}

// DB <-> app flow normalization. Plaid sync writes 'income'/'expense';
// the app uses 'in'/'out'. Normalize at the boundary.
const flowFromDb = (v: string): 'in' | 'out' =>
  v === 'in' || v === 'income' ? 'in' : 'out';
const flowToDb = (v: 'in' | 'out'): 'income' | 'expense' =>
  v === 'in' ? 'income' : 'expense';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuidOrNull = (v?: string | null) => (v && UUID_RE.test(v) ? v : null);
/** Fired after a signed-in write so every hook instance reloads right away. */
export const TRANSACTIONS_CHANGED_EVENT = 'zh:transactions-changed';
const notifyTransactionsChanged = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(TRANSACTIONS_CHANGED_EVENT));
};

type NewTransaction = Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

/**
 * Shape a transaction for the database. Ids that are not real database ids
 * (placeholder accounts like "default-checking") are dropped so one bad
 * reference cannot reject a whole import.
 */
const toDbRow = (t: NewTransaction) => ({
  date: String(t.date).slice(0, 10),
  description: String(t.description ?? '').slice(0, 500) || 'Imported',
  amount: Number(t.amount) || 0,
  category: t.category || 'Uncategorized',
  account_id: uuidOrNull(t.account_id),
  flow: flowToDb(t.flow),
  expense_id: uuidOrNull(t.expense_id),
  debt_id: uuidOrNull(t.debt_id),
  notes: t.notes ?? null,
  household_id: t.household_id ?? null,
});

const mapRowToTransaction = (row: any): Transaction => ({
  id: row.id,
  date: row.date,
  description: row.description,
  amount: Number(row.amount),
  category: row.category,
  account_id: row.account_id,
  flow: flowFromDb(row.flow),
  expense_id: row.expense_id ?? undefined,
  debt_id: row.debt_id ?? undefined,
  notes: row.notes ?? undefined,
  user_id: row.user_id,
  household_id: row.household_id ?? undefined,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export function useLocalTransactions(priority: 'critical' | 'secondary' = 'secondary') {
  const { user } = useAuth();
  const isAuthed = !!user;
  const loadState = useProgressiveLoad();
  const shouldLoad = useShouldLoad(priority, loadState);

  // Demo (unauth) path: keep existing localStorage behavior
  const [localTransactions, setLocalTransactions, isLocalLoading] =
    usePriorityLocalStorage<Transaction[]>('transactions', [], priority, shouldLoad);

  // Authed path: Supabase-backed state
  const [remoteTransactions, setRemoteTransactions] = useState<Transaction[]>([]);
  const [isRemoteLoading, setIsRemoteLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!isAuthed || !shouldLoad) return;
    setIsRemoteLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      console.error('load transactions error:', error);
      setRemoteTransactions([]);
    } else {
      setRemoteTransactions((data || []).map(mapRowToTransaction));
    }
    setIsRemoteLoading(false);
  }, [isAuthed, shouldLoad]);

  useEffect(() => {
    if (isAuthed) {
      reload();
    }
  }, [isAuthed, reload]);

  // Keep separate hook instances (import wizard, Transactions page) in sync.
  useEffect(() => {
    if (!isAuthed) return;
    const onChange = () => { reload(); };
    window.addEventListener(TRANSACTIONS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(TRANSACTIONS_CHANGED_EVENT, onChange);
  }, [isAuthed, reload]);

  const transactions = isAuthed ? remoteTransactions : localTransactions;
  const isLoading = isAuthed ? isRemoteLoading : isLocalLoading;

  const addTransaction = async (
    transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (isAuthed) {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          date: transaction.date,
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
          account_id: transaction.account_id,
          flow: flowToDb(transaction.flow),
          expense_id: transaction.expense_id ?? null,
          debt_id: transaction.debt_id ?? null,
          notes: transaction.notes ?? null,
          household_id: transaction.household_id ?? null,
        })
        .select('*')
        .single();
      if (error) {
        console.error('addTransaction error:', error);
        return;
      }
      setRemoteTransactions((prev) => [mapRowToTransaction(data), ...prev]);
      return;
    }

    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLocalTransactions(prev => [...prev, newTransaction]);
  };

  /**
   * Saves many transactions. Resolves to the number saved; throws when the
   * signed-in save fails so callers never report rows that were not stored.
   */
  const addTransactionsBulk = async (
    newTransactions: NewTransaction[]
  ): Promise<number> => {
    if (isAuthed) {
      if (newTransactions.length === 0) return 0;
      let rows = newTransactions.map(toDbRow);
      let { data, error } = await supabase.from('transactions').insert(rows).select('*');
      // Debts are stored in the browser, so a debt link may not exist in the
      // database. Retry without debt links instead of losing the import.
      if (error && error.code === '23503') {
        rows = rows.map((r) => ({ ...r, debt_id: null }));
        ({ data, error } = await supabase.from('transactions').insert(rows).select('*'));
      }
      if (error) {
        console.error('addTransactionsBulk error:', error.code, error.message);
        throw new Error('Could not save transactions');
      }
      const saved = (data || []).map(mapRowToTransaction);
      setRemoteTransactions((prev) => [...saved, ...prev]);
      notifyTransactionsChanged();
      return saved.length;
    }

    const transactionsWithIds = newTransactions.map((t) => ({
      ...t,
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    setLocalTransactions(prev => [...prev, ...transactionsWithIds]);
    return transactionsWithIds.length;
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (isAuthed) {
      const patch: any = { ...updates };
      if (updates.flow) patch.flow = flowToDb(updates.flow);
      delete patch.id;
      delete patch.user_id;
      delete patch.created_at;
      delete patch.updated_at;
      const { data, error } = await supabase
        .from('transactions')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();
      if (error) {
        console.error('updateTransaction error:', error);
        return;
      }
      setRemoteTransactions((prev) =>
        prev.map((t) => (t.id === id ? mapRowToTransaction(data) : t))
      );
      return;
    }

    setLocalTransactions(prev => prev.map((transaction) =>
        transaction.id === id
          ? { ...transaction, ...updates, updated_at: new Date().toISOString() }
          : transaction
      )
    );
  };

  const removeTransaction = async (id: string) => {
    if (isAuthed) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) {
        console.error('removeTransaction error:', error);
        return;
      }
      setRemoteTransactions((prev) => prev.filter((t) => t.id !== id));
      return;
    }
    setLocalTransactions(prev => prev.filter((transaction) => transaction.id !== id));
  };

  const getTransactionsByMonth = (month: Date | string, accountId?: string) => {
    const monthDate = typeof month === 'string' ? parseISO(month + '-01') : month;
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);

    return transactions.filter((t) => {
      const transactionDate = parseISO(t.date);
      const inRange = transactionDate >= start && transactionDate <= end;
      const matchesAccount = !accountId || t.account_id === accountId;
      return inRange && matchesAccount;
    });
  };

  const getMonthlyActuals = (month: Date | string): MonthlyActuals => {
    const monthTransactions = getTransactionsByMonth(month);
    const actuals: MonthlyActuals = {};

    monthTransactions.forEach((t) => {
      if (t.expense_id && t.flow === 'out') {
        actuals[t.expense_id] = (actuals[t.expense_id] || 0) + t.amount;
      }
    });

    return actuals;
  };

  /**
   * The actuals, and the number of transactions behind them, from one pass.
   *
   * One traversal on purpose. BudgetOverviewCard prints the count directly
   * under the Spent figure, so a count derived by a second, separately-written
   * filter would eventually disagree with the number above it -- and a label
   * that contradicts its own figure is worse than no label at all. The
   * qualifying set is narrower than "transactions this month": an outflow only
   * counts if it maps to a budget category, which is the same condition that
   * lets it contribute to the total.
   */
  const getMonthlyActualsBreakdown = (
    month: Date | string,
    categoryMap: Record<string, string> | any[]
  ): { actuals: MonthlyActuals; transactionCount: number } => {
    const monthTransactions = getTransactionsByMonth(month);
    const actuals: MonthlyActuals = {};
    let transactionCount = 0;

    const expenseMap: Record<string, string> = Array.isArray(categoryMap)
      ? categoryMap.reduce((acc, exp) => ({ ...acc, [exp.category]: exp.id }), {})
      : categoryMap;

    monthTransactions.forEach((t) => {
      if (t.flow === 'out') {
        const expenseId = t.expense_id || expenseMap[t.category];
        if (expenseId) {
          actuals[expenseId] = (actuals[expenseId] || 0) + t.amount;
          transactionCount += 1;
        }
      }
    });

    return { actuals, transactionCount };
  };

  const getMonthlyActualsByCategory = (
    month: Date | string,
    categoryMap: Record<string, string> | any[]
  ): MonthlyActuals => getMonthlyActualsBreakdown(month, categoryMap).actuals;

  const getTotalActualSpending = (month: Date | string): number => {
    const monthTransactions = getTransactionsByMonth(month);
    return monthTransactions
      .filter((t) => t.flow === 'out')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return {
    transactions,
    isLoading,
    reload,
    addTransaction,
    addTransactionsBulk,
    updateTransaction,
    removeTransaction,
    getTransactionsByMonth,
    getMonthlyActuals,
    getMonthlyActualsByCategory,
    getMonthlyActualsBreakdown,
    getTotalActualSpending,
  };
}
