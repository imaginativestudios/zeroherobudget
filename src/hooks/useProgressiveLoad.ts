import { useState, useEffect } from 'react';

export type LoadPriority = 'critical' | 'secondary';

interface ProgressiveLoadState {
  criticalLoaded: boolean;
  secondaryLoaded: boolean;
}

/**
 * Hook to manage progressive loading of data
 * Critical data loads immediately, secondary data loads after a brief delay
 */
export function useProgressiveLoad(enabled = true) {
  const [loadState, setLoadState] = useState<ProgressiveLoadState>({
    criticalLoaded: false,
    secondaryLoaded: false,
  });

  useEffect(() => {
    if (!enabled) {
      setLoadState({
        criticalLoaded: true,
        secondaryLoaded: true,
      });
      return;
    }

    // Load critical data immediately
    const criticalTimer = setTimeout(() => {
      setLoadState(prev => ({ ...prev, criticalLoaded: true }));
    }, 0);

    // Load secondary data after critical data with a small delay
    const secondaryTimer = setTimeout(() => {
      setLoadState(prev => ({ ...prev, secondaryLoaded: true }));
    }, 150); // 150ms delay for secondary data

    return () => {
      clearTimeout(criticalTimer);
      clearTimeout(secondaryTimer);
    };
  }, [enabled]);

  return loadState;
}

/**
 * Hook to determine if data should be loaded based on priority
 */
export function useShouldLoad(priority: LoadPriority, loadState: ProgressiveLoadState): boolean {
  if (priority === 'critical') {
    return loadState.criticalLoaded;
  }
  return loadState.secondaryLoaded;
}
