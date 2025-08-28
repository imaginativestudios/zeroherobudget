import { useMemo, useState } from "react";
import { DollarSign, TrendingUp, Target, AlertTriangle, BarChart3, TrendingDown, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { FinancialCard } from "@/components/FinancialCard";
import { OptimizeStrategyDialog } from "@/components/OptimizeStrategyDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUserLocalStorage } from "@/hooks/useUserLocalStorage";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { DEFAULT_EXPENSES, SAMPLE_DEBTS, DEFAULT_ASSETS, formatCurrency } from "@/lib/constants";
import { simulatePayoff } from "@/lib/debtCalculations";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export const Dashboard = () => {
  const [income] = useUserLocalStorage("bdt_income", 0);
  const [expenses] = useUserLocalStorage("bdt_expenses", DEFAULT_EXPENSES);
  const [debts, setDebts] = useUserLocalStorage("bdt_debts", SAMPLE_DEBTS);
  const [strategy, setStrategy] = useUserLocalStorage("bdt_strategy", "Snowball");
  const [assets] = useUserLocalStorage("bdt_assets", DEFAULT_ASSETS);
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);

  const { getTotalMonthlySpend } = useSubscriptions();

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
  const monthlySubscriptionSpend = getTotalMonthlySpend();

  // Prepare spending by category data
  const spendingByCategory = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      const category = expense.category || "Other";
      categoryTotals[category] = (categoryTotals[category] || 0) + (expense.planned || 0);
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--primary) / 0.8)",
    "hsl(var(--accent))",
    "hsl(var(--accent) / 0.8)",
    "hsl(var(--destructive))",
    "hsl(var(--destructive) / 0.8)",
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))"
  ];

  const customLabel = (entry: any) => {
    const RADIAN = Math.PI / 180;
    const radius = 110;
    const x = 150 + radius * Math.cos(-entry.midAngle * RADIAN);
    const y = 150 + radius * Math.sin(-entry.midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="hsl(var(--foreground))" 
        textAnchor={x > 150 ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {entry.name}
      </text>
    );
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="pt-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              <span className="leading-tight">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Your path to financial sovereignty
            </p>
          </div>
          <div className="w-full sm:w-auto flex justify-center sm:justify-end mt-4 sm:mt-0">
            <Button 
              variant="default" 
              size="lg" 
              className="w-full sm:w-auto min-w-[140px] font-semibold"
              asChild
            >
              <Link to="/reports">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">View Reports</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        <FinancialCard
          title="Monthly Income"
          amount={income}
          icon={DollarSign}
          trend="up"
          to="/reports/income"
        />
        <FinancialCard
          title="Planned Expenses"
          amount={totalExpenses}
          icon={TrendingUp}
          trend="neutral"
          to="/reports/expenses"
        />
        <FinancialCard
          title="Subscriptions"
          amount={monthlySubscriptionSpend}
          icon={CreditCard}
          trend="neutral"
          to="/subscriptions"
        />
        <FinancialCard
          title="Available for Debt"
          amount={leftover}
          icon={Target}
          trend="up"
          to="/reports/available"
        />
        <FinancialCard
          title="Net Worth"
          amount={netWorth}
          icon={AlertTriangle}
          trend={netWorth >= 0 ? "up" : "down"}
          to="/reports/net-worth"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Spending by Category Chart */}
        <Card className="shadow-royal overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2 sm:gap-3">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="h-80 sm:h-96 lg:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="pieGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
                    </linearGradient>
                    <linearGradient id="pieGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--accent))" />
                      <stop offset="100%" stopColor="hsl(var(--accent) / 0.8)" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={spendingByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                    innerRadius="30%"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    label={false}
                  >
                    {spendingByCategory.map((_, index) => (
                      <Cell 
                        key={index} 
                        fill={colors[index % colors.length]}
                        className="drop-shadow-sm hover:brightness-110 transition-all duration-300"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px hsl(var(--foreground) / 0.1)",
                      fontSize: "14px"
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "12px",
                      color: "hsl(var(--foreground))"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Debt Payoff Projection */}
        <Card className="shadow-royal overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2 sm:gap-3">
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              Debt Payoff Projection
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="h-80 sm:h-96 lg:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={schedule.timeline} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))" 
                    strokeOpacity={0.5}
                  />
                  <XAxis 
                    dataKey="label" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px hsl(var(--foreground) / 0.1)",
                      fontSize: "14px"
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      fontSize: "12px",
                      color: "hsl(var(--foreground))"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalBalance" 
                    name="Total Balance" 
                    strokeWidth={3} 
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    stroke="hsl(var(--primary))"
                    filter="drop-shadow(0 2px 4px hsl(var(--primary) / 0.2))"
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
                <Button 
                  variant="royal" 
                  className="w-full sm:w-auto"
                  onClick={() => setOptimizeDialogOpen(true)}
                >
                  Optimize Strategy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <OptimizeStrategyDialog
        open={optimizeDialogOpen}
        onOpenChange={setOptimizeDialogOpen}
        debts={debts}
        currentLeftover={leftover}
        currentStrategy={strategy}
        onStrategyUpdate={(newStrategy, extraPayment) => {
          setStrategy(newStrategy);
          // Could also update leftover/extra payment if needed
        }}
      />
    </div>
  );
};