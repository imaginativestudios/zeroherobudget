import { test, expect } from '@playwright/test';

test.describe('Demo onboarding progress isolation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('demo Profile Created does not leak into Get Started Free', async ({ page }) => {
    // Run demo onboarding through to the Profile Created screen.
    await page.goto('/onboarding?demo=true');

    // Step 1: demo hourly wage is prefilled.
    await expect(page.getByText('Define Your Life Value')).toBeVisible();
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 2: demo debt (Amex) is prefilled.
    await expect(page.getByText('Name Your Primary Debt')).toBeVisible();
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 3: emergency fund goal.
    await expect(page.getByText('Set Your Emergency Fund Goal')).toBeVisible();
    await page.getByRole('button', { name: /see my payoff timeline/i }).click();

    // Step 4: aha moment (demo skips pricing).
    await page.getByRole('button', { name: /continue to demo/i }).click();

    // Step 6: Profile Created ceremony.
    await expect(page.getByText('Profile Created')).toBeVisible();

    // Leave via "Skip to Demo Mode" instead of "Go to Dashboard".
    // Signed out, /dashboard redirects to /auth; either way we left onboarding.
    await page.getByRole('link', { name: /skip to demo mode/i }).click();
    await expect(page).not.toHaveURL(/\/onboarding/);

    // Starting real onboarding must begin at step 1, not the demo ceremony.
    await page.goto('/');
    await page.getByRole('button', { name: /get started free/i }).first().click();
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByText('Define Your Life Value')).toBeVisible();
    await expect(page.getByText('Profile Created')).not.toBeVisible();
  });

  test('stale demo sample progress is cleared and onboarding restarts at step 1', async ({ page }) => {
    // Simulate a browser that ran the old demo, which saved the demo sample
    // as real onboarding progress under the demo profile key.
    await page.goto('/');
    await page.evaluate(() => {
      // Signed-out profile storage lives under the demo user id.
      const key = 'demo-hero-00000000_bdt_hero_profile';
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({
        ...existing,
        onboarding_step: 6,
        onboarding_data: {
          hourlyWage: 25,
          debtName: 'Amex',
          debtBalance: 3500,
          debtApr: 23.99,
          debtMinPayment: 90,
          moatTarget: 1000,
        },
      }));
    });

    await page.goto('/onboarding');
    await expect(page.getByText('Define Your Life Value')).toBeVisible();
    await expect(page.getByText('Profile Created')).not.toBeVisible();

    // The stale progress must be removed from storage too.
    const stored = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('demo-hero-00000000_bdt_hero_profile') || '{}');
    });
    expect(stored.onboarding_step).toBeUndefined();
    expect(stored.onboarding_data).toBeUndefined();
  });
});
