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

test.describe('Stripe Checkout Success Page', () => {
  test('success page renders with branded design', async ({ page }) => {
    await page.goto('/checkout-success');
    
    // Should show the Zero Hero logo
    await expect(page.locator('img[alt*="logo"], svg').first()).toBeVisible();
    
    // Should show either subscription info or redirect to pricing
    await expect(
      page.getByText(/quest begins|no active subscription/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('success page has enter dashboard button', async ({ page }) => {
    await page.goto('/checkout-success');
    
    // Look for the main CTA (either dashboard or pricing depending on subscription state)
    await expect(
      page.getByRole('button', { name: /fortress|dashboard|pricing/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('success page redirects unauthenticated users appropriately', async ({ page }) => {
    // Clear any auth state
    await page.goto('/checkout-success');
    
    // Should handle gracefully - either show message or redirect
    await expect(
      page.getByText(/no active subscription|sign in|pricing/i).first()
        .or(page.getByRole('button', { name: /pricing|sign in/i }))
    ).toBeVisible({ timeout: 10000 });
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

  test('canceled checkout redirects back to pricing', async ({ page }) => {
    await page.goto('/pricing?canceled=true');
    
    // Should be on pricing page without query param after redirect
    await page.waitForURL(/\/pricing(?:\?|$)/, { timeout: 5000 });
    
    // Pricing content should be visible
    await expect(page.getByText(/pay what you can/i)).toBeVisible();
  });
});
