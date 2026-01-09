import { test, expect } from '@playwright/test';

test.describe('Navigation & Core Pages', () => {
  test('landing page hero section is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /get started|try|start/i }).first()).toBeVisible();
  });

  test('pricing page loads correctly', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText(/pricing|subscription|plan/i).first()).toBeVisible();
    // Check for pricing slider or tier options
    await expect(page.locator('input[type="range"]').or(page.getByText(/month/i))).toBeVisible();
  });

  test('can access demo dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard');
    // Should show dashboard or empty state
    await expect(page.getByText(/dashboard|budget|overview/i).first()).toBeVisible();
  });

  test('privacy policy page exists', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page.getByText(/privacy/i).first()).toBeVisible();
  });

  test('terms of service page exists', async ({ page }) => {
    await page.goto('/terms-of-service');
    await expect(page.getByText(/terms/i).first()).toBeVisible();
  });

  test('install page shows PWA instructions', async ({ page }) => {
    await page.goto('/install');
    await expect(page.getByText(/install/i).first()).toBeVisible();
  });

  test('404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/not found|404|doesn't exist/i).first()).toBeVisible();
  });
});
