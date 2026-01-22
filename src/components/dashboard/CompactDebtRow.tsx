/**
 * CompactDebtRow - Minimal debt display for Command Center
 * 
 * Shows debt name, balance, and APR in a condensed row format.
 * Highlights the current target debt based on payoff strategy.
 */

import { CreditCard, Landmark, Car, Home, GraduationCap, Banknote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import type { Debt } from '@/hooks/useLocalDebts';

interface CompactDebtRowProps {
  debt: Debt;
  isTarget: boolean;
}

// Map debt types to icons
const debtTypeIcons: Record<string, React.ElementType> = {
  card: CreditCard,
  credit_card: CreditCard,
  auto: Car,
  car: Car,
  mortgage: Home,
  home: Home,
  student: GraduationCap,
  education: GraduationCap,
  personal: Banknote,
  loan: Landmark,
};

export function CompactDebtRow({ debt, isTarget }: CompactDebtRowProps) {
  const Icon = debtTypeIcons[debt.type?.toLowerCase()] || Landmark;
  
  return (
    <div 
      className={cn(
        "flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors",
        isTarget 
          ? "bg-primary/10 ring-1 ring-primary/30" 
          : "hover:bg-muted/50"
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="font-medium truncate">{debt.name}</span>
        {isTarget && (
          <Badge variant="outline" className="text-xs shrink-0 bg-primary/5 text-primary border-primary/30">
            Target
          </Badge>
        )}
      </div>
      <div className="text-right shrink-0 ml-2">
        <p className="font-semibold text-foreground">{formatCurrency(debt.balance)}</p>
        <p className="text-xs text-muted-foreground">{debt.interest_rate}% APR</p>
      </div>
    </div>
  );
}
