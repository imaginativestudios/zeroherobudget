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

const DEFAULT_HERO_PROFILE: HeroProfile = {
  onboarding_completed: false,
  moat_target: 1000,
  moat_current: 0,
  last_active_date: null,
  activity_log: [],
};

export interface UseHeroProfileResult {
  profile: HeroProfile;
  isLoading: boolean;
  
  // Strategy from useStrategy hook
  currentStrategy: 'Snowball' | 'Avalanche';
  setStrategy: (strategy: 'Snowball' | 'Avalanche') => void;
  
  // Moat operations
  moatProgress: number;
  moatRemaining: number;
  isMoatComplete: boolean;
  addToMoat: (amount: number) => void;
  setMoatCurrent: (amount: number) => void;
  setMoatTarget: (amount: number) => void;
  
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

  // Moat calculations
  const moatProgress = useMemo(() => {
    if (profile.moat_target <= 0) return 100;
    return Math.min(100, (profile.moat_current / profile.moat_target) * 100);
  }, [profile.moat_current, profile.moat_target]);

  const moatRemaining = useMemo(() => {
    return Math.max(0, profile.moat_target - profile.moat_current);
  }, [profile.moat_current, profile.moat_target]);

  const isMoatComplete = profile.moat_current >= profile.moat_target;

  // Moat operations
  const addToMoat = useCallback((amount: number) => {
    setProfile({
      ...profile,
      moat_current: profile.moat_current + amount,
    });
  }, [profile, setProfile]);

  const setMoatCurrent = useCallback((amount: number) => {
    setProfile({
      ...profile,
      moat_current: Math.max(0, amount),
    });
  }, [profile, setProfile]);

  const setMoatTarget = useCallback((amount: number) => {
    setProfile({
      ...profile,
      moat_target: Math.max(0, amount),
    });
  }, [profile, setProfile]);

  // Onboarding
  const completeOnboarding = useCallback(() => {
    setProfile({
      ...profile,
      onboarding_completed: true,
    });
  }, [profile, setProfile]);

  return {
    profile,
    isLoading: false,
    currentStrategy: strategy as 'Snowball' | 'Avalanche',
    setStrategy,
    moatProgress,
    moatRemaining,
    isMoatComplete,
    addToMoat,
    setMoatCurrent,
    setMoatTarget,
    activityLog: profile.activity_log,
    recordDailyActivity,
    completeOnboarding,
  };
}

