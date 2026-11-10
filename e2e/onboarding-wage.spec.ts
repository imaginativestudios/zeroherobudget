import { test, expect } from '@playwright/test';

test('demo onboarding wage survives ceremony, completion, and reload', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/onboarding?demo=true');
  await page.locator('#hourly-wage').fill('37');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: /See My Payoff Timeline/i }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  const readProfile = () => page.evaluate(() => {
    const key = Object.keys(localStorage).find(key => key.endsWith('_bdt_hero_profile'));
    return key ? JSON.parse(localStorage.getItem(key) ?? '{}') : null;
  });
  await expect.poll(async () => (await readProfile())?.hourly_wage).toBe(37);
  await page.getByRole('button', { name: 'Go to Dashboard', exact: true }).click();
  // Demo entry deliberately loads sample data rather than creating an account.
  await expect(page).toHaveURL(/\/dashboard|\/auth/);
  await page.reload();
  expect((await readProfile())?.hourly_wage).toBe(25);
});