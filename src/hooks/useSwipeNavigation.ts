import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { haptics } from '@/lib/haptics';

interface SwipeRoutes {
  left?: string;
  right?: string;
}

interface UseSwipeNavigationOptions {
  routes: SwipeRoutes;
  threshold?: number;
  enabled?: boolean;
}

export function useSwipeNavigation({
  routes,
  threshold = 100,
  enabled = true,
}: UseSwipeNavigationOptions) {
  const navigate = useNavigate();
  const [dragOffset, setDragOffset] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
  }, [enabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || startX.current === null || startY.current === null) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;
    
    // Determine if this is a horizontal or vertical swipe on first move
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }
    
    // Only handle horizontal swipes
    if (!isHorizontalSwipe.current) return;
    
    // Check if we can navigate in the swipe direction
    const canGoLeft = routes.left !== undefined;
    const canGoRight = routes.right !== undefined;
    
    // Apply edge resistance if no route available
    let resistance = 1;
    if ((diffX > 0 && !canGoRight) || (diffX < 0 && !canGoLeft)) {
      resistance = 0.2; // Strong resistance when at edge
    }
    
    const offset = diffX * resistance;
    setDragOffset(offset);
    
    if (offset > threshold / 2) {
      setDirection('right');
    } else if (offset < -threshold / 2) {
      setDirection('left');
    } else {
      setDirection(null);
    }
  }, [enabled, routes, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || startX.current === null) return;
    
    const absOffset = Math.abs(dragOffset);
    
    if (absOffset > threshold) {
      if (dragOffset > 0 && routes.right) {
        haptics.medium();
        navigate(routes.right);
      } else if (dragOffset < 0 && routes.left) {
        haptics.medium();
        navigate(routes.left);
      }
    }
    
    // Reset state
    setDragOffset(0);
    setDirection(null);
    startX.current = null;
    startY.current = null;
    isHorizontalSwipe.current = null;
  }, [enabled, dragOffset, threshold, routes, navigate]);

  const containerProps = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    style: {
      transform: enabled && dragOffset !== 0 ? `translateX(${dragOffset}px)` : undefined,
      transition: dragOffset === 0 ? 'transform 0.2s ease-out' : 'none',
    } as React.CSSProperties,
  };

  return {
    containerProps,
    dragOffset,
    direction,
  };
}
