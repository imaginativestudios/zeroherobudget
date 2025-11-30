import { LinkedAccount } from '@/types/bankConnections';
import { Building2, CreditCard, Wallet, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface LinkedAccountRowProps {
  account: LinkedAccount;
  institutionName: string;
}

export const LinkedAccountRow = ({ account, institutionName }: LinkedAccountRowProps) => {
  const getAccountIcon = () => {
    switch (account.subtype) {
      case 'checking':
        return Building2;
      case 'savings':
        return Wallet;
      case 'credit':
        return CreditCard;
      default:
        return TrendingUp;
    }
  };

  const Icon = getAccountIcon();

  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{account.name}</p>
            <Badge variant="outline" className="text-xs">
              ****{account.mask}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{institutionName}</p>
        </div>
      </div>

      <div className="flex items-center gap-6 flex-shrink-0">
        <div className="text-right">
          <p className="font-semibold">{formatCurrency(account.balance)}</p>
          <p className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(account.lastUpdated), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};
