import { useUserLocalStorage } from './useUserLocalStorage';

export function useLocalSettings() {
  const [income] = useUserLocalStorage('bdt_income', 5000);
  const [strategy] = useUserLocalStorage('bdt_strategy', 'Snowball');
  const [expenses] = useUserLocalStorage('bdt_expenses', []);
  const [assets] = useUserLocalStorage('bdt_assets', []);
  const [debts] = useUserLocalStorage('bdt_debts', []);
  const [groupOrder] = useUserLocalStorage('bdt_group_order', []);

  const settings = {
    bdt_income: income,
    bdt_strategy: strategy,
    bdt_expenses: expenses,
    bdt_assets: assets,
    bdt_debts: debts,
    bdt_group_order: groupOrder,
  };

  const getSetting = <T,>(key: string, defaultValue: T): T => {
    return settings[key as keyof typeof settings] !== undefined 
      ? settings[key as keyof typeof settings] as T 
      : defaultValue;
  };

  const setSetting = (key: string, value: any) => {
    // Settings are updated through individual hooks
  };

  const useIncome = () => {
    return useUserLocalStorage('bdt_income', 5000);
  };

  const useStrategy = () => {
    return useUserLocalStorage('bdt_strategy', 'Snowball');
  };

  const useExpenses = () => {
    return useUserLocalStorage('bdt_expenses', []);
  };

  const useAssets = () => {
    return useUserLocalStorage('bdt_assets', []);
  };

  const useDebts = () => {
    return useUserLocalStorage('bdt_debts', []);
  };

  const useGroupOrder = () => {
    return useUserLocalStorage('bdt_group_order', []);
  };

  return {
    settings,
    isLoading: false,
    getSetting,
    setSetting,
    useIncome,
    useStrategy,
    useExpenses,
    useAssets,
    useDebts,
    useGroupOrder,
  };
}
