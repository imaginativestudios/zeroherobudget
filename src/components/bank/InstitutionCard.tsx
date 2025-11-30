import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConnectedInstitution } from '@/types/bankConnections';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';
import { DisconnectConfirmDialog } from './DisconnectConfirmDialog';
import { useBankConnections } from '@/hooks/useBankConnections';
import { LinkedAccountRow } from './LinkedAccountRow';
import { RefreshCw, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface InstitutionCardProps {
  institution: ConnectedInstitution;
}

export const InstitutionCard = ({ institution }: InstitutionCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const { getInstitutionAccounts, refreshConnection, disconnectInstitution } = useBankConnections();
  
  const accounts = getInstitutionAccounts(institution.id);
  const isRefreshing = institution.connectionStatus === 'syncing';

  const handleRefresh = () => {
    refreshConnection(institution.id);
  };

  const handleDisconnect = () => {
    disconnectInstitution(institution.id);
    setShowDisconnectDialog(false);
  };

  return (
    <>
      <Card className="shadow-elegant hover:shadow-royal transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{institution.logo}</span>
              <div>
                <h3 className="font-semibold">{institution.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <ConnectionStatusBadge status={institution.connectionStatus} />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last synced</span>
            <span>
              {institution.lastSync
                ? formatDistanceToNow(new Date(institution.lastSync), { addSuffix: true })
                : 'Never'}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
              {isRefreshing ? 'Syncing...' : 'Refresh'}
            </Button>
            <Button
              onClick={() => setShowDisconnectDialog(true)}
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                {isOpen ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Hide Accounts
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    View Accounts
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-3">
              {accounts.map((account) => (
                <LinkedAccountRow
                  key={account.id}
                  account={account}
                  institutionName={institution.name}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <DisconnectConfirmDialog
        open={showDisconnectDialog}
        onClose={() => setShowDisconnectDialog(false)}
        onConfirm={handleDisconnect}
        institutionName={institution.name}
        accountCount={accounts.length}
      />
    </>
  );
};
