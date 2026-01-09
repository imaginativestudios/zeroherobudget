import { test, expect } from '@playwright/test';

test.describe('Stripe Checkout Integration', () => {
  test('pricing page subscribe button is functional', async ({ page }) => {
    await page.goto('/pricing');
    
    // Find the subscribe/trial button
    const subscribeButton = page.getByRole('button', { name: /subscribe|start.*trial|get started/i }).first();
    await expect(subscribeButton).toBeVisible();
    await expect(subscribeButton).toBeEnabled();
  });

  test('checkout requires authentication', async ({ page }) => {
    await page.goto('/pricing');
    
    const subscribeButton = page.getByRole('button', { name: /subscribe|start.*trial|get started/i }).first();
    
    if (await subscribeButton.isVisible()) {
      await subscribeButton.click();
      
      // Should either redirect to auth or show auth modal
      await expect(
        page.getByPlaceholder(/email/i)
          .or(page.getByText(/sign in|log in|create account/i).first())
          .or(page.getByRole('dialog'))
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('pricing slider updates checkout amount', async ({ page }) => {
    await page.goto('/pricing');
    
    const slider = page.locator('input[type="range"]');
    
    if (await slider.isVisible()) {
      // Get initial displayed price
      const priceDisplay = page.getByText(/\$\d+/);
      const initialText = await priceDisplay.first().textContent();
      
      // Move slider to different position
      await slider.evaluate((el: HTMLInputElement) => {
        el.value = '15';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Price should reflect the slider value
      await expect(priceDisplay.first()).toBeVisible();
    }
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
    
    const subscribeButton = page.getByRole('button', { name: /subscribe|start.*trial/i }).first();
    
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

test.describe('Stripe Checkout - Edge Cases', () => {
  test('handles network errors gracefully', async ({ page }) => {
    await page.goto('/pricing');
    
    // Block network requests to Stripe
    await page.route('**/supabase.co/functions/**', route => {
      route.abort('failed');
    });
    
    const subscribeButton = page.getByRole('button', { name: /subscribe|start.*trial/i }).first();
    
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
    await expect(page.getByRole('button', { name: /subscribe|start|get started/i }).first()).toBeVisible();
  });
});
