import { useState, useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { LoadPriority } from "./useProgressiveLoad";
import { DEMO_USER_ID } from "@/lib/constants";

/**
 * Enhanced localStorage hook with priority-based loading
 * Critical data loads immediately, secondary data can be deferred
 *
 * For unauthenticated users, falls back to DEMO_USER_ID to read demo data.
 * Real authenticated users always use their own UUID, ensuring complete isolation.
 */
export function usePriorityLocalStorage<T>(
  key: string,
  initialValue: T,
  priority: LoadPriority = "critical",
  shouldLoad: boolean = true,
): [T, (value: T) => void, boolean] {
  const { user } = useAuth();
  const initialValueRef = useRef(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  const [storedValue, setStoredValue] = useState<T>(() => {
    // For critical priority, load immediately
    if (priority === "critical" || !shouldLoad) {
      // Use demo user ID for unauthenticated users to show demo data
      const effectiveUserId = user?.id ?? DEMO_USER_ID;

      try {
        const userKey = `${effectiveUserId}_${key}`;
        const item = window.localStorage.getItem(userKey);
        setIsLoading(false);
        return item ? JSON.parse(item) : initialValueRef.current;
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error); // FIXED: Changed backtick to parenthesis
        setIsLoading(false);
        return initialValueRef.current;
      }
    }

    // For secondary priority, return initial value and defer loading
    return initialValueRef.current;
  });

  // Handle deferred loading for secondary priority data
  useEffect(() => {
    if (priority === "secondary" && shouldLoad && !isLoading) {
      setIsLoading(true);

      // Use demo user ID for unauthenticated users
      const effectiveUserId = user?.id ?? DEMO_USER_ID;
      try {
        const userKey = `${effectiveUserId}_${key}`;
        const item = window.localStorage.getItem(userKey);
        setStoredValue(item ? JSON.parse(item) : initialValueRef.current);
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error); // FIXED: Changed backtick to parenthesis
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

    // Use demo user ID for unauthenticated users
    const effectiveUserId = user?.id ?? DEMO_USER_ID;
    try {
      const userKey = `${effectiveUserId}_${key}`;
      const item = window.localStorage.getItem(userKey);
      setStoredValue(item ? JSON.parse(item) : initialValueRef.current);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error); // FIXED: Changed backtick to parenthesis
      setStoredValue(initialValueRef.current);
    } finally {
      setIsLoading(false);
    }
  }, [user, key, shouldLoad]);

  const setValue = (value: T) => {
    // Use demo user ID for unauthenticated users (allows demo interactions)
    const effectiveUserId = user?.id ?? DEMO_USER_ID;

    try {
      setStoredValue(value);
      const userKey = `${effectiveUserId}_${key}`;
      window.localStorage.setItem(userKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error); // FIXED: Changed backtick to parenthesis
    }
  };

  return [storedValue, setValue, isLoading];
}
