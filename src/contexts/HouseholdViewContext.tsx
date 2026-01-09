import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds } from '@/hooks/useHouseholds';

type ViewMode = 'personal' | 'household';

interface HouseholdViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isHouseholdView: boolean;
  canToggle: boolean; // Only show toggle if user has household members
}

const HouseholdViewContext = createContext<HouseholdViewContextType | undefined>(undefined);

interface HouseholdViewProviderProps {
  children: ReactNode;
}

export function HouseholdViewProvider({ children }: HouseholdViewProviderProps) {
  const { user } = useAuth();
  const { members } = useHouseholds();
  
  // Persist preference to localStorage
  const storageKey = user ? `household-view-mode-${user.id}` : 'household-view-mode';
  
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'personal';
    const stored = localStorage.getItem(storageKey);
    return (stored === 'household' ? 'household' : 'personal');
  });

  // Check if user can toggle (has more than 1 household member)
  const canToggle = members.length > 1;

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(storageKey, mode);
  };

  // Reset to personal view if user can't toggle
  useEffect(() => {
    if (!canToggle && viewMode === 'household') {
      setViewMode('personal');
    }
  }, [canToggle, viewMode]);

  const value: HouseholdViewContextType = {
    viewMode,
    setViewMode,
    isHouseholdView: viewMode === 'household',
    canToggle,
  };

  return (
    <HouseholdViewContext.Provider value={value}>
      {children}
    </HouseholdViewContext.Provider>
  );
}

export function useHouseholdView() {
  const context = useContext(HouseholdViewContext);
  if (context === undefined) {
    throw new Error('useHouseholdView must be used within a HouseholdViewProvider');
  }
  return context;
}
