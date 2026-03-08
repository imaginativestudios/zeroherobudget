/**
 * Dashboard State Hook - Conditional Rendering Engine
 * 
 * Implements progressive disclosure by checking user data milestones
 * to determine which UI elements should be visible.
 */

import { useMemo } from 'react';
import { useLocalDebts, Debt } from './useLocalDebts';
import { useLocalTransactions } from './useLocalTransactions';
import { useHeroProfile } from './useHeroProfile';
import { useStrategy, useIncome, useExpenses, useAssets } from './useLocalSettings';
import { differenceInHours } from 'date-fns';

export interface DashboardState {
  // Empty states
  isNewUser: boolean;
  hasNoDebts: boolean;
  shouldShowInitializeMission: boolean;
  
  // Progressive disclosure flags
  canShowShadowBudget: boolean;        // >= 3 transactions
  canShowBoss: boolean;                // Has debt with balance > 0
  canShowMoat: boolean;                // Past onboarding
  
  // Card visibility flags (progressive reveal)
  canShowMoatBuilder: boolean;         // moatCurrent > 0 OR has expenses
  canShowIncomeCard: boolean;          // income > 0
  canShowExpenseCard: boolean;         // expenses.length > 0
  canShowAvailableCard: boolean;       // income > 0 AND expenses.length > 0
  canShowNetWorthCard: boolean;        // assets.length > 0 OR debts.length > 0
  canShowSpendingChart: boolean;       // expenses.length > 0
  canShowDebtProjection: boolean;      // debts.length > 0 AND leftover > 0
  canShowAchievements: boolean;        // debts.length > 0
  canShowFinancialOverview: boolean;   // Any financial card visible
  canShowAnalytics: boolean;           // Any analytics chart visible
  
  // Intel Feed unlocks (for staggered animations)
  unlockedCards: Array<'surplus' | 'shadow' | 'freedom'>;
  
  // Current target debt ("The Boss")
  currentBoss: Debt | null;
  
  // Strategy
  strategy: 'Snowball' | 'Avalanche';
  
  // Timestamp tracking
  accountAgeHours: number;
  
  // Loading state
  isLoading: boolean;
  
  // Stats for display
  transactionCount: number;
  debtCount: number;
  activeDebtCount: number;
  
  // Visible card count for grid layout
  visibleFinancialCardCount: number;
}

export function useDashboardState(): DashboardState {
  const { debts, isLoading: isLoadingDebts } = useLocalDebts('critical');
  const { transactions, isLoading: isLoadingTransactions } = useLocalTransactions('secondary');
  const { profile } = useHeroProfile();
  const [strategy] = useStrategy();
  const [income] = useIncome();
  const [expenses] = useExpenses();
  const [assets] = useAssets();

  const dashboardState = useMemo(() => {
    // Calculate account age in hours using activity log's first entry
    const firstActivity = profile.activity_log?.[0];
    const accountAgeHours = firstActivity
      ? differenceInHours(new Date(), new Date(firstActivity))
      : 0;

    // Count active debts (balance > 0)
    const activeDebts = debts.filter(d => d.balance > 0);
    const activeDebtCount = activeDebts.length;

    // Get current boss based on strategy
    let currentBoss: Debt | null = null;
    if (activeDebts.length > 0) {
      if (strategy === 'Avalanche') {
        // Highest interest rate first
        currentBoss = activeDebts.reduce((highest, debt) => 
          debt.interest_rate > highest.interest_rate ? debt : highest
        );
      } else {
        // Snowball: Lowest balance first
        currentBoss = activeDebts.reduce((lowest, debt) => 
          debt.balance < lowest.balance ? debt : lowest
        );
      }
    }

    // Calculate totals for visibility checks
    const totalExpenses = expenses.reduce((sum: number, expense: { planned?: number }) => sum + (expense.planned || 0), 0);
    const leftover = Math.max(0, (income || 0) - totalExpenses);

    // Progressive disclosure conditions
    const hasNoDebts = debts.length === 0;
    const isNewUser = hasNoDebts && transactions.length === 0;
    const shouldShowInitializeMission = hasNoDebts && profile.onboarding_completed;
    
    const canShowShadowBudget = transactions.length >= 3;
    const canShowBoss = activeDebtCount > 0;
    const canShowMoat = profile.onboarding_completed || !hasNoDebts;

    // Card visibility flags (progressive reveal)
    const canShowMoatBuilder = (profile.moat_current || 0) > 0 || expenses.length > 0;
    const canShowIncomeCard = (income || 0) > 0;
    const canShowExpenseCard = expenses.length > 0;
    const canShowAvailableCard = (income || 0) > 0 && expenses.length > 0;
    const canShowNetWorthCard = assets.length > 0 || debts.length > 0;
    const canShowSpendingChart = expenses.length > 0;
    const canShowDebtProjection = debts.length > 0 && leftover > 0;
    const canShowAchievements = debts.length > 0;
    
    // Section visibility
    const canShowFinancialOverview = canShowIncomeCard || canShowExpenseCard || canShowNetWorthCard;
    const canShowAnalytics = canShowSpendingChart || canShowDebtProjection;
    
    // Calculate visible financial card count for grid layout
    const visibleFinancialCardCount = [
      canShowIncomeCard,
      canShowExpenseCard,
      canShowAvailableCard,
      canShowNetWorthCard
    ].filter(Boolean).length;

    // Build unlocked cards array for staggered animation
    const unlockedCards: DashboardState['unlockedCards'] = ['surplus'];
    
    if (canShowShadowBudget) {
      unlockedCards.push('shadow');
    }
    
    if (canShowBoss) {
      unlockedCards.push('freedom');
    }
    
    // Freedom timeline always shows if there are debts
    if (canShowBoss) {
      unlockedCards.push('freedom');
    }

    return {
      isNewUser,
      hasNoDebts,
      shouldShowInitializeMission,
      canShowShadowBudget,
      canShowBoss,
      canShowMoat,
      canShowMoatBuilder,
      canShowIncomeCard,
      canShowExpenseCard,
      canShowAvailableCard,
      canShowNetWorthCard,
      canShowSpendingChart,
      canShowDebtProjection,
      canShowAchievements,
      canShowFinancialOverview,
      canShowAnalytics,
      unlockedCards,
      currentBoss,
      strategy: strategy as 'Snowball' | 'Avalanche',
      accountAgeHours,
      isLoading: isLoadingDebts || isLoadingTransactions,
      transactionCount: transactions.length,
      debtCount: debts.length,
      activeDebtCount,
      visibleFinancialCardCount,
    };
  }, [debts, transactions, profile, strategy, income, expenses, assets, isLoadingDebts, isLoadingTransactions]);

  return dashboardState;
}
