import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useHouseholds } from './useHouseholds';
import { toast } from './use-toast';

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash' | 'investment';
  balance: number;
  is_active: boolean;
  user_id?: string;
  household_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function useSupabaseAccounts() {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholds();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('Error fetching accounts:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load accounts",
        });
        return [];
      }

      return data as Account[];
    },
    enabled: !!user,
  });

  const addAccountMutation = useMutation({
    mutationFn: async (account: Omit<Account, 'id' | 'user_id' | 'household_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('accounts')
        .insert({
          ...account,
          user_id: user.id,
          household_id: currentHousehold,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      toast({
        title: "Account added",
        description: "Your account has been successfully added",
      });
    },
    onError: (error) => {
      console.error('Error adding account:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add account",
      });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Account> }) => {
      const { error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
    },
    onError: (error) => {
      console.error('Error updating account:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update account",
      });
    },
  });

  const removeAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      toast({
        title: "Account removed",
        description: "Account has been successfully removed",
      });
    },
    onError: (error) => {
      console.error('Error removing account:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove account",
      });
    },
  });

  const addAccount = (account: Omit<Account, 'id' | 'user_id' | 'household_id' | 'created_at' | 'updated_at'>) => {
    return addAccountMutation.mutateAsync(account);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    updateAccountMutation.mutate({ id, updates });
  };

  const removeAccount = (id: string) => {
    removeAccountMutation.mutate(id);
  };

  const getActiveAccounts = (): Account[] => {
    return accounts.filter(a => a.is_active);
  };

  const getAccountById = (id: string): Account | undefined => {
    return accounts.find(a => a.id === id);
  };

  return {
    accounts,
    isLoading,
    addAccount,
    updateAccount,
    removeAccount,
    getActiveAccounts,
    getAccountById,
  };
}