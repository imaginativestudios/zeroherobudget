import { useState, useCallback } from 'react';
import { useUserLocalStorage } from './useUserLocalStorage';

export interface OnboardingTourState {
  hasSeenTour: boolean;
  isRunning: boolean;
  stepIndex: number;
}

export const useOnboardingTour = () => {
  const [hasSeenTour, setHasSeenTour] = useUserLocalStorage<boolean>('onboarding_tour_completed', false);
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const startTour = useCallback(() => {
    setIsRunning(true);
    setStepIndex(0);
  }, []);

  const completeTour = useCallback(() => {
    setIsRunning(false);
    setHasSeenTour(true);
    setStepIndex(0);
  }, [setHasSeenTour]);

  const resetTour = useCallback(() => {
    setStepIndex(0);
    setIsRunning(true);
  }, []);

  const skipTour = useCallback(() => {
    setIsRunning(false);
    setHasSeenTour(true);
    setStepIndex(0);
  }, [setHasSeenTour]);

  return {
    hasSeenTour,
    isRunning,
    stepIndex,
    startTour,
    completeTour,
    resetTour,
    skipTour,
    setStepIndex,
  };
};
