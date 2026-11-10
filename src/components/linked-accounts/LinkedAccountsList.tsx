import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Building2, Plus, Loader2, AlertTriangle, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useBetaAccess } from '@/hooks/useBetaAccess';
import { syncPlaidTransactions } from '@/lib/plaidProvider';
import { STRIPE_PRICES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { LinkedAccountCard } from './LinkedAccountCard';
import { DisconnectDialog } from './DisconnectDialog';
import { ReconnectDialog } from './ReconnectDialog';
import { DeviceLossWarning } from './DeviceLossWarning';
import { BankLinkingFlow } from './BankLinkingFlow';
import type { LinkedAccountMeta } from '@/lib/mockBankProvider';

export function LinkedAccountsList({ refreshSignal = 0 }: { refreshSignal?: number }) {
  const { linkedAccounts, isLoading, removeAccount, updateAccountToken, encryptionAvailable, addAccounts, reload } = useLinkedAccounts();
  const { user } = useAuth();
  const [disconnecting, setDisconnecting] = useState<LinkedAccountMeta | null>(null);
  const [reconnecting, setReconnecting] = useState<LinkedAccountMeta | null>(null);
  const [isIncognito, setIsIncognito] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();
  const { subscribed, isTrialing, loading: subLoading, createCheckout } = useSubscriptionStatus();
  const trialCardRef = useRef<HTMLDivElement>(null);
  const [highlightTrial, setHighlightTrial] = useState(false);
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const { eligible: betaEligible, loading: betaLoading } = useBetaAccess();
  // Demo mode (no user) keeps the existing linking flow.
  const needsSubscription =
    !!user && !subLoading && !betaLoading && !subscribed && !isTrialing && !betaEligible;

  // Parent pages bump `refreshSignal` after changing accounts (e.g. deleting one
  // from the All Accounts table) so this list re-reads from the server.
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  const lastSignal = useRef(refreshSignal);
  useEffect(() => {
    if (lastSignal.current === refreshSignal) return;
    lastSignal.current = refreshSignal;
    reloadRef.current();
  }, [refreshSignal]);

  const handleStartTrial = async () => {
    setIsStartingTrial(true);
    try {
      const checkoutUrl = await createCheckout('monthly');
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create checkout';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
    setIsStartingTrial(false);
  };

  const focusTrialCard = () => {
    trialCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightTrial(true);
    window.setTimeout(() => setHighlightTrial(false), 1500);
  };

  const subscriptionCard = (
    <div ref={trialCardRef}>
      <Card
        className={cn(
          'border-2 border-primary transition-shadow duration-200',
          highlightTrial && 'ring-4 ring-primary/30 shadow-lg'
        )}
      >
        <CardContent className="py-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-semibold text-foreground">Link your bank with a 7-day free trial</h4>
              <p className="text-sm text-foreground">Your transactions sync on their own. No more manual entry.</p>
              <p className="text-sm text-muted-foreground">
                Free for 7 days, then ${STRIPE_PRICES.monthly.amount}/month or ${STRIPE_PRICES.annual.amount}/year. Cancel anytime. Budgeting stays free.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleStartTrial} disabled={isStartingTrial} className="min-h-[44px]">
              {isStartingTrial && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Start free trial
            </Button>
            <Button variant="outline" onClick={() => navigate('/pricing')} className="min-h-[44px]">
              See plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
      {linkedAccounts.length === 0 && !needsSubscription && (
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
                {user
                  ? 'Sensitive numbers stay with Plaid. We never see your bank login or full account numbers.'
                  : 'Your banking data stays encrypted on this device and is never stored on our servers.'}
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
          <Button
            size="sm"
            onClick={needsSubscription ? focusTrialCard : () => setIsLinking(true)}
            className="min-h-[36px]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Link Account
            {needsSubscription && (
              <span className="ml-2 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                Free trial
              </span>
            )}
          </Button>
        </div>
      </div>

      {needsSubscription && subscriptionCard}

      {linkedAccounts.length === 0 ? (
        needsSubscription ? null : (
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
        )
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
              description: `${name} has been disconnected and its data removed.`,
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
