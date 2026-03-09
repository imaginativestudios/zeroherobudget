import { useState } from 'react';
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
import { toast } from '@/hooks/use-toast';

interface ReconnectDialogProps {
  account: LinkedAccountMeta | null;
  onClose: () => void;
  onReconnected: (accountId: string, newToken: string) => void;
}

export function ReconnectDialog({ account, onClose, onReconnected }: ReconnectDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleReconnect = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const newToken = await reauthenticate(account.accessToken);
      onReconnected(account.id, newToken);
      toast({ title: 'Reconnected', description: `${account.institutionName} is active again.` });
    } catch {
      toast({
        title: 'Reconnection failed',
        description: 'Please try again in a few moments.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
