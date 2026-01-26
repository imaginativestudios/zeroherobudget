import { useCallback } from 'react';
import { haptics, HapticPattern } from '@/lib/haptics';

/**
 * Hook providing haptic-enabled event handlers for mobile feedback
 */
export function useHapticFeedback() {
  /**
   * Wraps a handler with haptic feedback
   */
  const withHaptic = useCallback(
    <T extends (...args: any[]) => any>(
      pattern: HapticPattern,
      handler?: T
    ): ((...args: Parameters<T>) => ReturnType<T> | void) => {
      return (...args: Parameters<T>) => {
        haptics[pattern]();
        return handler?.(...args);
      };
    },
    []
  );

  /**
   * Trigger haptic feedback directly
   */
  const trigger = useCallback((pattern: HapticPattern) => {
    haptics[pattern]();
  }, []);

  return { withHaptic, trigger };
}
