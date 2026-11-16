import { test, expect } from '@playwright/test';
import { calculatePayoffPlan } from '../src/lib/debtCalculations';

test('visitor can add no more than 10 debts', async ({ page }) => {
  await page.goto('/debt-payoff-calculator');
  for (let count = 1; count < 10; count++) await page.getByRole('button', { name: 'Add debt', exact: true }).click();
  await expect(page.locator('fieldset')).toHaveCount(10);
  await expect(page.getByRole('button', { name: 'Add debt', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Remove debt 10', exact: true }).click();
  await expect(page.locator('fieldset')).toHaveCount(9);
});

test('public comparison reuses the engine and saves no visitor entries', async ({ page }) => {
  await page.goto('/debt-payoff-calculator');
  const debts = [
    { id: '1', name: 'Small card', balance: 500, apr: 10, min: 25, type: 'debt' },
    { id: '2', name: 'Large card', balance: 2000, apr: 24, min: 60, type: 'debt' },
  ];
  const outgoing: string[] = [];
  page.on('request', request => { if (request.method() === 'POST') outgoing.push(request.postData() ?? ''); });
  await page.getByRole('button', { name: 'Add debt', exact: true }).click();
  for (const [index, debt] of debts.entries()) {
    const row = page.locator('fieldset').nth(index);
    await row.getByLabel('Name', { exact: true }).fill(debt.name);
    await row.getByLabel('Balance', { exact: true }).fill(String(debt.balance));
    await row.getByLabel('Interest rate (APR)', { exact: true }).fill(String(debt.apr));
    await row.getByLabel('Minimum payment', { exact: true }).fill(String(debt.min));
  }
  await page.getByLabel('Extra monthly payment', { exact: true }).fill('100');
  await page.getByLabel('Hourly pay (optional)', { exact: true }).fill('20');
  await page.getByRole('button', { name: 'Compare payoff plans' }).click();
  const baseline = calculatePayoffPlan(debts, 0, 'Snowball');
  for (const [method, strategy] of [['snowball', 'Snowball'], ['avalanche', 'Avalanche']] as const) {
    const plan = calculatePayoffPlan(debts, 100, strategy);
    await expect(page.getByTestId(`${method}-months`)).toHaveText(String(plan.months));
    await expect(page.getByTestId(`${method}-interest`)).toHaveText(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(plan.totalInterest));
    const hours = Math.max(0, baseline.totalInterest - plan.totalInterest) / 20;
    await expect(page.getByTestId(`${method}-hours`)).toHaveText(`${hours.toLocaleString('en-US', { maximumFractionDigits: 1 })} work hours saved`);
  }
  expect(outgoing.some(body => body.includes('Small card') || body.includes('Large card'))).toBe(false);
  const storage = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
  expect(storage).not.toContain('Small card');
  expect(storage).not.toContain('Large card');
  await page.reload();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('');
});

test('unpayable debt never reports a false debt-free date', async ({ page }) => {
  await page.goto('/debt-payoff-calculator');
  await page.getByLabel('Balance', { exact: true }).fill('1000');
  await page.getByLabel('Interest rate (APR)', { exact: true }).fill('24');
  await page.getByLabel('Minimum payment', { exact: true }).fill('1');
  await page.getByRole('button', { name: 'Compare payoff plans' }).click();
  await expect(page.getByTestId('snowball-date')).toHaveCount(0);
  await expect(page.getByTestId('avalanche-date')).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: 'Not paid off within 50 years' })).toHaveCount(2);
});