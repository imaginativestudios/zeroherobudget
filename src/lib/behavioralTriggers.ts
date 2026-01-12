/**
 * Behavioral Trigger Utilities
 * 
 * Shared utilities for the behavioral event trigger system.
 * Includes cooldown management, trigger history, and helper functions.
 */

import { getSurvivalCategories } from './behavioralEngine';

// Trigger cooldown periods in milliseconds
export const TRIGGER_COOLDOWNS = {
  SHADOW_COST: 5 * 60 * 1000,      // 5 minutes between shadow cost toasts
  SURPLUS_STRIKE: 24 * 60 * 60 * 1000, // Once per day for surplus modal
  STRATEGY_PIVOT: Infinity,         // One-time trigger (persisted permanently)
};

// Local storage keys for trigger state
export const TRIGGER_STORAGE_KEYS = {
  SHADOW_COST_LAST: 'bdt_shadow_cost_last_triggered',
  SHADOW_COST_TX_IDS: 'bdt_shadow_cost_shown_tx_ids',
  SURPLUS_STRIKE_LAST: 'bdt_surplus_strike_last_triggered',
  STRATEGY_PIVOT_SHOWN: 'bdt_strategy_pivot_shown',
  CONSISTENCY_HISTORY: 'bdt_consistency_history',
};

export interface TriggerState {
  shadowCostLastTriggered: number | null;
  shadowCostShownTxIds: string[];
  surplusStrikeLastTriggered: number | null;
  strategyPivotShown: boolean;
  consistencyHistory: Array<{ date: string; score: number }>;
}

/**
 * Check if a transaction category is non-essential (discretionary)
 */
export function isDiscretionaryCategory(category: string): boolean {
  const survivalCategories = getSurvivalCategories();
  return !survivalCategories.includes(category);
}

/**
 * Check if enough time has passed since last trigger
 */
export function canTrigger(lastTriggered: number | null, cooldownMs: number): boolean {
  if (lastTriggered === null) return true;
  return Date.now() - lastTriggered >= cooldownMs;
}

/**
 * Calculate freedom date delay in days
 * Based on how much the expense delays debt payoff
 */
export function calculateFreedomDateDelay(
  amount: number,
  monthlyDebtPayment: number
): number {
  if (monthlyDebtPayment <= 0) return 0;
  // Days = (amount / monthly payment) * 30 days
  return Math.round((amount / monthlyDebtPayment) * 30);
}

/**
 * Format currency for display
 */
export function formatTriggerCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get stored trigger state from localStorage
 */
export function getStoredTriggerState(): TriggerState {
  try {
    return {
      shadowCostLastTriggered: JSON.parse(
        localStorage.getItem(TRIGGER_STORAGE_KEYS.SHADOW_COST_LAST) || 'null'
      ),
      shadowCostShownTxIds: JSON.parse(
        localStorage.getItem(TRIGGER_STORAGE_KEYS.SHADOW_COST_TX_IDS) || '[]'
      ),
      surplusStrikeLastTriggered: JSON.parse(
        localStorage.getItem(TRIGGER_STORAGE_KEYS.SURPLUS_STRIKE_LAST) || 'null'
      ),
      strategyPivotShown: JSON.parse(
        localStorage.getItem(TRIGGER_STORAGE_KEYS.STRATEGY_PIVOT_SHOWN) || 'false'
      ),
      consistencyHistory: JSON.parse(
        localStorage.getItem(TRIGGER_STORAGE_KEYS.CONSISTENCY_HISTORY) || '[]'
      ),
    };
  } catch {
    return {
      shadowCostLastTriggered: null,
      shadowCostShownTxIds: [],
      surplusStrikeLastTriggered: null,
      strategyPivotShown: false,
      consistencyHistory: [],
    };
  }
}

/**
 * Update trigger state in localStorage
 */
export function updateTriggerState(updates: Partial<TriggerState>): void {
  try {
    if (updates.shadowCostLastTriggered !== undefined) {
      localStorage.setItem(
        TRIGGER_STORAGE_KEYS.SHADOW_COST_LAST,
        JSON.stringify(updates.shadowCostLastTriggered)
      );
    }
    if (updates.shadowCostShownTxIds !== undefined) {
      localStorage.setItem(
        TRIGGER_STORAGE_KEYS.SHADOW_COST_TX_IDS,
        JSON.stringify(updates.shadowCostShownTxIds)
      );
    }
    if (updates.surplusStrikeLastTriggered !== undefined) {
      localStorage.setItem(
        TRIGGER_STORAGE_KEYS.SURPLUS_STRIKE_LAST,
        JSON.stringify(updates.surplusStrikeLastTriggered)
      );
    }
    if (updates.strategyPivotShown !== undefined) {
      localStorage.setItem(
        TRIGGER_STORAGE_KEYS.STRATEGY_PIVOT_SHOWN,
        JSON.stringify(updates.strategyPivotShown)
      );
    }
    if (updates.consistencyHistory !== undefined) {
      localStorage.setItem(
        TRIGGER_STORAGE_KEYS.CONSISTENCY_HISTORY,
        JSON.stringify(updates.consistencyHistory)
      );
    }
  } catch (error) {
    console.error('Failed to update trigger state:', error);
  }
}
