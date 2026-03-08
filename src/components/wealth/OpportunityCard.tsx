import { useState } from 'react';
import {
  TrendingUp, Banknote, ArrowRight, Sparkles,
  Clock, Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/lib/constants';

interface OpportunityCardProps {
  lazyCash: number;
  monthlyEarning: number;
  yearlyEarning: number;
  apy: number;
  hasSavingsAccount: boolean;
  checkingAccountName?: string;
  savingsAccountName?: string;
  onSweep: () => void;
}

export function OpportunityCard({
  lazyCash,
  monthlyEarning,
  yearlyEarning,
  apy,
  hasSavingsAccount,
  checkingAccountName,
  savingsAccountName,
  onSweep,
}: OpportunityCardProps) {
  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          Opportunity Detected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          You have <span className="font-bold text-foreground">{formatCurrency(lazyCash)}</span> sitting
          in checking. At <span className="font-semibold text-primary">{apy}% APY</span>, this
          could be earning you approximately{' '}
          <span className="font-bold text-primary">{formatCurrency(monthlyEarning)}/mo</span> in a
          High-Yield account. Want to sweep it?
        </p>

        {/* Earnings preview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-background p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-[11px] uppercase tracking-wider">Monthly (est.)</span>
            </div>
            <p className="text-xl font-bold text-primary">{formatCurrency(monthlyEarning)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-[11px] uppercase tracking-wider">Yearly (est.)</span>
            </div>
            <p className="text-xl font-bold text-primary">{formatCurrency(yearlyEarning)}</p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
          Estimates are illustrative and based on a {apy}% APY. Actual returns may vary. This is not financial advice.
        </p>

        {!hasSavingsAccount && (
          <p className="text-xs text-destructive" role="alert">
            ⚠️ You need a <strong>Savings</strong> account to sweep. Add one in{' '}
            <a href="/accounts" className="underline">Accounts</a>.
          </p>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="lg"
              className="w-full gap-2 h-12"
              disabled={!hasSavingsAccount || lazyCash <= 0}
            >
              <Banknote className="h-5 w-5" aria-hidden="true" />
              Sweep {formatCurrency(lazyCash)} Now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Sweep Transfer</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2">
                  <p>This will log a transfer of <strong>{formatCurrency(lazyCash)}</strong>:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>From: <strong>{checkingAccountName || 'Checking'}</strong></li>
                    <li>To: <strong>{savingsAccountName || 'Savings'}</strong></li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    This records a transfer in your transaction history. It does not move money at your bank.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onSweep}>
                Confirm Sweep
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
