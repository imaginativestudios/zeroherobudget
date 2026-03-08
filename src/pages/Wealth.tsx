/**
 * Wealth Optimizer — Move 'Lazy Cash' into High-Yield Savings
 *
 * Supportive Coach voice. Safety Floor slider, Lazy Cash calculator,
 * Opportunity Card with sweep action + confirmation dialog.
 */

import { useState, useMemo, useCallback } from 'react';
import { TrendingUp, Percent, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SwipeablePageWrapper } from '@/components/SwipeablePageWrapper';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { formatCurrency } from '@/lib/constants';

import { SafetyFloorCard } from '@/components/wealth/SafetyFloorCard';
import { OpportunityCard } from '@/components/wealth/OpportunityCard';
import { SweepSuccessCard } from '@/components/wealth/SweepSuccessCard';
import { NoLazyCashCard } from '@/components/wealth/NoLazyCashCard';
import { AccountSelector } from '@/components/wealth/AccountSelector';

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

  // Filter active checking & savings accounts
  const checkingAccounts = useMemo(
    () => accounts.filter(a => a.type === 'checking' && a.isActive),
    [accounts],
  );
  const savingsAccounts = useMemo(
    () => accounts.filter(a => a.type === 'savings' && a.isActive),
    [accounts],
  );

  // Selected account IDs (default to first)
  const [selectedCheckingId, setSelectedCheckingId] = useUserLocalStorage<string | undefined>(
    'bdt_wealth_checking_id',
    undefined,
  );
  const [selectedSavingsId, setSelectedSavingsId] = useUserLocalStorage<string | undefined>(
    'bdt_wealth_savings_id',
    undefined,
  );

  const checkingAccount = useMemo(
    () => checkingAccounts.find(a => a.id === selectedCheckingId) ?? checkingAccounts[0],
    [checkingAccounts, selectedCheckingId],
  );
  const savingsAccount = useMemo(
    () => savingsAccounts.find(a => a.id === selectedSavingsId) ?? savingsAccounts[0],
    [savingsAccounts, selectedSavingsId],
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
    const sweepAmount = lazyCash;

    // Log outflow from checking
    addTransaction({
      date: today,
      description: `Sweep to High-Yield Savings`,
      amount: sweepAmount,
      category: 'Transfer',
      accountId: checkingAccount.id,
      flow: 'out',
      notes: 'Wealth Optimizer — Lazy Cash sweep',
    });

    // Log inflow to savings
    addTransaction({
      date: today,
      description: `Sweep from Checking`,
      amount: sweepAmount,
      category: 'Transfer',
      accountId: savingsAccount.id,
      flow: 'in',
      notes: 'Wealth Optimizer — Lazy Cash sweep',
    });

    setSwept(true);
    toast.success(`Swept ${formatCurrency(sweepAmount)} into your High-Yield Savings! 🎉`);
  };

  const maxSlider = Math.max(checkingBalance, 1000);

  return (
    <SwipeablePageWrapper>
      <div className="space-y-6 pb-24 lg:pb-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary" aria-hidden="true" />
            Wealth Optimizer
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Your money is on the bench—let's get it in the game! 👟
          </p>
        </div>

        {/* Rate Badge + Disclaimer */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Percent className="h-3 w-3" aria-hidden="true" />
            HYS Rate: {MOCK_HYS_APY}% APY
          </Badge>
          <span className="text-[11px] text-muted-foreground">(illustrative — not a live rate)</span>
        </div>

        {/* Account selectors for multi-account users */}
        {(checkingAccounts.length > 1 || savingsAccounts.length > 1) && (
          <div className="flex flex-wrap gap-4">
            <AccountSelector
              label="Checking account"
              accounts={checkingAccounts}
              selectedId={checkingAccount?.id}
              onSelect={setSelectedCheckingId}
            />
            <AccountSelector
              label="Savings account"
              accounts={savingsAccounts}
              selectedId={savingsAccount?.id}
              onSelect={setSelectedSavingsId}
            />
          </div>
        )}

        {/* Safety Floor Card */}
        <SafetyFloorCard
          safetyFloor={safetyFloor}
          checkingBalance={checkingBalance}
          lazyCash={lazyCash}
          maxSlider={maxSlider}
          onSliderChange={handleSafetyFloorChange}
          onInputChange={handleInputChange}
        />

        {/* Opportunity / Success / Empty */}
        <AnimatePresence mode="wait">
          {lazyCash > 0 && !swept ? (
            <motion.div
              key="opportunity"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <OpportunityCard
                lazyCash={lazyCash}
                monthlyEarning={monthlyEarning}
                yearlyEarning={yearlyEarning}
                apy={MOCK_HYS_APY}
                hasSavingsAccount={!!savingsAccount}
                checkingAccountName={checkingAccount?.name}
                savingsAccountName={savingsAccount?.name}
                onSweep={handleSweep}
              />
            </motion.div>
          ) : lazyCash > 0 && swept ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <SweepSuccessCard onSweepAgain={() => setSwept(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="no-lazy-cash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <NoLazyCashCard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Educational tip */}
        <Card className="bg-muted/30">
          <CardContent className="py-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">What is "Lazy Cash"?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lazy Cash is any money in your checking account <strong>above</strong> your Safety Floor — the
                minimum you want to keep on hand. Instead of sitting idle at ~0.01% interest, it could earn
                roughly <strong>400×</strong> more in a High-Yield Savings account. This tool helps you spot
                and track those transfers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SwipeablePageWrapper>
  );
}
