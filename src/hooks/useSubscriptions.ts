import { useLocalStorage } from './useLocalStorage';
import { useTransactions } from './useTransactions';
import { Subscription, SubscriptionMatch, SubscriptionSuggestion, SubscriptionSpend } from '@/types/subscriptions';
import { autoDetectSubscriptions, calculateNextChargeDate } from '@/lib/subscriptionDetection';
import { format, startOfMonth, endOfMonth, addDays, isBefore, isAfter } from 'date-fns';

const STORAGE_KEY = 'bdt_subscriptions';
const MATCHES_STORAGE_KEY = 'bdt_subscription_matches';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>(STORAGE_KEY, []);
  const [matches, setMatches] = useLocalStorage<SubscriptionMatch[]>(MATCHES_STORAGE_KEY, []);
  const { transactions } = useTransactions();

  const addSubscription = (subscription: Omit<Subscription, 'id' | 'createdAt'>) => {
    const newSubscription: Subscription = {
      ...subscription,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setSubscriptions([...subscriptions, newSubscription]);
    return newSubscription;
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(subscriptions.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const removeSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
    // Remove associated matches
    setMatches(matches.filter(m => m.subscriptionId !== id));
  };

  const cancelSubscription = (id: string) => {
    updateSubscription(id, { status: 'canceled' });
  };

  const pauseSubscription = (id: string) => {
    updateSubscription(id, { status: 'paused' });
  };

  const resumeSubscription = (id: string, nextCharge?: string) => {
    const updates: Partial<Subscription> = { status: 'active' };
    if (nextCharge) {
      updates.nextCharge = nextCharge;
    }
    updateSubscription(id, updates);
  };

  const linkTransaction = (subscriptionId: string, transactionId: string, matchedOn: 'keyword' | 'amount' | 'interval' = 'keyword') => {
    const existingMatch = matches.find(m => m.transactionId === transactionId);
    if (existingMatch) {
      // Update existing match
      setMatches(matches.map(m => 
        m.transactionId === transactionId 
          ? { ...m, subscriptionId, matchedOn, confidence: 1.0 }
          : m
      ));
    } else {
      // Create new match
      const newMatch: SubscriptionMatch = {
        subscriptionId,
        transactionId,
        matchedOn,
        confidence: 1.0
      };
      setMatches([...matches, newMatch]);
    }

    // Update subscription's last charge date if this transaction is more recent
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      const subscription = subscriptions.find(s => s.id === subscriptionId);
      if (subscription) {
        const transactionDate = new Date(transaction.date);
        const lastChargeDate = subscription.lastCharge ? new Date(subscription.lastCharge) : null;
        
        if (!lastChargeDate || transactionDate > lastChargeDate) {
          const nextCharge = calculateNextChargeDate(transaction.date, subscription.cycle, subscription.everyN);
          updateSubscription(subscriptionId, {
            lastCharge: transaction.date,
            nextCharge
          });
        }
      }
    }
  };

  const unlinkTransaction = (transactionId: string) => {
    setMatches(matches.filter(m => m.transactionId !== transactionId));
  };

  const getSubscriptionForTransaction = (transactionId: string): Subscription | null => {
    const match = matches.find(m => m.transactionId === transactionId);
    if (!match) return null;
    return subscriptions.find(s => s.id === match.subscriptionId) || null;
  };

  const getTransactionsForSubscription = (subscriptionId: string) => {
    const subscriptionMatches = matches.filter(m => m.subscriptionId === subscriptionId);
    const transactionIds = subscriptionMatches.map(m => m.transactionId);
    return transactions.filter(t => transactionIds.includes(t.id));
  };

  const getMonthlySubscriptionSpend = (monthStr: string, accountId?: string): SubscriptionSpend[] => {
    const monthStart = startOfMonth(new Date(monthStr + '-01'));
    const monthEnd = endOfMonth(monthStart);

    const monthlySpend: { [subscriptionId: string]: SubscriptionSpend } = {};

    matches.forEach(match => {
      const transaction = transactions.find(t => t.id === match.transactionId);
      const subscription = subscriptions.find(s => s.id === match.subscriptionId);

      if (!transaction || !subscription) return;
      if (accountId && transaction.accountId !== accountId) return;

      const transactionDate = new Date(transaction.date);
      if (transactionDate < monthStart || transactionDate > monthEnd) return;

      if (!monthlySpend[subscription.id]) {
        monthlySpend[subscription.id] = {
          subscriptionId: subscription.id,
          subscriptionName: subscription.name,
          monthlyAmount: getMonthlyEquivalent(subscription),
          totalSpent: 0,
          transactionCount: 0
        };
      }

      monthlySpend[subscription.id].totalSpent += Math.abs(transaction.amount);
      monthlySpend[subscription.id].transactionCount++;
    });

    return Object.values(monthlySpend);
  };

  const getUpcomingRenewals = (rangeDays: number = 14) => {
    const now = new Date();
    const endDate = addDays(now, rangeDays);

    return subscriptions
      .filter(s => s.status === 'active' && s.nextCharge)
      .filter(s => {
        const nextCharge = new Date(s.nextCharge);
        return nextCharge >= now && nextCharge <= endDate;
      })
      .sort((a, b) => new Date(a.nextCharge).getTime() - new Date(b.nextCharge).getTime());
  };

  const getMonthlyEquivalent = (subscription: Subscription): number => {
    const { expectedAmount, cycle, everyN = 1 } = subscription;

    switch (cycle) {
      case 'yearly':
        return expectedAmount / 12;
      case 'weekly':
        return (expectedAmount * 52) / 12 / everyN;
      case 'monthly':
        return expectedAmount / everyN;
      case 'custom':
        // Assume custom is in days
        return (expectedAmount * 30) / everyN;
      default:
        return expectedAmount;
    }
  };

  const getActiveSubscriptions = () => {
    return subscriptions.filter(s => s.status === 'active');
  };

  const getTotalMonthlySpend = (accountId?: string): number => {
    return getActiveSubscriptions()
      .filter(s => !accountId || s.accountId === accountId)
      .reduce((total, subscription) => total + getMonthlyEquivalent(subscription), 0);
  };

  const autoDetectSubscriptionSuggestions = (): SubscriptionSuggestion[] => {
    return autoDetectSubscriptions(transactions);
  };

  return {
    subscriptions,
    matches,
    addSubscription,
    updateSubscription,
    removeSubscription,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    linkTransaction,
    unlinkTransaction,
    getSubscriptionForTransaction,
    getTransactionsForSubscription,
    getMonthlySubscriptionSpend,
    getUpcomingRenewals,
    getMonthlyEquivalent,
    getActiveSubscriptions,
    getTotalMonthlySpend,
    autoDetectSubscriptionSuggestions,
  };
}