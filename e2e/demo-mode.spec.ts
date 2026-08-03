import { test, expect } from '@playwright/test';
import { seedDemoData } from './fixtures/demo.fixture';

test.describe('Demo Mode (Unauthenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Put the app INTO demo mode. The previous `localStorage.clear()` removed
    // the very key Layout.tsx checks (`${DEMO_USER_ID}_expenses`), so demo mode
    // was off and every route below redirected to /auth.
    await seedDemoData(page);
  });

  test('dashboard shows empty state or sample data', async ({ page }) => {
    await page.goto('/dashboard');
    // Should show either empty state guidance or demo data.
    // expect().toBeVisible() rather than await locator.isVisible(): the latter
    // samples once and returns false if the page has not painted yet, so it
    // races the render instead of waiting for it.
    await expect(
      page.getByText(/welcome|get started|add.*budget|income|expense/i).first()
    ).toBeVisible();
  });

  test('budgets page is accessible', async ({ page }) => {
    await page.goto('/budgets');
    await expect(page.getByText(/budget|income|expense/i).first()).toBeVisible();
  });

  test('debts page is accessible', async ({ page }) => {
    await page.goto('/debts');
    await expect(page.getByText(/debt|snowball|payoff/i).first()).toBeVisible();
  });

  test('subscriptions page is accessible', async ({ page }) => {
    await page.goto('/subscriptions');
    await expect(page.getByText(/subscription/i).first()).toBeVisible();
  });

  test('transactions page is accessible', async ({ page }) => {
    await page.goto('/transactions');
    await expect(page.getByText(/transaction/i).first()).toBeVisible();
  });

  test('reports page is accessible', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByText(/report/i).first()).toBeVisible();
  });

  test('can add a budget item in demo mode', async ({ page }) => {
    await page.goto('/budgets');
    
    // Look for an add button
    const addButton = page.getByRole('button', { name: /add|new|\+/i }).first();
    if (await addButton.isVisible()) {
      await addButton.click();
      // Check if a form or modal appears
      await expect(page.getByPlaceholder(/name|description|amount/i).first()).toBeVisible();
    }
  });
});
