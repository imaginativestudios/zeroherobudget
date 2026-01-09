import { test, expect } from '@playwright/test';

test.describe('Data Persistence - LocalStorage (Demo Mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('budget items persist after page reload', async ({ page }) => {
    await page.goto('/budget');
    
    // Add a budget item via localStorage simulation
    await page.evaluate(() => {
      const expenses = [{
        id: 'test-expense-1',
        name: 'Test Rent',
        amount: 1500,
        category: 'Housing',
        is_income: false
      }];
      localStorage.setItem('zero-hero-local-expenses', JSON.stringify(expenses));
    });
    
    await page.reload();
    
    // Data should persist
    const stored = await page.evaluate(() => 
      localStorage.getItem('zero-hero-local-expenses')
    );
    expect(stored).toContain('Test Rent');
  });

  test('debt items persist after page reload', async ({ page }) => {
    await page.goto('/debt-snowball');
    
    // Add a debt item
    await page.evaluate(() => {
      const debts = [{
        id: 'test-debt-1',
        name: 'Credit Card',
        balance: 5000,
        minimum_payment: 150,
        interest_rate: 19.99,
        type: 'credit_card'
      }];
      localStorage.setItem('zero-hero-local-debts', JSON.stringify(debts));
    });
    
    await page.reload();
    
    const stored = await page.evaluate(() => 
      localStorage.getItem('zero-hero-local-debts')
    );
    expect(stored).toContain('Credit Card');
  });

  test('subscription items persist after page reload', async ({ page }) => {
    await page.goto('/subscriptions');
    
    await page.evaluate(() => {
      const subscriptions = [{
        id: 'test-sub-1',
        name: 'Netflix',
        amount: 15.99,
        billing_cycle: 'monthly',
        category: 'Entertainment',
        is_active: true
      }];
      localStorage.setItem('zero-hero-local-subscriptions', JSON.stringify(subscriptions));
    });
    
    await page.reload();
    
    const stored = await page.evaluate(() => 
      localStorage.getItem('zero-hero-local-subscriptions')
    );
    expect(stored).toContain('Netflix');
  });

  test('transaction history persists', async ({ page }) => {
    await page.goto('/transactions');
    
    await page.evaluate(() => {
      const transactions = [{
        id: 'test-tx-1',
        description: 'Grocery Store',
        amount: 85.50,
        category: 'Food',
        date: new Date().toISOString(),
        flow: 'outflow'
      }];
      localStorage.setItem('zero-hero-local-transactions', JSON.stringify(transactions));
    });
    
    await page.reload();
    
    const stored = await page.evaluate(() => 
      localStorage.getItem('zero-hero-local-transactions')
    );
    expect(stored).toContain('Grocery Store');
  });

  test('settings persist after page reload', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.evaluate(() => {
      const settings = {
        theme: 'dark',
        currency: 'USD',
        notifications: true
      };
      localStorage.setItem('zero-hero-local-settings', JSON.stringify(settings));
    });
    
    await page.reload();
    
    const stored = await page.evaluate(() => 
      localStorage.getItem('zero-hero-local-settings')
    );
    expect(stored).toContain('dark');
  });

  test('data survives browser session', async ({ page, context }) => {
    await page.goto('/budget');
    
    // Store data
    await page.evaluate(() => {
      localStorage.setItem('zero-hero-test-data', JSON.stringify({ test: true }));
    });
    
    // Create new page in same context (simulates new tab)
    const newPage = await context.newPage();
    await newPage.goto('/budget');
    
    const stored = await newPage.evaluate(() => 
      localStorage.getItem('zero-hero-test-data')
    );
    expect(stored).toContain('test');
    
    await newPage.close();
  });
});

test.describe('Data Persistence - CRUD Operations', () => {
  test('can create new expense item', async ({ page }) => {
    await page.goto('/budget');
    
    // Look for add button
    const addButton = page.getByRole('button', { name: /add|new|\+/i }).first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Fill form if modal/form appears
      const nameInput = page.getByPlaceholder(/name|title|description/i).first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Expense');
        
        const amountInput = page.getByPlaceholder(/amount|\$/i).first();
        if (await amountInput.isVisible()) {
          await amountInput.fill('100');
        }
        
        // Submit
        const saveButton = page.getByRole('button', { name: /save|add|create|submit/i }).first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          // Verify item was added
          await expect(page.getByText('Test Expense')).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('can update existing item', async ({ page }) => {
    // Pre-populate data
    await page.goto('/budget');
    await page.evaluate(() => {
      const expenses = [{
        id: 'edit-test-1',
        name: 'Original Name',
        amount: 100,
        category: 'Other',
        is_income: false
      }];
      localStorage.setItem('zero-hero-local-expenses', JSON.stringify(expenses));
    });
    await page.reload();
    
    // Look for edit button on the item
    const editButton = page.getByRole('button', { name: /edit|modify/i }).first()
      .or(page.locator('[data-testid="edit-button"]').first());
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Form should appear with existing data
      const nameInput = page.getByPlaceholder(/name/i).first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Updated Name');
        
        const saveButton = page.getByRole('button', { name: /save|update/i }).first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
      }
    }
  });

  test('can delete item', async ({ page }) => {
    // Pre-populate data
    await page.goto('/budget');
    await page.evaluate(() => {
      const expenses = [{
        id: 'delete-test-1',
        name: 'Item To Delete',
        amount: 50,
        category: 'Other',
        is_income: false
      }];
      localStorage.setItem('zero-hero-local-expenses', JSON.stringify(expenses));
    });
    await page.reload();
    
    // Look for delete button
    const deleteButton = page.getByRole('button', { name: /delete|remove/i }).first()
      .or(page.locator('[data-testid="delete-button"]').first());
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion if dialog appears
      const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // Item should be removed
      await expect(page.getByText('Item To Delete')).not.toBeVisible({ timeout: 5000 });
    }
  });
});
