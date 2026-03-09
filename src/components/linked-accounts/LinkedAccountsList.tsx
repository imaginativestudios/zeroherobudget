import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Building2, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { LinkedAccountCard } from './LinkedAccountCard';
import { DisconnectDialog } from './DisconnectDialog';
import { ReconnectDialog } from './ReconnectDialog';
import { DeviceLossWarning } from './DeviceLossWarning';
import type { LinkedAccountMeta } from '@/lib/mockBankProvider';

interface LinkedAccountsListProps {
  onLinkNew: () => void;
}

export function LinkedAccountsList({ onLinkNew }: LinkedAccountsListProps) {
  const { linkedAccounts, isLoading, removeAccount, updateAccountToken, encryptionAvailable } = useLinkedAccounts();
  const [disconnecting, setDisconnecting] = useState<LinkedAccountMeta | null>(null);
  const [reconnecting, setReconnecting] = useState<LinkedAccountMeta | null>(null);
  const [isIncognito, setIsIncognito] = useState(false);

  useEffect(() => {
    // Detect private/incognito mode by testing storage persistence
    try {
      const testKey = '__zh_incognito_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      // Estimate storage quota — very low quota suggests incognito
      if (navigator.storage?.estimate) {
        navigator.storage.estimate().then((est) => {
          if (est.quota && est.quota < 120_000_000) {
            setIsIncognito(true);
          }
        });
      }
    } catch {
      setIsIncognito(true);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!encryptionAvailable) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-destructive">
            Secure storage is not available in this browser. Bank linking requires a modern browser with Web Crypto API support.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Linked Bank Accounts</h3>
        <Button size="sm" onClick={onLinkNew} className="min-h-[36px]">
          <Plus className="h-4 w-4 mr-1.5" />
          Link Account
        </Button>
      </div>

      {linkedAccounts.length === 0 ? (
        <Card className="py-10">
          <CardContent className="flex flex-col items-center text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No linked accounts</p>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs">
              Link a bank account to automatically see your account names and types — no manual entry needed.
            </p>
            <Button onClick={onLinkNew} className="min-h-[44px]">
              <Plus className="h-4 w-4 mr-2" />
              Link Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {linkedAccounts.map((account) => (
            <LinkedAccountCard
              key={account.id}
              account={account}
              onReconnect={setReconnecting}
              onDisconnect={setDisconnecting}
            />
          ))}
        </div>
      )}

      {linkedAccounts.length > 0 && <DeviceLossWarning />}

      <DisconnectDialog
        account={disconnecting}
        onClose={() => setDisconnecting(null)}
        onConfirm={async () => {
          if (disconnecting) {
            const name = disconnecting.institutionName;
            await removeAccount(disconnecting.id);
            setDisconnecting(null);
            toast({
              title: 'Account disconnected',
              description: `${name} has been removed from this device.`,
            });
          }
        }}
      />

      <ReconnectDialog
        account={reconnecting}
        onClose={() => setReconnecting(null)}
        onReconnected={async (accountId, newToken) => {
          await updateAccountToken(accountId, newToken);
          setReconnecting(null);
        }}
      />
    </div>
  );
}
