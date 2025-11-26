import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export function useUserLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const { user } = useAuth();
  const initialValueRef = useRef(initialValue);
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!user) return initialValueRef.current;
    
    try {
      const userKey = `${user.id}_${key}`;
      const item = window.localStorage.getItem(userKey);
      return item ? JSON.parse(item) : initialValueRef.current;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValueRef.current;
    }
  });

  // Update stored value when user changes (but not when initialValue changes)
  useEffect(() => {
    if (!user) {
      setStoredValue(initialValueRef.current);
      return;
    }

    try {
      const userKey = `${user.id}_${key}`;
      const item = window.localStorage.getItem(userKey);
      setStoredValue(item ? JSON.parse(item) : initialValueRef.current);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValueRef.current);
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

  return [storedValue, setValue];
}