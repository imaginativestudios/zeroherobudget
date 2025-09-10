import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

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
}

export function useSupabaseExpenses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch expenses
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching expenses:', error);
        toast({
          variant: "destructive",
          title: "Error fetching expenses",
          description: error.message,
        });
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Add expense
  const addExpenseMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expense,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to add expense",
        description: error.message,
      });
    },
  });

  // Update expense
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Expense> }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update expense",
        description: error.message,
      });
    },
  });

  // Remove expense
  const removeExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to remove expense",
        description: error.message,
      });
    },
  });

  const addExpense = (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    addExpenseMutation.mutate(expense);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    updateExpenseMutation.mutate({ id, updates });
  };

  const removeExpense = (id: string) => {
    removeExpenseMutation.mutate(id);
  };

  return {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    removeExpense,
  };
}