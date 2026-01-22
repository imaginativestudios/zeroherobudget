import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { DEMO_USER_ID } from '@/lib/demoDataLoader';

export function useUserLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void, boolean] {
  const { user } = useAuth();
  const initialValueRef = useRef(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use authenticated user ID or fall back to demo user ID for demo mode
  const getEffectiveUserId = () => user?.id ?? DEMO_USER_ID;
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const effectiveUserId = getEffectiveUserId();
      const userKey = `${effectiveUserId}_${key}`;
      const item = window.localStorage.getItem(userKey);
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
      const item = window.localStorage.getItem(userKey);
      setStoredValue(item ? JSON.parse(item) : initialValueRef.current);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValueRef.current);
    } finally {
      setIsLoading(false);
    }
  }, [user, key]); // Removed initialValue from dependencies

  const setValue = (value: T) => {
    try {
      const effectiveUserId = getEffectiveUserId();
      setStoredValue(value);
      const userKey = `${effectiveUserId}_${key}`;
      window.localStorage.setItem(userKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoading];
}