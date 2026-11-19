import { test, expect } from '@playwright/test';

const ID = 'demo-hero-00000000';
const read = (page: import('@playwright/test').Page, key: string) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), key);

test('Debt Strategy shows the five demo debts', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.clear();
    const m = await import('/src/lib/demoDataLoader.ts');
    m.loadDemoData();
  });
  await page.goto('/debts');
  await expect(page.getByText('$54,300').first()).toBeVisible();
  await expect(page.getByText(/unlock the simulator/i)).toHaveCount(0);
});

test('debt added on Debt Strategy is saved to the shared list the dashboard reads', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async (id) => {
    localStorage.clear();
    const m = await import('/src/lib/demoDataLoader.ts');
    m.loadDemoData();
    localStorage.setItem(`${id}_debts`, '[]');
  }, ID);
  await page.goto('/debts');
  await page.getByRole('button', { name: /Add Credit Card/ }).first().click();
  await expect.poll(async () => (await read(page, `${ID}_debts`))?.length).toBe(1);
  const [saved] = await read(page, `${ID}_debts`);
  expect(saved.name).toBe('New Credit Card');
  expect(saved).toHaveProperty('interest_rate', 0);
  expect(saved).toHaveProperty('minimum_payment', 0);
});

test('older saved debts are copied into the shared list once', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async (id) => {
    localStorage.clear();
    const m = await import('/src/lib/demoDataLoader.ts');
    m.loadDemoData();
    const now = new Date().toISOString();
    localStorage.setItem(`${id}_debts`, JSON.stringify([{ id: 'a', name: 'Visa', balance: 1000, interest_rate: 20, minimum_payment: 30, type: 'card', user_id: id, created_at: now, updated_at: now }]));
    localStorage.setItem(`${id}_bdt_debts`, JSON.stringify([
      { id: 'a', name: 'Visa', balance: 1000, apr: 20, min: 30, type: 'card' },
      { id: 'b', name: 'Car Loan', balance: 8000, apr: 6, min: 250, type: 'loan' },
    ]));
  }, ID);
  await page.goto('/debts');
  await expect.poll(async () => (await read(page, `${ID}_debts`))?.length).toBe(2);
  expect(await read(page, `${ID}_bdt_debts`)).toBeNull();
  const merged = await read(page, `${ID}_debts`);
  expect(merged[1]).toMatchObject({ id: 'b', name: 'Car Loan', balance: 8000, interest_rate: 6, minimum_payment: 250 });
  await page.reload();
  await expect.poll(async () => (await read(page, `${ID}_debts`))?.length).toBe(2);
});
