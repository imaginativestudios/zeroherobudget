import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const modulePath = '/src/lib/demoDataLoader.ts';
    const { loadDemoData } = await import(/* @vite-ignore */ modulePath);
    loadDemoData();
  });
});

test('Zora introduction waits 1.5 seconds without automatically opening chat', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('button', { name: 'Open chat assistant', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dismiss', exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Dismiss', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Zora chat' })).toBeHidden();
});

test('dismissing the introduction persists without marking chat as opened', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem('zora_intro_dismissed'))).toBe('true');
  expect(await page.evaluate(() => localStorage.getItem('zora_opened'))).toBeNull();
  await page.reload();
  await page.waitForTimeout(1800);
  await expect(page.getByRole('button', { name: 'Dismiss', exact: true })).toBeHidden();
});

test('opening from the introduction persists both receipts', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: /Hi, I'm Zora/ }).click();
  await expect(page.getByRole('dialog', { name: 'Zora chat' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('zora_opened'))).toBe('true');
  expect(await page.evaluate(() => localStorage.getItem('zora_intro_dismissed'))).toBe('true');
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Zora chat' })).toBeHidden();
});

test('blocked storage does not prevent opening or closing Zora', async ({ page }) => {
  await page.goto('/dashboard');
  await page.evaluate(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
    Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
  });
  await page.getByRole('button', { name: 'Open chat assistant', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Zora chat' })).toBeVisible();
  await page.getByRole('button', { name: 'Close chat', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Zora chat' })).toBeHidden();
});