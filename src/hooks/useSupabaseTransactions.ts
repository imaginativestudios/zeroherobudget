import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useHouseholds } from './useHouseholds';
import { useSupabaseAccounts } from './useSupabaseAccounts';
import { toast } from './use-toast';
import { isDateInMonth } from '@/lib/dateUtils';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  account_id: string;
  flow: 'in' | 'out';
  expense_id?: string;
  notes?: string;
  user_id?: string;
  household_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlyActuals {
  [expenseId: string]: number;
}

export function useSupabaseTransactions() {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholds();
  const { updateAccount, getAccountById } = useSupabaseAccounts();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load transactions",
        });
        return [];
      }

      return data.map(t => ({
        ...t,
        account_id: t.account_id,
        expense_id: t.expense_id,
      })) as Transaction[];
    },
    enabled: !!user,
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'user_id' | 'household_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id,
          household_id: currentHousehold,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: (newTransaction) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      
      // Update account balance
      const account = getAccountById(newTransaction.account_id);
      if (account) {
        const balanceChange = newTransaction.flow === 'in' ? newTransaction.amount : -newTransaction.amount;
        updateAccount(account.id, { balance: account.balance + balanceChange });
      }
    },
    onError: (error) => {
      console.error('Error adding transaction:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add transaction",
      });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Transaction> }) => {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
    onError: (error) => {
      console.error('Error updating transaction:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update transaction",
      });
    },
  });

  const removeTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
    onError: (error) => {
      console.error('Error removing transaction:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove transaction",
      });
    },
  });

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'household_id' | 'created_at' | 'updated_at'>) => {
    return addTransactionMutation.mutateAsync(transaction);
  };

  const addTransactionsBulk = async (newTransactions: Omit<Transaction, 'id' | 'user_id' | 'household_id' | 'created_at' | 'updated_at'>[]) => {
    if (!user) throw new Error('User not authenticated');

    const transactionsWithMeta = newTransactions.map(t => ({
      ...t,
      user_id: user.id,
      household_id: currentHousehold,
    }));

    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionsWithMeta)
      .select();

    if (error) {
      console.error('Error adding transactions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add transactions",
      });
      return [];
    }

    queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });

    // Update account balances
    const balanceUpdates: { [accountId: string]: number } = {};
    data.forEach(transaction => {
      const balanceChange = transaction.flow === 'in' ? Number(transaction.amount) : -Number(transaction.amount);
      balanceUpdates[transaction.account_id] = (balanceUpdates[transaction.account_id] || 0) + balanceChange;
    });

    Object.entries(balanceUpdates).forEach(([accountId, change]) => {
      const account = getAccountById(accountId);
      if (account) {
        updateAccount(accountId, { balance: account.balance + change });
      }
    });

    return data as Transaction[];
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    updateTransactionMutation.mutate({ id, updates });
  };

  const removeTransaction = (id: string) => {
    removeTransactionMutation.mutate(id);
  };

  const getTransactionsByMonth = (monthStr: string, accountId?: string): Transaction[] => {
    let filtered = transactions.filter(t => isDateInMonth(t.date, monthStr));
    if (accountId && accountId !== 'all') {
      filtered = filtered.filter(t => t.account_id === accountId);
    }
    return filtered;
  };

  const getMonthlyActuals = (monthStr: string, accountId?: string): MonthlyActuals => {
    const monthTransactions = getTransactionsByMonth(monthStr, accountId);
    const actuals: MonthlyActuals = {};
    
    monthTransactions.forEach(transaction => {
      if (transaction.expense_id && transaction.flow === 'out') {
        actuals[transaction.expense_id] = (actuals[transaction.expense_id] || 0) + transaction.amount;
      }
    });
    
    return actuals;
  };

  const getMonthlyActualsByCategory = (monthStr: string, expenses: any[], accountId?: string): MonthlyActuals => {
    const monthTransactions = getTransactionsByMonth(monthStr, accountId);
    const actuals: MonthlyActuals = {};
    
    monthTransactions.forEach(transaction => {
      if (transaction.flow === 'out') {
        if (transaction.expense_id) {
          actuals[transaction.expense_id] = (actuals[transaction.expense_id] || 0) + transaction.amount;
        } else {
          const matchedExpense = expenses.find(expense => 
            expense.category?.toLowerCase() === transaction.category?.toLowerCase()
          );
          if (matchedExpense) {
            actuals[matchedExpense.id] = (actuals[matchedExpense.id] || 0) + transaction.amount;
          }
        }
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