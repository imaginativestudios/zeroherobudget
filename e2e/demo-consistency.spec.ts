import { test, expect, type Page } from '@playwright/test';

const ID = 'demo-hero-00000000';

async function loadDemo(page: Page) {
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.clear();
    localStorage.setItem('zora_opened', 'true');
    localStorage.setItem('zora_intro_dismissed', 'true');
    const m = await import('/src/lib/demoDataLoader.ts');
    m.loadDemoData();
  });
}

test('demo budget fits the $5,800 income and leaves $399 for extra debt payment', async ({ page }) => {
  await loadDemo(page);
  const { planned, debtLines } = await page.evaluate((id) => {
    const rows = JSON.parse(localStorage.getItem(`${id}_expenses`) ?? '[]');
    return {
      planned: rows.reduce((s: number, r: { amount: number }) => s + r.amount, 0),
      debtLines: rows.filter((r: { category: string }) => r.category === 'Debt Payments')
        .map((r: { name: string; amount: number }) => `${r.name}:${r.amount}`).sort(),
    };
  }, ID);
  expect(planned).toBe(5401);
  expect(debtLines).toEqual(['401k Loan:469', 'Amex:90', 'Best Egg Loan:808', 'Chase Freedom:75', 'Kia Auto Loan:499']);
});

test('dashboard budget card reads the demo budget', async ({ page }) => {
  await loadDemo(page);
  await page.goto('/dashboard');
  await expect(page.getByText('No budget items set up yet')).toHaveCount(0);
  await expect(page.getByText('$399').first()).toBeVisible();
});

test('dashboard and Debt Strategy show the same 25-month payoff', async ({ page }) => {
  await loadDemo(page);
  await page.goto('/dashboard');
  await expect(page.getByText('25 months', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('25 months away')).toBeVisible();
  await page.goto('/debts');
  await expect(page.getByText('Extra Budget: $399')).toBeVisible();
  // Equal months: neither strategy gets a Faster badge
  await expect(page.getByText('Faster', { exact: true })).toHaveCount(0);
  await expect(page.getByText('$14,000.00').first()).toBeVisible();
});
