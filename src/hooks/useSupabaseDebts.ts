import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface Debt {
  id: string;
  name: string;
  balance: number;
  minimum_payment: number;
  interest_rate: number;
  type: string;
  user_id: string;
  household_id?: string;
  created_at: string;
  updated_at: string;
}

export function useSupabaseDebts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch debts
  const { data: debts = [], isLoading } = useQuery({
    queryKey: ['debts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching debts:', error);
        toast({
          variant: "destructive", 
          title: "Error fetching debts",
          description: error.message,
        });
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Add debt
  const addDebtMutation = useMutation({
    mutationFn: async (debt: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('debts')
        .insert({
          ...debt,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to add debt",
        description: error.message,
      });
    },
  });

  // Update debt
  const updateDebtMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Debt> }) => {
      const { data, error } = await supabase
        .from('debts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update debt",
        description: error.message,
      });
    },
  });

  // Remove debt
  const removeDebtMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to remove debt", 
        description: error.message,
      });
    },
  });

  const addDebt = (debt: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    addDebtMutation.mutate(debt);
  };

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    updateDebtMutation.mutate({ id, updates });
  };

  const removeDebt = (id: string) => {
    removeDebtMutation.mutate(id);
  };

  return {
    debts,
    isLoading,
    addDebt,
    updateDebt,
    removeDebt,
  };
}