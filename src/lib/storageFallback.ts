/**
 * Must be imported before anything that touches browser storage (notably the
 * Supabase client). When the browser blocks site data, reading
 * localStorage/sessionStorage throws; Supabase auth then throws in the
 * background. In that case only, swap in an in-memory store for this visit.
 * When storage works, nothing changes.
 */
type Kind = 'localStorage' | 'sessionStorage';

function isBlocked(kind: Kind): boolean {
  try {
    const s = window[kind];
    if (!s) return true;
    s.getItem('__zh_storage_probe__');
    return false;
  } catch {
    return true;
  }
}

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    key: (i: number) => Array.from(data.keys())[i] ?? null,
    getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
    setItem: (k: string, v: string) => { data.set(String(k), String(v)); },
    removeItem: (k: string) => { data.delete(k); },
    clear: () => { data.clear(); },
  } as Storage;
}

if (typeof window !== 'undefined') {
  for (const kind of ['localStorage', 'sessionStorage'] as Kind[]) {
    if (!isBlocked(kind)) continue;
    try {
      Object.defineProperty(window, kind, { configurable: true, value: memoryStorage() });
    } catch {
      /* cannot override; safeStorage helpers still prevent crashes */
    }
  }
}

export {};
