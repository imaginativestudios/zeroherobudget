import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Building2, Plus, Loader2, AlertTriangle, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { useAuth } from '@/hooks/useAuth';
import { syncPlaidTransactions } from '@/lib/plaidProvider';
import { LinkedAccountCard } from './LinkedAccountCard';
import { DisconnectDialog } from './DisconnectDialog';
import { ReconnectDialog } from './ReconnectDialog';
import { DeviceLossWarning } from './DeviceLossWarning';
import { BankLinkingFlow } from './BankLinkingFlow';
import type { LinkedAccountMeta } from '@/lib/mockBankProvider';

export function LinkedAccountsList() {
  const { linkedAccounts, isLoading, removeAccount, updateAccountToken, encryptionAvailable, addAccounts, reload } = useLinkedAccounts();
  const { user } = useAuth();
  const [disconnecting, setDisconnecting] = useState<LinkedAccountMeta | null>(null);
  const [reconnecting, setReconnecting] = useState<LinkedAccountMeta | null>(null);
  const [isIncognito, setIsIncognito] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncPlaidTransactions();
      await reload();
      toast({
        title: 'Sync complete',
        description: `${result.added} new, ${result.modified} updated, ${result.removed} removed across ${result.items} bank${result.items === 1 ? '' : 's'}.`,
      });
    } catch (e: any) {
      toast({
        title: 'Sync failed',
        description: e?.message || 'Could not refresh bank transactions.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    try {
      const testKey = '__zh_incognito_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
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

  // Show inline linking flow
  if (isLinking) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Link Bank Account</h3>
            <p className="text-sm text-muted-foreground">Securely connect your checking or savings account</p>
          </div>
        </div>
        <BankLinkingFlow
          onComplete={() => setIsLinking(false)}
          onCancel={() => setIsLinking(false)}
          addAccounts={addAccounts}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isIncognito && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="py-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              You appear to be in a private/incognito window. Linked account data may not persist after you close this session.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Value proposition — shown when no accounts linked */}
      {linkedAccounts.length === 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Why link your bank?</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Linking lets us identify your accounts automatically—no manual entry needed.
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Your banking data stays encrypted on this device and is never stored on our servers.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Linked Bank Accounts</h3>
        <div className="flex items-center gap-2">
          {user && linkedAccounts.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing}
              className="min-h-[36px]"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1.5" />
              )}
              Sync now
            </Button>
          )}
          <Button size="sm" onClick={() => setIsLinking(true)} className="min-h-[36px]">
            <Plus className="h-4 w-4 mr-1.5" />
            Link Account
          </Button>
        </div>
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
            <Button onClick={() => setIsLinking(true)} className="min-h-[44px]">
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

      {/* Subtle privacy reminder when accounts exist */}
      {linkedAccounts.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <Shield className="h-3 w-3 shrink-0" />
          <span>
            {user
              ? 'Bank data is stored securely in your account and synced across devices.'
              : 'All bank data is encrypted and stored only on this device.'}
          </span>
        </div>
      )}

      {linkedAccounts.length > 0 && !user && <DeviceLossWarning />}

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
