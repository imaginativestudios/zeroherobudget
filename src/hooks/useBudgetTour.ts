import { useContext } from 'react';
import BudgetTourContext, { BudgetTourState } from '@/contexts/BudgetTourContext';

export const useBudgetTour = (): BudgetTourState => {
  const context = useContext(BudgetTourContext);
  if (context === undefined) {
    throw new Error('useBudgetTour must be used within a BudgetTourProvider');
  }
  return context;
};
