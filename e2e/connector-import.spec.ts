import { test, expect } from '@playwright/test';
import { seedDemoData } from './fixtures/demo.fixture';

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
    await expect(page.getByText(/TRADER JOES/i)).toBeVisible();
    await expect(page.getByText(/AMAZON PRIME/i)).toBeVisible();
    await expect(page.getByText(/PAYROLL DEPOSIT/i)).toBeVisible();
    await expect(page.getByText(/STARBUCKS/i)).toBeVisible();
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
    await page.evaluate(() => {
      const existing = [{
        id: 'existing-1',
        date: '2026-01-15',
        description: 'TRADER JOES #321 GROCERY',
        amount: 45.20,
        category: 'Food',
        account_id: 'default-checking',
        flow: 'out'
      }];
      localStorage.setItem('zero-hero-local-transactions', JSON.stringify(existing));
    });
    await page.reload();
    
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate((data) => {
      navigator.clipboard.writeText(JSON.stringify(data));
    }, MOCK_CONNECTOR_DATA);
    
    await page.getByRole('button', { name: /paste from connector/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Should show 3 new (1 duplicate skipped)
    await expect(page.getByText('3 New')).toBeVisible();
    await expect(page.getByText(/1 Duplicate.*skipped/i)).toBeVisible();
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
    
    // Should show progress bar
    await expect(page.getByText(/uploading intel/i)).toBeVisible({ timeout: 2000 });
    
    // Modal should close after import
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
    
    // Success toast should appear
    await expect(page.getByText(/successfully imported 4 transactions/i)).toBeVisible();
    
    // Verify transactions are in localStorage
    const stored = await page.evaluate(() => 
      localStorage.getItem('zero-hero-local-transactions')
    );
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
    
    // No transactions should be saved
    const stored = await page.evaluate(() => 
      localStorage.getItem('zero-hero-local-transactions')
    );
    expect(stored).toBeNull();
  });
});

test.describe('AI Categorization in Connector Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
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
    
    // Income should show as Income category and have + sign
    await expect(page.getByText('Income')).toBeVisible();
    await expect(page.getByText(/\+/)).toBeVisible();
  });

  test('can change category using dropdown', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate((data) => {
      navigator.clipboard.writeText(JSON.stringify(data));
    }, [{ date: '01/15/2026', amount: -50, raw_text: 'GROCERY STORE' }]);
    
    await page.getByRole('button', { name: /paste from connector/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Click on category badge to open dropdown
    const categoryBadge = page.getByText('Uncategorized').first();
    await categoryBadge.click();
    
    // Select "Food" category
    await page.getByText('Food').click();
    
    // Category should update
    await expect(page.getByText('Food')).toBeVisible();
  });
});

test.describe('Connector Setup Page Access', () => {
  test('Bank Connector link is visible in sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for Tools section in sidebar
    await expect(page.getByText('Tools')).toBeVisible();
    
    // Bank Connector link should be present
    const connectorLink = page.getByRole('link', { name: /bank connector/i });
    await expect(connectorLink).toBeVisible();
  });

  test('can navigate to Connector setup page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click Bank Connector link
    await page.getByRole('link', { name: /bank connector/i }).click();
    
    // Should navigate to connector setup page
    await expect(page).toHaveURL('/settings/connector');
    await expect(page.getByText('Build Your Connector')).toBeVisible();
  });

  test('Connector setup page displays instructions', async ({ page }) => {
    await page.goto('/settings/connector');
    
    // Check key content is visible
    await expect(page.getByText("Hero's Privacy Oath")).toBeVisible();
    await expect(page.getByText('Setup Instructions')).toBeVisible();
    await expect(page.getByText('manifest.json')).toBeVisible();
    await expect(page.getByText('content.js')).toBeVisible();
    await expect(page.getByText('popup.html')).toBeVisible();
  });

  test('can copy code blocks from setup page', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/settings/connector');
    
    // Find the first Copy button
    const copyButton = page.getByRole('button', { name: /copy/i }).first();
    await copyButton.click();
    
    // Should show success state
    await expect(page.getByText(/copied/i)).toBeVisible();
    
    // Verify clipboard contains JSON
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toContain('manifest_version');
  });
});
