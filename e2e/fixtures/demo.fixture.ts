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
