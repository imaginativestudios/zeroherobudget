import { test as base, expect } from '@playwright/test';

// Extend base test with authentication fixture
export const test = base.extend<{ authenticatedPage: typeof base }>({
  // This fixture sets up a mock authenticated state
  authenticatedPage: async ({ page }, use) => {
    // Navigate to auth page and perform login
    // Note: For real E2E tests, use test accounts or mock auth
    await page.goto('/auth');
    await use(page);
  },
});

// Test user credentials (use environment variables in CI)
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'e2e-test@zerohero.test',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
};

// Helper to login
export async function loginUser(page: any, email?: string, password?: string) {
  await page.goto('/auth');
  await page.getByPlaceholder(/email/i).fill(email || TEST_USER.email);
  await page.getByPlaceholder(/password/i).fill(password || TEST_USER.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait for redirect to dashboard
  await page.waitForURL(/dashboard|\/$/);
}

// Helper to logout
export async function logoutUser(page: any) {
  // Find and click logout/signout button
  const logoutButton = page.getByRole('button', { name: /sign out|log out|logout/i });
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  }
}

// Helper to clear test data.
//
// Navigates first: localStorage belongs to an origin, and a fresh page starts
// on about:blank, which has none. Calling evaluate() before any goto() throws
// `SecurityError: Failed to read the 'localStorage' property from 'Window':
// Access is denied for this document` -- which is what failed all five tests in
// authenticated-user.spec.ts, since its beforeEach called this helper first.
export async function clearLocalStorage(page: any) {
  if (new URL(page.url()).protocol === 'about:') {
    await page.goto('/');
  }
  await page.evaluate(() => localStorage.clear());
}

export { expect };
