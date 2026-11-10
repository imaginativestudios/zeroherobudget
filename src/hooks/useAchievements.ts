import { useMemo, useEffect, useRef, useState } from 'react';
import { useUserLocalStorage } from './useUserLocalStorage';
import { useAuth } from './useAuth';
import { DEMO_USER_ID } from '@/lib/demoDataLoader';
import confetti from 'canvas-confetti';
import { playAchievementUnlockSound } from '@/lib/soundEffects';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface DebtStats {
  totalDebt: number;
  debtsPaidOff: number;
  totalDebts: number;
}

export function useAchievements(currentStats: DebtStats, isReady: boolean) {
  const [initialDebt, setInitialDebt, initialLoading] = useUserLocalStorage<number>('initial-debt-total', 0);
  const [unlockedIds, setUnlockedIds, unlockedLoading] = useUserLocalStorage<string[]>('unlocked-achievements', []);
  const [unlockTimestamps, setUnlockTimestamps, timestampsLoading] = useUserLocalStorage<Record<string, string>>('achievement-timestamps', {});
  const [celebratedIds, setCelebratedIds, celebratedLoading] = useUserLocalStorage<string[] | null>('celebrated-achievements', null);
  const { user } = useAuth();
  const migratedRef = useRef<string | null>(null);
  const accountId = user?.id ?? DEMO_USER_ID;
  const [loadedAccount, setLoadedAccount] = useState<string | null>(null);
  useEffect(() => { setLoadedAccount(accountId); }, [accountId]);
  const ready = isReady && loadedAccount === accountId && !initialLoading && !unlockedLoading && !timestampsLoading && !celebratedLoading;

  // One-time migration: copy legacy unprefixed keys into the signed-in
  // account's prefixed keys, then remove the unprefixed ones. Only migrates
  // into an account that has no prefixed value yet.
  useEffect(() => {
    if (!ready || !user?.id || migratedRef.current === user.id) return;
    migratedRef.current = user.id;
    try {
      const prefix = `${user.id}_`;
      const migrateKey = (key: string): string | null => {
        if (localStorage.getItem(`${prefix}${key}`) !== null) return null;
        const oldValue = localStorage.getItem(key);
        if (oldValue === null) return null;
        localStorage.setItem(`${prefix}${key}`, oldValue);
        localStorage.removeItem(key);
        return oldValue;
      };

      const oldInitialDebt = migrateKey('initial-debt-total');
      if (oldInitialDebt !== null) setInitialDebt(JSON.parse(oldInitialDebt));
      const oldUnlocked = migrateKey('unlocked-achievements');
      if (oldUnlocked !== null) setUnlockedIds(JSON.parse(oldUnlocked));
      const oldTimestamps = migrateKey('achievement-timestamps');
      if (oldTimestamps !== null) setUnlockTimestamps(JSON.parse(oldTimestamps));

      // Migrate hourly wage from the legacy unprefixed hero profile
      const oldProfileRaw = localStorage.getItem('bdt_hero_profile');
      if (oldProfileRaw !== null) {
        const oldProfile = JSON.parse(oldProfileRaw);
        const prefixedProfileRaw = localStorage.getItem(`${prefix}bdt_hero_profile`);
        const prefixedProfile = prefixedProfileRaw ? JSON.parse(prefixedProfileRaw) : {};
        if (prefixedProfile.hourly_wage === undefined && typeof oldProfile?.hourly_wage === 'number') {
          prefixedProfile.hourly_wage = oldProfile.hourly_wage;
          localStorage.setItem(`${prefix}bdt_hero_profile`, JSON.stringify(prefixedProfile));
        }
        localStorage.removeItem('bdt_hero_profile');
      }
    } catch (error) {
      console.error('Error migrating local data to account:', error);
    }
  }, [ready, user?.id, setInitialDebt, setUnlockedIds, setUnlockTimestamps]);
  
  // Set initial debt if not set and there are debts
  useEffect(() => {
    const storedInitial = localStorage.getItem(`${accountId}_initial-debt-total`);
    if (storedInitial !== null && JSON.parse(storedInitial) !== initialDebt) return;
    if (ready && initialDebt === 0 && currentStats.totalDebt > 0) {
      setInitialDebt(currentStats.totalDebt);
    }
  }, [ready, accountId, initialDebt, currentStats.totalDebt, setInitialDebt]);

  const achievements = useMemo<Achievement[]>(() => {
    if (!ready) return [];
    const debtReduction = initialDebt > 0 ? ((initialDebt - currentStats.totalDebt) / initialDebt) * 100 : 0;
    
    return [
      {
        id: 'first-blood',
        title: 'First Debt Cleared',
        description: 'Remove the weight of the past to move forward.',
        icon: '🔗',
        unlocked: currentStats.debtsPaidOff >= 1,
        unlockedAt: unlockTimestamps['first-blood'],
      },
      {
        id: 'quarter-mark',
        title: '25% Milestone',
        description: 'Every step forward builds momentum.',
        icon: '🧱',
        unlocked: debtReduction >= 25,
        unlockedAt: unlockTimestamps['quarter-mark'],
        progress: Math.min(debtReduction, 25),
        maxProgress: 25,
      },
      {
        id: 'halfway-hero',
        title: 'Halfway Point',
        description: 'Discipline today creates freedom tomorrow.',
        icon: '⚖️',
        unlocked: debtReduction >= 50,
        unlockedAt: unlockTimestamps['halfway-hero'],
        progress: Math.min(debtReduction, 50),
        maxProgress: 50,
      },
      {
        id: 'three-quarters',
        title: '75% Milestone',
        description: 'The finish line rewards those who persist.',
        icon: '🧭',
        unlocked: debtReduction >= 75,
        unlockedAt: unlockTimestamps['three-quarters'],
        progress: Math.min(debtReduction, 75),
        maxProgress: 75,
      },
      {
        id: 'debt-slayer',
        title: 'Multiple Debts Cleared',
        description: 'Each cleared debt is a chain removed.',
        icon: '🔓',
        unlocked: currentStats.debtsPaidOff >= 3,
        unlockedAt: unlockTimestamps['debt-slayer'],
        progress: Math.min(currentStats.debtsPaidOff, 3),
        maxProgress: 3,
      },
      {
        id: 'freedom',
        title: 'Debt Freedom',
        description: 'The ultimate victory is owning your own time.',
        icon: '☀️',
        unlocked: currentStats.totalDebt === 0 && initialDebt > 0,
        unlockedAt: unlockTimestamps['freedom'],
      },
    ];
  }, [ready, currentStats, initialDebt, unlockTimestamps]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = 6;

  // Detect newly unlocked achievements and trigger confetti
  useEffect(() => {
    if (!ready) return;
    const storedInitial = localStorage.getItem(`${accountId}_initial-debt-total`);
    if (storedInitial !== null && JSON.parse(storedInitial) !== initialDebt) return;
    const celebratedKey = `${accountId}_celebrated-achievements`;
    if (localStorage.getItem(celebratedKey) === null) {
      const stored = localStorage.getItem(`${accountId}_unlocked-achievements`);
      setCelebratedIds(stored ? JSON.parse(stored) : []);
      return;
    }
    const currentUnlocked = achievements.filter(a => a.unlocked).map(a => a.id);
    const persisted: string[] = JSON.parse(localStorage.getItem(celebratedKey) ?? '[]');
    const newlyUnlocked = currentUnlocked.filter(id => !persisted.includes(id));
    if (JSON.stringify(currentUnlocked) !== JSON.stringify(unlockedIds)) setUnlockedIds(currentUnlocked);
    
    if (newlyUnlocked.length > 0) {
      // Update storage with timestamps
      const newTimestamps = { ...unlockTimestamps };
      const now = new Date().toISOString();
      newlyUnlocked.forEach(id => {
        if (!newTimestamps[id]) {
          newTimestamps[id] = now;
        }
      });
      setCelebratedIds(previous => [...new Set([...(previous ?? []), ...newlyUnlocked])]);
      setUnlockTimestamps(previous => ({ ...newTimestamps, ...previous }));
      
      // Trigger confetti for each newly unlocked achievement
      newlyUnlocked.forEach((id, index) => {
        setTimeout(() => {
          const achievement = achievements.find(a => a.id === id);
          const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          
          // Different confetti patterns based on achievement importance
          if (achievement?.id === 'freedom') {
            // Epic confetti for debt freedom
            playAchievementUnlockSound('epic');
            if (reducedMotion) return;
            const duration = 3000;
            const end = Date.now() + duration;
            
            (function frame() {
              confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#0f766e', '#e8a317', '#fbbf24']
              });
              confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#0f766e', '#e8a317', '#fbbf24']
              });
              
              if (Date.now() < end) {
                requestAnimationFrame(frame);
              }
            }());
          } else if (achievement?.id === 'halfway-hero' || achievement?.id === 'three-quarters') {
            // Medium celebration for major milestones
            playAchievementUnlockSound('milestone');
            if (reducedMotion) return;
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#0f766e', '#e8a317', '#fbbf24']
            });
          } else {
            // Standard celebration
            playAchievementUnlockSound('basic');
            if (reducedMotion) return;
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#0f766e', '#e8a317']
            });
          }
        }, index * 300); // Stagger multiple unlocks
      });
    }
    
  }, [ready, accountId, initialDebt, achievements, unlockedIds, celebratedIds, setCelebratedIds, setUnlockedIds, setUnlockTimestamps, unlockTimestamps]);

  return {
    achievements,
    unlockedCount,
    totalCount,
    initialDebt,
    resetProgress: () => {
      setInitialDebt(0);
      setUnlockedIds([]);
      setUnlockTimestamps({});
    },
  };
}
