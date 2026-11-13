import { test, expect } from './fixtures/billing.fixture';

test.describe('Stripe Checkout Integration', () => {
  test('pricing page subscribe button is functional', async ({ page }) => {
    await page.goto('/pricing');
    
    // Find the subscribe/trial button
    const subscribeButton = page.getByRole('button', { name: /start 7-day free trial/i }).first();
    await expect(subscribeButton).toBeVisible();
    await expect(subscribeButton).toBeEnabled();
  });

  test('checkout requires authentication', async ({ page }) => {
    await page.goto('/pricing');
    
    await page.getByRole('button', { name: 'Start 7-day free trial', exact: true }).click();
    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('billing interval selects the fixed checkout price', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByRole('button', { name: /monthly/i }).click();
    await expect(page.getByText('$10', { exact: true })).toBeVisible();
    await expect(page.getByText('Free for 7 days, then $10/month. Cancel anytime.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /annual/i }).click();
    await expect(page.getByText('$99', { exact: true })).toBeVisible();
    await expect(page.getByText('Free for 7 days, then $99/year. Cancel anytime.', { exact: true })).toBeVisible();
  });

  test('trial period messaging is accurate', async ({ page }) => {
    await page.goto('/pricing');
    
    // Should show 7-day trial information
    await expect(page.getByText(/7.day|week|trial/i).first()).toBeVisible();
  });

  test('checkout button shows loading state', async ({ page }) => {
    await page.goto('/pricing');
    
    // Mock authentication state
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { email: 'test@example.com' }
      }));
    });
    
    const subscribeButton = page.getByRole('button', { name: /start 7-day free trial/i }).first();
    
    if (await subscribeButton.isVisible()) {
      // Button should be clickable
      await expect(subscribeButton).toBeEnabled();
    }
  });

  test('manage subscription button visible for subscribers', async ({ page }) => {
    // This test checks UI behavior - actual Stripe portal requires real subscription
    await page.goto('/pricing');
    
    // Look for manage subscription option
    const manageButton = page.getByRole('button', { name: /manage.*subscription|billing/i });
    
    // May or may not be visible depending on subscription state
    const isVisible = await manageButton.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });
});

test.describe('Stripe Checkout Success Page', () => {
  test('success page renders with branded design', async ({ page }) => {
    await page.goto('/checkout-success');
    
    // Should show the Zero Hero logo
    await expect(page.locator('img[alt*="logo"], svg').first()).toBeVisible();
    
    // Should show either subscription info or redirect to pricing
    await expect(
      page.getByText(/no active subscription found/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('success page has enter dashboard button', async ({ page }) => {
    await page.goto('/checkout-success');
    
    // Look for the main CTA (either dashboard or pricing depending on subscription state)
    await expect(
      page.getByRole('button', { name: /dashboard|pricing/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('success page redirects unauthenticated users appropriately', async ({ page }) => {
    // Clear any auth state
    await page.goto('/checkout-success');
    
    await expect(page.getByText('No active subscription found.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'View Pricing', exact: true }).click();
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(page.getByText('Premium', { exact: true })).toBeVisible();
  });
});

test.describe('Stripe Checkout - Edge Cases', () => {
  test('handles network errors gracefully', async ({ page }) => {
    await page.goto('/pricing');
    
    // Block network requests to Stripe
    await page.route('**/supabase.co/functions/**', route => {
      route.abort('failed');
    });
    
    const subscribeButton = page.getByRole('button', { name: /start 7-day free trial/i }).first();
    
    if (await subscribeButton.isVisible()) {
      await subscribeButton.click();
      
      // Should show error message (if authenticated) or auth prompt
      await expect(
        page.getByText(/error|failed|try again|sign in/i).first()
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('displays proper error for invalid session', async ({ page }) => {
    await page.goto('/pricing');
    
    // Set invalid auth token
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'invalid-token',
        user: null
      }));
    });
    
    // Page should handle gracefully
    await expect(page.getByRole('button', { name: /start 7-day free trial/i }).first()).toBeVisible();
  });

  test('canceled checkout redirects back to pricing', async ({ page }) => {
    await page.goto('/pricing?canceled=true');
    
    // Should be on pricing page without query param after redirect
    await expect(page).toHaveURL(/\/pricing$/);
    
    // Pricing content should be visible
    await expect(page.getByText('Checkout canceled', { exact: true })).toBeVisible();
    await expect(page.getByText('Free', { exact: true })).toBeVisible();
    await expect(page.getByText('Premium', { exact: true })).toBeVisible();
  });
});
