import { useLocalStorage } from './useLocalStorage';
import { Transaction, MonthlyActuals } from '@/types/transactions';
import { isDateInMonth } from '@/lib/dateUtils';
import { useAccounts } from './useAccounts';

export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('bdt_transactions', []);
  const { updateAccount, getAccountById } = useAccounts();

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions([...transactions, newTransaction]);
    
    // Update account balance
    const account = getAccountById(transaction.accountId);
    if (account) {
      const balanceChange = transaction.flow === 'in' ? transaction.amount : -transaction.amount;
      updateAccount(account.id, { balance: account.balance + balanceChange });
    }
    
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

  const getTransactionsByMonth = (monthStr: string, accountId?: string): Transaction[] => {
    let filtered = transactions.filter(t => isDateInMonth(t.date, monthStr));
    if (accountId && accountId !== 'all') {
      filtered = filtered.filter(t => t.accountId === accountId);
    }
    return filtered;
  };

  const getMonthlyActuals = (monthStr: string, accountId?: string): MonthlyActuals => {
    const monthTransactions = getTransactionsByMonth(monthStr, accountId);
    const actuals: MonthlyActuals = {};
    
    monthTransactions.forEach(transaction => {
      if (transaction.expenseId && transaction.flow === 'out') {
        actuals[transaction.expenseId] = (actuals[transaction.expenseId] || 0) + transaction.amount;
      }
    });
    
    return actuals;
  };

  const getTotalActualSpending = (monthStr: string, accountId?: string): number => {
    return getTransactionsByMonth(monthStr, accountId)
      .filter(t => t.flow === 'out')
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