import { useCallback, useMemo, type SetStateAction } from 'react';
import { useAuth } from './useAuth';
import { useUserLocalStorage } from './useUserLocalStorage';
import { DEMO_USER_ID } from '@/lib/demoDataLoader';
import type { DebtItem } from '@/lib/debtCalculations';
import { migrateLegacyDebts, toDebtItem, toStoredDebt, type StoredDebt } from '@/lib/debtStore';

/** Debt Strategy view of the shared `${userId}_debts` store, in calculator shape. */
export function useDebtItems(): [DebtItem[], (value: SetStateAction<DebtItem[]>) => void, boolean] {
  const { user } = useAuth();
  const userId = user?.id ?? DEMO_USER_ID;
  // Runs before the store is read so legacy entries are never hidden.
  useMemo(() => migrateLegacyDebts(userId), [userId]);
  const [stored, setStored, isLoading] = useUserLocalStorage<StoredDebt[]>('debts', []);
  const items = useMemo(() => (Array.isArray(stored) ? stored.map(toDebtItem) : []), [stored]);

  const setItems = useCallback(
    (value: SetStateAction<DebtItem[]>) => {
      setStored((prev) => {
        const prevList = Array.isArray(prev) ? prev : [];
        const next = typeof value === 'function' ? value(prevList.map(toDebtItem)) : value;
        const byId = new Map(prevList.map((d) => [d.id, d]));
        return next.map((item) => toStoredDebt(item, userId, byId.get(item.id)));
      });
    },
    [setStored, userId],
  );

  return [items, setItems, isLoading];
}
