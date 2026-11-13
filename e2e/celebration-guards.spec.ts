import { test, expect } from '@playwright/test';

test('achievements wait for debts and seed old unlocks without celebrating', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const source = await fetch('/src/main.tsx').then(response => response.text());
    const reactDomPath = source.match(/from "([^"]*react-dom_client[^"]*)"/)?.[1] ?? '/node_modules/.vite/deps/react-dom_client.js';
    const reactPath = reactDomPath.replace('react-dom_client', 'react');
    const reactModule = await load(reactPath);
    const React = reactModule.default ?? reactModule;
    const reactDomModule = await load(reactDomPath);
    const ReactDOM = reactDomModule.default ?? reactDomModule;
    const { useAchievements } = await load('/src/hooks/useAchievements.ts');
    const { DEMO_USER_ID } = await load('/src/lib/demoDataLoader.ts');
    const key = (name: string) => `${DEMO_USER_ID}_${name}`;
    localStorage.clear();
    localStorage.setItem(key('initial-debt-total'), '1000');
    localStorage.setItem(key('unlocked-achievements'), '["quarter-mark"]');
    function Consumer({ ready, debt }: { ready: boolean; debt: number }) {
      useAchievements({ totalDebt: debt, debtsPaidOff: 0, totalDebts: 1 }, ready);
      return null;
    }
    const root = ReactDOM.createRoot(document.createElement('div'));
    root.render(React.createElement(Consumer, { ready: false, debt: 0 }));
    await new Promise(resolve => setTimeout(resolve, 100));
    const whileLoading = localStorage.getItem(key('celebrated-achievements'));
    root.render(React.createElement(Consumer, { ready: true, debt: 700 }));
    await new Promise(resolve => setTimeout(resolve, 100));
    root.render(React.createElement(Consumer, { ready: true, debt: 1000 }));
    await new Promise(resolve => setTimeout(resolve, 100));
    root.unmount();
    return { whileLoading, celebrated: localStorage.getItem(key('celebrated-achievements')), sounds: localStorage.getItem(key('celebration-sounds')) };
  });
  expect(result.whileLoading).toBeNull();
  expect(result.celebrated).toBe('["quarter-mark"]');
  expect(result.sounds).toBeNull();
});

test('celebration sound helpers stay silent by default and honor the account setting', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { supabase } = await load('/src/integrations/supabase/client.ts');
    const { soundEffects, playAchievementUnlockSound } = await load('/src/lib/soundEffects.ts');
    const original = supabase.auth.getSession;
    supabase.auth.getSession = async () => ({ data: { session: { user: { id: 'sound-test-user' } } }, error: null });
    let tones = 0;
    const originalAudio = window.AudioContext;
    window.AudioContext = class {
      constructor() { tones++; }
    } as any;
    localStorage.removeItem('sound-test-user_celebration-sounds');
    playAchievementUnlockSound('epic');
    soundEffects.moatMilestone();
    await new Promise(resolve => setTimeout(resolve, 400));
    const off = tones;
    localStorage.setItem('sound-test-user_celebration-sounds', 'true');
    soundEffects.achievementBasic();
    await new Promise(resolve => setTimeout(resolve, 100));
    const on = tones;
    window.AudioContext = originalAudio;
    supabase.auth.getSession = original;
    return { off, on };
  });
  expect(result.off).toBe(0);
  expect(result.on).toBeGreaterThan(0);
});
