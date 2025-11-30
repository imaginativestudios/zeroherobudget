import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaidLinkButton } from '@/components/bank/PlaidLinkButton';
import { MockPlaidLinkModal } from '@/components/bank/MockPlaidLinkModal';
import { InstitutionCard } from '@/components/bank/InstitutionCard';
import { LinkedAccountRow } from '@/components/bank/LinkedAccountRow';
import { useBankConnections } from '@/hooks/useBankConnections';
import { Building2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

export default function BankConnections() {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const { institutions, linkedAccounts, getConnectionStatus } = useBankConnections();
  const status = getConnectionStatus();

  const totalBalance = linkedAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="pt-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Bank Connections</h1>
            <p className="text-muted-foreground mt-1">
              Connect your bank accounts for automatic transaction syncing
            </p>
          </div>
          <PlaidLinkButton onSuccess={() => setShowLinkModal(true)} />
        </div>
      </div>

      {institutions.length === 0 ? (
        /* Empty State */
        <Card className="shadow-elegant">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Banks Connected</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Connect your bank accounts to automatically sync transactions, track balances, and get real-time insights into your finances.
            </p>
            <PlaidLinkButton onSuccess={() => setShowLinkModal(true)} size="lg" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-elegant">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-accent" />
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {status.totalAccounts} account{status.totalAccounts !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  Last Synced
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {status.lastSync
                    ? formatDistanceToNow(new Date(status.lastSync), { addSuffix: true })
                    : 'Never'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {status.connectedInstitutions} institution{status.connectedInstitutions !== 1 ? 's' : ''} connected
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {status.allHealthy ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  Connection Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {status.allHealthy ? 'All Good' : 'Needs Attention'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {status.needsAttention > 0
                    ? `${status.needsAttention} issue${status.needsAttention !== 1 ? 's' : ''} require attention`
                    : 'All connections are healthy'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Connected Institutions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Connected Institutions</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {institutions.map((institution) => (
                <InstitutionCard key={institution.id} institution={institution} />
              ))}
            </div>
          </div>

          {/* All Linked Accounts */}
          <div>
            <h2 className="text-xl font-semibold mb-4">All Linked Accounts</h2>
            <div className="space-y-3">
              {linkedAccounts.map((account) => {
                const institution = institutions.find(i => i.id === account.institutionId);
                return (
                  <LinkedAccountRow
                    key={account.id}
                    account={account}
                    institutionName={institution?.name || 'Unknown'}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}

      <MockPlaidLinkModal open={showLinkModal} onClose={() => setShowLinkModal(false)} />
    </div>
  );
}
