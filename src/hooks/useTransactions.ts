import { useLocalStorage } from './useLocalStorage';
import { Transaction, MonthlyActuals } from '@/types/transactions';
import { isDateInMonth } from '@/lib/dateUtils';

export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('bdt_transactions', []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions([...transactions, newTransaction]);
    return newTransaction;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const getTransactionsByMonth = (monthStr: string): Transaction[] => {
    return transactions.filter(t => isDateInMonth(t.date, monthStr));
  };

  const getMonthlyActuals = (monthStr: string): MonthlyActuals => {
    const monthTransactions = getTransactionsByMonth(monthStr);
    const actuals: MonthlyActuals = {};
    
    monthTransactions.forEach(transaction => {
      if (transaction.expenseId) {
        actuals[transaction.expenseId] = (actuals[transaction.expenseId] || 0) + transaction.amount;
      }
    });
    
    return actuals;
  };

  const getTotalActualSpending = (monthStr: string): number => {
    return getTransactionsByMonth(monthStr)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    getTransactionsByMonth,
    getMonthlyActuals,
    getTotalActualSpending,
  };
}