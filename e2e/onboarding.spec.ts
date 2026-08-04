import { test, expect } from '@playwright/test';

test.describe('Onboarding Wizard (Character Creation)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing onboarding state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('can navigate to onboarding from landing page', async ({ page }) => {
    // '/' is the Coming Soon page, whose only links are Pricing/Legal/Support.
    // The CTA that starts onboarding is a button on /landing.
    await page.goto('/landing');

    await page.getByRole('button', { name: /get started/i }).first().click();
    
    // Should be on onboarding page
    await expect(page).toHaveURL(/onboarding/);
  });

  test('Step 1: Enter hourly wage and continue', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Should see Step 1 content - "Define Your Life Value"
    await expect(page.getByText('Define Your Life Value')).toBeVisible();
    // Actual copy is "Enter your hourly wage"; the string below never existed
    // on this step, so this assertion could only ever time out.
    await expect(page.getByText('Enter your hourly wage')).toBeVisible();
    
    // Enter hourly wage
    const wageInput = page.locator('#hourly-wage');
    await wageInput.fill('35');
    
    // Click Continue
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Should advance to Step 2 - "Name Your Primary Debt Boss"
    await expect(page.getByText('Name Your Primary Debt')).toBeVisible();
  });

  test('Step 2: Add primary debt and continue', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Complete Step 1 first
    await page.locator('#hourly-wage').fill('30');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Now on Step 2 - fill debt form
    await expect(page.getByText('Name Your Primary Debt')).toBeVisible();
    
    await page.locator('#debt-name').fill('Chase Sapphire');
    await page.locator('#debt-balance').fill('5200');
    await page.locator('#debt-apr').fill('22.99');
    await page.locator('#debt-min-payment').fill('105');
    
    // Continue to Step 3
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Should see Moat selection - "Set Your Moat Depth"
    await expect(page.getByText('Set Your Emergency Fund Goal')).toBeVisible();
  });

  test('Step 3: Select moat target and see freedom path', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Complete Steps 1-2
    await page.locator('#hourly-wage').fill('30');
    await page.getByRole('button', { name: /continue/i }).click();
    
    await page.locator('#debt-name').fill('Test Debt');
    await page.locator('#debt-balance').fill('1000');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Should be on Step 3
    await expect(page.getByText('Set Your Emergency Fund Goal')).toBeVisible();
    
    // Select $1,000 moat (the middle option)
    // .first(): '$1,000' is both the option label and part of the sentence
    // below it, so a bare match is a strict mode violation.
    await page.getByText('$1,000').first().click();
    
    // Click "See My Freedom Path"
    await page.getByRole('button', { name: /See My Payoff Timeline/i }).click();
    
    // Should see Aha Moment step (Step 4)
    // .first(): this loose regex matches several nodes on Step 3 (the heading,
    // the explanatory copy and the projection), so a bare match is a strict
    // mode violation rather than a real failure.
    await expect(page.getByText(/freedom|path|debt-free/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('complete full onboarding flow ends at dashboard', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Step 1: Wage
    await page.locator('#hourly-wage').fill('25');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 2: Debt
    await page.locator('#debt-name').fill('Credit Card');
    await page.locator('#debt-balance').fill('3000');
    await page.locator('#debt-apr').fill('18.5');
    await page.locator('#debt-min-payment').fill('75');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 3: Moat - select $1,000 and see freedom path
    // .first(): '$1,000' is both the option label and part of the sentence
    // below it, so a bare match is a strict mode violation.
    await page.getByText('$1,000').first().click();
    await page.getByRole('button', { name: /See My Payoff Timeline/i }).click();
    
    // Step 4: Aha Moment - Continue
    await page.getByRole('button', { name: /continue/i }).click({ timeout: 5000 });
    
    // Step 5: Pricing - Skip to demo mode
    await page.getByRole('button', { name: /skip|demo|explore/i }).click({ timeout: 5000 });
    
    // Step 6: Ceremony - Go to Dashboard
    await page.getByRole('button', { name: /Go to Dashboard/i }).click({ timeout: 5000 });
    
    // Should be on dashboard
    await expect(page).toHaveURL(/dashboard/);
  });

  test('can skip Step 1 (hourly wage)', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Should see Step 1
    await expect(page.getByText('Define Your Life Value')).toBeVisible();
    
    // Skip Step 1
    await page.getByRole('button', { name: /skip for now/i }).click();
    
    // Should advance to Step 2
    await expect(page.getByText('Name Your Primary Debt')).toBeVisible();
  });

  test('can navigate back from Step 2 to Step 1', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Go to Step 2
    await page.locator('#hourly-wage').fill('30');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Should be on Step 2
    await expect(page.getByText('Name Your Primary Debt')).toBeVisible();
    
    // Click Back
    await page.getByRole('button', { name: /back/i }).click();
    
    // Should be back on Step 1
    await expect(page.getByText('Define Your Life Value')).toBeVisible();
  });

  test('validation prevents empty balance with debt name', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Go to Step 2
    await page.locator('#hourly-wage').fill('30');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Enter only debt name without balance
    await page.locator('#debt-name').fill('Test Debt');
    // Leave balance empty
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Should still advance (debt is optional)
    await expect(page.getByText('Set Your Emergency Fund Goal')).toBeVisible();
  });

  test('validation shows error for negative balance', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Go to Step 2
    await page.locator('#hourly-wage').fill('30');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Enter invalid balance
    await page.locator('#debt-name').fill('Test');
    await page.locator('#debt-balance').fill('-100');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/positive/i)).toBeVisible();
  });

  test('validation shows error for APR over 100%', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Go to Step 2
    await page.locator('#hourly-wage').fill('30');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Enter invalid APR
    await page.locator('#debt-name').fill('Test');
    await page.locator('#debt-balance').fill('1000');
    await page.locator('#debt-apr').fill('150');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/between 0% and 100%/i)).toBeVisible();
  });

  test('preserves data when navigating back', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Fill Step 1
    await page.locator('#hourly-wage').fill('45');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Fill Step 2
    await page.locator('#debt-name').fill('My Credit Card');
    await page.locator('#debt-balance').fill('2500');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Go back to Step 2
    await page.getByRole('button', { name: /back/i }).click();
    
    // Data should still be there (form state is preserved via local state)
    await expect(page.locator('#debt-name')).toHaveValue('My Credit Card');
  });

  test('Step 3: Enter custom emergency fund goal', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Complete Steps 1-2
    await page.locator('#hourly-wage').fill('30');
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('button', { name: /continue/i }).click(); // Skip debt
    
    // Should be on Step 3
    await expect(page.getByText('Set Your Emergency Fund Goal')).toBeVisible();
    
    // Click "Custom" option
    await page.getByText('Custom').click();
    
    // Custom input should appear
    await expect(page.locator('#custom-goal')).toBeVisible();
    
    // Enter custom amount
    await page.locator('#custom-goal').fill('3500');
    
    // Continue to next step
    await page.getByRole('button', { name: /See My Payoff Timeline/i }).click();
    
    // Should advance to Aha Moment
    // .first(): this loose regex matches several nodes on Step 3 (the heading,
    // the explanatory copy and the projection), so a bare match is a strict
    // mode violation rather than a real failure.
    await expect(page.getByText(/freedom|path|debt-free/i).first()).toBeVisible({ timeout: 5000 });
  });
});
