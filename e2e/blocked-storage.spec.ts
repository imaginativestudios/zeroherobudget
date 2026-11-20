import { test, expect } from '@playwright/test';

test.describe('blocked browser storage', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const block = () => { throw new DOMException('Storage blocked', 'SecurityError'); };
      Storage.prototype.getItem = block;
      Storage.prototype.setItem = block;
      Storage.prototype.removeItem = block;
    });
  });

  for (const path of ['/', '/onboarding']) {
    test(`${path} still renders when storage throws from first load`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const root = page.locator('#root');
      await expect(root).not.toBeEmpty({ timeout: 20000 });
      await expect(page.getByText('Something went wrong')).toHaveCount(0);
      await expect.poll(async () => (await root.innerText()).trim().length, { timeout: 20000 }).toBeGreaterThan(20);
    });
  }
});
