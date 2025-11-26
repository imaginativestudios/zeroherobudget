import { useUserLocalStorage } from './useUserLocalStorage';

// Export individual hooks for each setting
export const useIncome = () => useUserLocalStorage('bdt_income', 5000);
export const useStrategy = () => useUserLocalStorage('bdt_strategy', 'Snowball');
export const useExpenses = () => useUserLocalStorage('bdt_expenses', []);
export const useAssets = () => useUserLocalStorage('bdt_assets', []);
export const useDebts = () => useUserLocalStorage('bdt_debts', []);
export const useGroupOrder = () => useUserLocalStorage('bdt_group_order', []);
