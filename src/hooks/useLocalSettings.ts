import { useMemo } from 'react';
import { useUserLocalStorage } from './useUserLocalStorage';
import { useLocalExpenses } from './useLocalExpenses';

// Export individual hooks for each setting
export const useIncome = () => useUserLocalStorage('bdt_income', 5000);
export const useStrategy = () => useUserLocalStorage('bdt_strategy', 'Snowball');
export const useAssets = () => useUserLocalStorage('bdt_assets', []);
export const useGroupOrder = () => useUserLocalStorage('bdt_group_order', []);

/**
 * Planned budget lines in the legacy `{ planned }` shape, read from the same
 * `expenses` list the Budget page edits (signed-in, demo and signed-out alike).
 * Income lines are excluded. The retired `bdt_expenses` list is left in
 * storage untouched.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useExpenses = (): [any[], (value: any) => void, boolean] => {
  const { expenses, isLoading } = useLocalExpenses('critical');
  const planned = useMemo(
    () => expenses.filter(e => !e.is_income).map(e => ({ ...e, planned: e.amount })),
    [expenses]
  );
  return [planned, () => {}, isLoading];
};
