/**
 * Command Center - 3-Column Dashboard Layout
 * 
 * Consolidates the three pillars of personal finance into one responsive grid:
 * 1. Your Debts - Active debt list with target indicator
 * 2. Monthly Budget - Income/expense summary with available for debt
 * 3. Payoff Strategy - Freedom date calculator with real-time updates
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Wallet, 
  Calendar, 
  Plus, 
  ArrowRight,
  Castle,
  TrendingUp,
  AlertCircle,
  Pencil,
  Check,
  Snowflake,
  Flame
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CompactDebtRow } from './CompactDebtRow';
import { FreedomSlider } from '@/components/behavioral/FreedomSlider';
import { formatCurrency } from '@/lib/utils';
import { FUNCTIONAL_COPY, HEROIC_SUBTEXTS } from '@/lib/functionalVocabulary';
import type { Debt } from '@/hooks/useLocalDebts';
import type { DebtItem } from '@/lib/debtCalculations';

interface ExpenseWithId {
  id?: string;
  category: string;
  planned?: number;
  name?: string;
}

interface CommandCenterProps {
  debts: Debt[];
  debtItems: DebtItem[];
  income: number;
  expenses: ExpenseWithId[];
  leftover: number;
  strategy: 'Snowball' | 'Avalanche';
  moatCurrent: number;
  moatTarget: number;
  currentBoss: Debt | null;
  freedomDate: string;
  onAddDebt?: () => void;
  onStrategyUpdate?: (strategy: 'Snowball' | 'Avalanche') => void;
  // Budget editing props
  onIncomeChange?: (newIncome: number) => void;
  onExpenseChange?: (id: string, newAmount: number) => void;
}

export function CommandCenter({
  debts,
  debtItems,
  income,
  expenses,
  leftover,
  strategy,
  moatCurrent,
  moatTarget,
  currentBoss,
  freedomDate,
  onAddDebt,
  onStrategyUpdate,
  onIncomeChange,
  onExpenseChange,
}: CommandCenterProps) {
  const [isEditing, setIsEditing] = useState(false);
  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.planned || 0), 0);
  const moatPercentage = moatTarget > 0 ? Math.min(100, (moatCurrent / moatTarget) * 100) : 0;
  const activeDebts = debts.filter(d => d.balance > 0);
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.balance, 0);
  
  // Get top 5 expense categories by planned amount
  const topExpenses = [...expenses]
    .sort((a, b) => (b.planned || 0) - (a.planned || 0))
    .slice(0, 5);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    })
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Column 1: Your Debts */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="shadow-royal hover-lift h-full card-debt">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    {FUNCTIONAL_COPY.debts}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px]">
                        <p className="font-medium">What counts as debt?</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Loans and credit balances you are actively paying off to zero
                          (credit cards, student loans, mortgages, car loans).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {HEROIC_SUBTEXTS.debts}
                  </p>
                </div>
                {activeDebts.length > 0 && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                    {formatCurrency(totalDebt)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-2">
              {activeDebts.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">No active debts!</p>
                    <p className="text-sm text-muted-foreground">
                      You're debt-free. Focus on building your emergency fund.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Debt list - max 5 shown */}
                  <div className="space-y-1">
                    {activeDebts.slice(0, 5).map(debt => (
                      <CompactDebtRow 
                        key={debt.id} 
                        debt={debt} 
                        isTarget={currentBoss?.id === debt.id}
                      />
                    ))}
                  </div>
                  
                  {activeDebts.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      +{activeDebts.length - 5} more debts
                    </p>
                  )}
                </>
              )}
              
              <Separator className="my-3" />
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 min-h-[44px]"
                  onClick={onAddDebt}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Debt
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 min-h-[44px]"
                  asChild
                >
                  <Link to="/debts">
                    View Strategy <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Column 2: Monthly Budget */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="shadow-royal hover-lift h-full card-expense">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-success" />
                    {FUNCTIONAL_COPY.budget}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px]">
                        <p className="font-medium">What counts as an expense?</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Recurring monthly costs like rent, utilities, groceries, 
                          subscriptions, and discretionary spending.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {HEROIC_SUBTEXTS.budget}
                  </p>
                </div>
                {/* Edit Toggle */}
                {(onIncomeChange || onExpenseChange) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="h-8 w-8 p-0"
                    aria-label={isEditing ? "Done editing" : "Edit budget"}
                  >
                    {isEditing ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Income Display/Edit */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                <span className="font-medium">Monthly Income</span>
                {isEditing && onIncomeChange ? (
                  <CurrencyInput
                    prefix="$"
                    value={income || ''}
                    onChange={(e) => onIncomeChange(parseFloat(e.target.value) || 0)}
                    className="w-28 text-right"
                    aria-label="Monthly income"
                  />
                ) : (
                  <span className="text-lg font-bold text-success">
                    {income > 0 ? formatCurrency(income) : '—'}
                  </span>
                )}
              </div>
              
              {/* Top Expenses */}
              {topExpenses.length > 0 ? (
                <div className="space-y-2">
                  {topExpenses.map((expense, i) => (
                    <div key={expense.id || i} className="flex items-center justify-between py-1.5 text-sm">
                      <span className="text-muted-foreground truncate max-w-[120px]">
                        {expense.name || expense.category}
                      </span>
                      {isEditing && onExpenseChange && expense.id ? (
                        <CurrencyInput
                          prefix="$"
                          value={expense.planned || ''}
                          onChange={(e) => onExpenseChange(expense.id!, parseFloat(e.target.value) || 0)}
                          className="w-24 text-right text-sm"
                          variant="expense"
                          aria-label={`${expense.name || expense.category} amount`}
                        />
                      ) : (
                        <span className="font-medium">
                          {formatCurrency(expense.planned || 0)}
                        </span>
                      )}
                    </div>
                  ))}
                  {expenses.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{expenses.length - 5} more categories
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No expenses set up yet
                  </p>
                </div>
              )}
              
              <Separator />
              
              {/* Available for Debt */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="font-medium">Available for Debt</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(Math.max(0, leftover))}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full min-h-[44px]"
                asChild
              >
                <Link to="/budgets">
                  Open Budget Planner <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Column 3: Payoff Strategy */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="shadow-royal hover-lift h-full">
            <CardHeader className="pb-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {FUNCTIONAL_COPY.strategy}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {HEROIC_SUBTEXTS.strategy}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Freedom Date Display */}
              {activeDebts.length > 0 ? (
                <>
                  <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Debt-Free By
                    </p>
                    <p className="text-2xl font-bold text-primary">{freedomDate}</p>
                    {onStrategyUpdate ? (
                      <div className="flex justify-center gap-1 mt-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={strategy === "Snowball" ? "default" : "outline"}
                              size="sm"
                              className="text-xs h-7 px-2"
                              onClick={() => onStrategyUpdate("Snowball")}
                            >
                              <Snowflake className="h-3 w-3 mr-1" />
                              Snowball
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[200px]">
                            <p className="font-medium">Snowball Method</p>
                            <p className="text-sm text-muted-foreground">
                              Pay smallest debts first for quick psychological wins.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={strategy === "Avalanche" ? "default" : "outline"}
                              size="sm"
                              className="text-xs h-7 px-2"
                              onClick={() => onStrategyUpdate("Avalanche")}
                            >
                              <Flame className="h-3 w-3 mr-1" />
                              Avalanche
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[200px]">
                            <p className="font-medium">Avalanche Method</p>
                            <p className="text-sm text-muted-foreground">
                              Pay highest interest first to save the most money.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ) : (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {strategy} Strategy
                      </Badge>
                    )}
                  </div>
                  
                  {/* Embedded FreedomSlider (compact) */}
                  {leftover > 0 ? (
                    <FreedomSlider 
                      debts={debtItems} 
                      currentExtraBudget={leftover}
                      strategy={strategy}
                      variant="compact"
                      maxAmount={Math.min(1000, leftover * 2)}
                    />
                  ) : (
                    <div className="text-center py-4 px-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground">
                        Increase income or reduce expenses to unlock the freedom simulator.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <p className="font-medium text-success">Debt-Free!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Focus on growing your emergency fund below.
                  </p>
                </div>
              )}
              
              <Separator />
              
              {/* Emergency Fund Mini-Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Castle className="h-4 w-4 text-primary" />
                    <span className="font-medium">{FUNCTIONAL_COPY.emergencyFund}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(moatCurrent)} / {formatCurrency(moatTarget || 1000)}
                  </span>
                </div>
                <Progress value={moatPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {moatPercentage.toFixed(0)}% of goal
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
