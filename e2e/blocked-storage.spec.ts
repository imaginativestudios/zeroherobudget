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

test.describe('sign-in with blocked browser storage', () => {
  test.setTimeout(90000);

  test('signing in works for the current tab', async ({ page }) => {
    await page.addInitScript(() => {
      const block = () => { throw new DOMException('Storage blocked', 'SecurityError'); };
      Storage.prototype.getItem = block;
      Storage.prototype.setItem = block;
      Storage.prototype.removeItem = block;
    });
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'blocked@example.com', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
    const token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: user.id, exp, role: 'authenticated', aud: 'authenticated', email: user.email })}.sig`;
    await page.route(/\/auth\/v1\/token\?grant_type=password/, (r) => r.fulfill({ json: { access_token: token, token_type: 'bearer', expires_in: 3600, expires_at: exp, refresh_token: 'refresh', user } }));
    await page.route(/\/auth\/v1\/user/, (r) => r.fulfill({ json: user }));

    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: 30000 });
    await expect(page.getByRole('button', { name: 'Open chat assistant' })).toHaveCount(0);

    const result = await page.evaluate(async () => {
      const path = '/src/integrations/supabase/client.ts';
      const { supabase } = await import(/* @vite-ignore */ path);
      const signIn = await supabase.auth.signInWithPassword({ email: 'blocked@example.com', password: 'correct-horse-battery' });
      const { data } = await supabase.auth.getSession();
      return { error: signIn.error?.message ?? null, sessionUser: data.session?.user?.email ?? null };
    });
    expect(result).toEqual({ error: null, sessionUser: 'blocked@example.com' });
    // The app's own auth state picks up the session: the signed-in-only launcher appears.
    await expect(page.getByRole('button', { name: 'Open chat assistant' })).toBeVisible({ timeout: 20000 });
    expect(errors.filter((e) => /Storage blocked/.test(e))).toEqual([]);
  });
});
