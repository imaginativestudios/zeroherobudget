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

  test('auth client raises no background storage errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && /Storage blocked/.test(m.text())) errors.push(m.text()); });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: 20000 });
    await page.waitForTimeout(3000);
    expect(errors.filter((e) => /Storage blocked/.test(e))).toEqual([]);
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
