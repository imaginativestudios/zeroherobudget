/**
 * Wealth Optimizer — Move 'Lazy Cash' into High-Yield Savings
 *
 * Supportive Coach voice. Safety Floor slider, Lazy Cash calculator,
 * Opportunity Card with sweep action.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  TrendingUp, Shield, Banknote, ArrowRight, Sparkles,
  DollarSign, Percent, Clock, CheckCircle2, Wallet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { SwipeablePageWrapper } from '@/components/SwipeablePageWrapper';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { formatCurrency } from '@/lib/constants';
import { cn } from '@/lib/utils';

// Mock Global Rates API
const MOCK_HYS_APY = 4.09;

function monthlyInterest(principal: number, apy: number): number {
  return principal * (apy / 100) / 12;
}

function yearlyInterest(principal: number, apy: number): number {
  return principal * (apy / 100);
}

export default function Wealth() {
  const { accounts } = useAccounts();
  const { addTransaction } = useTransactions();
  const [safetyFloor, setSafetyFloor] = useUserLocalStorage('bdt_safety_floor', 1000);
  const [swept, setSwept] = useState(false);

  // Find checking & savings accounts
  const checkingAccount = useMemo(
    () => accounts.find(a => a.type === 'checking' && a.isActive),
    [accounts],
  );
  const savingsAccount = useMemo(
    () => accounts.find(a => a.type === 'savings' && a.isActive),
    [accounts],
  );

  const checkingBalance = checkingAccount?.balance ?? 0;
  const lazyCash = Math.max(0, checkingBalance - safetyFloor);
  const monthlyEarning = monthlyInterest(lazyCash, MOCK_HYS_APY);
  const yearlyEarning = yearlyInterest(lazyCash, MOCK_HYS_APY);

  const handleSafetyFloorChange = useCallback((val: number[]) => {
    setSafetyFloor(val[0]);
  }, [setSafetyFloor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0, Math.min(checkingBalance, Number(e.target.value) || 0));
    setSafetyFloor(val);
  };

  const handleSweep = () => {
    if (!checkingAccount || !savingsAccount || lazyCash <= 0) {
      toast.error('Cannot sweep — make sure you have both a Checking and Savings account with available funds.');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    // Log outflow from checking
    addTransaction({
      date: today,
      description: `Sweep to High-Yield Savings`,
      amount: lazyCash,
      category: 'Transfer',
      accountId: checkingAccount.id,
      flow: 'out',
      notes: 'Wealth Optimizer — Lazy Cash sweep',
    });

    // Log inflow to savings
    addTransaction({
      date: today,
      description: `Sweep from Checking`,
      amount: lazyCash,
      category: 'Transfer',
      accountId: savingsAccount.id,
      flow: 'in',
      notes: 'Wealth Optimizer — Lazy Cash sweep',
    });

    setSwept(true);
    toast.success(`Swept ${formatCurrency(lazyCash)} into your High-Yield Savings! 🎉`);
  };

  const maxSlider = Math.max(checkingBalance, 5000);

  return (
    <SwipeablePageWrapper>
      <div className="space-y-6 pb-24 lg:pb-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary" />
            Wealth Optimizer
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Your money is on the bench—let's get it in the game! 👟
          </p>
        </div>

        {/* Rate Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Percent className="h-3 w-3" />
            Current HYS Rate: {MOCK_HYS_APY}% APY
          </Badge>
          <span className="text-[11px] text-muted-foreground">via Global Rates API</span>
        </div>

        {/* Safety Floor Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Safety Floor
            </CardTitle>
            <CardDescription>
              How much do you want to keep in checking for peace of mind?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Slider
                value={[safetyFloor]}
                onValueChange={handleSafetyFloorChange}
                min={0}
                max={maxSlider}
                step={50}
                className="flex-1"
              />
              <div className="relative w-28 shrink-0">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={safetyFloor}
                  onChange={handleInputChange}
                  className="pl-8 h-11 text-right font-mono"
                  min={0}
                  max={checkingBalance}
                />
              </div>
            </div>

            {/* Visual breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Checking</p>
                <p className="font-bold text-foreground">{formatCurrency(checkingBalance)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Safety Floor</p>
                <p className="font-bold text-foreground">{formatCurrency(safetyFloor)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-primary">Lazy Cash</p>
                <p className="font-bold text-primary text-lg">{formatCurrency(lazyCash)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opportunity Card */}
        <AnimatePresence mode="wait">
          {lazyCash > 0 && !swept ? (
            <motion.div
              key="opportunity"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Opportunity Detected
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You have <span className="font-bold text-foreground">{formatCurrency(lazyCash)}</span> sitting
                    in checking. At <span className="font-semibold text-primary">{MOCK_HYS_APY}% APY</span>, this
                    could be earning you{' '}
                    <span className="font-bold text-primary">{formatCurrency(monthlyEarning)}/mo</span> in a
                    High-Yield account. Want to sweep it?
                  </p>

                  {/* Earnings preview */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-background p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-[11px] uppercase tracking-wider">Monthly</span>
                      </div>
                      <p className="text-xl font-bold text-primary">{formatCurrency(monthlyEarning)}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="text-[11px] uppercase tracking-wider">Yearly</span>
                      </div>
                      <p className="text-xl font-bold text-primary">{formatCurrency(yearlyEarning)}</p>
                    </div>
                  </div>

                  {!savingsAccount && (
                    <p className="text-xs text-destructive">
                      ⚠️ You need a <strong>Savings</strong> account to sweep. Add one in{' '}
                      <a href="/accounts" className="underline">Accounts</a>.
                    </p>
                  )}

                  <Button
                    size="lg"
                    className="w-full gap-2 h-12"
                    onClick={handleSweep}
                    disabled={!savingsAccount || lazyCash <= 0}
                  >
                    <Banknote className="h-5 w-5" />
                    Sweep {formatCurrency(lazyCash)} Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : lazyCash > 0 && swept ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="border-2 border-accent/30 bg-accent/5">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <CheckCircle2 className="h-12 w-12 text-accent" />
                  <h3 className="text-lg font-bold text-foreground">Sweep Complete!</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Your lazy cash is now working for you. Check your Transactions log for the transfer details.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSwept(false)}>
                    Sweep Again
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="no-lazy-cash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <Wallet className="h-10 w-10 text-muted-foreground/50" />
                  <h3 className="text-base font-semibold text-foreground">No Lazy Cash Right Now</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Your checking balance is at or below your safety floor. Lower the floor or add funds to unlock optimization opportunities.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Educational tip */}
        <Card className="bg-muted/30">
          <CardContent className="py-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Why High-Yield Savings?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Traditional checking accounts pay ~0.01% interest. A High-Yield Savings account at {MOCK_HYS_APY}% APY
                earns roughly <strong>400×</strong> more on the same balance — with no extra risk. Your money works
                harder while staying fully accessible.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SwipeablePageWrapper>
  );
}
