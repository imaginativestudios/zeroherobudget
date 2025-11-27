import { useMemo, useState } from "react";
import { DollarSign, TrendingUp, Target, AlertTriangle, BarChart3, TrendingDown, CreditCard, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { FinancialCard } from "@/components/FinancialCard";
import { ChartInsight } from "@/components/ChartInsight";
import { OptimizeStrategyDialog } from "@/components/OptimizeStrategyDialog";
import { EmptyChartNotice } from "@/components/EmptyChartNotice";
import { AchievementCard } from "@/components/AchievementCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useIncome, useStrategy, useExpenses, useAssets } from "@/hooks/useLocalSettings";
import { useLocalDebts } from "@/hooks/useLocalDebts";
import { useLocalSubscriptions } from "@/hooks/useLocalSubscriptions";
import { useLocalTransactions } from "@/hooks/useLocalTransactions";
import { useProfile } from "@/hooks/useProfile";
import { useAchievements } from "@/hooks/useAchievements";
import { DEFAULT_EXPENSES, SAMPLE_DEBTS, DEFAULT_ASSETS, formatCurrency } from "@/lib/constants";
import { generateFinancialInsights, getPreviousMonthData, type InsightData } from "@/lib/insights";
import { simulatePayoff } from "@/lib/debtCalculations";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export const Dashboard = () => {
  const [income] = useIncome();
  const [expenses] = useExpenses();
  const { debts } = useLocalDebts();
  const [strategy, setStrategy] = useStrategy();
  const [assets] = useAssets();
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);

  const { getTotalMonthlySpend } = useLocalSubscriptions();
  const { transactions } = useLocalTransactions();
  const { profile } = useProfile();

  const hasAnyTransactions = useMemo(() => transactions.length > 0, [transactions]);

  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, expense) => sum + (expense.planned || 0), 0), [expenses]
  );
  
  const leftover = useMemo(() => 
    Math.max(0, (income || 0) - totalExpenses), [income, totalExpenses]
  );
  
  const schedule = useMemo(() => 
    simulatePayoff(debts.map(d => ({
      id: d.id,
      name: d.name,
      balance: d.balance,
      min: d.minimum_payment,
      apr: d.interest_rate,
      type: d.type as 'card' | 'loan'
    })), leftover, strategy as "Snowball" | "Avalanche"), [debts, leftover, strategy]
  );

  const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const totalDebt = debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
  const netWorth = totalAssets - totalDebt;
  const monthlySubscriptionSpend = getTotalMonthlySpend();

  // Calculate achievement stats
  const debtsPaidOff = useMemo(() => 
    debts.filter(d => d.balance === 0).length, [debts]
  );
  
  const { achievements, unlockedCount, totalCount } = useAchievements({
    totalDebt,
    debtsPaidOff,
    totalDebts: debts.length,
  });

  // Get greeting name
  const greetingName = profile?.first_name || profile?.display_name || 'there';

  // Prepare spending by category data with insights
  const spendingByCategory = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      const category = expense.category || "Other";
      categoryTotals[category] = (categoryTotals[category] || 0) + (expense.amount || 0);
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Find largest expense category for insights
  const largestExpenseCategory = useMemo(() => {
    if (spendingByCategory.length === 0) return undefined;
    
    const largest = spendingByCategory.reduce((max, category) => 
      category.value > max.value ? category : max
    );
    
    const percentage = totalExpenses > 0 ? (largest.value / totalExpenses) * 100 : 0;
    return { name: largest.name, amount: largest.value, percentage };
  }, [spendingByCategory, totalExpenses]);

  // Generate insights
  const insightData: InsightData = {
    income,
    expenses: totalExpenses,
    netWorth,
    subscriptions: monthlySubscriptionSpend,
    availableForDebt: leftover,
    totalDebt,
    totalTransactions: transactions.length,
    largestExpenseCategory,
    ...getPreviousMonthData({ income, expenses: totalExpenses, netWorth, subscriptions: monthlySubscriptionSpend, availableForDebt: leftover })
  };

  const insights = generateFinancialInsights(insightData);

  // Chart insights
  const spendingInsight = useMemo(() => {
    if (largestExpenseCategory && largestExpenseCategory.percentage > 50) {
      return `${largestExpenseCategory.name} represents over half of your spending. Consider if this allocation aligns with your priorities.`;
    }
    if (spendingByCategory.length > 8) {
      return "You have many spending categories. Consider consolidating to better track your major expenses.";
    }
    if (spendingByCategory.length === 0) {
      return "Start by adding expense categories to better understand your spending patterns.";
    }
    return "Your spending appears well-distributed across categories.";
  }, [largestExpenseCategory, spendingByCategory]);

  const debtInsight = useMemo(() => {
    if (debts.length === 0) return "Great job staying debt-free! Keep building your wealth.";
    if (leftover === 0) return "Find ways to increase available funds for faster debt payoff.";
    
    const highInterestDebt = debts.find(d => d.interest_rate > 20);
    if (highInterestDebt) {
      return `Focus on paying off ${highInterestDebt.name} first due to its high ${highInterestDebt.interest_rate}% interest rate.`;
    }
    
    return "You're making good progress on your debt payoff journey!";
  }, [debts, leftover]);

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
              <span className="leading-tight">Welcome, debt warrior!</span>
            </h1>
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

      {/* Financial Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border"></div>
          <h2 className="text-lg font-semibold text-muted-foreground">Financial Overview</h2>
          <div className="h-px flex-1 bg-border"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 items-stretch">
        <FinancialCard
          title="Monthly Income"
          amount={income}
          icon={DollarSign}
          trend="up"
          to="/reports/income"
          previousAmount={insightData.previousIncome}
          insight={insights.income}
        />
        <FinancialCard
          title="Planned Expenses"
          amount={totalExpenses}
          icon={TrendingUp}
          trend="neutral"
          to="/reports/expenses"
          previousAmount={insightData.previousExpenses}
          insight={insights.expenses}
        />
        <FinancialCard
          title="Subscriptions"
          amount={monthlySubscriptionSpend}
          icon={CreditCard}
          trend="neutral"
          to="/subscriptions"
          previousAmount={insightData.previousSubscriptions}
          insight={insights.subscriptions}
        />
        <FinancialCard
          title="Available for Debt"
          amount={leftover}
          icon={Target}
          trend="up"
          to="/reports/available"
          previousAmount={insightData.previousAvailableForDebt}
          insight={insights.availableForDebt}
        />
        <FinancialCard
          title="Net Worth"
          amount={netWorth}
          icon={AlertTriangle}
          trend={netWorth >= 0 ? "up" : "down"}
          to="/reports/net-worth"
          previousAmount={insightData.previousNetWorth}
          insight={insights.netWorth}
        />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border"></div>
          <h2 className="text-lg font-semibold text-muted-foreground">Analytics</h2>
          <div className="h-px flex-1 bg-border"></div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Spending by Category Chart */}
        <Card className="shadow-royal overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2 sm:gap-3">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasAnyTransactions ? (
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
            ) : (
              <EmptyChartNotice />
            )}
            
            {hasAnyTransactions && spendingInsight && (
              <div className="mt-4">
                <ChartInsight insight={spendingInsight} type="info" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debt Payoff Projection */}
        <Card className="shadow-royal overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2 sm:gap-3">
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              Debt Payoff Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasAnyTransactions && schedule.timeline.length > 0 ? (
              <>
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
                <div className="mt-4">
                  <ChartInsight insight={debtInsight} type="info" />
                </div>
              </>
            ) : (
              <EmptyChartNotice />
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border"></div>
          <h2 className="text-lg font-semibold text-muted-foreground">Victories & Achievements</h2>
          <div className="h-px flex-1 bg-border"></div>
        </div>
        
        <Card className="shadow-royal">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 sm:gap-3">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              Your Progress Milestones
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {unlockedCount} / {totalCount} Unlocked
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {achievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Start tracking debts to unlock achievements!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debt Progress Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border"></div>
          <h2 className="text-lg font-semibold text-muted-foreground">Debt Progress</h2>
          <div className="h-px flex-1 bg-border"></div>
        </div>
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
      </div>

      <OptimizeStrategyDialog
        open={optimizeDialogOpen}
        onOpenChange={setOptimizeDialogOpen}
        debts={debts.map(d => ({
          id: d.id,
          name: d.name,
          balance: d.balance,
          min: d.minimum_payment,
          apr: d.interest_rate,
          type: d.type as 'card' | 'loan'
        }))}
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
