import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { ConnectionStatus } from '@/types/bankConnections';
import { cn } from '@/lib/utils';

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
  showIcon?: boolean;
}

export const ConnectionStatusBadge = ({ status, showIcon = true }: ConnectionStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          label: 'Connected',
          icon: CheckCircle2,
          className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        };
      case 'syncing':
        return {
          label: 'Syncing',
          icon: Loader2,
          className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
          animate: true,
        };
      case 'needs_attention':
        return {
          label: 'Needs Attention',
          icon: AlertCircle,
          className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        };
      case 'disconnected':
        return {
          label: 'Disconnected',
          icon: XCircle,
          className: 'bg-muted text-muted-foreground border-border',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1.5', config.className)}>
      {showIcon && (
        <Icon className={cn('h-3 w-3', config.animate && 'animate-spin')} />
      )}
      {config.label}
    </Badge>
  );
};
