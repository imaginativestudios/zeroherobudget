import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useHouseholdView } from '@/contexts/HouseholdViewContext';

// Local hooks for personal data
import { useLocalExpenses, type Expense } from '@/hooks/useLocalExpenses';
import { useLocalDebts } from '@/hooks/useLocalDebts';
import { useLocalSubscriptions } from '@/hooks/useLocalSubscriptions';
import { useLocalTransactions, type Transaction } from '@/hooks/useLocalTransactions';

interface HouseholdExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  is_income: boolean;
  user_id: string;
  household_id: string | null;
  created_at: string;
  updated_at: string;
}

interface HouseholdDebt {
  id: string;
  name: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  type: string;
  user_id: string;
  household_id: string | null;
  created_at: string;
  updated_at: string;
}

interface HouseholdSubscription {
  id: string;
  name: string;
  amount: number;
  billing_cycle: string;
  category: string | null;
  is_active: boolean;
  next_billing_date: string | null;
  user_id: string;
  household_id: string | null;
  created_at: string;
  updated_at: string;
}

interface HouseholdTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  flow: string;
  notes: string | null;
  account_id: string | null;
  expense_id: string | null;
  user_id: string;
  household_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useHouseholdData() {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholds();
  const { isHouseholdView } = useHouseholdView();
  
  // Local data hooks
  const { expenses: localExpenses, isLoading: isLoadingLocalExpenses } = useLocalExpenses('critical');
  const { debts: localDebts, isLoading: isLoadingLocalDebts } = useLocalDebts('critical');
  const { subscriptions: localSubscriptions, isLoading: isLoadingLocalSubscriptions } = useLocalSubscriptions('critical');
  const { transactions: localTransactions, isLoading: isLoadingLocalTransactions } = useLocalTransactions('secondary');

  // Household data state
  const [householdExpenses, setHouseholdExpenses] = useState<HouseholdExpense[]>([]);
  const [householdDebts, setHouseholdDebts] = useState<HouseholdDebt[]>([]);
  const [householdSubscriptions, setHouseholdSubscriptions] = useState<HouseholdSubscription[]>([]);
  const [householdTransactions, setHouseholdTransactions] = useState<HouseholdTransaction[]>([]);
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);

  // Fetch household data from Supabase when in household view
  useEffect(() => {
    if (!isHouseholdView || !user || !currentHousehold) {
      return;
    }

    const fetchHouseholdData = async () => {
      setIsLoadingHousehold(true);
      try {
        // Fetch all data in parallel
        const [expensesRes, debtsRes, subscriptionsRes, transactionsRes] = await Promise.all([
          supabase
            .from('expenses')
            .select('*')
            .eq('household_id', currentHousehold),
          supabase
            .from('debts')
            .select('*')
            .eq('household_id', currentHousehold),
          supabase
            .from('subscriptions')
            .select('*')
            .eq('household_id', currentHousehold),
          supabase
            .from('transactions')
            .select('*')
            .eq('household_id', currentHousehold)
            .order('date', { ascending: false }),
        ]);

        if (expensesRes.data) setHouseholdExpenses(expensesRes.data);
        if (debtsRes.data) setHouseholdDebts(debtsRes.data);
        if (subscriptionsRes.data) setHouseholdSubscriptions(subscriptionsRes.data);
        if (transactionsRes.data) {
          // Normalize DB flow ('income'/'expense') to app flow ('in'/'out')
          setHouseholdTransactions(
            transactionsRes.data.map((t: any) => ({
              ...t,
              flow: t.flow === 'in' || t.flow === 'income' ? 'in' : 'out',
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching household data:', error);
      } finally {
        setIsLoadingHousehold(false);
      }
    };

    fetchHouseholdData();
  }, [isHouseholdView, user, currentHousehold]);

  // Return appropriate data based on view mode
  const expenses = useMemo(() => {
    if (isHouseholdView && user) {
      return householdExpenses.map(e => ({
        ...e,
        sort_order: 0, // Household expenses don't have sort order
      })) as Expense[];
    }
    return localExpenses;
  }, [isHouseholdView, user, householdExpenses, localExpenses]);

  const debts = useMemo(() => {
    if (isHouseholdView && user) {
      return householdDebts;
    }
    return localDebts;
  }, [isHouseholdView, user, householdDebts, localDebts]);

  const subscriptions = useMemo(() => {
    if (isHouseholdView && user) {
      return householdSubscriptions;
    }
    return localSubscriptions;
  }, [isHouseholdView, user, householdSubscriptions, localSubscriptions]);

  const transactions = useMemo(() => {
    if (isHouseholdView && user) {
      return householdTransactions as unknown as Transaction[];
    }
    return localTransactions;
  }, [isHouseholdView, user, householdTransactions, localTransactions]);

  // Calculate total monthly subscription spend
  const getTotalMonthlySpend = () => {
    const subs = isHouseholdView && user ? householdSubscriptions : localSubscriptions;
    return subs
      .filter(s => s.is_active)
      .reduce((total, sub) => {
        let monthlyAmount = sub.amount;
        if (sub.billing_cycle === 'yearly') {
          monthlyAmount = sub.amount / 12;
        } else if (sub.billing_cycle === 'weekly') {
          monthlyAmount = sub.amount * 4.33;
        }
        return total + monthlyAmount;
      }, 0);
  };

  const isLoading = isHouseholdView 
    ? isLoadingHousehold 
    : isLoadingLocalExpenses || isLoadingLocalDebts || isLoadingLocalSubscriptions || isLoadingLocalTransactions;

  return {
    expenses,
    debts,
    subscriptions,
    transactions,
    getTotalMonthlySpend,
    isLoading,
    isHouseholdView,
  };
}
