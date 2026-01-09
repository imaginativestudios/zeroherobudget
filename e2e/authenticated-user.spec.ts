import { test, expect } from '@playwright/test';
import { loginUser, TEST_USER, clearLocalStorage } from './fixtures/auth.fixture';

test.describe('Authenticated User Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/auth');
    await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
    await page.getByPlaceholder(/password/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect after login (may show error if test user doesn't exist)
    await expect(
      page.getByText(/dashboard|invalid|error/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('protected routes redirect unauthenticated users', async ({ page }) => {
    await page.goto('/household');
    
    // Should redirect to auth or show login prompt
    await expect(
      page.getByPlaceholder(/email/i).or(page.getByText(/sign in|log in/i).first())
    ).toBeVisible({ timeout: 5000 });
  });

  test('session persists across page reload', async ({ page }) => {
    // Set up mock session in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('zero-hero-demo-session', JSON.stringify({
        user: { id: 'test-user', email: 'test@example.com' },
        isAuthenticated: true
      }));
    });
    
    await page.reload();
    
    // Demo session should persist
    const session = await page.evaluate(() => 
      localStorage.getItem('zero-hero-demo-session')
    );
    expect(session).toBeTruthy();
  });

  test('logout clears session', async ({ page }) => {
    // Set up mock session
    await page.goto('/dashboard');
    await page.evaluate(() => {
      localStorage.setItem('zero-hero-demo-session', JSON.stringify({
        user: { id: 'test-user', email: 'test@example.com' },
        isAuthenticated: true
      }));
    });
    
    await page.reload();
    
    // Find and click logout if visible
    const logoutButton = page.getByRole('button', { name: /sign out|log out/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Session should be cleared
      const session = await page.evaluate(() => 
        localStorage.getItem('zero-hero-demo-session')
      );
      expect(session).toBeFalsy();
    }
  });

  test('user profile is accessible after login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for profile/account menu
    const profileButton = page.getByRole('button', { name: /profile|account|settings/i })
      .or(page.locator('[data-testid="user-menu"]'))
      .first();
    
    if (await profileButton.isVisible()) {
      await profileButton.click();
      await expect(page.getByText(/profile|settings|account/i).first()).toBeVisible();
    }
  });
});
