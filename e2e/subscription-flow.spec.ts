import { test, expect } from './fixtures/billing.fixture';

test.describe('Subscription Flow', () => {
  test('pricing page displays Free and fixed-price Premium plans', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText('Free', { exact: true })).toBeVisible();
    await expect(page.getByText('$0', { exact: true })).toBeVisible();
    await expect(page.getByText('Premium', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /monthly/i }).click();
    await expect(page.getByText('$10', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /annual/i }).click();
    await expect(page.getByText('$99', { exact: true })).toBeVisible();
  });

  test('billing interval changes the displayed renewal amount', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByRole('button', { name: /monthly/i }).click();
    await expect(page.getByText('Free for 7 days, then $10/month. Cancel anytime.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /annual/i }).click();
    await expect(page.getByText('Free for 7 days, then $99/year. Cancel anytime.', { exact: true })).toBeVisible();
  });

  test('trial messaging is visible', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('button', { name: 'Start 7-day free trial', exact: true })).toBeVisible();
  });

  test('subscribe button requires authentication', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByRole('button', { name: 'Start 7-day free trial', exact: true }).click();
    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('free plan is available without checkout', async ({ page }) => {
    let checkoutRequests = 0;
    page.on('request', request => {
      if (request.url().includes('/functions/v1/create-checkout')) checkoutRequests++;
    });
    await page.goto('/pricing');
    await page.getByRole('button', { name: 'Start free', exact: true }).click();
    await expect(page).toHaveURL(/\/auth$/);
    expect(checkoutRequests).toBe(0);
  });
});
