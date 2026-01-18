import { test, expect } from './fixtures/visual.fixture';

test.describe('Visual Regression - Public Pages', () => {
  test('Landing page', async ({ visualPage }) => {
    await visualPage.goto('/');
    await visualPage.compareScreenshot('landing-page', {
      hideSelectors: ['[data-testid="dynamic-date"]'],
    });
  });

  test('Auth page - Login tab', async ({ visualPage }) => {
    await visualPage.goto('/auth');
    await visualPage.compareScreenshot('auth-login');
  });

  test('Auth page - Signup tab', async ({ visualPage }) => {
    await visualPage.goto('/auth');
    await visualPage.getByRole('tab', { name: /sign up/i }).click();
    await visualPage.waitForPageReady();
    await visualPage.compareScreenshot('auth-signup');
  });

  test('Pricing page', async ({ visualPage }) => {
    await visualPage.goto('/pricing');
    await visualPage.compareScreenshot('pricing-page');
  });

  test('Legal page - Privacy tab', async ({ visualPage }) => {
    await visualPage.goto('/legal');
    await visualPage.compareScreenshot('legal-privacy');
  });

  test('Legal page - Terms tab', async ({ visualPage }) => {
    await visualPage.goto('/legal');
    await visualPage.getByRole('tab', { name: /terms/i }).click();
    await visualPage.waitForPageReady();
    await visualPage.compareScreenshot('legal-terms');
  });

  test('404 Not Found page', async ({ visualPage }) => {
    await visualPage.goto('/this-page-does-not-exist');
    await visualPage.compareScreenshot('404-page');
  });

  test('Help & Support page', async ({ visualPage }) => {
    await visualPage.goto('/help');
    await visualPage.compareScreenshot('help-page');
  });

  test('Install page', async ({ visualPage }) => {
    await visualPage.goto('/install');
    await visualPage.compareScreenshot('install-page');
  });

  test('Data Privacy FAQ page', async ({ visualPage }) => {
    await visualPage.goto('/data-privacy');
    await visualPage.compareScreenshot('data-privacy-page');
  });
});

test.describe('Visual Regression - App Pages (Demo Mode)', () => {
  test.beforeEach(async ({ visualPage }) => {
    // Load demo data by visiting explore-demo
    await visualPage.goto('/explore-demo');
    await visualPage.waitForLoadState('networkidle');
    await visualPage.waitForTimeout(1000); // Wait for demo data to load
  });

  test('Dashboard page', async ({ visualPage }) => {
    await visualPage.goto('/dashboard');
    await visualPage.compareScreenshot('dashboard', {
      maskSelectors: [
        '[data-testid="current-date"]',
        '[data-testid="last-updated"]',
      ],
    });
  });

  test('Budget page', async ({ visualPage }) => {
    await visualPage.goto('/budget');
    await visualPage.compareScreenshot('budget-page');
  });

  test('Transactions page', async ({ visualPage }) => {
    await visualPage.goto('/transactions');
    await visualPage.compareScreenshot('transactions-page', {
      maskSelectors: ['[data-testid="transaction-date"]'],
    });
  });

  test('Debt Snowball page', async ({ visualPage }) => {
    await visualPage.goto('/debt');
    await visualPage.compareScreenshot('debt-snowball');
  });

  test('Reports page', async ({ visualPage }) => {
    await visualPage.goto('/reports');
    await visualPage.compareScreenshot('reports-page');
  });

  test('Subscriptions page', async ({ visualPage }) => {
    await visualPage.goto('/subscriptions');
    await visualPage.compareScreenshot('subscriptions-page');
  });

  test('Achievements page', async ({ visualPage }) => {
    await visualPage.goto('/achievements');
    await visualPage.compareScreenshot('achievements-page');
  });

  test('Financial Tips page', async ({ visualPage }) => {
    await visualPage.goto('/tips');
    await visualPage.compareScreenshot('financial-tips');
  });

  test('Account Settings page', async ({ visualPage }) => {
    await visualPage.goto('/account');
    await visualPage.compareScreenshot('account-settings');
  });

  test('Data Management page', async ({ visualPage }) => {
    await visualPage.goto('/data');
    await visualPage.compareScreenshot('data-management');
  });

  test('Connector Setup page', async ({ visualPage }) => {
    await visualPage.goto('/settings/connector');
    await visualPage.compareScreenshot('connector-setup');
  });
});

test.describe('Visual Regression - Empty States', () => {
  test('Empty Dashboard', async ({ visualPage }) => {
    // Clear localStorage to show empty state
    await visualPage.goto('/');
    await visualPage.evaluate(() => localStorage.clear());
    await visualPage.goto('/dashboard');
    await visualPage.compareScreenshot('dashboard-empty');
  });

  test('Empty Transactions', async ({ visualPage }) => {
    await visualPage.goto('/');
    await visualPage.evaluate(() => localStorage.clear());
    await visualPage.goto('/transactions');
    await visualPage.compareScreenshot('transactions-empty');
  });

  test('Empty Budget', async ({ visualPage }) => {
    await visualPage.goto('/');
    await visualPage.evaluate(() => localStorage.clear());
    await visualPage.goto('/budget');
    await visualPage.compareScreenshot('budget-empty');
  });
});

test.describe('Visual Regression - Modal & Dialog States', () => {
  test('Auth modal from landing', async ({ visualPage }) => {
    await visualPage.goto('/');
    // Look for sign in button and click it
    const signInButton = visualPage.getByRole('button', { name: /sign in|login|get started/i }).first();
    if (await signInButton.isVisible()) {
      await signInButton.click();
      await visualPage.waitForPageReady();
      await visualPage.compareScreenshot('auth-modal');
    }
  });
});

test.describe('Visual Regression - Responsive Tables', () => {
  test.beforeEach(async ({ visualPage }) => {
    await visualPage.goto('/explore-demo');
    await visualPage.waitForLoadState('networkidle');
    await visualPage.waitForTimeout(1000);
  });

  test('Transactions table horizontal scroll', async ({ visualPage }) => {
    await visualPage.goto('/transactions');
    // Verify table doesn't overflow viewport
    const hasHorizontalOverflow = await visualPage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
    await visualPage.compareScreenshot('transactions-table');
  });

  test('Debt page Payment Schedule tab', async ({ visualPage }) => {
    await visualPage.goto('/debt');
    await visualPage.getByRole('tab', { name: /payment schedule/i }).click();
    await visualPage.waitForPageReady();
    await visualPage.compareScreenshot('debt-payment-schedule');
  });

  test('Debt page Compare Strategies tab', async ({ visualPage }) => {
    await visualPage.goto('/debt');
    await visualPage.getByRole('tab', { name: /compare/i }).click();
    await visualPage.waitForPageReady();
    await visualPage.compareScreenshot('debt-compare-strategies');
  });
});

test.describe('Visual Regression - Form States', () => {
  test('Auth form validation error', async ({ visualPage }) => {
    await visualPage.goto('/auth');
    await visualPage.getByRole('button', { name: /sign in|login/i }).click();
    await visualPage.waitForPageReady();
    await visualPage.compareScreenshot('auth-validation-error');
  });
});

test.describe('Visual Regression - Navigation', () => {
  test('Mobile navigation menu', async ({ visualPage }) => {
    // Only test on mobile viewport
    const viewport = visualPage.viewportSize();
    if (viewport && viewport.width < 768) {
      await visualPage.goto('/dashboard');
      await visualPage.waitForLoadState('networkidle');
      
      // Open mobile menu
      const menuButton = visualPage.getByRole('button', { name: /menu|toggle/i }).first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await visualPage.waitForPageReady();
        await visualPage.compareScreenshot('mobile-nav-open');
      }
    }
  });

  test('Sidebar expanded state', async ({ visualPage }) => {
    // Only test on desktop viewport
    const viewport = visualPage.viewportSize();
    if (viewport && viewport.width >= 1024) {
      await visualPage.goto('/explore-demo');
      await visualPage.waitForLoadState('networkidle');
      await visualPage.goto('/dashboard');
      await visualPage.compareScreenshot('sidebar-expanded');
    }
  });
});
