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

  type NewExpense = Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sort_order'>;
  const maxOrder = (list: Expense[]) => list.reduce((max, e) => Math.max(max, e.sort_order ?? 0), -1);
  const build = (items: NewExpense[], startOrder: number): Expense[] => {
    const userId = user?.id ?? DEMO_USER_ID;
    const now = new Date().toISOString();
    return items.map((item, i) => ({
      ...item,
      id: uuidv4(),
      user_id: userId,
      created_at: now,
      updated_at: now,
      sort_order: startOrder + i,
    }));
  };

  const addExpense = (expense: NewExpense) => {
    setExpenses(prev => [...prev, ...build([expense], maxOrder(prev) + 1)]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map((expense) =>
      expense.id === id ? { ...expense, ...updates, updated_at: new Date().toISOString() } : expense
    ));
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter((expense) => expense.id !== id));
  };

  const batchAddExpenses = (items: NewExpense[]) => {
    setExpenses(prev => [...prev, ...build(items, maxOrder(prev) + 1)]);
  };

  /** Replace all expense lines in one save; Income lines are kept. Returns the number of rows saved. */
  const replaceAllExpenses = (items: NewExpense[]): number => {
    let saved = 0;
    setExpenses(prev => {
      const incomeLines = prev.filter(e => e.is_income);
      const added = build(items.map(i => ({ ...i, is_income: false })), maxOrder(incomeLines) + 1);
      saved = added.length;
      return [...incomeLines, ...added];
    });
    return saved;
  };

  const setExpensesOrder = (orderedIds: string[]) => {
    const now = new Date().toISOString();
    setExpenses(prev => prev.map(expense => ({
      ...expense,
      sort_order: orderedIds.indexOf(expense.id),
      updated_at: now
    })));
  };

  return { expenses: sortedExpenses, isLoading, addExpense, updateExpense, removeExpense, batchAddExpenses, replaceAllExpenses, setExpensesOrder };
}
