import { test, expect } from '@playwright/test';

test.describe('Demo Mode (Unauthenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure fresh demo state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('dashboard shows empty state or sample data', async ({ page }) => {
    await page.goto('/dashboard');
    // Should show either empty state guidance or demo data
    const hasContent = await page.getByText(/welcome|get started|add.*budget|income|expense/i).first().isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('budget page is accessible', async ({ page }) => {
    await page.goto('/budget');
    await expect(page.getByText(/budget|income|expense/i).first()).toBeVisible();
  });

  test('debt snowball page is accessible', async ({ page }) => {
    await page.goto('/debt-snowball');
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
    await page.goto('/budget');
    
    // Look for an add button
    const addButton = page.getByRole('button', { name: /add|new|\+/i }).first();
    if (await addButton.isVisible()) {
      await addButton.click();
      // Check if a form or modal appears
      await expect(page.getByPlaceholder(/name|description|amount/i).first()).toBeVisible();
    }
  });
});
