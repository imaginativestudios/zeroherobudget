import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Zero Hero/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('sign in opens the auth modal', async ({ page }) => {
    // Landing opens AuthModal in place (setAuthModalOpen(true)) rather than
    // routing to /auth, so asserting a URL change tested something the app has
    // never done. /auth still exists and is covered by the tests below.
    await page.goto('/landing');
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('auth page shows login and signup options', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.goto('/auth');
    await page.getByRole('button', { name: /sign in/i }).click();
    expect(await page.getByLabel(/email/i).evaluate((input: HTMLInputElement) => input.validity.valueMissing && !input.validity.valid)).toBe(true);
    expect(await page.getByLabel(/password/i).evaluate((input: HTMLInputElement) => input.validity.valueMissing && !input.validity.valid)).toBe(true);
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('notanemail');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    expect(await page.getByLabel(/email/i).evaluate((input: HTMLInputElement) => input.validity.typeMismatch && !input.validity.valid)).toBe(true);
  });

  test('signup flow shows confirmation message', async ({ page }) => {
    let signupRequests = 0;
    await page.route('**/auth/v1/signup**', async route => {
      signupRequests++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'confirmation-test-user', email: 'confirmation@example.com', identities: [{ id: 'confirmation-identity', provider: 'email' }] }, session: null }),
      });
    });
    await page.goto('/auth');
    await page.getByRole('tab', { name: 'Sign Up', exact: true }).click();
    await page.getByLabel('First Name', { exact: true }).fill('Test');
    await page.getByLabel(/email/i).fill('confirmation@example.com');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: 'Create Account', exact: true }).click();
    await expect.poll(() => signupRequests).toBe(1);

    // Should show confirmation message
    await expect(page.getByText(/check.*email.*confirm/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Sign-out clears local data', () => {
  test.skip(!process.env.TEST_USER_EMAIL, 'TEST_USER_EMAIL not set');

  test('no user-prefixed localStorage keys remain after sign-out', async ({ page }) => {
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || '');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/dashboard|onboarding/);

    const uid = await page.evaluate(() => {
      const key = Object.keys(localStorage).find(k => /^sb-.*-auth-token$/.test(k));
      return key ? JSON.parse(localStorage.getItem(key)!).user?.id : null;
    });
    expect(uid).toBeTruthy();

    await page.getByRole('button', { name: /sign out|log out/i }).first().click();
    await expect.poll(() => page.evaluate(() =>
      Object.keys(localStorage).some(k => /^sb-.*-auth-token$/.test(k)))).toBe(false);

    const remaining = await page.evaluate(
      (id) => Object.keys(localStorage).filter(k => k.startsWith(id)),
      uid,
    );
    expect(remaining).toHaveLength(0);
  });
});
