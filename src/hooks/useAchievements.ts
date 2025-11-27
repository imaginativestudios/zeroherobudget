import { useMemo, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
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
      },
      {
        id: 'quarter-mark',
        title: 'Quarter Warrior',
        description: 'Reduced total debt by 25%',
        icon: '⚔️',
        unlocked: debtReduction >= 25,
        progress: Math.min(debtReduction, 25),
        maxProgress: 25,
      },
      {
        id: 'halfway-hero',
        title: 'Halfway Hero',
        description: 'Reduced total debt by 50%',
        icon: '🛡️',
        unlocked: debtReduction >= 50,
        progress: Math.min(debtReduction, 50),
        maxProgress: 50,
      },
      {
        id: 'three-quarters',
        title: 'Victory in Sight',
        description: 'Reduced total debt by 75%',
        icon: '🏆',
        unlocked: debtReduction >= 75,
        progress: Math.min(debtReduction, 75),
        maxProgress: 75,
      },
      {
        id: 'debt-slayer',
        title: 'Debt Slayer',
        description: 'Paid off 3 or more debts',
        icon: '⚡',
        unlocked: currentStats.debtsPaidOff >= 3,
        progress: Math.min(currentStats.debtsPaidOff, 3),
        maxProgress: 3,
      },
      {
        id: 'freedom',
        title: 'Financial Freedom',
        description: 'Eliminated all debts!',
        icon: '👑',
        unlocked: currentStats.totalDebt === 0 && initialDebt > 0,
      },
    ];
  }, [currentStats, initialDebt]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return {
    achievements,
    unlockedCount,
    totalCount,
    resetProgress: () => setInitialDebt(0),
  };
}
