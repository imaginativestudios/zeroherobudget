import { createContext, useState, useCallback, ReactNode } from 'react';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';

export interface OnboardingTourState {
  hasSeenTour: boolean;
  isRunning: boolean;
  stepIndex: number;
  startTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
  skipTour: () => void;
  setStepIndex: (index: number) => void;
}

const OnboardingTourContext = createContext<OnboardingTourState | undefined>(undefined);

export const OnboardingTourProvider = ({ children }: { children: ReactNode }) => {
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

  return (
    <OnboardingTourContext.Provider
      value={{
        hasSeenTour,
        isRunning,
        stepIndex,
        startTour,
        completeTour,
        resetTour,
        skipTour,
        setStepIndex,
      }}
    >
      {children}
    </OnboardingTourContext.Provider>
  );
};

export default OnboardingTourContext;
