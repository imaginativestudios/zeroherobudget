import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeroProfile } from './useHeroProfile';
import { useLocalDebts } from './useLocalDebts';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DebtEntry {
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
}

export interface OnboardingData {
  hourlyWage: number | null;
  primaryDebt: DebtEntry | null;
  moatTarget: 500 | 1000 | 2000;
}

export interface UseOnboardingStateResult {
  currentStep: 1 | 2 | 3;
  data: OnboardingData;
  setHourlyWage: (wage: number | null) => void;
  setPrimaryDebt: (debt: DebtEntry | null) => void;
  setMoatTarget: (target: 500 | 1000 | 2000) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  completeOnboarding: () => void;
  isCompleting: boolean;
}

export function useOnboardingState(): UseOnboardingStateResult {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setMoatTarget: setProfileMoatTarget, completeOnboarding: markComplete } = useHeroProfile();
  const { addDebt } = useLocalDebts();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    hourlyWage: null,
    primaryDebt: null,
    moatTarget: 1000,
  });

  const setHourlyWage = useCallback((wage: number | null) => {
    setData((prev) => ({ ...prev, hourlyWage: wage }));
  }, []);

  const setPrimaryDebt = useCallback((debt: DebtEntry | null) => {
    setData((prev) => ({ ...prev, primaryDebt: debt }));
  }, []);

  const setMoatTarget = useCallback((target: 500 | 1000 | 2000) => {
    setData((prev) => ({ ...prev, moatTarget: target }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  }, [currentStep]);

  const skipStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const completeOnboarding = useCallback(() => {
    setIsCompleting(true);

    try {
      // Store hourly wage in localStorage (extend hero profile later if needed)
      if (data.hourlyWage !== null) {
        const existingProfile = localStorage.getItem('bdt_hero_profile');
        const profile = existingProfile ? JSON.parse(existingProfile) : {};
        profile.hourly_wage = data.hourlyWage;
        localStorage.setItem('bdt_hero_profile', JSON.stringify(profile));
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

      // Mark onboarding as complete
      markComplete();

      // Show welcome message
      toast.success('Welcome, Hero! Your quest begins now.', {
        description: 'Your character has been created. Time to conquer your debts!',
      });

      // Navigate based on auth status
      if (user) {
        navigate('/dashboard');
      } else {
        // For unauthenticated users, go to demo dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  }, [data, user, navigate, addDebt, setProfileMoatTarget, markComplete]);

  return {
    currentStep,
    data,
    setHourlyWage,
    setPrimaryDebt,
    setMoatTarget,
    nextStep,
    prevStep,
    skipStep,
    completeOnboarding,
    isCompleting,
  };
}
