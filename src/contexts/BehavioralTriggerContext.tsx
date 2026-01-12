/**
 * Behavioral Trigger Context & Provider
 * 
 * Central orchestration for the behavioral event trigger system.
 * Monitors local data changes and triggers contextual UI responses.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useBehavioralEngine } from '@/hooks/useBehavioralEngine';
import { useLocalTransactions, Transaction } from '@/hooks/useLocalTransactions';
import { useLocalDebts } from '@/hooks/useLocalDebts';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  TriggerState,
  getStoredTriggerState,
  updateTriggerState,
  isDiscretionaryCategory,
  canTrigger,
  TRIGGER_COOLDOWNS,
  calculateFreedomDateDelay,
} from '@/lib/behavioralTriggers';
import { calculateShadowCost } from '@/lib/behavioralEngine';
import { ShadowCostToast } from '@/components/behavioral/ShadowCostToast';
import { SurplusStrikeModal } from '@/components/behavioral/SurplusStrikeModal';
import { StrategyPivotDialog } from '@/components/behavioral/StrategyPivotDialog';
import { LevelUpModal } from '@/components/behavioral/LevelUpModal';

interface ShadowCostTriggerData {
  transactionId: string;
  description: string;
  amount: number;
  shadowCost: number;
  freedomDateDelay: number;
  interestRate: number;
}

interface SurplusStrikeTriggerData {
  surplusAmount: number;
  smallestDebtName: string;
  smallestDebtBalance: number;
  daysAccelerated: number;
}

interface LevelUpTriggerData {
  highestInterestDebt: {
    name: string;
    balance: number;
    interest_rate: number;
  };
  annualSavings: number;
}

interface BehavioralTriggerContextType {
  // Trigger states
  shadowCostData: ShadowCostTriggerData | null;
  surplusStrikeData: SurplusStrikeTriggerData | null;
  showStrategyPivot: boolean;
  showLevelUp: boolean;
  levelUpData: LevelUpTriggerData | null;
  
  // Dismiss handlers
  dismissShadowCost: () => void;
  dismissSurplusStrike: () => void;
  dismissStrategyPivot: () => void;
  dismissLevelUp: () => void;
  
  // Action handlers
  handleSurplusStrike: () => void;
  handleStrategySwitch: (newStrategy: 'Snowball' | 'Avalanche') => void;
  handleLevelUpSwitch: () => void;
  
  // Manual triggers (for testing/demo)
  triggerShadowCost: (transaction: Transaction) => void;
}

const BehavioralTriggerContext = createContext<BehavioralTriggerContextType | null>(null);

export function useBehavioralTriggers() {
  const context = useContext(BehavioralTriggerContext);
  if (!context) {
    throw new Error('useBehavioralTriggers must be used within BehavioralTriggerProvider');
  }
  return context;
}

interface BehavioralTriggerProviderProps {
  children: React.ReactNode;
}

export function BehavioralTriggerProvider({ children }: BehavioralTriggerProviderProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { transactions } = useLocalTransactions();
  const { debts } = useLocalDebts();
  const { 
    highestInterestRate, 
    budgetCompliance, 
    consistencyScore,
    surplusPower,
  } = useBehavioralEngine();

  // Strategy preference
  const [strategy, setStrategy] = useUserLocalStorage<'Snowball' | 'Avalanche'>(
    'bdt_strategy',
    'Snowball'
  );

  // Trigger states
  const [shadowCostData, setShadowCostData] = useState<ShadowCostTriggerData | null>(null);
  const [surplusStrikeData, setSurplusStrikeData] = useState<SurplusStrikeTriggerData | null>(null);
  const [showStrategyPivot, setShowStrategyPivot] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<LevelUpTriggerData | null>(null);

  const { toast } = useToast();

  // Track previous transaction count
  const prevTransactionCount = useRef(transactions.length);
  const triggerStateRef = useRef<TriggerState>(getStoredTriggerState());

  // Only enable triggers on protected routes (dashboard, transactions, etc.)
  const isProtectedRoute = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/transactions') ||
    location.pathname.startsWith('/budgets') ||
    location.pathname.startsWith('/debts');

  // Calculate total minimum debt payments
  const totalMinDebtPayment = debts.reduce((sum, d) => sum + d.minimum_payment, 0);

  // ============= TRIGGER A: Shadow Cost (Loss Aversion) =============
  const triggerShadowCost = useCallback((transaction: Transaction) => {
    if (!isProtectedRoute || !user) return;
    if (highestInterestRate <= 0) return; // No debt, no shadow cost
    
    const state = triggerStateRef.current;
    
    // Check cooldown
    if (!canTrigger(state.shadowCostLastTriggered, TRIGGER_COOLDOWNS.SHADOW_COST)) {
      return;
    }
    
    // Check if already shown for this transaction
    if (state.shadowCostShownTxIds.includes(transaction.id)) {
      return;
    }

    // Check if discretionary category
    if (!isDiscretionaryCategory(transaction.category)) {
      return;
    }

    // Calculate shadow cost
    const rate = highestInterestRate / 100; // Convert percentage back to decimal
    const shadowResult = calculateShadowCost(transaction.amount, rate);
    const freedomDateDelay = calculateFreedomDateDelay(transaction.amount, totalMinDebtPayment);

    // Update state
    const newShownIds = [...state.shadowCostShownTxIds, transaction.id].slice(-50); // Keep last 50
    triggerStateRef.current = {
      ...state,
      shadowCostLastTriggered: Date.now(),
      shadowCostShownTxIds: newShownIds,
    };
    updateTriggerState({
      shadowCostLastTriggered: Date.now(),
      shadowCostShownTxIds: newShownIds,
    });

    // Trigger the toast
    setShadowCostData({
      transactionId: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      shadowCost: shadowResult.shadowCost,
      freedomDateDelay,
      interestRate: highestInterestRate,
    });
  }, [isProtectedRoute, user, highestInterestRate, totalMinDebtPayment]);

  // Monitor for new transactions (Trigger A)
  useEffect(() => {
    if (transactions.length > prevTransactionCount.current) {
      // New transaction added
      const newTransaction = transactions[transactions.length - 1];
      if (newTransaction && newTransaction.flow === 'out') {
        triggerShadowCost(newTransaction);
      }
    }
    prevTransactionCount.current = transactions.length;
  }, [transactions, triggerShadowCost]);

  // ============= TRIGGER B: Surplus Strike =============
  useEffect(() => {
    if (!isProtectedRoute || !user) return;
    if (debts.length === 0) return;

    const state = triggerStateRef.current;
    
    // Check cooldown
    if (!canTrigger(state.surplusStrikeLastTriggered, TRIGGER_COOLDOWNS.SURPLUS_STRIKE)) {
      return;
    }

    // Check if budget variance > $20 under budget
    const surplusAmount = budgetCompliance.variance;
    if (surplusAmount < 20) return;

    // Find smallest debt (snowball order)
    const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
    const smallestDebt = sortedDebts[0];
    if (!smallestDebt) return;

    // Calculate days accelerated
    const daysAccelerated = calculateFreedomDateDelay(surplusAmount, totalMinDebtPayment);

    // Update state
    triggerStateRef.current = {
      ...state,
      surplusStrikeLastTriggered: Date.now(),
    };
    updateTriggerState({
      surplusStrikeLastTriggered: Date.now(),
    });

    // Trigger the modal
    setSurplusStrikeData({
      surplusAmount,
      smallestDebtName: smallestDebt.name,
      smallestDebtBalance: smallestDebt.balance,
      daysAccelerated,
    });
  }, [isProtectedRoute, user, budgetCompliance.variance, debts, totalMinDebtPayment]);

  // ============= TRIGGER C: Strategy Pivot =============
  useEffect(() => {
    if (!isProtectedRoute || !user) return;
    
    const state = triggerStateRef.current;
    
    // Already shown
    if (state.strategyPivotShown) return;

    // Check if on Snowball strategy
    if (strategy !== 'Snowball') return;

    // Check 30-day streak with 80%+ consistency
    if (consistencyScore.currentStreak < 30) return;

    // Trigger the dialog
    triggerStateRef.current = {
      ...state,
      strategyPivotShown: true,
    };
    updateTriggerState({
      strategyPivotShown: true,
    });

    setShowStrategyPivot(true);
  }, [isProtectedRoute, user, consistencyScore.currentStreak, strategy]);

  // ============= TRIGGER D: Level Up (Consistency > 75 + Snowball) =============
  useEffect(() => {
    if (!isProtectedRoute || !user) return;
    if (debts.length === 0) return;
    
    const state = triggerStateRef.current;
    
    // Already shown level-up
    if (state.levelUpShown) return;

    // Check if on Snowball strategy
    if (strategy !== 'Snowball') return;

    // Check consistency score > 75
    if (consistencyScore.score <= 75) return;

    // Find highest interest debt
    const sortedByInterest = [...debts].sort((a, b) => b.interest_rate - a.interest_rate);
    const highestDebt = sortedByInterest[0];
    if (!highestDebt) return;

    // Calculate potential annual savings from switching to Avalanche
    // Using shadow cost logic: difference in interest paid over payoff period
    const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
    const avgRate = debts.reduce((sum, d) => sum + d.interest_rate * d.balance, 0) / totalBalance;
    const highestRate = highestDebt.interest_rate;
    
    // Estimate savings: ~15-20% efficiency gain from targeting high interest first
    const avgBalance = totalBalance / 2; // Average outstanding over payoff
    const interestDifference = avgBalance * ((highestRate - avgRate) / 100) * 0.2;
    const annualSavings = Math.max(Math.round(interestDifference), 50); // Minimum $50 for display

    // Update state
    triggerStateRef.current = {
      ...state,
      levelUpShown: true,
    };
    updateTriggerState({
      levelUpShown: true,
    });

    // Trigger the modal
    setLevelUpData({
      highestInterestDebt: {
        name: highestDebt.name,
        balance: highestDebt.balance,
        interest_rate: highestDebt.interest_rate,
      },
      annualSavings,
    });
    setShowLevelUp(true);
  }, [isProtectedRoute, user, consistencyScore.score, strategy, debts]);

  // ============= Dismiss Handlers =============
  const dismissShadowCost = useCallback(() => {
    setShadowCostData(null);
  }, []);

  const dismissSurplusStrike = useCallback(() => {
    setSurplusStrikeData(null);
  }, []);

  const dismissStrategyPivot = useCallback(() => {
    setShowStrategyPivot(false);
  }, []);

  const dismissLevelUp = useCallback(() => {
    setShowLevelUp(false);
    setLevelUpData(null);
  }, []);

  // ============= Action Handlers =============
  const handleSurplusStrike = useCallback(() => {
    // Navigate to debt page with surplus amount
    // This would need router navigation - for now just dismiss
    setSurplusStrikeData(null);
    window.location.href = '/debts';
  }, []);

  const handleStrategySwitch = useCallback((newStrategy: 'Snowball' | 'Avalanche') => {
    setStrategy(newStrategy);
    setShowStrategyPivot(false);
  }, [setStrategy]);

  const handleLevelUpSwitch = useCallback(() => {
    setStrategy('Avalanche');
    setShowLevelUp(false);
    setLevelUpData(null);
    toast({
      title: "Strategy Updated",
      description: "Your tactical advantage has increased.",
    });
  }, [setStrategy, toast]);

  const contextValue: BehavioralTriggerContextType = {
    shadowCostData,
    surplusStrikeData,
    showStrategyPivot,
    showLevelUp,
    levelUpData,
    dismissShadowCost,
    dismissSurplusStrike,
    dismissStrategyPivot,
    dismissLevelUp,
    handleSurplusStrike,
    handleStrategySwitch,
    handleLevelUpSwitch,
    triggerShadowCost,
  };

  return (
    <BehavioralTriggerContext.Provider value={contextValue}>
      {children}
      
      {/* Trigger A: Shadow Cost Toast */}
      <ShadowCostToast
        data={shadowCostData}
        onDismiss={dismissShadowCost}
      />
      
      {/* Trigger B: Surplus Strike Modal */}
      <SurplusStrikeModal
        data={surplusStrikeData}
        onDismiss={dismissSurplusStrike}
        onStrike={handleSurplusStrike}
      />
      
      {/* Trigger C: Strategy Pivot Dialog */}
      <StrategyPivotDialog
        open={showStrategyPivot}
        currentStreak={consistencyScore.currentStreak}
        currentStrategy={strategy}
        onDismiss={dismissStrategyPivot}
        onSwitch={handleStrategySwitch}
      />
      
      {/* Trigger D: Level Up Modal */}
      <LevelUpModal
        open={showLevelUp}
        onOpenChange={setShowLevelUp}
        consistencyScore={consistencyScore.score}
        highestInterestDebt={levelUpData?.highestInterestDebt ?? null}
        annualSavings={levelUpData?.annualSavings ?? 0}
        currentStrategy={strategy}
        onSwitch={handleLevelUpSwitch}
        onDismiss={dismissLevelUp}
      />
    </BehavioralTriggerContext.Provider>
  );
}
