import { test, expect } from '@playwright/test';
import { seedDemoData } from './fixtures/demo.fixture';

test.describe('Search indexing boundaries', () => {
  test('public debt strategy guide reaches the calculator without signing in', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Snowball vs. avalanche', exact: true }).click();
    await expect(page).toHaveURL(/\/learn\/debt-strategies$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://zeroherobudget.com/learn/debt-strategies');
    await page.getByRole('link', { name: 'Compare your payoff plans', exact: true }).click();
    await expect(page).toHaveURL(/\/debt-payoff-calculator$/);
    await expect(page.getByLabel('Balance', { exact: true })).toBeVisible();
  });

  for (const path of ['/auth', '/onboarding', '/reset-password', '/checkout-success', '/accept-invite/invalid', '/install', '/plaid-oauth', '/internal/coming-soon', '/internal/style-guide/icons', '/internal/style-guide/colors', '/internal/sitemap', '/internal/unavailable', '/internal/join-beta', '/admin', '/admin/login', '/admin/waitlist', '/admin/beta-codes']) {
    test(`${path} is excluded from indexing`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    });
  }

  for (const path of ['/dashboard', '/journey', '/budgets', '/debts', '/transactions', '/achievements', '/learn', '/data', '/reports', '/reports/income', '/reports/expenses', '/reports/available', '/reports/net-worth', '/reports/subscriptions', '/household', '/subscriptions', '/accounts', '/wealth', '/account', '/subscription', '/missing-page']) {
    test(`${path} stays excluded when the app layout renders`, async ({ page }) => {
      await seedDemoData(page);
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${path.replaceAll('/', '\\/')}$`));
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    });
  }

  test('public navigation clears the private-page exclusion', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    await page.evaluate(() => {
      // Use a same-origin history navigation, with the application's router
      // receiving its normal popstate event rather than loading a new document.
      history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  });

  test('home software offers include free and monthly Premium prices', async ({ page }) => {
    await page.goto('/');
    await expect.poll(async () => page.locator('script[type="application/ld+json"]').evaluateAll(nodes => {
      const application = nodes.map(node => JSON.parse(node.textContent ?? '{}')).find(data => data['@type'] === 'SoftwareApplication');
      return application?.offers;
    })).toEqual([
      { '@type': 'Offer', name: 'Free', price: 0, priceCurrency: 'USD' },
      {
        '@type': 'Offer', name: 'Premium', price: 10, priceCurrency: 'USD',
        priceSpecification: { '@type': 'UnitPriceSpecification', price: 10, priceCurrency: 'USD', unitText: 'month', billingDuration: 'P1M' },
      },
    ]);
  });
});