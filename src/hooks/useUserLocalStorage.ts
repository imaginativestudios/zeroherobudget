import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useUserLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const { user } = useAuth();
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!user) return initialValue;
    
    try {
      const userKey = `${user.id}_${key}`;
      const item = window.localStorage.getItem(userKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update stored value when user changes
  useEffect(() => {
    if (!user) {
      setStoredValue(initialValue);
      return;
    }

    try {
      const userKey = `${user.id}_${key}`;
      const item = window.localStorage.getItem(userKey);
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValue);
    }
  }, [user, key, initialValue]);

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