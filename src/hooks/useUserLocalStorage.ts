import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export function useUserLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void, boolean] {
  const { user } = useAuth();
  const initialValueRef = useRef(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  
  const [storedValue, setStoredValue] = useState<T>(() => {
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
  });

  // Update stored value when user changes (but not when initialValue changes)
  useEffect(() => {
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
  }, [user, key]); // Removed initialValue from dependencies

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