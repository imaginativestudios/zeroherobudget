/**
 * Debt Crusher — Strategy Page
 * 
 * Supportive Coach voice header, priority-ordered debt list,
 * progress bar, potential savings card, and commit-to-plan action.
 */

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Compass, Target, Plus, Download, Upload, Trash2,
  TrendingDown, Calendar, Snowflake, Flame, ArrowRight,
  Info, Sparkles, CheckCircle2, Zap, Scale, SlidersHorizontal,
  Lightbulb,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserLocalStorage } from "@/hooks/useUserLocalStorage";
import { useTransactions } from "@/hooks/useTransactions";
import { SAMPLE_DEBTS, formatCurrency } from "@/lib/constants";
import { simulatePayoff, getDetailedPaymentSchedule, calculatePayoffPlan, compareStrategies } from "@/lib/debtCalculations";
import { toCsv, downloadCsv, parseCsv, mapDebtCsv, validateCsvFile, type Debt } from "@/lib/csvUtils";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CustomLineLegend } from "@/components/charts/CustomChartLegend";
import { STANDARD_TOOLTIP_STYLE, currencyFormatter } from "@/lib/chartConfig";
import { EmptyChartNotice } from "@/components/EmptyChartNotice";
import { PaymentScheduleTable } from "@/components/debt/PaymentScheduleTable";
import { StrategyComparison } from "@/components/debt/StrategyComparison";
import { FreedomSlider } from "@/components/behavioral/FreedomSlider";
import { EditableValue } from "@/components/ui/editable-value";
import { SwipeablePageWrapper } from '@/components/SwipeablePageWrapper';
import { Slider } from "@/components/ui/slider";
import { generateDebtCoachTips } from "@/lib/debtInsights";
import { cn } from "@/lib/utils";

export const DebtSnowball = () => {
  const [debts, setDebts] = useUserLocalStorage("bdt_debts", SAMPLE_DEBTS);
  const [strategy, setStrategy] = useUserLocalStorage("bdt_strategy", "Snowball");
  const [income] = useUserLocalStorage("bdt_income", 0);
  const [expenses] = useUserLocalStorage("bdt_expenses", []);
  const { transactions } = useTransactions();
  const [committedStrategy, setCommittedStrategy] = useUserLocalStorage<string | null>("bdt_committed_strategy", null);

  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');

  // Simulator state (independent from main strategy)
  const [simStrategy, setSimStrategy] = useState<"Snowball" | "Avalanche">(strategy as "Snowball" | "Avalanche");
  const [simExtra, setSimExtra] = useState<number>(0);

  const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + (expense.planned || 0), 0);
  const leftover = Math.max(0, (income || 0) - totalExpenses);

  // Core calculations
  const currentPlan = useMemo(() =>
    calculatePayoffPlan(debts, leftover, strategy as "Snowball" | "Avalanche"),
    [debts, leftover, strategy]
  );

  const comparison = useMemo(() =>
    compareStrategies(debts, leftover, strategy as "Snowball" | "Avalanche"),
    [debts, leftover, strategy]
  );

  const detailedSchedule = useMemo(() =>
    getDetailedPaymentSchedule(debts, leftover, strategy as "Snowball" | "Avalanche"),
    [debts, leftover, strategy]
  );

  // Simulator calculations
  const baselinePlan = useMemo(() =>
    calculatePayoffPlan(debts, leftover, strategy as "Snowball" | "Avalanche"),
    [debts, leftover, strategy]
  );

  const simPlan = useMemo(() =>
    calculatePayoffPlan(debts, leftover + simExtra, simStrategy),
    [debts, leftover, simExtra, simStrategy]
  );

  const simInterestSaved = baselinePlan.totalInterest - simPlan.totalInterest;
  const simMonthsSaved = baselinePlan.months - simPlan.months;

  const coachTips = useMemo(() =>
    generateDebtCoachTips(debts, leftover + simExtra, simStrategy),
    [debts, leftover, simExtra, simStrategy]
  );

  const handleApplySimPlan = () => {
    setStrategy(simStrategy);
    toast.success(`Applied ${simStrategy} strategy with $${simExtra}/mo extra!`, {
      icon: <CheckCircle2 className="h-5 w-5 text-success" />,
    });
  };

  const totalDebt = debts.filter(d => d.balance > 0).reduce((sum, d) => sum + d.balance, 0);
  const totalOriginal = debts.reduce((sum, d) => sum + (d._orig || d.balance || 0), 0);
  const overallProgress = totalOriginal > 0 ? ((totalOriginal - totalDebt) / totalOriginal) * 100 : 0;

  const addDebt = (type: "card" | "loan") => {
    const newDebt: Debt = {
      id: crypto.randomUUID(),
      name: type === "card" ? "New Credit Card" : "New Loan",
      balance: 0,
      apr: 0,
      min: 0,
      type,
      _orig: 0,
    };
    setDebts([...debts, newDebt]);
  };

  const updateDebt = (id: string, field: keyof Debt, value: string | number) => {
    setDebts(debts.map(debt => {
      if (debt.id === id) {
        const updated = { ...debt, [field]: value };
        if (field === 'balance') updated._orig = updated._orig ?? Number(value);
        return updated;
      }
      return debt;
    }));
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  const exportDebts = () => {
    const rows = [
      ["name", "balance", "apr", "min", "type"],
      ...debts.map(debt => [debt.name, debt.balance.toString(), debt.apr.toString(), debt.min.toString(), debt.type || "debt"]),
    ];
    downloadCsv("debts.csv", toCsv(rows));
  };

  const importDebts = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validation = validateCsvFile(file);
    if (!validation.isValid) {
      toast.error(`Import failed: ${validation.error}`);
      event.target.value = "";
      return;
    }
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      const mapped = mapDebtCsv(rows);
      if (mapped.length) {
        setDebts(mapped);
        toast.success(`Imported ${mapped.length} debts`);
      } else {
        toast.error("No valid debt data found");
      }
    } catch {
      toast.error("Failed to import file");
    }
    event.target.value = "";
  };

  const handleCommitPlan = () => {
    setCommittedStrategy(strategy);
    toast.success(`Committed to ${strategy} strategy! Stay the course.`, {
      icon: <CheckCircle2 className="h-5 w-5 text-success" />,
    });
  };

  const activeDebts = debts.filter(d => d.balance > 0);

  return (
    <SwipeablePageWrapper leftRoute="/transactions" rightRoute="/budgets">
      <div className="space-y-8">
        {/* Header */}
        <div className="pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Debt Crusher</h1>
              <p className="text-sm text-muted-foreground mt-1">Your path to financial freedom</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportDebts} aria-label="Export debts to CSV">
                <Download className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline ml-2">Export</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('import-debt-file')?.click()} aria-label="Import debts">
                <Upload className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline ml-2">Import</span>
              </Button>
              <input id="import-debt-file" type="file" accept=".csv" className="hidden" onChange={importDebts} />
            </div>
          </div>
        </div>

        {/* Supportive Coach Banner */}
        {activeDebts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardContent className="py-4 flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Your Coach Says:</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {comparison.coachMessage}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Overall Progress Bar */}
        {totalOriginal > 0 && (
          <Card>
            <CardContent className="py-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Debt Remaining</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalDebt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Paid Off</p>
                  <p className="text-2xl font-bold text-success">{overallProgress.toFixed(1)}%</p>
                </div>
              </div>
              <Progress value={overallProgress} className="h-4" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Started: {formatCurrency(totalOriginal)}</span>
                <span>Goal: $0</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex border border-border rounded-lg overflow-hidden bg-transparent p-0 h-auto">
            {[
              { value: "overview", icon: Compass, label: "Overview" },
              { value: "schedule", icon: Calendar, label: "Schedule" },
              { value: "compare", icon: Scale, label: "Compare" },
              { value: "simulator", icon: SlidersHorizontal, label: "Simulator" },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3",
                  "bg-background text-foreground/70 font-medium text-xs sm:text-sm",
                  "border-r border-border last:border-r-0",
                  "hover:bg-muted hover:text-foreground transition-all cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold data-[state=active]:shadow-sm"
                )}
              >
                <tab.icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden xs:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-8">
            {/* Strategy Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3">
                  <Target className="h-5 w-5 text-accent" aria-hidden="true" />
                  Payoff Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex border border-border rounded-lg overflow-hidden w-full sm:w-auto">
                    <Button
                      variant={strategy === "Snowball" ? "royal" : "ghost"}
                      className="rounded-none flex-1 sm:flex-initial text-xs sm:text-sm"
                      onClick={() => setStrategy("Snowball")}
                    >
                      <Snowflake className="h-4 w-4 mr-1" aria-hidden="true" />
                      Snowball
                    </Button>
                    <Button
                      variant={strategy === "Avalanche" ? "royal" : "ghost"}
                      className="rounded-none flex-1 sm:flex-initial text-xs sm:text-sm"
                      onClick={() => setStrategy("Avalanche")}
                    >
                      <Flame className="h-4 w-4 mr-1" aria-hidden="true" />
                      Avalanche
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Extra Budget: <span className="font-bold text-accent-dark">{formatCurrency(leftover)}</span>
                  </div>
                </div>

                {/* Strategy Explanation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      key: "Snowball" as const,
                      icon: Snowflake,
                      title: "Snowball Method",
                      desc: "Pay off smallest balances first, then roll payments into larger debts.",
                      best: "Quick psychological wins and staying motivated.",
                    },
                    {
                      key: "Avalanche" as const,
                      icon: Flame,
                      title: "Avalanche Method",
                      desc: "Pay off highest interest rate debts first to minimize total interest.",
                      best: "Saving the most money mathematically.",
                    },
                  ].map(s => (
                    <div
                      key={s.key}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all cursor-pointer",
                        strategy === s.key ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
                      )}
                      onClick={() => setStrategy(s.key)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setStrategy(s.key)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <s.icon className={cn("h-5 w-5", strategy === s.key ? "text-primary" : "text-muted-foreground")} />
                        <h3 className={cn("font-semibold", strategy === s.key ? "text-primary" : "text-foreground")}>{s.title}</h3>
                        {strategy === s.key && (
                          <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Active</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{s.desc}</p>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Best for:</span> {s.best}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Potential Savings Card */}
            {activeDebts.length > 0 && comparison.interestSaved > 0 && strategy !== "Avalanche" && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                <Card className="border-2 border-success bg-success/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-success" />
                      Potential Savings
                    </CardTitle>
                    <CardDescription>
                      Comparing your current {strategy} plan vs. the Avalanche method
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Interest</p>
                        <p className="text-lg font-bold text-destructive">{formatCurrency(comparison.current.totalInterest)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avalanche Interest</p>
                        <p className="text-lg font-bold text-success">{formatCurrency(comparison.optimized.totalInterest)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">You Save</p>
                        <p className="text-lg font-bold text-success">{formatCurrency(comparison.interestSaved)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Months Saved</p>
                        <p className="text-lg font-bold text-success">
                          {comparison.monthsSaved > 0 ? comparison.monthsSaved : '—'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="mt-4"
                      onClick={() => setStrategy("Avalanche")}
                    >
                      Switch to Avalanche <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Priority-Ordered Debt List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  Your Debts — Priority Order
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-medium">Priority Order</p>
                      <p className="text-sm text-muted-foreground">
                        Debts are ranked by your chosen strategy. Extra payments target #{1} first.
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <AnimatePresence mode="popLayout">
                    {currentPlan.priorityOrder.map((item, index) => {
                      const debt = debts.find(d => d.id === item.id)!;
                      if (!debt) return null;
                      const progressPct = debt._orig ? ((debt._orig - debt.balance) / debt._orig) * 100 : 0;
                      const isTarget = index === 0;
                      const isEditingName = editingNameId === debt.id;

                      return (
                        <motion.div
                          key={debt.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25, delay: index * 0.05 }}
                          className={cn(
                            "border rounded-lg p-4 space-y-3 transition-colors",
                            isTarget ? "border-primary bg-primary/5" : "border-border"
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                isTarget ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              )}>
                                #{item.priority}
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                {isEditingName ? (
                                  <Input
                                    value={editingNameValue}
                                    onChange={e => setEditingNameValue(e.target.value)}
                                    onBlur={() => { updateDebt(debt.id, 'name', editingNameValue); setEditingNameId(null); }}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') { updateDebt(debt.id, 'name', editingNameValue); setEditingNameId(null); }
                                      if (e.key === 'Escape') setEditingNameId(null);
                                    }}
                                    className="font-semibold"
                                    autoFocus
                                  />
                                ) : (
                                  <button
                                    onClick={() => { setEditingNameId(debt.id); setEditingNameValue(debt.name); }}
                                    className="font-semibold text-base text-left hover:bg-muted/50 rounded px-2 py-0.5 -mx-2 transition-colors cursor-text truncate max-w-full block"
                                  >
                                    {debt.name}
                                  </button>
                                )}
                                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                                  <span className="capitalize">{debt.type}</span>
                                  <span>•</span>
                                  <span>APR: {debt.apr}%</span>
                                  {item.payoffLabel && item.payoffLabel !== '—' && (
                                    <>
                                      <span>•</span>
                                      <span className="font-semibold text-accent-dark">Payoff: {item.payoffLabel}</span>
                                    </>
                                  )}
                                  {isTarget && (
                                    <Badge variant="default" className="bg-primary text-primary-foreground text-[10px]">
                                      Current Target
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => removeDebt(debt.id)}
                              className="text-destructive hover:text-destructive"
                              aria-label={`Remove ${debt.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>{progressPct.toFixed(1)}%</span>
                            </div>
                            <Progress value={progressPct} className="h-2" />
                          </div>

                          <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">Balance</label>
                              <EditableValue
                                value={debt.balance}
                                onChange={v => updateDebt(debt.id, 'balance', v)}
                                prefix="$"
                                formatDisplay={formatCurrency}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">APR</label>
                              <EditableValue
                                value={debt.apr}
                                onChange={v => updateDebt(debt.id, 'apr', v)}
                                suffix="%"
                                step={0.1}
                                formatDisplay={v => `${v}%`}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">Min Payment</label>
                              <EditableValue
                                value={debt.min}
                                onChange={v => updateDebt(debt.id, 'min', v)}
                                prefix="$"
                                formatDisplay={formatCurrency}
                              />
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Est. Interest: <span className="font-semibold">{formatCurrency(item.totalInterest)}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col xs:flex-row gap-3">
                  <Button onClick={() => addDebt("card")} variant="royal" className="flex-1 xs:flex-initial text-sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Credit Card
                  </Button>
                  <Button onClick={() => addDebt("loan")} variant="royal" className="flex-1 xs:flex-initial text-sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Loan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Freedom Slider */}
            <FreedomSlider debts={debts} currentExtraBudget={leftover} strategy={strategy as "Snowball" | "Avalanche"} />

            {/* Timeline Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-accent" aria-hidden="true" />
                  Debt Balance Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentPlan.timeline.length > 0 ? (
                  <>
                    <CustomLineLegend items={[{ label: "Total Debt Balance", color: "hsl(var(--primary))" }]} />
                    <div className="h-[350px] sm:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={currentPlan.timeline} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                          <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                          <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                          <Tooltip formatter={currencyFormatter} contentStyle={STANDARD_TOOLTIP_STYLE} />
                          <Line type="monotone" dataKey="totalBalance" name="Total Debt Balance" strokeWidth={3} dot={false} stroke="hsl(var(--primary))" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {currentPlan.totalInterest > 0 && (
                      <div className="mt-4 p-4 bg-muted rounded-lg flex items-center justify-between flex-wrap gap-3">
                        <div className="text-sm text-muted-foreground">
                          Total Interest: <span className="font-bold text-destructive text-lg">{formatCurrency(currentPlan.totalInterest)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Debt-Free By: <span className="font-bold text-accent-dark text-lg">{currentPlan.debtFreeDate}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyChartNotice title="No Data Available" message="Add debts above to see your payoff timeline" />
                )}
              </CardContent>
            </Card>

            {/* Commit to Plan */}
            {activeDebts.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Card className="border-2 border-primary/20">
                  <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">Ready to crush your debt?</p>
                      <p className="text-sm text-muted-foreground">
                        Commit to the {strategy} strategy and stay the course.
                      </p>
                    </div>
                    <Button
                      onClick={handleCommitPlan}
                      variant="royal"
                      size="lg"
                      className="min-w-[180px]"
                    >
                      {committedStrategy === strategy ? (
                        <><CheckCircle2 className="h-5 w-5 mr-2" /> Plan Committed</>
                      ) : (
                        <><Target className="h-5 w-5 mr-2" /> Commit to Plan</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="mt-8">
            <PaymentScheduleTable schedule={detailedSchedule} strategy={strategy as "Snowball" | "Avalanche"} />
          </TabsContent>

          <TabsContent value="compare" className="mt-8">
            <StrategyComparison
              debts={debts}
              extraBudget={leftover}
              currentStrategy={strategy as "Snowball" | "Avalanche"}
              onStrategyChange={newStrategy => setStrategy(newStrategy)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </SwipeablePageWrapper>
  );
};
