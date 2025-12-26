import { createContext, useState, useCallback, ReactNode } from 'react';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';

export interface BudgetTourState {
  hasSeenBudgetTour: boolean;
  isRunning: boolean;
  stepIndex: number;
  startTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
  skipTour: () => void;
  setStepIndex: (index: number) => void;
}

const BudgetTourContext = createContext<BudgetTourState | undefined>(undefined);

export const BudgetTourProvider = ({ children }: { children: ReactNode }) => {
  const [hasSeenBudgetTour, setHasSeenBudgetTour] = useUserLocalStorage<boolean>('budget_tour_completed', false);
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const startTour = useCallback(() => {
    setIsRunning(true);
    setStepIndex(0);
  }, []);

  const completeTour = useCallback(() => {
    setIsRunning(false);
    setHasSeenBudgetTour(true);
    setStepIndex(0);
  }, [setHasSeenBudgetTour]);

  const resetTour = useCallback(() => {
    setStepIndex(0);
    setIsRunning(true);
  }, []);

  const skipTour = useCallback(() => {
    setIsRunning(false);
    setHasSeenBudgetTour(true);
    setStepIndex(0);
  }, [setHasSeenBudgetTour]);

  return (
    <BudgetTourContext.Provider
      value={{
        hasSeenBudgetTour,
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
    </BudgetTourContext.Provider>
  );
};

export default BudgetTourContext;
