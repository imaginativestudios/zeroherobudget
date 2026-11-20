/**
 * Browser storage helpers that never throw. Browsers that block site data
 * (or privacy extensions) make localStorage/sessionStorage access throw;
 * these return null / false instead so the app keeps rendering.
 */
type Kind = 'localStorage' | 'sessionStorage';

function resolve(kind: Kind): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window[kind];
  } catch {
    return null;
  }
}

function make(kind: Kind) {
  return {
    getItem(key: string): string | null {
      try {
        return resolve(kind)?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    /** Returns false when the value could not be saved. */
    setItem(key: string, value: string): boolean {
      try {
        const s = resolve(kind);
        if (!s) return false;
        s.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
    removeItem(key: string): void {
      try {
        resolve(kind)?.removeItem(key);
      } catch {
        /* storage unavailable */
      }
    },
    /** All keys currently stored (empty when storage is unavailable). */
    keys(): string[] {
      try {
        const s = resolve(kind);
        if (!s) return [];
        const out: string[] = [];
        for (let i = 0; i < s.length; i++) {
          const k = s.key(i);
          if (k !== null) out.push(k);
        }
        return out;
      } catch {
        return [];
      }
    },
  };
}

export const safeLocalStorage = make('localStorage');
export const safeSessionStorage = make('sessionStorage');
