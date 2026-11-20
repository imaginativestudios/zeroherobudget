import { test, expect, type Page } from '@playwright/test';

// ChatbotWidget renders nothing without a signed-in user, so the launcher and
// introduction behaviour below is exercised against a stubbed account. The
// stub replaces the useAuth module itself, which is how the app learns whether
// someone is signed in.
const signInStub = () => 'const user = { id: "zora-launcher-user" }; export const useAuth = () => ({ user, session: null });';

// This sandbox serves the app slowly enough that the default 30s budget is
// spent before a page finishes booting, so the whole file gets a longer one.
test.setTimeout(90000);

// Navigations wait for domcontentloaded, not the full `load` event: the app
// keeps requests to the hosted backend open, so `load` can arrive long after
// the page is actually usable (or not at all), which made these specs time out.
const goto = (page: Page, path: string) => page.goto(path, { waitUntil: 'domcontentloaded' });
const reload = (page: Page) => page.reload({ waitUntil: 'domcontentloaded' });

async function seedDemoData(page: Page) {
  await goto(page, '/');
  await page.evaluate(async () => {
    const modulePath = '/src/lib/demoDataLoader.ts';
    const { loadDemoData } = await import(/* @vite-ignore */ modulePath);
    loadDemoData();
  });
}

test.beforeEach(async ({ page }) => {
  await page.route('**/src/hooks/useAuth.ts', route => route.fulfill({
    contentType: 'application/javascript',
    body: signInStub(),
  }));
  await seedDemoData(page);
});

test('signed-out visitors see no Zora launcher or introduction', async ({ page }) => {
  for (const path of ['/', '/onboarding']) {
    await page.unroute('**/src/hooks/useAuth.ts');
    await goto(page, '/');
    await page.evaluate(() => localStorage.clear());
    await goto(page, path);
    // The introduction bubble appears 1.5s after mount, so wait past it.
    await page.waitForTimeout(2000);
    await expect(page.getByRole('button', { name: 'Open chat assistant', exact: true })).toHaveCount(0);
    await expect(page.getByText("Hi, I'm Zora")).toHaveCount(0);
    await expect(page.getByRole('dialog', { name: 'Zora chat' })).toHaveCount(0);
  }
});

test('Zora introduction waits 1.5 seconds without automatically opening chat', async ({ page }) => {
  await goto(page, '/dashboard');
  await expect(page.getByRole('button', { name: 'Open chat assistant', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dismiss', exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Dismiss', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Zora chat' })).toBeHidden();
});

test('dismissing the introduction persists without marking chat as opened', async ({ page }) => {
  await goto(page, '/dashboard');
  await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem('zora_intro_dismissed'))).toBe('true');
  expect(await page.evaluate(() => localStorage.getItem('zora_opened'))).toBeNull();
  await reload(page);
  await page.waitForTimeout(1800);
  await expect(page.getByRole('button', { name: 'Dismiss', exact: true })).toBeHidden();
});

test('opening from the introduction persists both receipts', async ({ page }) => {
  await goto(page, '/dashboard');
  await page.getByRole('button', { name: /Hi, I'm Zora/ }).click();
  await expect(page.getByRole('dialog', { name: 'Zora chat' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('zora_opened'))).toBe('true');
  expect(await page.evaluate(() => localStorage.getItem('zora_intro_dismissed'))).toBe('true');
  await reload(page);
  // Wait for the widget to come back before checking the panel, otherwise the
  // assertion races the app boot after reload and flakes.
  await expect(page.getByRole('button', { name: 'Open chat assistant', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Zora chat' })).toBeHidden();
});

test('blocked storage does not prevent opening or closing Zora', async ({ page }) => {
  await goto(page, '/dashboard');
  await page.evaluate(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
    Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
  });
  await page.getByRole('button', { name: 'Open chat assistant', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Zora chat' })).toBeVisible();
  await page.getByRole('button', { name: 'Close chat', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Zora chat' })).toBeHidden();
});
