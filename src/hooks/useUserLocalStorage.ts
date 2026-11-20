import { useState, useEffect, useRef, type SetStateAction } from 'react';
import { useAuth } from './useAuth';
import { DEMO_USER_ID } from '@/lib/demoDataLoader';
import { safeLocalStorage } from '@/lib/safeStorage';

export function useUserLocalStorage<T>(key: string, initialValue: T): [T, (value: SetStateAction<T>) => void, boolean] {
  const { user } = useAuth();
  const initialValueRef = useRef(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use authenticated user ID or fall back to demo user ID for demo mode
  const getEffectiveUserId = () => user?.id ?? DEMO_USER_ID;
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const effectiveUserId = getEffectiveUserId();
      const userKey = `${effectiveUserId}_${key}`;
      const item = safeLocalStorage.getItem(userKey);
      setIsLoading(false);
      return item ? JSON.parse(item) : initialValueRef.current;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setIsLoading(false);
      return initialValueRef.current;
    }
  });

  // Update stored value when user changes (but not when initialValue changes)
  useEffect(() => {
    setIsLoading(true);
    try {
      const effectiveUserId = getEffectiveUserId();
      const userKey = `${effectiveUserId}_${key}`;
      const item = safeLocalStorage.getItem(userKey);
      setStoredValue(item ? JSON.parse(item) : initialValueRef.current);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValueRef.current);
    } finally {
      setIsLoading(false);
    }
  }, [user, key]); // Removed initialValue from dependencies

  const setValue = (value: SetStateAction<T>) => {
    const effectiveUserId = getEffectiveUserId();
    const userKey = `${effectiveUserId}_${key}`;
    setStoredValue((previous) => {
      let currentValue: T = previous;
      try {
        const item = safeLocalStorage.getItem(userKey);
        if (item) currentValue = JSON.parse(item);
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
      const nextValue = typeof value === 'function'
        ? (value as (previous: T) => T)(currentValue)
        : value;
      let saved = false;
      try {
        saved = safeLocalStorage.setItem(userKey, JSON.stringify(nextValue));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
      if (!saved) console.warn(`Could not save "${key}"; keeping it for this visit only.`);
      return nextValue;
    });
  };

  return [storedValue, setValue, isLoading];
}