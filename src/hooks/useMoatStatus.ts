/**
 * useMoatStatus Hook
 * 
 * Real-time monitoring of moat status with REGROUPING detection.
 * Provides repair plan calculations and UI state management.
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { DEMO_USER_ID } from '@/lib/demoDataLoader';
import { useHeroProfile } from './useHeroProfile';
import { useLocalExpenses } from './useLocalExpenses';
import { 
  RecoveryStatus, 
  RecoveryState, 
  RepairPlan,
  calculateRecoveryState,
  calculateRepairPlan,
} from '@/lib/debtInsights';
import { soundEffects, playAchievementUnlockSound } from '@/lib/soundEffects';
import { haptics } from '@/lib/haptics';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

const BANNER_DISMISSED_KEY = 'moat_banner_dismissed_session';
const REPAIR_MODE_KEY = 'moat_repair_mode_active';
const BANNER_SYNC_EVENT = 'moat-banner-dismissed-sync';

export interface MoatStatusResult {
  // Status
  status: RecoveryStatus;
  isRegrouping: boolean;
  isVulnerable: boolean;
  isSecure: boolean;
  
  // Recovery state
  recoveryState: RecoveryState;
  
  // Repair plan
  repairPlan: RepairPlan | null;
  
  // Actions
  activateRepairMode: () => void;
  deactivateRepairMode: () => void;
  dismissBanner: () => void;
  acknowledgeBreach: () => void;
  
  // UI state
  bannerDismissed: boolean;
  repairModeActive: boolean;
}

export function useMoatStatus(): MoatStatusResult {
  const { user } = useAuth();
  const accountId = user?.id ?? DEMO_USER_ID;
  const previousStatus = useRef<{ accountId: string; secure: boolean } | null>(null);
  const { savingsVault, updateSavingsVault } = useHeroProfile();
  const { expenses } = useLocalExpenses();
  
  // Session-based banner dismissal
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
  });
  
  // Persistent repair mode
  const [repairModeActive, setRepairModeActive] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(REPAIR_MODE_KEY) === 'true';
  });
  
  // Track if we've already played the breach alert this session
  const [breachAlertPlayed, setBreachAlertPlayed] = useState(false);
  
  // Calculate recovery state
  const recoveryState = useMemo(() => {
    return calculateRecoveryState(
      savingsVault.moat_balance,
      savingsVault.moat_target,
      savingsVault.was_secure || false,
      savingsVault.last_secure_date || null
    );
  }, [savingsVault]);
  
  // Calculate repair plan when not secure
  const repairPlan = useMemo(() => {
    if (recoveryState.status === 'SECURE') return null;
    return calculateRepairPlan(expenses, recoveryState.breachAmount);
  }, [expenses, recoveryState]);
  
  // Status convenience booleans
  const status = recoveryState.status;
  const isRegrouping = status === 'REGROUPING';
  const isVulnerable = status === 'VULNERABLE';
  const isSecure = status === 'SECURE';
  
  // Track when moat becomes secure
  useEffect(() => {
    if (isSecure && !savingsVault.was_secure) {
      updateSavingsVault({
        was_secure: true,
        last_secure_date: new Date().toISOString(),
      });
    }
  }, [isSecure, savingsVault.was_secure, updateSavingsVault]);
  
  // Play breach alert sound when entering REGROUPING
  useEffect(() => {
    if ((isRegrouping || isVulnerable) && !breachAlertPlayed && savingsVault.was_secure) {
      soundEffects.breachAlert();
      setBreachAlertPlayed(true);
    }
    
    // Reset when secure again
    if (isSecure) {
      setBreachAlertPlayed(false);
    }
  }, [isRegrouping, isVulnerable, isSecure, breachAlertPlayed, savingsVault.was_secure]);
  
  // Keep every hook instance in sync (the banner and its parent each call this hook)
  useEffect(() => {
    const sync = () => {
      setBannerDismissed(sessionStorage.getItem(BANNER_DISMISSED_KEY) === 'true');
    };
    window.addEventListener(BANNER_SYNC_EVENT, sync);
    return () => window.removeEventListener(BANNER_SYNC_EVENT, sync);
  }, []);

  // Actions
  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
    sessionStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    window.dispatchEvent(new Event(BANNER_SYNC_EVENT));
  }, []);
  
  const activateRepairMode = useCallback(() => {
    localStorage.setItem(`${accountId}_moat-recovery-event`, crypto.randomUUID());
    setRepairModeActive(true);
    localStorage.setItem(REPAIR_MODE_KEY, 'true');
    updateSavingsVault({ repair_mode_active: true });
  }, [accountId, updateSavingsVault]);
  
  const deactivateRepairMode = useCallback(() => {
    setRepairModeActive(false);
    localStorage.removeItem(REPAIR_MODE_KEY);
    updateSavingsVault({ repair_mode_active: false });
  }, [updateSavingsVault]);
  
  const acknowledgeBreach = useCallback(() => {
    updateSavingsVault({ breach_acknowledged: true });
  }, [updateSavingsVault]);
  
  // Recovery celebration when moat returns to 100%
  const triggerRecoveryCelebration = useCallback(() => {
    // Haptic feedback
    haptics.success();
    
    // Epic sound for fortress restoration
    playAchievementUnlockSound('epic');
    
    // Epic confetti - 2.5 second side-burst celebration
    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const colors = ['#0D7377', '#14919B', '#10B981', '#FFD700', '#22C55E'];
    
    const frame = () => {
      confetti({ 
        particleCount: 4, 
        angle: 60, 
        spread: 55, 
        origin: { x: 0, y: 0.6 }, 
        colors 
      });
      confetti({ 
        particleCount: 4, 
        angle: 120, 
        spread: 55, 
        origin: { x: 1, y: 0.6 }, 
        colors 
      });
      if (Date.now() < animationEnd) requestAnimationFrame(frame);
    };
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) frame();
    
    // Show heroic toast
    toast.success('Defenses Fully Restored!', {
      description: 'Your fortress stands strong once more. The moat is at full strength!',
      icon: '🛡️',
      duration: 6000,
    });
  }, []);
  
  // Clear repair mode when moat is secure
  useEffect(() => {
    const storedVault = localStorage.getItem(`${accountId}_bdt_savings_vault`);
    const loadedVault = storedVault ? JSON.parse(storedVault) : null;
    if (!loadedVault || loadedVault.moat_balance !== savingsVault.moat_balance || loadedVault.moat_target !== savingsVault.moat_target) return;
    const previous = previousStatus.current;
    previousStatus.current = { accountId, secure: isSecure };
    if (isSecure && repairModeActive) {
      // Trigger recovery celebration before clearing repair mode
      const eventKey = `${accountId}_celebrated-moat-recoveries`;
      const eventId = localStorage.getItem(`${accountId}_moat-recovery-event`) ?? savingsVault.last_secure_date ?? 'initial';
      const celebrated: string[] = JSON.parse(localStorage.getItem(eventKey) ?? '[]');
      if (!celebrated.includes(eventId)) {
        localStorage.setItem(eventKey, JSON.stringify([...celebrated, eventId]));
        if (previous?.accountId === accountId && !previous.secure) triggerRecoveryCelebration();
      }
      
      deactivateRepairMode();
      // Reset banner dismissal for next potential breach
      sessionStorage.removeItem(BANNER_DISMISSED_KEY);
      setBannerDismissed(false);
      window.dispatchEvent(new Event(BANNER_SYNC_EVENT));
    }
  }, [accountId, savingsVault, isSecure, repairModeActive, deactivateRepairMode, triggerRecoveryCelebration]);
  
  return {
    status,
    isRegrouping,
    isVulnerable,
    isSecure,
    recoveryState,
    repairPlan,
    activateRepairMode,
    deactivateRepairMode,
    dismissBanner,
    acknowledgeBreach,
    bannerDismissed,
    repairModeActive,
  };
}
