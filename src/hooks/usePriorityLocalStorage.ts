import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { LoadPriority } from './useProgressiveLoad';

/**
 * Enhanced localStorage hook with priority-based loading
 * Critical data loads immediately, secondary data can be deferred
 */
export function usePriorityLocalStorage<T>(
  key: string,
  initialValue: T,
  priority: LoadPriority = 'critical',
  shouldLoad: boolean = true
): [T, (value: T) => void, boolean] {
  const { user } = useAuth();
  const initialValueRef = useRef(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    // For critical priority, load immediately
    if (priority === 'critical' || !shouldLoad) {
      if (!user) {
        setIsLoading(false);
        return initialValueRef.current;
      }
      
      try {
        const userKey = `${user.id}_${key}`;
        const item = window.localStorage.getItem(userKey);
        setIsLoading(false);
        return item ? JSON.parse(item) : initialValueRef.current;
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        setIsLoading(false);
        return initialValueRef.current;
      }
    }
    
    // For secondary priority, return initial value and defer loading
    return initialValueRef.current;
  });

  // Handle deferred loading for secondary priority data
  useEffect(() => {
    if (priority === 'secondary' && shouldLoad && !isLoading) {
      setIsLoading(true);
      
      if (!user) {
        setStoredValue(initialValueRef.current);
        setIsLoading(false);
        return;
      }

      try {
        const userKey = `${user.id}_${key}`;
        const item = window.localStorage.getItem(userKey);
        setStoredValue(item ? JSON.parse(item) : initialValueRef.current);
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        setStoredValue(initialValueRef.current);
      } finally {
        setIsLoading(false);
      }
    }
  }, [priority, shouldLoad, user, key]);

  // Update stored value when user changes
  useEffect(() => {
    if (!shouldLoad) return;
    
    setIsLoading(true);
    if (!user) {
      setStoredValue(initialValueRef.current);
      setIsLoading(false);
      return;
    }

    try {
      const userKey = `${user.id}_${key}`;
      const item = window.localStorage.getItem(userKey);
      setStoredValue(item ? JSON.parse(item) : initialValueRef.current);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValueRef.current);
    } finally {
      setIsLoading(false);
    }
  }, [user, key, shouldLoad]);

  const setValue = (value: T) => {
    if (!user) return;
    
    try {
      setStoredValue(value);
      const userKey = `${user.id}_${key}`;
      window.localStorage.setItem(userKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoading];
}
