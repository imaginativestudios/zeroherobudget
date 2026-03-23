import { Building2, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { LinkedAccountMeta } from '@/lib/mockBankProvider';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface LinkedAccountCardProps {
  account: LinkedAccountMeta;
  onReconnect: (account: LinkedAccountMeta) => void;
  onDisconnect: (account: LinkedAccountMeta) => void;
}

export function LinkedAccountCard({ account, onReconnect, onDisconnect }: LinkedAccountCardProps) {
  const isExpired = account.status === 'expired';

  return (
    <Card className={cn('transition-colors', isExpired && 'border-destructive/40 bg-destructive/5')}>
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            'p-2 rounded-lg shrink-0',
            isExpired ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
          )}>
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{account.institutionName}</p>
            <p className="text-xs text-muted-foreground">{account.maskedAccountName}</p>
            {account.balance != null && (
              <p className={cn(
                'text-sm font-semibold mt-0.5',
                account.balance < 0 ? 'text-destructive' : 'text-foreground'
              )}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(account.balance)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              Linked {formatDistanceToNow(new Date(account.linkedAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={isExpired ? 'destructive' : 'secondary'} className="text-xs">
            {isExpired ? 'Needs Attention' : 'Active'}
          </Badge>

          {isExpired && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onReconnect(account)}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="sr-only">Reconnect</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reconnect</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDisconnect(account)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Disconnect</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Disconnect</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}
