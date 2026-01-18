import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Compass, Target, Plus, Download, Upload, Trash2, DollarSign, TrendingDown, Calendar, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserLocalStorage } from "@/hooks/useUserLocalStorage";
import { useTransactions } from "@/hooks/useTransactions";
import { SAMPLE_DEBTS, formatCurrency } from "@/lib/constants";
import { simulatePayoff, getDetailedPaymentSchedule } from "@/lib/debtCalculations";
import { toCsv, downloadCsv, parseCsv, mapDebtCsv, validateCsvFile, type Debt } from "@/lib/csvUtils";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CustomLineLegend } from "@/components/charts/CustomChartLegend";
import { STANDARD_TOOLTIP_STYLE, currencyFormatter } from "@/lib/chartConfig";
import { EmptyChartNotice } from "@/components/EmptyChartNotice";
import { PaymentScheduleTable } from "@/components/debt/PaymentScheduleTable";
import { StrategyComparison } from "@/components/debt/StrategyComparison";
import { FreedomSlider } from "@/components/behavioral/FreedomSlider";

export const DebtSnowball = () => {
  const [debts, setDebts] = useUserLocalStorage("bdt_debts", SAMPLE_DEBTS);
  const [strategy, setStrategy] = useUserLocalStorage("bdt_strategy", "Snowball");
  const [income] = useUserLocalStorage("bdt_income", 0);
  const [expenses] = useUserLocalStorage("bdt_expenses", []);
  const { transactions } = useTransactions();

  const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + (expense.planned || 0), 0);
  const leftover = Math.max(0, (income || 0) - totalExpenses);

  const schedule = useMemo(() => 
    simulatePayoff(debts, leftover, strategy as "Snowball" | "Avalanche"), 
    [debts, leftover, strategy]
  );

  const detailedSchedule = useMemo(() => 
    getDetailedPaymentSchedule(debts, leftover, strategy as "Snowball" | "Avalanche"),
    [debts, leftover, strategy]
  );

  const addDebt = (type: "card" | "loan") => {
    const newDebt: Debt = {
      id: crypto.randomUUID(),
      name: type === "card" ? "New Credit Card" : "New Loan",
      balance: 0,
      apr: 0,
      min: 0,
      type,
      _orig: 0
    };
    setDebts([...debts, newDebt]);
  };

  const updateDebt = (id: string, field: keyof Debt, value: string | number) => {
    setDebts(debts.map(debt => {
      if (debt.id === id) {
        const updated = { ...debt, [field]: value };
        if (field === 'balance') {
          updated._orig = updated._orig ?? Number(value);
        }
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
      ...debts.map(debt => [
        debt.name,
        debt.balance.toString(),
        debt.apr.toString(),
        debt.min.toString(),
        debt.type || "debt"
      ])
    ];
    downloadCsv("debts.csv", toCsv(rows));
  };

  const importDebts = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file before processing
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
        toast.success(`Successfully imported ${mapped.length} debts`);
      } else {
        toast.error("No valid debt data found in the file");
      }
    } catch (error) {
      toast.error("Failed to import file. Please check the format and try again.");
      console.error("Import error:", error);
    }
    
    event.target.value = "";
  };

  return (
    <div className="space-y-8">
      <div className="pt-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Clear Your Shadows</h1>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportDebts} aria-label="Export debts to CSV">
              <Download className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline ml-2">Export CSV</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => document.getElementById('import-debt-file')?.click()} aria-label="Import debts from CSV">
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline ml-2">Import CSV</span>
            </Button>
            <input
              id="import-debt-file"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={importDebts}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex border border-border rounded-lg overflow-hidden bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="overview"
            className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 
                       bg-background text-foreground/70 font-medium text-xs sm:text-sm
                       border-r border-border last:border-r-0
                       hover:bg-muted hover:text-foreground
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                       transition-all cursor-pointer
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground 
                       data-[state=active]:font-semibold data-[state=active]:shadow-sm"
          >
            <Compass className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xs:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="schedule"
            className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 
                       bg-background text-foreground/70 font-medium text-xs sm:text-sm
                       border-r border-border last:border-r-0
                       hover:bg-muted hover:text-foreground
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                       transition-all cursor-pointer
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground 
                       data-[state=active]:font-semibold data-[state=active]:shadow-sm"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xs:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger 
            value="compare"
            className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 
                       bg-background text-foreground/70 font-medium text-xs sm:text-sm
                       border-r border-border last:border-r-0
                       hover:bg-muted hover:text-foreground
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                       transition-all cursor-pointer
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground 
                       data-[state=active]:font-semibold data-[state=active]:shadow-sm"
          >
            <Scale className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xs:inline">Compare</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-8">
          {/* Strategy Selection */}
          <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-3">
            <Target className="h-5 w-5 text-accent" aria-hidden="true" />
            Payoff Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col xs:flex-row border border-border rounded-lg overflow-hidden w-full xs:w-auto">
              <Button
                variant={strategy === "Snowball" ? "royal" : "ghost"}
                className="rounded-none text-xs sm:text-sm"
                onClick={() => setStrategy("Snowball")}
              >
                <span className="hidden sm:inline">Snowball (Smallest First)</span>
                <span className="sm:hidden">Snowball</span>
              </Button>
              <Button
                variant={strategy === "Avalanche" ? "royal" : "ghost"}
                className="rounded-none text-xs sm:text-sm"
                onClick={() => setStrategy("Avalanche")}
              >
                <span className="hidden sm:inline">Avalanche (Highest APR)</span>
                <span className="sm:hidden">Avalanche</span>
              </Button>
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">
              Extra Budget: <span className="font-bold text-accent-dark">{formatCurrency(leftover)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Debt Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {debts.map((debt) => {
              const progressPercentage = debt._orig 
                ? ((debt._orig - debt.balance) / debt._orig) * 100 
                : 0;
              const payoffInfo = schedule.perDebt.find(d => d.id === debt.id);
              
              return (
                <div key={debt.id} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={debt.name}
                        onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                        className="font-semibold"
                      />
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="capitalize">{debt.type}</span>
                        <span>•</span>
                        <span>APR: {debt.apr}%</span>
                        {payoffInfo?.payoffLabel && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-accent-dark">
                              Payoff: {payoffInfo.payoffLabel}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDebt(debt.id)}
                      className="text-destructive hover:text-destructive"
                      aria-label={`Remove ${debt.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor={`balance-${debt.id}`} className="text-xs text-muted-foreground">Balance</label>
                      <Input
                        id={`balance-${debt.id}`}
                        type="number"
                        step="0.01"
                        value={debt.balance}
                        onChange={(e) => updateDebt(debt.id, 'balance', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label htmlFor={`apr-${debt.id}`} className="text-xs text-muted-foreground">APR (%)</label>
                      <Input
                        id={`apr-${debt.id}`}
                        type="number"
                        step="0.01"
                        value={debt.apr}
                        onChange={(e) => updateDebt(debt.id, 'apr', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label htmlFor={`min-${debt.id}`} className="text-xs text-muted-foreground">Min Payment</label>
                      <Input
                        id={`min-${debt.id}`}
                        type="number"
                        step="0.01"
                        value={debt.min}
                        onChange={(e) => updateDebt(debt.id, 'min', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Current Balance: <span className="font-semibold">{formatCurrency(debt.balance)}</span>
                    {payoffInfo && (
                      <>
                        {" "}• Estimated Interest: <span className="font-semibold">{formatCurrency(payoffInfo.totalInterest)}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col xs:flex-row gap-3">
            <Button onClick={() => addDebt("card")} variant="royal" className="flex-1 xs:flex-initial text-sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline ml-2">Add Credit Card</span>
              <span className="sm:hidden ml-2">Add Card</span>
            </Button>
            <Button onClick={() => addDebt("loan")} variant="royal" className="flex-1 xs:flex-initial text-sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline ml-2">Add Loan</span>
              <span className="sm:hidden ml-2">Add Loan</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Freedom Date Simulator */}
      <FreedomSlider
        debts={debts}
        currentExtraBudget={leftover}
        strategy={strategy as "Snowball" | "Avalanche"}
      />

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg text-foreground flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-accent" aria-hidden="true" />
            Total Debt Balance Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <>
              <CustomLineLegend items={[{ label: "Total Debt Balance", color: "hsl(var(--primary))" }]} />
              <div className="h-[350px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={schedule.timeline} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={currencyFormatter}
                      contentStyle={STANDARD_TOOLTIP_STYLE}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalBalance" 
                      name="Total Debt Balance" 
                      strokeWidth={3} 
                      dot={false}
                      stroke="hsl(var(--primary))"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {schedule.totalInterest > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    Total Interest Projected: <span className="font-bold text-destructive text-lg">
                      {formatCurrency(schedule.totalInterest)}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyChartNotice 
              title="No Data Available"
              message="This chart will populate once you enter or upload transactions"
            />
          )}
        </CardContent>
      </Card>
        </TabsContent>

          <TabsContent value="schedule" className="mt-8">
            <PaymentScheduleTable 
              schedule={detailedSchedule} 
              strategy={strategy as "Snowball" | "Avalanche"}
            />
          </TabsContent>

          <TabsContent value="compare" className="mt-8">
            <StrategyComparison
              debts={debts}
              extraBudget={leftover}
              currentStrategy={strategy as "Snowball" | "Avalanche"}
              onStrategyChange={(newStrategy) => setStrategy(newStrategy)}
            />
          </TabsContent>
      </Tabs>
    </div>
  );
};