import { useMemo } from "react";
import { Crown, DollarSign, TrendingUp, Target, AlertTriangle } from "lucide-react";
import { FinancialCard } from "@/components/FinancialCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DEFAULT_EXPENSES, SAMPLE_DEBTS, DEFAULT_ASSETS, formatCurrency } from "@/lib/constants";
import { simulatePayoff } from "@/lib/debtCalculations";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export const Dashboard = () => {
  const [income] = useLocalStorage("bdt_income", 18254);
  const [expenses] = useLocalStorage("bdt_expenses", DEFAULT_EXPENSES);
  const [debts] = useLocalStorage("bdt_debts", SAMPLE_DEBTS);
  const [strategy] = useLocalStorage("bdt_strategy", "Snowball");
  const [assets] = useLocalStorage("bdt_assets", DEFAULT_ASSETS);

  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, expense) => sum + (expense.planned || 0), 0), [expenses]
  );
  
  const leftover = useMemo(() => 
    Math.max(0, (income || 0) - totalExpenses), [income, totalExpenses]
  );
  
  const schedule = useMemo(() => 
    simulatePayoff(debts, leftover, strategy as "Snowball" | "Avalanche"), [debts, leftover, strategy]
  );

  const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const totalDebt = debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
  const netWorth = totalAssets - totalDebt;

  // Prepare spending by category data
  const spendingByCategory = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      const category = expense.category || "Other";
      categoryTotals[category] = (categoryTotals[category] || 0) + (expense.planned || 0);
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const colors = ["#0284c7", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316"];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 pt-4 sm:pt-6 lg:pt-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              <span className="leading-tight">Royal Financial Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Your path to financial sovereignty
            </p>
          </div>
          <div className="w-full sm:w-auto flex justify-center sm:justify-end mt-4 sm:mt-0">
            <Button 
              variant="gold" 
              size="lg" 
              className="w-full sm:w-auto min-w-[140px] shadow-gold border-2 border-accent-dark/30 font-semibold"
            >
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">View Reports</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <FinancialCard
          title="Monthly Income"
          amount={income}
          icon={DollarSign}
          trend="up"
        />
        <FinancialCard
          title="Planned Expenses"
          amount={totalExpenses}
          icon={TrendingUp}
          trend="neutral"
        />
        <FinancialCard
          title="Available for Debt"
          amount={leftover}
          icon={Target}
          trend="up"
        />
        <FinancialCard
          title="Net Worth"
          amount={netWorth}
          icon={AlertTriangle}
          trend={netWorth >= 0 ? "up" : "down"}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Spending by Category Chart */}
        <Card className="shadow-royal">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingByCategory}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label={(entry) => entry.name}
                  >
                    {spendingByCategory.map((_, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Debt Payoff Projection */}
        <Card className="shadow-royal">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Debt Payoff Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={schedule.timeline} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalBalance" 
                    name="Total Balance" 
                    strokeWidth={2} 
                    dot={false}
                    stroke="hsl(var(--primary))"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payoffs */}
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2 sm:gap-3">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            Upcoming Payoffs ({strategy} Strategy)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedule.perDebt && schedule.perDebt.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {schedule.perDebt
                .filter(debt => debt.months !== null)
                .slice(0, 6)
                .map(debt => {
                  const progressPercentage = debt.orig 
                    ? ((debt.orig - debt.balance) / debt.orig) * 100 
                    : 0;
                  
                  return (
                    <div key={debt.id} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{debt.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {debt.type === 'card' ? 'Credit Card' : 'Loan'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-accent">{debt.payoffLabel}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{progressPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Remaining: {formatCurrency(debt.balance)} • 
                        Interest: {formatCurrency(debt.totalInterest)}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Add debts to see projected payoff dates.
            </p>
          )}
          
          {leftover > 0 && (
            <div className="mt-6 p-4 bg-gradient-subtle rounded-lg border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-foreground">Extra Payment Strategy</h4>
                  <p className="text-sm text-muted-foreground">
                    Applying {formatCurrency(leftover)} extra monthly using {strategy} method
                  </p>
                </div>
                <Button variant="royal" className="w-full sm:w-auto">
                  Optimize Strategy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};