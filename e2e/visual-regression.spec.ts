import { test, expect } from './fixtures/visual.fixture';
import { seedDemoData, emptyDemoData } from './fixtures/demo.fixture';

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

  // '404 Not Found page' moved to the demo-mode block below. An unknown URL
  // matches the catch-all route *inside* Layout.tsx, so an unauthenticated
  // visitor is redirected to /auth and never sees NotFound at all. Captured
  // from here, the baseline named 404-page was byte-identical to auth-login --
  // and to the login-modal image from the first Linux batch.

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
    // Was: goto('/explore-demo') + a 1s sleep. No such route exists in
    // App.tsx, so this landed on NotFound inside the gated layout, redirected
    // to /auth, and every screenshot below photographed the login modal.
    // seedDemoData() calls the app's own loadDemoData() and throws if it did
    // not take, so the failure can no longer be silent.
    await seedDemoData(visualPage);
  });

  test('Dashboard page', async ({ visualPage }) => {
    await visualPage.gotoApp('/dashboard');
    await visualPage.compareScreenshot('dashboard', {
      maskSelectors: [
        '[data-testid="current-date"]',
        '[data-testid="last-updated"]',
      ],
    });
  });

  test('Budget page', async ({ visualPage }) => {
    await visualPage.gotoApp('/budgets');
    await visualPage.compareScreenshot('budget-page');
  });

  test('Transactions page', async ({ visualPage }) => {
    await visualPage.gotoApp('/transactions');
    await visualPage.compareScreenshot('transactions-page', {
      maskSelectors: ['[data-testid="transaction-date"]'],
    });
  });

  test('Debt Snowball page', async ({ visualPage }) => {
    await visualPage.gotoApp('/debts');
    await visualPage.compareScreenshot('debt-snowball');
  });

  test('Reports page', async ({ visualPage }) => {
    await visualPage.gotoApp('/reports');
    await visualPage.compareScreenshot('reports-page');
  });

  test('Subscriptions page', async ({ visualPage }) => {
    await visualPage.gotoApp('/subscriptions');
    await visualPage.compareScreenshot('subscriptions-page');
  });

  test('Achievements page', async ({ visualPage }) => {
    await visualPage.gotoApp('/achievements');
    await visualPage.compareScreenshot('achievements-page');
  });

  test('Financial Tips page', async ({ visualPage }) => {
    await visualPage.gotoApp('/learn');
    await visualPage.compareScreenshot('financial-tips');
  });

  test('Account Settings page', async ({ visualPage }) => {
    await visualPage.gotoApp('/account');
    await visualPage.compareScreenshot('account-settings');
  });

  test('Data Management page', async ({ visualPage }) => {
    await visualPage.gotoApp('/data');
    await visualPage.compareScreenshot('data-management');
  });

  test('404 Not Found page', async ({ visualPage }) => {
    await visualPage.gotoApp('/this-page-does-not-exist');
    await visualPage.compareScreenshot('404-page');
  });

  // 'Connector Setup page' (was /settings/connector) is deleted, not fixed.
  // There is no connector route in App.tsx -- connector import is a modal
  // inside /transactions (ConnectorReviewModal), and its behaviour is already
  // covered by connector-import.spec.ts at 12/12. The old test could only ever
  // have produced a baseline of a 404 or a login modal.
});

test.describe('Visual Regression - Empty States', () => {
  // Each of these was `localStorage.clear()` then navigate, which deletes the
  // key Layout.tsx uses to admit demo visitors -- so all three photographed the
  // login modal rather than an empty page. Seed first, then blank the data:
  // in demo mode "empty" means the keys exist and hold [], not that they are
  // gone.
  test.beforeEach(async ({ visualPage }) => {
    await seedDemoData(visualPage);
    await emptyDemoData(visualPage);
  });

  // fullPage on all three: at 320px the viewport-only capture is the header,
  // which looks the same whether or not there is data behind it. Empty
  // Transactions came back byte-identical to the seeded Transactions page.

  test('Empty Dashboard', async ({ visualPage }) => {
    await visualPage.gotoApp('/dashboard');
    await visualPage.compareScreenshot('dashboard-empty', { fullPage: true });
  });

  test('Empty Transactions', async ({ visualPage }) => {
    await visualPage.gotoApp('/transactions');
    await visualPage.compareScreenshot('transactions-empty', { fullPage: true });
  });

  test('Empty Budget', async ({ visualPage }) => {
    await visualPage.gotoApp('/budgets');
    await visualPage.compareScreenshot('budget-empty', { fullPage: true });
  });
});

test.describe('Visual Regression - Modal & Dialog States', () => {
  test('Auth modal from landing', async ({ visualPage }) => {
    // Was: goto('/') and screenshot only `if (await signInButton.isVisible())`.
    // '/' is the Coming Soon page, whose buttons are Explore Demo and Notify
    // Me, so the condition was always false and the test passed for months
    // without ever taking a screenshot. /landing is the page that has Sign In,
    // and the guard is gone so a missing button fails the test.
    await visualPage.goto('/landing');
    await visualPage.getByRole('button', { name: /sign in/i }).first().click();
    await visualPage.waitForPageReady();
    await visualPage.compareScreenshot('auth-modal');
  });
});

test.describe('Visual Regression - Responsive Tables', () => {
  test.beforeEach(async ({ visualPage }) => {
    await seedDemoData(visualPage);
  });

  test('Transactions table horizontal scroll', async ({ visualPage }) => {
    await visualPage.gotoApp('/transactions');
    // Verify table doesn't overflow viewport
    const hasHorizontalOverflow = await visualPage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
    // fullPage: the table is the subject and it sits below the fold on narrow
    // viewports, where this baseline was otherwise identical to the plain
    // transactions-page capture.
    await visualPage.compareScreenshot('transactions-table', { fullPage: true });
  });

  // Both of these clicked `getByRole('tab')` on /debts. That page has no tabs
  // and never has -- neither test has ever produced a baseline, and
  // continue-on-error in the snapshot workflow hid that they were failing.

  test('Debt page Payment Schedule', async ({ visualPage }) => {
    await visualPage.gotoApp('/debts');
    // A CollapsibleTrigger, collapsed by default -- a button, not a tab.
    await visualPage.getByRole('button', { name: /payment schedule/i }).click();
    await visualPage.waitForPageReady();
    await visualPage.compareScreenshot('debt-payment-schedule', { fullPage: true });
  });

  // 'Debt page Compare Strategies tab' is deleted. There is no compare-strategies
  // control on /debts: StrategyComparison renders inline and only when
  // `activeDebts.length > 0 && comparison.interestSaved > 0 && strategy !== 'Avalanche'`
  // (DebtSnowball.tsx:316). A baseline gated on that combination would be
  // flaky by construction. Coverage gap worth a deliberate decision rather
  // than a test that clicks something that does not exist.

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
  test.beforeEach(async ({ visualPage }) => {
    await seedDemoData(visualPage);
  });

  test('Mobile navigation menu', async ({ visualPage }) => {
    // The viewport guard is legitimate -- there is no mobile menu on desktop.
    // The inner `if (await menuButton.isVisible())` was not: without demo data
    // this page was the login modal, the button was never there, and the test
    // reported success having captured nothing. Skip explicitly by viewport,
    // then assert.
    const viewport = visualPage.viewportSize();
    test.skip(!viewport || viewport.width >= 768, 'Mobile viewports only');

    await visualPage.gotoApp('/dashboard');
    await visualPage.getByRole('button', { name: /menu|toggle/i }).first().click();
    await visualPage.waitForPageReady();
    await visualPage.compareScreenshot('mobile-nav-open');
  });

  // 'Sidebar expanded state' is deleted. It navigated to /dashboard and
  // screenshotted without expanding anything, so its baseline was byte-identical
  // to the dashboard baseline -- two names for one image. The desktop sidebar is
  // expanded by default and the dashboard capture already covers it. If a
  // collapsed/expanded distinction is worth testing, it needs a test that
  // actually toggles the control.
});
