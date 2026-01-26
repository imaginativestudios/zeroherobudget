import { useState, useRef, useCallback, useEffect } from 'react';
import { haptics } from '@/lib/haptics';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
}: UsePullToRefreshOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  const isAtTop = useRef(true);
  const hasTriggeredHaptic = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    // Check if we're at the top of the scroll container
    const container = containerRef.current;
    if (!container) return;
    
    isAtTop.current = container.scrollTop <= 0;
    if (!isAtTop.current) return;
    
    startY.current = e.touches[0].clientY;
    hasTriggeredHaptic.current = false;
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || startY.current === null || !isAtTop.current) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    // Only track downward pulls
    if (diff <= 0) {
      setPullProgress(0);
      return;
    }
    
    // Apply resistance for more natural feel
    const resistance = 0.5;
    const pullDistance = Math.min(diff * resistance, threshold * 1.5);
    const progress = Math.min(pullDistance / threshold, 1);
    
    setPullProgress(progress);
    
    // Trigger haptic at threshold
    if (progress >= 1 && !hasTriggeredHaptic.current) {
      haptics.medium();
      hasTriggeredHaptic.current = true;
    }
    
    // Prevent default scroll if we're pulling
    if (diff > 10) {
      e.preventDefault();
    }
  }, [disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || startY.current === null) return;
    
    const shouldRefresh = pullProgress >= 1;
    
    if (shouldRefresh) {
      setIsRefreshing(true);
      setPullProgress(1);
      
      try {
        await onRefresh();
        haptics.success();
      } catch (error) {
        haptics.error();
        console.error('Pull to refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullProgress(0);
    startY.current = null;
    currentY.current = null;
    hasTriggeredHaptic.current = false;
  }, [disabled, isRefreshing, pullProgress, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    isRefreshing,
    pullProgress,
  };
}
