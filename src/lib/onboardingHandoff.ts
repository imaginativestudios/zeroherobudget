import type { OnboardingData } from '@/hooks/useHeroProfile';

// Only the account returned by signup can consume this draft; never adopt another
// account's demo/profile data merely because it signs in on the same browser.
export function stageOnboarding(userId: string, data: OnboardingData, free: boolean) {
  localStorage.setItem(`${userId}_pending_onboarding`, JSON.stringify({ data, free }));
}

export function applyPendingOnboarding(userId: string) {
  const pendingKey = `${userId}_pending_onboarding`;
  const raw = localStorage.getItem(pendingKey);
  if (!raw) return;
  const { data, free } = JSON.parse(raw) as { data: OnboardingData; free: boolean };
  const profileKey = `${userId}_bdt_hero_profile`;
  const previous = JSON.parse(localStorage.getItem(profileKey) ?? '{}');
  localStorage.setItem(profileKey, JSON.stringify({
    hourly_wage: null,
    moat_current: 0, last_active_date: null, activity_log: [], trial_started: false,
    ...previous,
    ...(data.hourlyWage !== undefined ? { hourly_wage: data.hourlyWage } : {}),
    moat_target: data.moatTarget ?? previous.moat_target ?? 1000,
    onboarding_completed: free || previous.onboarding_completed || false,
    onboarding_step: free ? undefined : 5,
    onboarding_data: free ? undefined : data,
  }));
  const vaultKey = `${userId}_bdt_savings_vault`;
  const vault = JSON.parse(localStorage.getItem(vaultKey) ?? '{}');
  localStorage.setItem(vaultKey, JSON.stringify({
    moat_balance: 0, last_deposit_date: null, deposit_history: [],
    achieved_milestones: [], was_secure: false, last_secure_date: null,
    breach_acknowledged: false, repair_mode_active: false, ...vault,
    moat_target: data.moatTarget ?? vault.moat_target ?? 1000,
  }));
  if (data.debtName && data.debtBalance && data.debtBalance > 0) {
    const key = `${userId}_debts`;
    const debts = JSON.parse(localStorage.getItem(key) ?? '[]');
    // Stable id makes replay safe if a storage write fails partway through.
    const id = `onboarding-${userId}`;
    if (!debts.some((debt: { id: string }) => debt.id === id)) {
      const now = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify([...debts, {
        id, user_id: userId, name: data.debtName, balance: data.debtBalance,
        interest_rate: data.debtApr ?? 0, minimum_payment: data.debtMinPayment ?? 25,
        type: 'credit_card', created_at: now, updated_at: now,
      }]));
    }
  }
  localStorage.removeItem(pendingKey);
}