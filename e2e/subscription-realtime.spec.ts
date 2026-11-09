import { test, expect } from '@playwright/test';

test('concurrent subscription hooks own separate realtime listeners', async ({ page }) => {
  await page.route('**/src/hooks/useAuth.ts', route => route.fulfill({
    contentType: 'application/javascript',
    body: 'const user = { id: "realtime-regression-user" }; export const useAuth = () => ({ user, session: null });',
  }));
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const React = await load('/node_modules/.vite/deps/react.js');
    const { createRoot } = await load('/node_modules/.vite/deps/react-dom_client.js');
    const { supabase } = await load('/src/integrations/supabase/client.ts');
    const { useSubscriptionStatus } = await load('/src/hooks/useSubscriptionStatus.ts');
    const originalChannel = supabase.channel.bind(supabase);
    const originalRemove = supabase.removeChannel.bind(supabase);
    const created: any[] = [];
    const removed: any[] = [];
    supabase.channel = (...args: any[]) => {
      const channel = originalChannel(...args);
      // Preserve the SDK's callback-after-subscribe guard without network access.
      channel.subscribe = () => { channel.joinedOnce = true; return channel; };
      created.push(channel);
      return channel;
    };
    // Simulate asynchronous cleanup leaving old channels registered temporarily.
    supabase.removeChannel = async (channel: any) => { removed.push(channel); return 'ok'; };
    function Consumer() { useSubscriptionStatus(); return null; }
    const node = document.createElement('div');
    document.body.append(node);
    const root = createRoot(node);
    root.render(React.createElement(React.StrictMode, null,
      React.createElement(Consumer), React.createElement(Consumer)));
    await new Promise(resolve => setTimeout(resolve, 100));
    root.unmount();
    supabase.channel = originalChannel;
    supabase.removeChannel = originalRemove;
    return {
      count: created.length,
      unique: new Set(created).size,
      allCleaned: created.every(channel => removed.includes(channel)),
      updateListeners: created.every(channel => channel.bindings.postgres_changes?.length === 1),
    };
  });
  expect(result.count).toBe(4);
  expect(result.unique).toBe(4);
  expect(result.allCleaned).toBe(true);
  expect(result.updateListeners).toBe(true);
});