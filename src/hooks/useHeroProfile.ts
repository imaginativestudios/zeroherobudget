/**
 * Hero Profile Hook
 * 
 * Consolidates user profile state for behavioral coaching purposes.
 * Tracks onboarding, strategy selection, emergency fund (Moat), and activity.
 */

import { useMemo, useCallback } from 'react';
import { format, subDays, parseISO, startOfDay } from 'date-fns';
import { useUserLocalStorage } from './useUserLocalStorage';
import { useStrategy } from './useLocalSettings';

export interface HeroProfile {
  onboarding_completed: boolean;
  moat_target: number;
  moat_current: number;
  last_active_date: string | null;
  activity_log: string[]; // Array of ISO dates for app opens (last 7 days)
}

// Separate Savings Vault storage for mental separation of emergency fund
export interface SavingsVault {
  moat_balance: number;
  moat_target: number;
  last_deposit_date: string | null;
  deposit_history: Array<{ amount: number; date: string }>;
  achieved_milestones: number[]; // [25, 50, 75, 100] as they're reached
  // Recovery tracking
  was_secure: boolean;
  last_secure_date: string | null;
  breach_acknowledged: boolean;
  repair_mode_active: boolean;
}

const DEFAULT_HERO_PROFILE: HeroProfile = {
  onboarding_completed: false,
  moat_target: 1000,
  moat_current: 0,
  last_active_date: null,
  activity_log: [],
};

const DEFAULT_SAVINGS_VAULT: SavingsVault = {
  moat_balance: 0,
  moat_target: 1000,
  last_deposit_date: null,
  deposit_history: [],
  achieved_milestones: [],
  was_secure: false,
  last_secure_date: null,
  breach_acknowledged: false,
  repair_mode_active: false,
};

export interface UseHeroProfileResult {
  profile: HeroProfile;
  savingsVault: SavingsVault;
  isLoading: boolean;
  
  // Strategy from useStrategy hook
  currentStrategy: 'Snowball' | 'Avalanche';
  setStrategy: (strategy: 'Snowball' | 'Avalanche') => void;
  
  // Moat operations (uses savings vault for mental separation)
  moatProgress: number;
  moatRemaining: number;
  isMoatComplete: boolean;
  achievedMilestones: number[];
  addToMoat: (amount: number) => number[]; // Returns newly achieved milestones
  setMoatCurrent: (amount: number) => void;
  setMoatTarget: (amount: number) => void;
  updateSavingsVault: (updates: Partial<SavingsVault>) => void;
  
  // Activity tracking
  activityLog: string[];
  recordDailyActivity: () => void;
  
  // Onboarding
  completeOnboarding: () => void;
}

export function useHeroProfile(): UseHeroProfileResult {
  const [profile, setProfile] = useUserLocalStorage<HeroProfile>(
    'bdt_hero_profile',
    DEFAULT_HERO_PROFILE
  );
  
  // Separate savings vault storage for mental separation of emergency fund
  const [savingsVault, setSavingsVault] = useUserLocalStorage<SavingsVault>(
    'bdt_savings_vault',
    DEFAULT_SAVINGS_VAULT
  );
  
  const [strategy, setStrategy] = useStrategy();

  // Prune activity log to keep only last 7 days
  const pruneActivityLog = useCallback((log: string[]): string[] => {
    const today = startOfDay(new Date());
    const sevenDaysAgo = subDays(today, 6);
    
    return log.filter(dateStr => {
      try {
        const date = startOfDay(parseISO(dateStr));
        return date >= sevenDaysAgo && date <= today;
      } catch {
        return false;
      }
    });
  }, []);

  // Record daily activity (called when app is opened)
  const recordDailyActivity = useCallback(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    // Skip if already recorded today
    if (profile.activity_log.includes(todayStr)) {
      if (profile.last_active_date !== todayStr) {
        setProfile({
          ...profile,
          last_active_date: todayStr,
        });
      }
      return;
    }
    
    // Add today and prune old entries
    const updatedLog = pruneActivityLog([...profile.activity_log, todayStr]);
    
    setProfile({
      ...profile,
      activity_log: updatedLog,
      last_active_date: todayStr,
    });
  }, [profile, setProfile, pruneActivityLog]);

  // Moat calculations - use savingsVault for mental separation
  const moatProgress = useMemo(() => {
    const target = savingsVault.moat_target || profile.moat_target;
    const current = savingsVault.moat_balance || profile.moat_current;
    if (target <= 0) return 100;
    return Math.min(100, (current / target) * 100);
  }, [savingsVault.moat_balance, savingsVault.moat_target, profile.moat_current, profile.moat_target]);

  const moatRemaining = useMemo(() => {
    const target = savingsVault.moat_target || profile.moat_target;
    const current = savingsVault.moat_balance || profile.moat_current;
    return Math.max(0, target - current);
  }, [savingsVault.moat_balance, savingsVault.moat_target, profile.moat_current, profile.moat_target]);

  const isMoatComplete = (savingsVault.moat_balance || profile.moat_current) >= (savingsVault.moat_target || profile.moat_target);

  // Moat operations - sync to both storages for backward compatibility
  const addToMoat = useCallback((amount: number): number[] => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const previousBalance = savingsVault.moat_balance || profile.moat_current;
    const newBalance = previousBalance + amount;
    const target = savingsVault.moat_target || profile.moat_target;
    
    // Calculate percentages before and after
    const previousPercentage = (previousBalance / target) * 100;
    const newPercentage = (newBalance / target) * 100;
    
    // Detect newly crossed milestones
    const milestones = [25, 50, 75, 100];
    const newlyAchieved = milestones.filter(m => 
      previousPercentage < m && 
      newPercentage >= m && 
      !savingsVault.achieved_milestones.includes(m)
    );
    
    // Update savings vault (primary)
    setSavingsVault({
      ...savingsVault,
      moat_balance: newBalance,
      last_deposit_date: todayStr,
      deposit_history: [
        ...savingsVault.deposit_history,
        { amount, date: todayStr }
      ].slice(-50), // Keep last 50 deposits
      achieved_milestones: [...savingsVault.achieved_milestones, ...newlyAchieved],
    });
    
    // Sync to hero profile for backward compatibility
    setProfile({
      ...profile,
      moat_current: newBalance,
    });
    
    return newlyAchieved;
  }, [profile, setProfile, savingsVault, setSavingsVault]);

  const setMoatCurrent = useCallback((amount: number) => {
    const newAmount = Math.max(0, amount);
    
    setSavingsVault({
      ...savingsVault,
      moat_balance: newAmount,
    });
    
    setProfile({
      ...profile,
      moat_current: newAmount,
    });
  }, [profile, setProfile, savingsVault, setSavingsVault]);

  const setMoatTarget = useCallback((amount: number) => {
    const newTarget = Math.max(0, amount);
    
    setSavingsVault({
      ...savingsVault,
      moat_target: newTarget,
    });
    
    setProfile({
      ...profile,
      moat_target: newTarget,
    });
  }, [profile, setProfile, savingsVault, setSavingsVault]);

  // Onboarding
  const completeOnboarding = useCallback(() => {
    setProfile({
      ...profile,
      onboarding_completed: true,
    });
  }, [profile, setProfile]);

  // Update savings vault with partial updates
  const updateSavingsVault = useCallback((updates: Partial<SavingsVault>) => {
    setSavingsVault({
      ...savingsVault,
      ...updates,
    });
  }, [savingsVault, setSavingsVault]);

  return {
    profile,
    savingsVault,
    isLoading: false,
    currentStrategy: strategy as 'Snowball' | 'Avalanche',
    setStrategy,
    moatProgress,
    moatRemaining,
    isMoatComplete,
    achievedMilestones: savingsVault.achieved_milestones,
    addToMoat,
    setMoatCurrent,
    setMoatTarget,
    updateSavingsVault,
    activityLog: profile.activity_log,
    recordDailyActivity,
    completeOnboarding,
  };
}

