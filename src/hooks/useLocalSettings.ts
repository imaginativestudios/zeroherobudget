import { useMemo } from 'react';
import { useUserLocalStorage } from './useUserLocalStorage';
import { useAuth } from './useAuth';
import { useLocalExpenses } from './useLocalExpenses';

// Export individual hooks for each setting
export const useIncome = () => useUserLocalStorage('bdt_income', 5000);
export const useStrategy = () => useUserLocalStorage('bdt_strategy', 'Snowball');
export const useAssets = () => useUserLocalStorage('bdt_assets', []);
export const useGroupOrder = () => useUserLocalStorage('bdt_group_order', []);

/**
 * Planned budget lines in the legacy `{ planned }` shape.
 * Signed-in users keep reading their `bdt_expenses` list unchanged. Demo
 * visitors read the same `expenses` list the Budget page edits, so every
 * demo screen shows one budget.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useExpenses = (): [any[], (value: any) => void, boolean] => {
  const { user } = useAuth();
  const legacy = useUserLocalStorage<any[]>('bdt_expenses', []);
  const { expenses: demoExpenses, isLoading: demoLoading } = useLocalExpenses('critical');
  const demoPlanned = useMemo(
    () => demoExpenses.filter(e => !e.is_income).map(e => ({ ...e, planned: e.amount })),
    [demoExpenses]
  );
  if (user) return legacy;
  return [demoPlanned, legacy[1], demoLoading];
};
