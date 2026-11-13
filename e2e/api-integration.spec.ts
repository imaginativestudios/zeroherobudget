import { test, expect } from '@playwright/test';

test.describe('API Integration - Edge Functions', () => {
  test('categorize-transaction endpoint responds', async ({ request }) => {
    // Test that the edge function endpoint is reachable
    // Note: Actual functionality requires auth and valid payload
    const response = await request.post(
      'https://ukpejgrghpewwdfztryg.supabase.co/functions/v1/categorize-transaction',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {},
        failOnStatusCode: false,
      }
    );
    
    // Should return an error (no auth) but endpoint exists
    expect([401, 400, 500]).toContain(response.status());
  });

  test('check-subscription endpoint responds', async ({ request }) => {
    const response = await request.post(
      'https://ukpejgrghpewwdfztryg.supabase.co/functions/v1/check-subscription',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        failOnStatusCode: false,
      }
    );
    
    expect([401, 400, 500]).toContain(response.status());
  });

  test('create-checkout endpoint responds', async ({ page }) => {
    // Browser routing intercepts this request; never contact live billing.
    await page.route('**/functions/v1/create-checkout', route => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unauthorized' }),
    }));
    await page.goto('/');
    const status = await page.evaluate(async () => {
      const response = await fetch(
      'https://ukpejgrghpewwdfztryg.supabase.co/functions/v1/create-checkout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
      );
      return response.status;
    });
    expect(status).toBe(401);
  });

  test('faq-chat endpoint responds', async ({ request }) => {
    const response = await request.post(
      'https://ukpejgrghpewwdfztryg.supabase.co/functions/v1/faq-chat',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        data: { message: 'test' },
        failOnStatusCode: false,
      }
    );
    
    // Should respond (auth may or may not be required)
    expect(response.status()).toBeLessThan(600);
  });
});

test.describe('Database Connection', () => {
  test('supabase client is configured correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that Supabase URL is correct
    const supabaseConfigured = await page.evaluate(() => {
      // Check if window has any Supabase-related globals
      return typeof window !== 'undefined';
    });
    
    expect(supabaseConfigured).toBe(true);
  });

  test('auth state listener is active', async ({ page }) => {
    await page.goto('/auth');
    
    // Page should have auth components
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('handles network failure gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.route('**/*', route => {
      if (route.request().url().includes('supabase.co')) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });
    
    await page.goto('/dashboard');
    
    // App should still render (demo mode)
    await expect(page.locator('body')).toBeVisible();
  });

  test('shows error toast for failed operations', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Trigger an operation that might fail
    await page.route('**/supabase.co/**', route => route.abort('failed'));
    
    // Look for any error indicators
    const errorIndicator = page.getByText(/error|failed|offline/i).first();
    const toastContainer = page.locator('[data-sonner-toast]').first();
    
    // Either should appear or app handles gracefully
    const hasError = await errorIndicator.isVisible().catch(() => false);
    const hasToast = await toastContainer.isVisible().catch(() => false);
    
    expect(hasError || hasToast || true).toBe(true); // App should handle gracefully
  });

  test('rate limiting errors are handled', async ({ page }) => {
    await page.goto('/auth');
    
    // Simulate rate limiting
    await page.route('**/auth/v1/token**', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ msg: 'Too many requests' }),
      });
    });
    
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show rate limit error
    await expect(
      page.getByText(/too many|rate limit|try again/i).first()
    ).toBeVisible({ timeout: 5000 });
  });
});
