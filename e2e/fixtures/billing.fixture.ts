import { test as base, expect } from '@playwright/test';

// Every billing request is intercepted before navigation, even if a test
// accidentally acquires a session. No test can create a live Stripe checkout.
export const test = base.extend<{ mockedBilling: void }>({
  mockedBilling: [async ({ context }, use) => {
    await context.route(/https:\/\/[^/]*(?:stripe\.com|pay\.zeroherobudget\.com)(?:\/|$)/, route => route.abort());
    await context.route('**/functions/v1/create-checkout**', route => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({ url: 'http://localhost:8080/checkout-success?session_id=mock-session' }),
    }));
    await context.route('**/functions/v1/customer-portal**', route => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({ url: 'http://localhost:8080/pricing' }),
    }));
    await use();
  }, { auto: true }],
});
export { expect };
