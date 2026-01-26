/**
 * Haptic feedback utilities for touch devices
 * Enhanced patterns for native-feeling mobile experience
 */

export const haptics = {
  /**
   * Quick tap feedback for button/tab presses
   */
  tap: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  },

  /**
   * Light haptic feedback for drag start
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium haptic feedback for successful drop/navigation
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  /**
   * Success pattern for completed actions
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },

  /**
   * Warning pattern for destructive action confirmation
   */
  warning: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 40, 20]);
    }
  },

  /**
   * Error pattern for validation failures
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  },

  /**
   * Selection feedback for toggles/switches
   */
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(8);
    }
  },
};

export type HapticPattern = keyof typeof haptics;
