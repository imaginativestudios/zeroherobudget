import { test, expect } from '@playwright/test';

test('onboarding wage survives ceremony, completion, and reload', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/onboarding');
  await page.locator('#hourly-wage').fill('37');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: /See My Payoff Timeline/i }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: /Skip — Explore Demo Mode/i }).click();

  const readProfile = () => page.evaluate(() => {
    const key = Object.keys(localStorage).find(key => key.endsWith('_bdt_hero_profile'));
    return key ? JSON.parse(localStorage.getItem(key) ?? '{}') : null;
  });
  await expect.poll(async () => (await readProfile())?.hourly_wage).toBe(37);
  await page.getByRole('button', { name: 'Go to Dashboard', exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
  expect((await readProfile())?.hourly_wage).toBe(37);
  expect((await readProfile())?.onboarding_completed).toBe(true);
  await page.reload();
  expect((await readProfile())?.hourly_wage).toBe(37);
});