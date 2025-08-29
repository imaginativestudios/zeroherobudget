import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useHouseholds } from './useHouseholds';
import { toast } from './use-toast';

export function useSupabaseSettings() {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholds();
  const queryClient = useQueryClient();

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['settings', user?.id],
    queryFn: async () => {
      if (!user) return {};
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching settings:', error);
        return {};
      }

      const settingsMap: { [key: string]: any } = {};
      data.forEach(setting => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });
      
      return settingsMap;
    },
    enabled: !!user,
  });

  const setSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          household_id: currentHousehold,
          setting_key: key,
          setting_value: value,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.id] });
    },
    onError: (error) => {
      console.error('Error updating setting:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update setting",
      });
    },
  });

  const getSetting = <T>(key: string, defaultValue: T): T => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  const setSetting = (key: string, value: any) => {
    setSettingMutation.mutate({ key, value });
  };

  // Convenience hooks for common settings
  const useIncome = () => {
    const income = getSetting('bdt_income', 0);
    const setIncome = (value: number) => setSetting('bdt_income', value);
    return [income, setIncome] as const;
  };

  const useStrategy = () => {
    const strategy = getSetting('bdt_strategy', 'Snowball');
    const setStrategy = (value: string) => setSetting('bdt_strategy', value);
    return [strategy, setStrategy] as const;
  };

  const useExpenses = () => {
    const expenses = getSetting('bdt_expenses', []);
    const setExpenses = (value: any[]) => setSetting('bdt_expenses', value);
    return [expenses, setExpenses] as const;
  };

  const useAssets = () => {
    const assets = getSetting('bdt_assets', []);
    const setAssets = (value: any[]) => setSetting('bdt_assets', value);
    return [assets, setAssets] as const;
  };

  const useDebts = () => {
    const debts = getSetting('bdt_debts', []);
    const setDebts = (value: any[]) => setSetting('bdt_debts', value);
    return [debts, setDebts] as const;
  };

  const useGroupOrder = () => {
    const groupOrder = getSetting('bdt_group_order', []);
    const setGroupOrder = (value: string[]) => setSetting('bdt_group_order', value);
    return [groupOrder, setGroupOrder] as const;
  };

  return {
    settings,
    isLoading,
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