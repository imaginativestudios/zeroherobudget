import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billing_cycle: string;
  next_billing_date?: string;
  is_active: boolean;
  category?: string;
  user_id: string;
  household_id?: string;
  created_at: string;
  updated_at: string;
}

export function useSupabaseSubscriptions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch subscriptions
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast({
          variant: "destructive",
          title: "Error fetching subscriptions",
          description: error.message,
        });
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Add subscription
  const addSubscriptionMutation = useMutation({
    mutationFn: async (subscription: Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          ...subscription,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.id] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to add subscription",
        description: error.message,
      });
    },
  });

  // Update subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Subscription> }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.id] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update subscription",
        description: error.message,
      });
    },
  });

  // Remove subscription
  const removeSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.id] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to remove subscription",
        description: error.message,
      });
    },
  });

  const addSubscription = (subscription: Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    addSubscriptionMutation.mutate(subscription);
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    updateSubscriptionMutation.mutate({ id, updates });
  };

  const removeSubscription = (id: string) => {
    removeSubscriptionMutation.mutate(id);
  };

  const getTotalMonthlySpend = (): number => {
    return subscriptions
      .filter(sub => sub.is_active)
      .reduce((total, sub) => {
        const cycleFactor = sub.billing_cycle === 'yearly' ? 1/12 : 1;
        return total + (sub.amount * cycleFactor);
      }, 0);
  };

  return {
    subscriptions,
    isLoading,
    addSubscription,
    updateSubscription,
    removeSubscription,
    getTotalMonthlySpend,
  };
}