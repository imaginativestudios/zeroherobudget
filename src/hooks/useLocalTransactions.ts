import { usePriorityLocalStorage } from './usePriorityLocalStorage';
import { useProgressiveLoad, useShouldLoad } from './useProgressiveLoad';
import { useAuth } from './useAuth';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { DEMO_USER_ID } from '@/lib/constants';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  account_id: string | null;
  flow: 'in' | 'out';
  expense_id?: string;
  notes?: string;
  user_id: string;
  household_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyActuals {
  [expenseId: string]: number;
}

export function useLocalTransactions(priority: 'critical' | 'secondary' = 'secondary') {
  const { user } = useAuth();
  const loadState = useProgressiveLoad();
  const shouldLoad = useShouldLoad(priority, loadState);
  const [transactions, setTransactions, isLoading] = usePriorityLocalStorage<Transaction[]>('transactions', [], priority, shouldLoad);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const effectiveUserId = user?.id ?? DEMO_USER_ID;
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      user_id: effectiveUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTransactions([...transactions, newTransaction]);
  };

  const addTransactionsBulk = async (newTransactions: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    const effectiveUserId = user?.id ?? DEMO_USER_ID;
    const transactionsWithIds = newTransactions.map(t => ({
      ...t,
      id: uuidv4(),
      user_id: effectiveUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    setTransactions([...transactions, ...transactionsWithIds]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(
      transactions.map((transaction) =>
        transaction.id === id
          ? { ...transaction, ...updates, updated_at: new Date().toISOString() }
          : transaction
      )
    );
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id));
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

  const getMonthlyActualsByCategory = (month: Date | string, categoryMap: Record<string, string> | any[]): MonthlyActuals => {
    const monthTransactions = getTransactionsByMonth(month);
    const actuals: MonthlyActuals = {};
    
    // Handle array of expenses with id and category
    const expenseMap: Record<string, string> = Array.isArray(categoryMap) 
      ? categoryMap.reduce((acc, exp) => ({ ...acc, [exp.category]: exp.id }), {})
      : categoryMap;
    
    monthTransactions.forEach((t) => {
      if (t.flow === 'out') {
        const expenseId = t.expense_id || expenseMap[t.category];
        if (expenseId) {
          actuals[expenseId] = (actuals[expenseId] || 0) + t.amount;
        }
      }
    });
    
    return actuals;
  };

  const getTotalActualSpending = (month: Date | string): number => {
    const monthTransactions = getTransactionsByMonth(month);
    return monthTransactions
      .filter((t) => t.flow === 'out')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return {
    transactions,
    isLoading,
    addTransaction,
    addTransactionsBulk,
    updateTransaction,
    removeTransaction,
    getTransactionsByMonth,
    getMonthlyActuals,
    getMonthlyActualsByCategory,
    getTotalActualSpending,
  };
}
