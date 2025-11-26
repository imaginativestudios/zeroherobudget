import { useUserLocalStorage } from './useUserLocalStorage';
import { v4 as uuidv4 } from 'uuid';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billing_cycle: string;
  category?: string;
  next_billing_date?: string;
  is_active: boolean;
  user_id: string;
  household_id?: string;
  created_at: string;
  updated_at: string;
}

export function useLocalSubscriptions() {
  const [subscriptions, setSubscriptions] = useUserLocalStorage<Subscription[]>('subscriptions', []);

  const addSubscription = (subscription: Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newSubscription: Subscription = {
      ...subscription,
      id: uuidv4(),
      user_id: 'demo-user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSubscriptions([...subscriptions, newSubscription]);
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(
      subscriptions.map((subscription) =>
        subscription.id === id
          ? { ...subscription, ...updates, updated_at: new Date().toISOString() }
          : subscription
      )
    );
  };

  const removeSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter((subscription) => subscription.id !== id));
  };

  const getTotalMonthlySpend = (): number => {
    return subscriptions
      .filter((sub) => sub.is_active)
      .reduce((total, sub) => {
        const monthlyAmount = sub.billing_cycle === 'yearly' ? sub.amount / 12 : sub.amount;
        return total + monthlyAmount;
      }, 0);
  };

  return {
    subscriptions,
    isLoading: false,
    addSubscription,
    updateSubscription,
    removeSubscription,
    getTotalMonthlySpend,
  };
}
