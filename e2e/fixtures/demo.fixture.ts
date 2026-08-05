import type { Page } from '@playwright/test';

/**
 * Put the app into demo mode.
 *
 * Why this exists
 * ---------------
 * Layout.tsx gates every app route:
 *
 *   const isInDemoMode = !user && isDemoDataLoaded();
 *   if (!user && !isInDemoMode) return <Navigate to="/auth?returnTo=..." replace />;
 *
 * and isDemoDataLoaded() is simply:
 *
 *   localStorage.getItem(`${DEMO_USER_ID}_expenses`) !== null
 *
 * So an unauthenticated visitor reaches /dashboard, /transactions, /budgets and
 * friends ONLY when demo data is present in localStorage. Specs that began with
 * a bare `localStorage.clear()` deleted precisely the key that let them in, and
 * every navigation afterwards redirected to /auth. The tests defeated
 * themselves; the app was never broken.
 *
 * How it works
 * ------------
 * Calls the application's own loadDemoData() rather than reproducing the shape
 * of a dozen localStorage keys here. Vite serves source modules in dev, so the
 * browser can import the real module — meaning this helper cannot drift away
 * from the app's notion of demo data the way a hand-written fixture would.
 *
 * Note the goto() before any evaluate(): localStorage is unreachable on
 * about:blank and throws `SecurityError: Failed to read the 'localStorage'
 * property from 'Window'`. Several specs hit exactly that by evaluating before
 * navigating.
 */
export async function seedDemoData(page: Page): Promise<void> {
  await page.goto('/');

  // Full clear first: loadDemoData() refuses to run when it detects a Supabase
  // auth session (an authenticated user must never be given demo data), so any
  // leftover sb-*-auth-token from a previous test would silently no-op this.
  await page.evaluate(() => localStorage.clear());

  const result = await page.evaluate(async () => {
    const mod = await import('/src/lib/demoDataLoader.ts');
    return mod.loadDemoData();
  });

  if (!result?.loaded) {
    throw new Error(
      `seedDemoData: loadDemoData() declined to load — "${result?.summary ?? 'no summary'}"`
    );
  }

  const ready = await page.evaluate(async () => {
    const mod = await import('/src/lib/demoDataLoader.ts');
    return mod.isDemoDataLoaded();
  });

  if (!ready) {
    throw new Error('seedDemoData: loadDemoData() reported success but isDemoDataLoaded() is false');
  }
}

/**
 * Read the transactions the app has stored, in demo mode.
 *
 * The app keys local data by user id — `${DEMO_USER_ID}_transactions` while in
 * demo mode — not by a fixed literal. Specs that hardcoded
 * 'zero-hero-local-transactions' were reading a key nothing ever writes, so
 * they got null back and their assertions were meaningless.
 *
 * Resolves DEMO_USER_ID from the app module rather than repeating the literal,
 * so this cannot drift if the constant changes.
 */
export async function readDemoTransactions(page: Page): Promise<unknown[]> {
  return page.evaluate(async () => {
    const mod = await import('/src/lib/demoDataLoader.ts');
    const raw = localStorage.getItem(`${mod.DEMO_USER_ID}_transactions`);
    return raw ? JSON.parse(raw) : [];
  });
}

/** Overwrite the demo-mode transaction list. Counterpart to readDemoTransactions. */
export async function writeDemoTransactions(page: Page, transactions: unknown[]): Promise<void> {
  await page.evaluate(async (txs) => {
    const mod = await import('/src/lib/demoDataLoader.ts');
    localStorage.setItem(`${mod.DEMO_USER_ID}_transactions`, JSON.stringify(txs));
  }, transactions);
}

/**
 * Empty the demo data while staying in demo mode.
 *
 * Needed because "empty state" and "locked out" are the same localStorage
 * state as far as Layout.tsx is concerned: the gate is
 * `localStorage.getItem(`${DEMO_USER_ID}_expenses`) !== null`, so a spec that
 * clears storage to photograph an empty dashboard gets redirected to /auth and
 * photographs a login modal instead. That is exactly how 69 of the first batch
 * of Linux visual baselines came to be pixel-identical pictures of the sign-in
 * form.
 *
 * Sets every array-valued demo key to `[]` — present, therefore still admitted
 * by the gate, but with nothing in it. Scalar and object keys (income,
 * strategy, hero profile, behavioural engine) are left alone: they are app
 * configuration rather than user data, and blanking them would test a state a
 * real user is never in.
 */
export async function emptyDemoData(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const mod = await import('/src/lib/demoDataLoader.ts');
    const prefix = `${mod.DEMO_USER_ID}_`;

    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(prefix)) continue;
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      try {
        if (Array.isArray(JSON.parse(raw))) localStorage.setItem(key, '[]');
      } catch {
        // Not JSON — leave it exactly as the app wrote it.
      }
    }
  });
}

/**
 * Clear demo data without touching the rest of localStorage.
 *
 * Use when a test needs the unauthenticated, no-demo state — the one that
 * SHOULD redirect to /auth. Prefer this over localStorage.clear(), which is
 * indiscriminate and is what broke the demo specs.
 */
export async function clearDemoData(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const mod = await import('/src/lib/demoDataLoader.ts');
    mod.clearDemoData();
  });
}
