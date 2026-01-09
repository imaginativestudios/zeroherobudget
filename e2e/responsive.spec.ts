import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('mobile navigation menu works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Look for hamburger menu or mobile nav trigger
    const menuButton = page.getByRole('button', { name: /menu/i })
      .or(page.locator('[data-testid="mobile-menu"]'))
      .or(page.locator('button').filter({ has: page.locator('svg') }).first());
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Navigation should be visible
      await expect(page.getByText(/dashboard|budget|debt/i).first()).toBeVisible();
    }
  });

  test('landing page is responsive', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('dashboard adapts to mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Content should still be visible and not overflow
    const body = page.locator('body');
    const bodyWidth = await body.evaluate((el) => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 20); // Allow small margin
  });

  test('forms are usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth');
    
    // Form inputs should be visible and tappable
    const emailInput = page.getByPlaceholder(/email/i);
    await expect(emailInput).toBeVisible();
    
    // Input should be wide enough to tap
    const box = await emailInput.boundingBox();
    expect(box?.width).toBeGreaterThan(200);
  });
});
