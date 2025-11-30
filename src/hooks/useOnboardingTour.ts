import { useContext } from 'react';
import OnboardingTourContext from '@/contexts/OnboardingTourContext';

export interface OnboardingTourState {
  hasSeenTour: boolean;
  isRunning: boolean;
  stepIndex: number;
}

export const useOnboardingTour = () => {
  const context = useContext(OnboardingTourContext);
  
  if (!context) {
    throw new Error('useOnboardingTour must be used within OnboardingTourProvider');
  }
  
  return context;
};
