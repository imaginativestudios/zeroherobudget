import { usePriorityLocalStorage } from './usePriorityLocalStorage';
import { useProgressiveLoad, useShouldLoad } from './useProgressiveLoad';
import { useAuth } from './useAuth';
import { v4 as uuidv4 } from 'uuid';
import { DEMO_USER_ID } from '@/lib/constants';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  is_income: boolean;
  user_id: string;
  household_id?: string;
  created_at: string;
  updated_at: string;
  sort_order: number;
}

export function useLocalExpenses(priority: 'critical' | 'secondary' = 'critical') {
  const { user } = useAuth();
  const loadState = useProgressiveLoad();
  const shouldLoad = useShouldLoad(priority, loadState);
  const [expenses, setExpenses, isLoading] = usePriorityLocalStorage<Expense[]>('expenses', [], priority, shouldLoad);

  const sortedExpenses = [...expenses].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const addExpense = (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sort_order'>) => {
    const userId = user?.id ?? DEMO_USER_ID;
    const maxSortOrder = expenses.reduce((max, e) => Math.max(max, e.sort_order ?? 0), -1);
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sort_order: maxSortOrder + 1,
    };
    setExpenses([...expenses, newExpense]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(expenses.map((expense) =>
      expense.id === id ? { ...expense, ...updates, updated_at: new Date().toISOString() } : expense
    ));
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const setExpensesOrder = (orderedIds: string[]) => {
    const updatedExpenses = expenses.map(expense => ({
      ...expense,
      sort_order: orderedIds.indexOf(expense.id),
      updated_at: new Date().toISOString()
    }));
    setExpenses(updatedExpenses);
  };

  return { expenses: sortedExpenses, isLoading, addExpense, updateExpense, removeExpense, setExpensesOrder };
}
