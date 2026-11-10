import { test, expect } from '@playwright/test';
import { applyPendingOnboarding, stageOnboarding } from '../src/lib/onboardingHandoff';

test('free signup preserves wage, debt and savings target in only its account', () => {
  const values = new Map<string, string>();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  } });
  try {
    stageOnboarding('new-account', { hourlyWage: 37, debtName: 'Visa', debtBalance: 1200, debtApr: 20, debtMinPayment: 35, moatTarget: 2000 }, true);
    applyPendingOnboarding('other-account');
    expect(values.has('other-account_bdt_hero_profile')).toBe(false);
    applyPendingOnboarding('new-account');
    const profile = JSON.parse(values.get('new-account_bdt_hero_profile') ?? '{}');
    expect(profile.hourly_wage).toBe(37);
    expect(profile.onboarding_completed).toBe(true);
    expect(profile.trial_started).toBe(false);
    expect(profile.moat_target).toBe(2000);
    const debts = JSON.parse(values.get('new-account_debts') ?? '[]');
    expect(debts).toHaveLength(1);
    expect(debts[0]).toMatchObject({ user_id: 'new-account', name: 'Visa', balance: 1200, interest_rate: 20, minimum_payment: 35 });
    applyPendingOnboarding('new-account');
    expect(JSON.parse(values.get('new-account_debts') ?? '[]')).toHaveLength(1);
    expect(values.has('new-account_pending_onboarding')).toBe(false);
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});