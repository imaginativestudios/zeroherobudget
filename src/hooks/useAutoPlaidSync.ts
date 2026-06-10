import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { syncPlaidTransactions } from '@/lib/plaidProvider';

const SESSION_KEY = 'plaid_synced_this_session';

/**
 * Triggers a Plaid transaction sync once per browser session for authed users.
 * Calls the provided onComplete callback after a successful sync so consumers
 * can refetch their data.
 */
export function useAutoPlaidSync(onComplete?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
    sessionStorage.setItem(SESSION_KEY, '1');

    syncPlaidTransactions()
      .then((res) => {
        if (res && (res.added > 0 || res.modified > 0 || res.removed > 0)) {
          onComplete?.();
        }
      })
      .catch((e) => {
        // Non-fatal — user may not have any linked items
        console.debug('auto plaid sync skipped:', e?.message || e);
      });
  }, [user, onComplete]);
}
