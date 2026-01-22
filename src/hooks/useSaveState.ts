import { useState, useCallback, useRef } from 'react';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface UseSaveStateOptions {
  /** Duration in ms to show "saved" state before resetting to idle */
  successDuration?: number;
  /** Duration in ms to show "error" state before resetting to idle */
  errorDuration?: number;
}

interface UseSaveStateReturn {
  state: SaveState;
  isSaving: boolean;
  isSaved: boolean;
  isError: boolean;
  setSaving: () => void;
  setSaved: () => void;
  setError: () => void;
  reset: () => void;
  /** Wrap an async function to automatically manage save states */
  wrapAsync: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

export function useSaveState(options: UseSaveStateOptions = {}): UseSaveStateReturn {
  const { successDuration = 2000, errorDuration = 3000 } = options;
  const [state, setState] = useState<SaveState>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearExistingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearExistingTimeout();
    setState('idle');
  }, [clearExistingTimeout]);

  const setSaving = useCallback(() => {
    clearExistingTimeout();
    setState('saving');
  }, [clearExistingTimeout]);

  const setSaved = useCallback(() => {
    clearExistingTimeout();
    setState('saved');
    timeoutRef.current = setTimeout(() => {
      setState('idle');
    }, successDuration);
  }, [clearExistingTimeout, successDuration]);

  const setError = useCallback(() => {
    clearExistingTimeout();
    setState('error');
    timeoutRef.current = setTimeout(() => {
      setState('idle');
    }, errorDuration);
  }, [clearExistingTimeout, errorDuration]);

  const wrapAsync = useCallback(async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
    setSaving();
    try {
      const result = await asyncFn();
      setSaved();
      return result;
    } catch (error) {
      setError();
      throw error;
    }
  }, [setSaving, setSaved, setError]);

  return {
    state,
    isSaving: state === 'saving',
    isSaved: state === 'saved',
    isError: state === 'error',
    setSaving,
    setSaved,
    setError,
    reset,
    wrapAsync,
  };
}
