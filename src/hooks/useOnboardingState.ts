import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useHeroProfile, OnboardingData } from './useHeroProfile';
import { useLocalDebts } from './useLocalDebts';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { loadDemoData } from '@/lib/demoDataLoader';

export interface DebtEntry {
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
}

export interface OnboardingDataState {
  hourlyWage: number | null;
  primaryDebt: DebtEntry | null;
  moatTarget: number;
}

export interface UseOnboardingStateResult {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  data: OnboardingDataState;
  setHourlyWage: (wage: number | null) => void;
  setPrimaryDebt: (debt: DebtEntry | null) => void;
  setMoatTarget: (target: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  showAhaMoment: () => void;
  showPricing: () => void;
  showCeremony: () => void;
  skipTrial: () => void;
  enterDashboard: () => void;
  isCompleting: boolean;
  isReturning: boolean;
  isDemoMode: boolean;
}

export function useOnboardingState(): UseOnboardingStateResult {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isDemoMode = searchParams.get('demo') === 'true';
  const { 
    setMoatTarget: setProfileMoatTarget, 
    completeOnboarding: markComplete,
    profile,
    saveOnboardingProgress,
    clearOnboardingProgress,
    setTrialStarted,
  } = useHeroProfile();
  const { addDebt } = useLocalDebts();

  // Check for returning user with saved progress
  const savedStep = profile.onboarding_step;
  const savedData = profile.onboarding_data;
  
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(() => {
    // Check for Stripe redirect (canceled only - success now goes to /checkout-success)
    const canceled = searchParams.get('canceled');
    
    if (canceled === 'true') {
      return 5; // Stay on pricing
    }
    // Restore from saved progress
    return savedStep || 1;
  });
  
  const [isCompleting, setIsCompleting] = useState(false);
  const [isReturning, setIsReturning] = useState(!!savedStep && savedStep > 1);
  
  const [data, setData] = useState<OnboardingDataState>(() => {
    if (isDemoMode) {
      return {
        hourlyWage: 25,
        primaryDebt: {
          name: 'Amex',
          balance: 3500,
          apr: 23.99,
          minimumPayment: 90,
        },
        moatTarget: 1000,
      };
    }
    return {
      hourlyWage: savedData?.hourlyWage || null,
      primaryDebt: savedData?.debtName ? {
        name: savedData.debtName,
        balance: savedData.debtBalance || 0,
        apr: savedData.debtApr || 0,
        minimumPayment: savedData.debtMinPayment || 25,
      } : null,
      moatTarget: savedData?.moatTarget || 1000,
    };
  });

  // Handle Stripe redirect (canceled only - success now goes to /checkout-success)
  useEffect(() => {
    const canceled = searchParams.get('canceled');
    
    if (canceled === 'true') {
      localStorage.removeItem('bdt_checkout_in_progress');
      toast.info('No worries!', {
        description: 'You can still explore in demo mode.',
      });
      navigate('/onboarding', { replace: true });
    }
  }, [searchParams, navigate]);

  // Show welcome back toast for returning users
  useEffect(() => {
    if (isReturning) {
      toast.info('Welcome back!', {
        description: 'Let\'s continue where you left off.',
      });
      setIsReturning(false);
    }
  }, [isReturning]);

  const setHourlyWage = useCallback((wage: number | null) => {
    setData((prev) => ({ ...prev, hourlyWage: wage }));
  }, []);

  const setPrimaryDebt = useCallback((debt: DebtEntry | null) => {
    setData((prev) => ({ ...prev, primaryDebt: debt }));
  }, []);

  const setMoatTarget = useCallback((target: number) => {
    setData((prev) => ({ ...prev, moatTarget: target }));
  }, []);

  const saveProgress = useCallback((step: 1 | 2 | 3 | 4 | 5 | 6, currentData: OnboardingDataState) => {
    const persistData: OnboardingData = {
      hourlyWage: currentData.hourlyWage || undefined,
      debtName: currentData.primaryDebt?.name,
      debtBalance: currentData.primaryDebt?.balance,
      debtApr: currentData.primaryDebt?.apr,
      debtMinPayment: currentData.primaryDebt?.minimumPayment,
      moatTarget: currentData.moatTarget,
    };
    saveOnboardingProgress(step, persistData);
  }, [saveOnboardingProgress]);

  const nextStep = useCallback(() => {
    if (currentStep < 3) {
      const newStep = (currentStep + 1) as 1 | 2 | 3 | 4 | 5 | 6;
      setCurrentStep(newStep);
      saveProgress(newStep, data);
    }
  }, [currentStep, data, saveProgress]);

  const prevStep = useCallback(() => {
    if (currentStep > 1 && currentStep <= 5) {
      const newStep = (currentStep - 1) as 1 | 2 | 3 | 4 | 5 | 6;
      setCurrentStep(newStep);
    }
  }, [currentStep]);

  const skipStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const showAhaMoment = useCallback(() => {
    setCurrentStep(4);
    saveProgress(4, data);
  }, [data, saveProgress]);

  const showPricing = useCallback(() => {
    if (isDemoMode) {
      // Demo mode skips pricing, go straight to ceremony
      setIsCompleting(true);
      try {
        saveOnboardingData();
        setCurrentStep(6);
        saveProgress(6, data);
      } catch (error) {
        console.error('Onboarding error:', error);
        toast.error('Something went wrong. Please try again.');
      } finally {
        setIsCompleting(false);
      }
      return;
    }
    setCurrentStep(5);
    saveProgress(5, data);
  }, [data, saveProgress, isDemoMode]);

  const saveOnboardingData = useCallback(() => {
    // Store hourly wage in localStorage
    if (data.hourlyWage !== null) {
      const existingProfile = localStorage.getItem('bdt_hero_profile');
      const profileData = existingProfile ? JSON.parse(existingProfile) : {};
      profileData.hourly_wage = data.hourlyWage;
      localStorage.setItem('bdt_hero_profile', JSON.stringify(profileData));
    }

    // Create debt entry if provided
    if (data.primaryDebt && data.primaryDebt.name && data.primaryDebt.balance > 0) {
      addDebt({
        name: data.primaryDebt.name,
        balance: data.primaryDebt.balance,
        interest_rate: data.primaryDebt.apr,
        minimum_payment: data.primaryDebt.minimumPayment || 25,
        type: 'credit_card',
      });
    }

    // Set moat target
    setProfileMoatTarget(data.moatTarget);
  }, [data, addDebt, setProfileMoatTarget]);

  const showCeremony = useCallback(() => {
    setIsCompleting(true);
    try {
      saveOnboardingData();
      setCurrentStep(6);
      saveProgress(6, data);
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  }, [saveOnboardingData, data, saveProgress]);

  const skipTrial = useCallback(() => {
    // User skipped trial - mark as demo mode user
    setTrialStarted(false);
    showCeremony();
  }, [setTrialStarted, showCeremony]);

  const enterDashboard = useCallback(() => {
    if (isDemoMode) {
      // Load demo data before entering dashboard
      loadDemoData();
      clearOnboardingProgress();
      toast.success('Demo Loaded! 🎉', {
        description: 'Explore a fully-populated financial dashboard.',
      });
      navigate('/dashboard');
      return;
    }
    markComplete();
    clearOnboardingProgress();
    toast.success('Welcome! You\'re ready to take control.', {
      description: 'Your profile has been created. Time to take control of your finances!',
    });
    navigate('/dashboard');
  }, [markComplete, clearOnboardingProgress, navigate, isDemoMode]);

  return {
    currentStep,
    data,
    setHourlyWage,
    setPrimaryDebt,
    setMoatTarget,
    nextStep,
    prevStep,
    skipStep,
    showAhaMoment,
    showPricing,
    showCeremony,
    skipTrial,
    enterDashboard,
    isCompleting,
    isReturning,
    isDemoMode,
  };
}
