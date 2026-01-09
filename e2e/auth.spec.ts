import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Zero Hero/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('can navigate to auth page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /sign in|log in|get started/i }).first().click();
    await expect(page).toHaveURL(/\/auth/);
  });

  test('auth page shows login and signup options', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.goto('/auth');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Form should show validation - check for error styling or message
    await expect(page.getByPlaceholder(/email/i)).toHaveAttribute('aria-invalid', 'true');
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.goto('/auth');
    await page.getByPlaceholder(/email/i).fill('notanemail');
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Should show email validation error
    await expect(page.getByText(/invalid email|email.*invalid/i)).toBeVisible();
  });

  test('signup flow shows confirmation message', async ({ page }) => {
    await page.goto('/auth');
    // Switch to signup mode if needed
    const signupLink = page.getByRole('button', { name: /sign up|create account|register/i });
    if (await signupLink.isVisible()) {
      await signupLink.click();
    }
    
    // Fill signup form with test data
    await page.getByPlaceholder(/email/i).fill(`test-${Date.now()}@example.com`);
    await page.getByPlaceholder(/password/i).fill('TestPassword123!');
    
    // Submit
    await page.getByRole('button', { name: /sign up|create account/i }).click();
    
    // Should show confirmation message
    await expect(page.getByText(/check.*email|confirmation|verify/i)).toBeVisible({ timeout: 10000 });
  });
});
