import { test, expect } from '@playwright/test';
import { seedDemoData } from './fixtures/demo.fixture';

test.describe('Navigation & Core Pages', () => {
  test.beforeEach(async ({ page }) => {
    // /dashboard and the 404 page render inside Layout, which redirects to
    // /auth unless demo mode is active. Public pages below are unaffected.
    await seedDemoData(page);
  });

  test('landing page hero section is visible', async ({ page }) => {
    // '/' is the Coming Soon page ("Explore Demo" / "Notify Me"); the marketing
    // hero with "Get Started Free" lives at /landing.
    await page.goto('/landing');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /get started|try|start/i }).first()).toBeVisible();
  });

  test('pricing page loads correctly', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText(/pricing|subscription|plan/i).first()).toBeVisible();
    // Check for pricing slider or tier options
    // .first(): the .or() union matches several 'month' nodes on this page,
    // which is a strict mode violation rather than a real failure.
    await expect(page.locator('input[type="range"]').or(page.getByText(/month/i)).first()).toBeVisible();
  });

  test('can access demo dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard');
    // Should show dashboard or empty state
    await expect(page.getByText(/dashboard|budget|overview/i).first()).toBeVisible();
  });

  test('privacy policy page exists', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByText(/privacy/i).first()).toBeVisible();
  });

  test('terms of service page exists', async ({ page }) => {
    await page.goto('/terms');
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
