/**
 * Freedom Engine - Scenario Modeling for Debt Freedom
 * 
 * Provides utilities to calculate the impact of extra payments on debt-free timelines
 * and translate interest savings into meaningful human time metrics.
 */

import { DebtItem, getDetailedPaymentSchedule } from './debtCalculations';
import { addMonths, format } from 'date-fns';

export interface FreedomImpactResult {
  // Baseline scenario (current payments only)
  baselineMonths: number;
  baselineInterest: number;
  baselineFreedomDate: Date;
  
  // With extra payment scenario
  newMonths: number;
  newInterest: number;
  newFreedomDate: Date;
  
  // Savings
  monthsSaved: number;
  totalInterestSaved: number;
  
  // Formatted strings
  baselineFreedomDateFormatted: string;
  newFreedomDateFormatted: string;
  
  // Target debt info (where extra goes first)
  targetDebt: {
    name: string;
    balance: number;
    apr: number;
  } | null;
}

export interface HumanTimeResult {
  hours: number;
  days: number;
  weeks: number;
  displayString: string;
  heroMessage: string;
}

export interface SliderImpactPoint {
  amount: number;
  months: number;
  date: string;
  interestSaved: number;
  freedomDate: Date;
}

/**
 * Creates an empty impact result for edge cases
 */
function createEmptyImpactResult(): FreedomImpactResult {
  const today = new Date();
  return {
    baselineMonths: 0,
    baselineInterest: 0,
    baselineFreedomDate: today,
    newMonths: 0,
    newInterest: 0,
    newFreedomDate: today,
    monthsSaved: 0,
    totalInterestSaved: 0,
    baselineFreedomDateFormatted: 'Already Free!',
    newFreedomDateFormatted: 'Already Free!',
    targetDebt: null,
  };
}

/**
 * Calculate the impact of an additional payment amount on debt freedom
 */
export function calculateFreedomImpact(
  debts: DebtItem[],
  currentExtraBudget: number,
  additionalAmount: number,
  strategy: 'Snowball' | 'Avalanche' = 'Snowball'
): FreedomImpactResult {
  // 1. Filter active debts (balance > 0)
  const activeDebts = debts.filter(d => d.balance > 0);
  
  if (activeDebts.length === 0) {
    return createEmptyImpactResult();
  }
  
  // 2. Calculate baseline (current extra budget only)
  const baselineSchedule = getDetailedPaymentSchedule(
    activeDebts, 
    currentExtraBudget, 
    strategy
  );
  
  // 3. Calculate new scenario (current + additional amount)
  const newSchedule = getDetailedPaymentSchedule(
    activeDebts,
    currentExtraBudget + additionalAmount,
    strategy
  );
  
  // 4. Compute dates
  const today = new Date();
  const baselineFreedomDate = addMonths(today, baselineSchedule.summary.totalMonths);
  const newFreedomDate = addMonths(today, newSchedule.summary.totalMonths);
  
  // 5. Compute differences
  const monthsSaved = baselineSchedule.summary.totalMonths - newSchedule.summary.totalMonths;
  const totalInterestSaved = baselineSchedule.summary.totalInterest - newSchedule.summary.totalInterest;
  
  // 6. Identify target debt based on strategy
  const sortedDebts = [...activeDebts].sort((a, b) => 
    strategy === 'Avalanche' ? b.apr - a.apr : a.balance - b.balance
  );
  
  const targetDebt = sortedDebts[0] ? {
    name: sortedDebts[0].name,
    balance: sortedDebts[0].balance,
    apr: sortedDebts[0].apr,
  } : null;
  
  return {
    baselineMonths: baselineSchedule.summary.totalMonths,
    baselineInterest: baselineSchedule.summary.totalInterest,
    baselineFreedomDate,
    newMonths: newSchedule.summary.totalMonths,
    newInterest: newSchedule.summary.totalInterest,
    newFreedomDate,
    monthsSaved,
    totalInterestSaved,
    baselineFreedomDateFormatted: baselineSchedule.summary.totalMonths > 0 
      ? format(baselineFreedomDate, 'MMM yyyy') 
      : 'Already Free!',
    newFreedomDateFormatted: newSchedule.summary.totalMonths > 0 
      ? format(newFreedomDate, 'MMM yyyy') 
      : 'Already Free!',
    targetDebt,
  };
}

/**
 * Translate interest saved into human-meaningful time metrics
 */
export function translateToHumanTime(
  interestSaved: number,
  hourlyWage: number = 25 // Default to $25/hour if not specified
): HumanTimeResult {
  if (hourlyWage <= 0 || interestSaved <= 0) {
    return {
      hours: 0,
      days: 0,
      weeks: 0,
      displayString: 'No time saved',
      heroMessage: 'Every dollar counts on your journey!',
    };
  }
  
  const hours = interestSaved / hourlyWage;
  const days = hours / 8; // 8-hour workday
  const weeks = days / 5; // 5-day work week
  
  // Generate human-friendly display string
  let displayString: string;
  let heroMessage: string;
  
  if (weeks >= 2) {
    displayString = `${weeks.toFixed(1)} Weeks of Freedom`;
    heroMessage = `That's ${weeks.toFixed(1)} weeks you won't have to work just to pay interest!`;
  } else if (days >= 2) {
    displayString = `${days.toFixed(1)} Days of Freedom`;
    heroMessage = `Skip this expense and reclaim ${days.toFixed(1)} days of your life from debt!`;
  } else if (hours >= 1) {
    displayString = `${Math.round(hours)} Hours of Life`;
    heroMessage = `This purchase costs ${Math.round(hours)} hours of work when you factor in debt interest.`;
  } else {
    const minutes = Math.round(hours * 60);
    displayString = `${minutes} Minutes of Your Time`;
    heroMessage = 'Even small amounts add up on your path to freedom!';
  }
  
  return { hours, days, weeks, displayString, heroMessage };
}

/**
 * Calculate freedom impact for a range of slider values
 * Optimized for real-time slider interaction
 */
export function calculateSliderImpact(
  debts: DebtItem[],
  currentExtraBudget: number,
  maxAmount: number = 1000,
  step: number = 50,
  strategy: 'Snowball' | 'Avalanche' = 'Snowball'
): SliderImpactPoint[] {
  const activeDebts = debts.filter(d => d.balance > 0);
  
  if (activeDebts.length === 0) {
    return [];
  }
  
  // Pre-calculate baseline
  const baseline = getDetailedPaymentSchedule(activeDebts, currentExtraBudget, strategy);
  const today = new Date();
  
  // Generate slider values
  const sliderValues = Array.from(
    { length: Math.floor(maxAmount / step) + 1 }, 
    (_, i) => i * step
  );
  
  return sliderValues.map(amount => {
    const schedule = getDetailedPaymentSchedule(
      activeDebts, 
      currentExtraBudget + amount, 
      strategy
    );
    
    const freedomDate = addMonths(today, schedule.summary.totalMonths);
    
    return {
      amount,
      months: schedule.summary.totalMonths,
      date: schedule.summary.totalMonths > 0 
        ? format(freedomDate, 'MMM yyyy') 
        : 'Free!',
      interestSaved: baseline.summary.totalInterest - schedule.summary.totalInterest,
      freedomDate,
    };
  });
}

/**
 * Calculate the "true cost" of a purchase considering opportunity cost of debt payment
 */
export function calculateTrueCost(
  purchaseAmount: number,
  debts: DebtItem[],
  currentExtraBudget: number,
  strategy: 'Snowball' | 'Avalanche' = 'Snowball'
): {
  purchaseAmount: number;
  trueCost: number;
  opportunityCost: number;
  monthsDelayed: number;
} {
  const activeDebts = debts.filter(d => d.balance > 0);
  
  if (activeDebts.length === 0 || purchaseAmount <= 0) {
    return {
      purchaseAmount,
      trueCost: purchaseAmount,
      opportunityCost: 0,
      monthsDelayed: 0,
    };
  }
  
  // Calculate impact of applying this amount to debt vs spending it
  const withPayment = getDetailedPaymentSchedule(
    activeDebts,
    currentExtraBudget + purchaseAmount,
    strategy
  );
  
  const withoutPayment = getDetailedPaymentSchedule(
    activeDebts,
    currentExtraBudget,
    strategy
  );
  
  const interestDifference = withoutPayment.summary.totalInterest - withPayment.summary.totalInterest;
  const monthsDelayed = withoutPayment.summary.totalMonths - withPayment.summary.totalMonths;
  
  return {
    purchaseAmount,
    trueCost: purchaseAmount + interestDifference,
    opportunityCost: interestDifference,
    monthsDelayed: Math.abs(monthsDelayed),
  };
}
