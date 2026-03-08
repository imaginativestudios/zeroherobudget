/**
 * Behavioral Trigger Context & Provider (Simplified)
 * 
 * 2 triggers only:
 * A. Shadow Cost — loss aversion toast on discretionary transactions
 * B. Surplus Strike — celebration when budget surplus detected
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useBehavioralEngine } from '@/hooks/useBehavioralEngine';
import { useLocalTransactions, Transaction } from '@/hooks/useLocalTransactions';
import { useLocalDebts } from '@/hooks/useLocalDebts';
import { useAuth } from '@/hooks/useAuth';
import {
  TriggerState,
  getStoredTriggerState,
  updateTriggerState,
  isDiscretionaryCategory,
  canTrigger,
  TRIGGER_COOLDOWNS,
  calculateFreedomDateDelay,
  calculateShadowCost,
} from '@/lib/debtInsights';
import { ShadowCostToast } from '@/components/behavioral/ShadowCostToast';
import { SurplusStrikeModal } from '@/components/behavioral/SurplusStrikeModal';

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
  shadowCostData: ShadowCostTriggerData | null;
  surplusStrikeData: SurplusStrikeTriggerData | null;
  dismissShadowCost: () => void;
  dismissSurplusStrike: () => void;
  handleSurplusStrike: () => void;
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
  const { highestInterestRate, budgetCompliance } = useBehavioralEngine();

  // Trigger states
  const [shadowCostData, setShadowCostData] = useState<ShadowCostTriggerData | null>(null);
  const [surplusStrikeData, setSurplusStrikeData] = useState<SurplusStrikeTriggerData | null>(null);

  const prevTransactionCount = useRef(transactions.length);
  const triggerStateRef = useRef<TriggerState>(getStoredTriggerState());

  const isProtectedRoute = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/transactions') ||
    location.pathname.startsWith('/budgets') ||
    location.pathname.startsWith('/debts');

  const totalMinDebtPayment = debts.reduce((sum, d) => sum + d.minimum_payment, 0);

  // ============= TRIGGER A: Shadow Cost =============
  const triggerShadowCost = useCallback((transaction: Transaction) => {
    if (!isProtectedRoute || !user) return;
    if (highestInterestRate <= 0) return;

    const state = triggerStateRef.current;
    if (!canTrigger(state.shadowCostLastTriggered, TRIGGER_COOLDOWNS.SHADOW_COST)) return;
    if (state.shadowCostShownTxIds.includes(transaction.id)) return;
    if (!isDiscretionaryCategory(transaction.category)) return;

    const rate = highestInterestRate / 100;
    const shadowResult = calculateShadowCost(transaction.amount, rate);
    const freedomDateDelay = calculateFreedomDateDelay(transaction.amount, totalMinDebtPayment);

    const newShownIds = [...state.shadowCostShownTxIds, transaction.id].slice(-50);
    triggerStateRef.current = { ...state, shadowCostLastTriggered: Date.now(), shadowCostShownTxIds: newShownIds };
    updateTriggerState({ shadowCostLastTriggered: Date.now(), shadowCostShownTxIds: newShownIds });

    setShadowCostData({
      transactionId: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      shadowCost: shadowResult.shadowCost,
      freedomDateDelay,
      interestRate: highestInterestRate,
    });
  }, [isProtectedRoute, user, highestInterestRate, totalMinDebtPayment]);

  // Monitor for new transactions
  useEffect(() => {
    if (transactions.length > prevTransactionCount.current) {
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
    if (!canTrigger(state.surplusStrikeLastTriggered, TRIGGER_COOLDOWNS.SURPLUS_STRIKE)) return;

    const surplusAmount = budgetCompliance.variance;
    if (surplusAmount < 20) return;

    const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
    const smallestDebt = sortedDebts[0];
    if (!smallestDebt) return;

    const daysAccelerated = calculateFreedomDateDelay(surplusAmount, totalMinDebtPayment);

    triggerStateRef.current = { ...state, surplusStrikeLastTriggered: Date.now() };
    updateTriggerState({ surplusStrikeLastTriggered: Date.now() });

    setSurplusStrikeData({
      surplusAmount,
      smallestDebtName: smallestDebt.name,
      smallestDebtBalance: smallestDebt.balance,
      daysAccelerated,
    });
  }, [isProtectedRoute, user, budgetCompliance.variance, debts, totalMinDebtPayment]);

  // ============= Dismiss Handlers =============
  const dismissShadowCost = useCallback(() => setShadowCostData(null), []);
  const dismissSurplusStrike = useCallback(() => setSurplusStrikeData(null), []);

  const handleSurplusStrike = useCallback(() => {
    setSurplusStrikeData(null);
    window.location.href = '/debts';
  }, []);

  const contextValue: BehavioralTriggerContextType = {
    shadowCostData,
    surplusStrikeData,
    dismissShadowCost,
    dismissSurplusStrike,
    handleSurplusStrike,
    triggerShadowCost,
  };

  return (
    <BehavioralTriggerContext.Provider value={contextValue}>
      {children}
      <ShadowCostToast data={shadowCostData} onDismiss={dismissShadowCost} />
      <SurplusStrikeModal data={surplusStrikeData} onDismiss={dismissSurplusStrike} onStrike={handleSurplusStrike} />
    </BehavioralTriggerContext.Provider>
  );
}
