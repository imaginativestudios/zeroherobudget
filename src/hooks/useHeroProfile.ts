/**
 * Hero Profile Hook
 * 
 * Unified hook for the Hero's Stats including the Moat (emergency fund) tracking.
 * Consolidates user profile state for behavioral coaching.
 */

import { useCallback, useMemo } from 'react';
import { useUserLocalStorage } from './useUserLocalStorage';
import { useStrategy } from './useLocalSettings';

export interface HeroProfile {
  // Onboarding
  onboarding_completed: boolean;
  
  // The Moat (Emergency Fund)
  moat_target: number;      // Default 1000
  moat_current: number;     // Current savings toward $1,000
  
  // Last active tracking
  last_active_date: string | null;
}

const DEFAULT_HERO_PROFILE: HeroProfile = {
  onboarding_completed: false,
  moat_target: 1000,
  moat_current: 0,
  last_active_date: null,
};

export interface UseHeroProfileResult {
  profile: HeroProfile;
  isLoading: boolean;
  
  // Strategy (from existing hook)
  currentStrategy: string;
  setStrategy: (strategy: string) => void;
  
  // Moat operations
  moatProgress: number; // 0-100 percentage
  moatRemaining: number;
  isMoatComplete: boolean;
  addToMoat: (amount: number) => void;
  setMoatCurrent: (amount: number) => void;
  setMoatTarget: (amount: number) => void;
  
  // Activity tracking
  recordActivity: () => void;
  
  // Onboarding
  completeOnboarding: () => void;
}

export function useHeroProfile(): UseHeroProfileResult {
  const [heroProfile, setHeroProfile, isLoading] = useUserLocalStorage<HeroProfile>(
    'bdt_hero_profile',
    DEFAULT_HERO_PROFILE
  );
  const [strategy, setStrategy] = useStrategy();

  // Calculate moat progress
  const moatProgress = useMemo(() => {
    if (heroProfile.moat_target <= 0) return 100;
    return Math.min(100, (heroProfile.moat_current / heroProfile.moat_target) * 100);
  }, [heroProfile.moat_current, heroProfile.moat_target]);

  const moatRemaining = useMemo(() => {
    return Math.max(0, heroProfile.moat_target - heroProfile.moat_current);
  }, [heroProfile.moat_current, heroProfile.moat_target]);

  const isMoatComplete = moatProgress >= 100;

  // Add to moat (cumulative)
  const addToMoat = useCallback((amount: number) => {
    setHeroProfile({
      ...heroProfile,
      moat_current: Math.min(
        heroProfile.moat_target,
        heroProfile.moat_current + amount
      ),
    });
  }, [heroProfile, setHeroProfile]);

  // Set moat current directly
  const setMoatCurrent = useCallback((amount: number) => {
    setHeroProfile({
      ...heroProfile,
      moat_current: Math.max(0, Math.min(heroProfile.moat_target, amount)),
    });
  }, [heroProfile, setHeroProfile]);

  // Set moat target
  const setMoatTarget = useCallback((amount: number) => {
    setHeroProfile({
      ...heroProfile,
      moat_target: Math.max(0, amount),
    });
  }, [heroProfile, setHeroProfile]);

  // Record activity
  const recordActivity = useCallback(() => {
    setHeroProfile({
      ...heroProfile,
      last_active_date: new Date().toISOString(),
    });
  }, [heroProfile, setHeroProfile]);

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    setHeroProfile({
      ...heroProfile,
      onboarding_completed: true,
    });
  }, [heroProfile, setHeroProfile]);

  return {
    profile: heroProfile,
    isLoading,
    currentStrategy: strategy,
    setStrategy,
    moatProgress,
    moatRemaining,
    isMoatComplete,
    addToMoat,
    setMoatCurrent,
    setMoatTarget,
    recordActivity,
    completeOnboarding,
  };
}
