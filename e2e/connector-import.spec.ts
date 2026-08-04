import { test, expect } from '@playwright/test';
import { seedDemoData, readDemoTransactions, writeDemoTransactions } from './fixtures/demo.fixture';

// Sample connector data that mimics browser extension output
const MOCK_CONNECTOR_DATA = [
  { date: '01/15/2026', amount: -45.20, raw_text: 'TRADER JOES #321 GROCERY' },
  { date: '01/16/2026', amount: -89.99, raw_text: 'AMAZON PRIME MEMBERSHIP' },
  { date: '01/17/2026', amount: 1500.00, raw_text: 'PAYROLL DEPOSIT ACME CORP' },
  { date: '01/18/2026', amount: -12.50, raw_text: 'STARBUCKS COFFEE #1842' },
];

test.describe('Zero Hero Connector Import Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Seed demo data, then navigate. The previous `localStorage.clear()`
    // removed the key Layout.tsx uses to decide demo mode is active, so
    // /transactions redirected to /auth and all 16 tests below timed out
    // waiting for a page they never reached.
    await seedDemoData(page);
    await page.goto('/transactions');
  });

  test('shows error when clipboard is empty', async ({ page, context }) => {
    // Grant clipboard permissions and set empty clipboard
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate(() => navigator.clipboard.writeText(''));
    
    // Click Paste from Connector button
    const pasteButton = page.getByRole('button', { name: /paste from connector/i });
    await pasteButton.click();
    
    // Should show error toast
    await expect(page.getByText(/clipboard is empty/i)).toBeVisible({ timeout: 5000 });
  });

  test('shows error for invalid JSON in clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate(() => navigator.clipboard.writeText('not valid json'));
    
    const pasteButton = page.getByRole('button', { name: /paste from connector/i });
    await pasteButton.click();
    
    await expect(page.getByText(/does not contain valid transaction data/i)).toBeVisible();
  });

  test('opens review modal with parsed transactions', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Set mock connector data in clipboard
    await page.evaluate((data) => {
      navigator.clipboard.writeText(JSON.stringify(data));
    }, MOCK_CONNECTOR_DATA);
    
    // Click paste button
    const pasteButton = page.getByRole('button', { name: /paste from connector/i });
    await pasteButton.click();
    
    // Modal should open with "Scout Report Received" title
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Scout Report Received')).toBeVisible();
    
    // Should show count of new transactions
    await expect(page.getByText('4 New')).toBeVisible();
  });

  test('displays transaction list with descriptions', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate((data) => {
      navigator.clipboard.writeText(JSON.stringify(data));
    }, MOCK_CONNECTOR_DATA);
    
    await page.getByRole('button', { name: /paste from connector/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Check that transaction descriptions are visible
    await expect(page.getByText(/TRADER JOES/i).first()).toBeVisible();
    await expect(page.getByText(/AMAZON PRIME/i).first()).toBeVisible();
    await expect(page.getByText(/PAYROLL DEPOSIT/i).first()).toBeVisible();
    await expect(page.getByText(/STARBUCKS/i).first()).toBeVisible();
  });

  test('can select and deselect transactions', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate((data) => {
      navigator.clipboard.writeText(JSON.stringify(data));
    }, MOCK_CONNECTOR_DATA);
    
    await page.getByRole('button', { name: /paste from connector/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // All should be selected by default
    await expect(page.getByText('4 of 4 selected')).toBeVisible();
    
    // Click "Clear" to deselect all
    await page.getByRole('button', { name: /clear/i }).click();
    await expect(page.getByText('0 of 4 selected')).toBeVisible();
    
    // Click "Select All" to reselect
    await page.getByRole('button', { name: /select all/i }).click();
    await expect(page.getByText('4 of 4 selected')).toBeVisible();
  });

  test('detects and skips duplicate transactions', async ({ page, context }) => {
    // Pre-populate with existing transaction
    // Seed the duplicate under the key the app actually reads.
    await writeDemoTransactions(page, [{
      id: 'existing-1',
      date: '2026-01-15',
      // Must match what the app STORES, not the raw bank text. Incoming rows
      // are keyed on extractDescription(), which strips '#321', giving
      // 'traderjoesgrocery'. Seeding the raw text yields 'traderjoes321grocery'
      // and the duplicate is never recognised.
      description: 'TRADER JOES GROCERY',
      amount: 45.20,
      category: 'Food',
      account_id: 'default-checking',
      flow: 'out'
    }]);
    await page.reload();
    // Wait for the reloaded page to be interactive. Without this the clipboard
    // write and click race the reload, the modal never opens, and the failure
    // surfaces confusingly as "'3 New' not found".
    await expect(page.getByRole('button', { name: /paste from connector/i })).toBeVisible();

    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate((data) => {
      navigator.clipboard.writeText(JSON.stringify(data));
    }, MOCK_CONNECTOR_DATA);
    
    await page.getByRole('button', { name: /paste from connector/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Should show 3 new (1 duplicate skipped)
    await expect(page.getByText('3 New')).toBeVisible();
    // .first(): the modal shows the duplicate count in both a badge and an
    // expandable summary row, so the bare match resolves to 2 elements.
    await expect(page.getByText(/1 Duplicate.*skipped/i).first()).toBeVisible();
  });

  test('can confirm import of selected transactions', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate((data) => {
      navigator.clipboard.writeText(JSON.stringify(data));
    }, MOCK_CONNECTOR_DATA);
    
    await page.getByRole('button', { name: /paste from connector/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Click Confirm Import
    await page.getByRole('button', { name: /confirm import/i }).click();
    
    // NOTE: no assertion on the "uploading intel" progress bar. It is a
    // transient state that can complete before Playwright samples for it, which
    // made this test flaky (observed failing 1 run in 2). Asserting on the
    // outcome below is deterministic; asserting on a spinner is a race.

    // Modal should close after import
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
    
    // Success toast should appear
    await expect(page.getByText(/successfully imported 4 transactions/i)).toBeVisible();
    
    // Verify transactions are in localStorage. The app keys by user id
    // (`${DEMO_USER_ID}_transactions` in demo mode); the literal previously
    // used here is a key nothing ever writes, so this always read null.
    const stored = JSON.stringify(await readDemoTransactions(page));
    expect(stored).toContain('TRADER JOES');
    expect(stored).toContain('AMAZON PRIME');
  });

  test('cancel button closes modal without importing', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate((data) => {
      navigator.clipboard.writeText(JSON.stringify(data));
    }, MOCK_CONNECTOR_DATA);
    
    await page.getByRole('button', { name: /paste from connector/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Click Cancel
    await page.getByRole('button', { name: /cancel/i }).click();
    
    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Nothing from the clipboard should have been imported. Demo mode seeds a
    // transaction list, so assert the imported merchants are absent rather
    // than that storage is empty.
    const stored = JSON.stringify(await readDemoTransactions(page));
    expect(stored).not.toContain('TRADER JOES');
    expect(stored).not.toContain('STARBUCKS COFFEE');
  });
});

test.describe('AI Categorization in Connector Import', () => {
  test.beforeEach(async ({ page }) => {
    // Same fix as the block above: localStorage.clear() removed the demo-mode
    // key, so /transactions redirected to /auth and every test here timed out.
    await seedDemoData(page);
    await page.goto('/transactions');
  });

  test('AI Categorize button is visible in modal', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate((data) => {
      navigator.clipboard.writeText(JSON.stringify(data));
    }, [{ date: '01/15/2026', amount: -50, raw_text: 'TEST GROCERY STORE' }]);
    
    await page.getByRole('button', { name: /paste from connector/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // AI Categorize button should be present
    const aiButton = page.getByRole('button', { name: /ai categorize/i });
    await expect(aiButton).toBeVisible();
  });

  test('category badges are displayed for transactions', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate((data) => {
      navigator.clipboard.writeText(JSON.stringify(data));
    }, [{ date: '01/15/2026', amount: -50, raw_text: 'GROCERY STORE' }]);
    
    await page.getByRole('button', { name: /paste from connector/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Default category badge should be visible (Uncategorized for expenses)
    await expect(page.getByText('Uncategorized')).toBeVisible();
  });

  test('income transactions show Income category by default', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate((data) => {
      navigator.clipboard.writeText(JSON.stringify(data));
    }, [{ date: '01/17/2026', amount: 1500.00, raw_text: 'PAYROLL DEPOSIT' }]);
    
    await page.getByRole('button', { name: /paste from connector/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Scope to the dialog: 'Income' and '+' also appear in the transactions
    // table behind the modal, so an unscoped match resolved to 3 elements and
    // tripped strict mode rather than finding a real problem.
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Income').first()).toBeVisible();
    await expect(dialog.getByText(/\+/).first()).toBeVisible();
  });

  test('can change category using dropdown', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate((data) => {
      navigator.clipboard.writeText(JSON.stringify(data));
    }, [{ date: '01/15/2026', amount: -50, raw_text: 'GROCERY STORE' }]);
    
    await page.getByRole('button', { name: /paste from connector/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Scope to the dialog. 'Food' is a category name that also appears
    // throughout the transactions table behind the modal -- an unscoped match
    // resolved to 11 elements and tripped strict mode.
    const dialog = page.getByRole('dialog');
    await dialog.getByText('Uncategorized').first().click();

    // 'Groceries', not 'Food'. Food is a GROUP heading in categoryRegistry, not
    // a selectable category -- the popover offers Groceries, Restaurants /
    // Takeout, Coffee / Snacks under it. The old assertion named a category
    // that has never been selectable.
    //
    // Options are <Button>s inside a Popover (no 'option'/'menuitem' roles),
    // portalled outside the dialog, so this is page-scoped with an exact match.
    // Wait for the popover to actually render before clicking. Without this the
    // click races the Popover open animation and times out intermittently.
    const groceries = page.getByRole('button', { name: 'Groceries', exact: true }).first();
    await expect(groceries).toBeVisible();
    await groceries.click();

    await expect(dialog.getByText('Groceries').first()).toBeVisible();
  });
});

// The 'Connector Setup Page Access' describe block was removed here.
//
// It covered src/pages/ConnectorSetup.tsx, the sidebar "Tools" section and the
// "Bank Connector" link -- all deleted deliberately in 53bb014 "Remove Bank
// Connector page" (2026-03-09), which dropped 635 lines including
// ConnectorSetup.tsx and lib/extensionCode.ts. Nothing named "Bank Connector",
// "Tools" or "connector" remains in src/ or the router.
//
// The tests outlived the feature by five months and could never pass again.
// They were invisible because the CI gate reported zero failures regardless.
//
// The import flow itself is alive and still covered above: the "Paste from
// Connector" button exists at src/pages/Transactions.tsx:396.
