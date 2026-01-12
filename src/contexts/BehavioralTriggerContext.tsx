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

interface BehavioralTriggerContextType {
  // Trigger states
  shadowCostData: ShadowCostTriggerData | null;
  surplusStrikeData: SurplusStrikeTriggerData | null;
  showStrategyPivot: boolean;
  
  // Dismiss handlers
  dismissShadowCost: () => void;
  dismissSurplusStrike: () => void;
  dismissStrategyPivot: () => void;
  
  // Action handlers
  handleSurplusStrike: () => void;
  handleStrategySwitch: (newStrategy: 'Snowball' | 'Avalanche') => void;
  
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

  const contextValue: BehavioralTriggerContextType = {
    shadowCostData,
    surplusStrikeData,
    showStrategyPivot,
    dismissShadowCost,
    dismissSurplusStrike,
    dismissStrategyPivot,
    handleSurplusStrike,
    handleStrategySwitch,
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
    </BehavioralTriggerContext.Provider>
  );
}
