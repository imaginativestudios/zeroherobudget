import type { DebtItem } from './debtCalculations';

/** Shape persisted under `${userId}_debts` (the single debt store). */
export interface StoredDebt {
  id: string;
  name: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  type: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  _orig?: number;
  [extra: string]: unknown;
}

export const toDebtItem = (d: StoredDebt): DebtItem => ({
  id: d.id,
  name: d.name,
  balance: Number(d.balance) || 0,
  apr: Number(d.interest_rate) || 0,
  min: Number(d.minimum_payment) || 0,
  type: d.type || 'debt',
  _orig: d._orig,
});

export const toStoredDebt = (item: DebtItem, userId: string, prev?: StoredDebt): StoredDebt => {
  const now = new Date().toISOString();
  return {
    ...(prev ?? {}),
    id: item.id,
    name: item.name,
    balance: item.balance,
    interest_rate: item.apr,
    minimum_payment: item.min,
    type: item.type,
    user_id: prev?.user_id ?? userId,
    created_at: prev?.created_at ?? now,
    updated_at:
      prev && prev.name === item.name && prev.balance === item.balance &&
      prev.interest_rate === item.apr && prev.minimum_payment === item.min && prev.type === item.type
        ? prev.updated_at
        : now,
    ...(item._orig !== undefined ? { _orig: item._orig } : {}),
  };
};

/**
 * One-time move of debts saved in the retired `${userId}_bdt_debts` list into
 * `${userId}_debts`, skipping entries already present by id or name+balance.
 */
export function migrateLegacyDebts(userId: string, storage: Storage = localStorage): void {
  const legacyKey = `${userId}_bdt_debts`;
  try {
    const raw = storage.getItem(legacyKey);
    if (raw === null) return;
    const legacy = JSON.parse(raw);
    const key = `${userId}_debts`;
    const current: StoredDebt[] = JSON.parse(storage.getItem(key) ?? '[]');
    if (Array.isArray(legacy) && legacy.length) {
      const merged = [...current];
      for (const l of legacy as DebtItem[]) {
        if (!l || typeof l !== 'object') continue;
        const dup = merged.some(
          (c) => c.id === l.id || (c.name === l.name && Number(c.balance) === Number(l.balance)),
        );
        if (!dup) merged.push(toStoredDebt({ ...l, id: l.id || crypto.randomUUID() }, userId));
      }
      if (merged.length !== current.length) storage.setItem(key, JSON.stringify(merged));
    }
    storage.removeItem(legacyKey);
  } catch (error) {
    console.error('Debt migration failed', error);
  }
}
