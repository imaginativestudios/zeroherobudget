import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaidLink } from 'react-plaid-link';
import { Loader2 } from 'lucide-react';
import {
  PLAID_LINK_TOKEN_KEY,
  PLAID_UPDATE_ITEM_KEY,
  exchangePublicToken,
  markPlaidItemActive,
  syncPlaidTransactions,
} from '@/lib/plaidProvider';
import { toast } from '@/hooks/use-toast';

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(PLAID_LINK_TOKEN_KEY);
    sessionStorage.removeItem(PLAID_UPDATE_ITEM_KEY);
  } catch {
    /* ignore */
  }
}

function OAuthLink({ token, updateItemId }: { token: string; updateItemId: string | null }) {
  const navigate = useNavigate();
  const opened = useRef(false);

  const onSuccess = useCallback(
    async (publicToken: string) => {
      try {
        if (updateItemId) {
          await markPlaidItemActive(updateItemId);
          toast({ title: 'Reconnected', description: 'Your bank is active again.' });
        } else {
          await exchangePublicToken(publicToken);
          syncPlaidTransactions().catch((e) => console.error('initial plaid sync failed:', e));
          toast({ title: 'Bank connected', description: 'Your accounts have been linked.' });
        }
      } catch {
        toast({
          title: 'Something went wrong',
          description: 'We could not finish connecting your bank. Please try again.',
          variant: 'destructive',
        });
      } finally {
        clearSession();
        navigate('/accounts', { replace: true });
      }
    },
    [navigate, updateItemId]
  );

  const onExit = useCallback(() => {
    clearSession();
    navigate('/accounts', { replace: true });
  }, [navigate]);

  const { open, ready } = usePlaidLink({
    token,
    receivedRedirectUri: window.location.href,
    onSuccess,
    onExit,
  });

  useEffect(() => {
    if (ready && !opened.current) {
      opened.current = true;
      open();
    }
  }, [ready, open]);

  return null;
}

const PlaidOAuth = () => {
  const navigate = useNavigate();
  const [token] = useState(() => readSession(PLAID_LINK_TOKEN_KEY));
  const [updateItemId] = useState(() => readSession(PLAID_UPDATE_ITEM_KEY));

  useEffect(() => {
    if (!token) {
      toast({
        title: 'Connection session expired',
        description: 'Please start connecting your bank again from Accounts.',
      });
      navigate('/accounts', { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-sm font-medium text-foreground">Finishing your secure bank connection…</p>
      {token && <OAuthLink token={token} updateItemId={updateItemId} />}
    </div>
  );
};

export default PlaidOAuth;
