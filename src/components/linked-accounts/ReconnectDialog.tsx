import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { reauthenticate } from '@/lib/mockBankProvider';
import type { LinkedAccountMeta } from '@/lib/mockBankProvider';
import {
  PLAID_LINK_TOKEN_KEY,
  PLAID_UPDATE_ITEM_KEY,
  createLinkToken,
  markPlaidItemActive,
} from '@/lib/plaidProvider';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ReconnectDialogProps {
  account: LinkedAccountMeta | null;
  onClose: () => void;
  onReconnected: (accountId: string, newToken: string) => void;
}

/** Opens Plaid Link in update mode once a token is available. */
function PlaidUpdateLauncher({
  token,
  onSuccess,
  onExit,
}: {
  token: string;
  onSuccess: () => void;
  onExit: () => void;
}) {
  const { open, ready } = usePlaidLink({ token, onSuccess: () => onSuccess(), onExit: () => onExit() });
  useEffect(() => {
    if (ready) open();
  }, [ready, open]);
  return null;
}

export function ReconnectDialog({ account, onClose, onReconnected }: ReconnectDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [updateToken, setUpdateToken] = useState<string | null>(null);

  const itemId = account?.accessToken?.startsWith('plaid-item-')
    ? account.accessToken.replace('plaid-item-', '')
    : null;

  const failed = useCallback(() => {
    toast({
      title: 'Reconnection failed',
      description: 'Please try again in a few moments.',
      variant: 'destructive',
    });
  }, []);

  const clearSession = () => {
    try {
      sessionStorage.removeItem(PLAID_LINK_TOKEN_KEY);
      sessionStorage.removeItem(PLAID_UPDATE_ITEM_KEY);
    } catch {
      /* ignore */
    }
  };

  const handleReconnect = async () => {
    if (!account) return;
    setLoading(true);

    // Signed-in users: Plaid Link update mode
    if (user && itemId) {
      try {
        const token = await createLinkToken(itemId);
        try {
          sessionStorage.setItem(PLAID_LINK_TOKEN_KEY, token);
          sessionStorage.setItem(PLAID_UPDATE_ITEM_KEY, itemId);
        } catch {
          /* sessionStorage unavailable */
        }
        setUpdateToken(token);
      } catch {
        failed();
        setLoading(false);
      }
      return;
    }

    // Demo mode: mock reconnect
    try {
      const newToken = await reauthenticate(account.accessToken);
      onReconnected(account.id, newToken);
      toast({ title: 'Reconnected', description: `${account.institutionName} is active again.` });
    } catch {
      failed();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = async () => {
    if (!account || !itemId) return;
    setUpdateToken(null);
    clearSession();
    try {
      await markPlaidItemActive(itemId);
      onReconnected(account.id, account.accessToken);
      toast({ title: 'Reconnected', description: `${account.institutionName} is active again.` });
    } catch {
      failed();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExit = () => {
    setUpdateToken(null);
    clearSession();
    setLoading(false);
  };

  return (
    <>
      {updateToken && (
        <PlaidUpdateLauncher token={updateToken} onSuccess={handleUpdateSuccess} onExit={handleUpdateExit} />
      )}
      <AlertDialog open={!!account} onOpenChange={(open) => !open && onClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reconnect {account?.institutionName}</AlertDialogTitle>
            <AlertDialogDescription>
              Your connection to {account?.institutionName} has expired. Re-authenticate to restore access to {account?.maskedAccountName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]" disabled={loading}>
              Cancel
            </AlertDialogCancel>
            <Button onClick={handleReconnect} disabled={loading} className="min-h-[44px]">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Reconnect
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
