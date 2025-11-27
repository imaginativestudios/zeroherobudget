import { useMemo, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
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

export function useAchievements(currentStats: DebtStats) {
  const [initialDebt, setInitialDebt] = useLocalStorage<number>('initial-debt-total', 0);
  const [unlockedIds, setUnlockedIds] = useLocalStorage<string[]>('unlocked-achievements', []);
  const [unlockTimestamps, setUnlockTimestamps] = useLocalStorage<Record<string, string>>('achievement-timestamps', {});
  const previousUnlockedRef = useRef<string[]>(unlockedIds);
  
  // Set initial debt if not set and there are debts
  useEffect(() => {
    if (initialDebt === 0 && currentStats.totalDebt > 0) {
      setInitialDebt(currentStats.totalDebt);
    }
  }, [initialDebt, currentStats.totalDebt, setInitialDebt]);

  const achievements = useMemo<Achievement[]>(() => {
    const debtReduction = initialDebt > 0 ? ((initialDebt - currentStats.totalDebt) / initialDebt) * 100 : 0;
    
    return [
      {
        id: 'first-blood',
        title: 'First Victory',
        description: 'Paid off your first debt',
        icon: '🎯',
        unlocked: currentStats.debtsPaidOff >= 1,
        unlockedAt: unlockTimestamps['first-blood'],
      },
      {
        id: 'quarter-mark',
        title: 'Quarter Warrior',
        description: 'Reduced total debt by 25%',
        icon: '⚔️',
        unlocked: debtReduction >= 25,
        unlockedAt: unlockTimestamps['quarter-mark'],
        progress: Math.min(debtReduction, 25),
        maxProgress: 25,
      },
      {
        id: 'halfway-hero',
        title: 'Halfway Hero',
        description: 'Reduced total debt by 50%',
        icon: '🛡️',
        unlocked: debtReduction >= 50,
        unlockedAt: unlockTimestamps['halfway-hero'],
        progress: Math.min(debtReduction, 50),
        maxProgress: 50,
      },
      {
        id: 'three-quarters',
        title: 'Victory in Sight',
        description: 'Reduced total debt by 75%',
        icon: '🏆',
        unlocked: debtReduction >= 75,
        unlockedAt: unlockTimestamps['three-quarters'],
        progress: Math.min(debtReduction, 75),
        maxProgress: 75,
      },
      {
        id: 'debt-slayer',
        title: 'Debt Slayer',
        description: 'Paid off 3 or more debts',
        icon: '⚡',
        unlocked: currentStats.debtsPaidOff >= 3,
        unlockedAt: unlockTimestamps['debt-slayer'],
        progress: Math.min(currentStats.debtsPaidOff, 3),
        maxProgress: 3,
      },
      {
        id: 'freedom',
        title: 'Financial Freedom',
        description: 'Eliminated all debts!',
        icon: '👑',
        unlocked: currentStats.totalDebt === 0 && initialDebt > 0,
        unlockedAt: unlockTimestamps['freedom'],
      },
    ];
  }, [currentStats, initialDebt, unlockTimestamps]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  // Detect newly unlocked achievements and trigger confetti
  useEffect(() => {
    const currentUnlocked = achievements.filter(a => a.unlocked).map(a => a.id);
    const newlyUnlocked = currentUnlocked.filter(id => !previousUnlockedRef.current.includes(id));
    
    if (newlyUnlocked.length > 0) {
      // Update storage with timestamps
      const newTimestamps = { ...unlockTimestamps };
      const now = new Date().toISOString();
      newlyUnlocked.forEach(id => {
        if (!newTimestamps[id]) {
          newTimestamps[id] = now;
        }
      });
      setUnlockedIds(currentUnlocked);
      setUnlockTimestamps(newTimestamps);
      
      // Trigger confetti for each newly unlocked achievement
      newlyUnlocked.forEach((id, index) => {
        setTimeout(() => {
          const achievement = achievements.find(a => a.id === id);
          
          // Different confetti patterns based on achievement importance
          if (achievement?.id === 'freedom') {
            // Epic confetti for debt freedom
            playAchievementUnlockSound('epic');
            const duration = 3000;
            const end = Date.now() + duration;
            
            (function frame() {
              confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#9b87f5', '#F97316', '#fbbf24']
              });
              confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#9b87f5', '#F97316', '#fbbf24']
              });
              
              if (Date.now() < end) {
                requestAnimationFrame(frame);
              }
            }());
          } else if (achievement?.id === 'halfway-hero' || achievement?.id === 'three-quarters') {
            // Medium celebration for major milestones
            playAchievementUnlockSound('milestone');
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#9b87f5', '#F97316', '#fbbf24']
            });
          } else {
            // Standard celebration
            playAchievementUnlockSound('basic');
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#9b87f5', '#F97316']
            });
          }
        }, index * 300); // Stagger multiple unlocks
      });
    }
    
    previousUnlockedRef.current = currentUnlocked;
  }, [achievements, setUnlockedIds, setUnlockTimestamps, unlockTimestamps]);

  return {
    achievements,
    unlockedCount,
    totalCount,
    initialDebt,
    resetProgress: () => {
      setInitialDebt(0);
      setUnlockedIds([]);
      setUnlockTimestamps({});
      previousUnlockedRef.current = [];
    },
  };
}
