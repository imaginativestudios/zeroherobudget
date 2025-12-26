import { useState, useEffect, useCallback, useRef } from 'react';

interface ParallaxValues {
  scrollY: number;
  parallaxOffset: number;
  rotateX: number;
  elementTop: number;
  isInView: boolean;
}

export const useParallax = (
  ref: React.RefObject<HTMLElement>,
  options: {
    parallaxFactor?: number;
    maxRotation?: number;
    enabled?: boolean;
  } = {}
): ParallaxValues => {
  const { parallaxFactor = 0.05, maxRotation = 5, enabled = true } = options;
  
  const [values, setValues] = useState<ParallaxValues>({
    scrollY: 0,
    parallaxOffset: 0,
    rotateX: 0,
    elementTop: 0,
    isInView: false,
  });

  const rafId = useRef<number | null>(null);

  const updateValues = useCallback(() => {
    if (!ref.current || !enabled) return;

    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const elementTop = rect.top;
    const elementCenter = elementTop + rect.height / 2;
    
    // Check if element is in view
    const isInView = elementTop < windowHeight && elementTop + rect.height > 0;
    
    if (!isInView) {
      setValues(prev => ({ ...prev, isInView: false }));
      return;
    }

    // Calculate how far through the viewport the element is (0 to 1)
    const viewportProgress = 1 - (elementCenter / windowHeight);
    
    // Parallax offset based on scroll position relative to element
    const parallaxOffset = viewportProgress * 100 * parallaxFactor;
    
    // Subtle rotation based on viewport position (-maxRotation to +maxRotation)
    const rotateX = (viewportProgress - 0.5) * 2 * maxRotation;

    setValues({
      scrollY: window.scrollY,
      parallaxOffset,
      rotateX: Math.max(-maxRotation, Math.min(maxRotation, rotateX)),
      elementTop,
      isInView,
    });
  }, [ref, parallaxFactor, maxRotation, enabled]);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !enabled) return;

    const handleScroll = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      rafId.current = requestAnimationFrame(updateValues);
    };

    // Initial calculation
    updateValues();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [updateValues, enabled]);

  return values;
};
