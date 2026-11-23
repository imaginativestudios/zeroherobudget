import { useState, useMemo } from "react";
import { BarChart3, Calendar, CreditCard, DollarSign, TrendingUp, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { EmptyChartNotice } from "@/components/EmptyChartNotice";
import { BudgetVarianceAlert } from "@/components/BudgetVarianceAlert";
import { ChartInsight } from "@/components/ChartInsight";
import { ChartCardSkeleton } from "@/components/ChartCardSkeleton";
import { useExpenses } from "@/hooks/useLocalSettings";
import { useLocalTransactions } from "@/hooks/useLocalTransactions";
import { DEFAULT_EXPENSES, formatCurrency } from "@/lib/constants";
import { getCurrentMonth, formatMonthDisplay } from "@/lib/dateUtils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
export const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [expenses] = useExpenses();

  // Secondary: Load transactions for chart data
  const {
    getMonthlyActualsByCategory,
    getTransactionsByMonth,
    isLoading: isLoadingTransactions
  } = useLocalTransactions('secondary');
  const isSecondaryLoading = isLoadingTransactions;
  const monthlyActuals = getMonthlyActualsByCategory(selectedMonth, expenses);
  // Planned vs actual grouped by budget category for the chart
  const monthTransactions = getTransactionsByMonth(selectedMonth);
  const expenseData = useMemo(() => {
    const rows: Record<string, { planned: number; actual: number }> = {};
    expenses.forEach(expense => {
      const cat = expense.category || 'Other';
      rows[cat] = rows[cat] || { planned: 0, actual: 0 };
      rows[cat].planned += expense.amount || 0;
    });
    monthTransactions.filter(t => t.flow === 'out').forEach(t => {
      const cat = t.category || 'Other';
      rows[cat] = rows[cat] || { planned: 0, actual: 0 };
      rows[cat].actual += t.amount || 0;
    });
    return Object.entries(rows)
      .filter(([, r]) => r.planned > 0 || r.actual > 0)
      .map(([cat, r]) => ({
        name: cat.length > 15 ? cat.substring(0, 15) + '...' : cat,
        planned: Math.round(r.planned * 100) / 100,
        actual: Math.round(r.actual * 100) / 100,
        fullName: cat,
        variance: Math.round((r.actual - r.planned) * 100) / 100,
      }));
  }, [expenses, monthTransactions]);

  // Generate variance alerts for significant over/under budget items
  const varianceAlerts = useMemo(() => {
    return expenses.map(expense => ({
      expense,
      planned: expense.amount || 0,
      actual: monthlyActuals[expense.id] || 0,
      variance: (monthlyActuals[expense.id] || 0) - (expense.amount || 0)
    })).filter(({
      planned,
      variance
    }) => {
      const variancePercentage = planned > 0 ? Math.abs(variance / planned) * 100 : 0;
      return variancePercentage > 20;
    }).sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance)).slice(0, 3); // Show top 3 variances
  }, [expenses, monthlyActuals]);

  const hasTransactionData = useMemo(() => expenseData.some(row => row.actual > 0), [expenseData]);

  // Overall insight from the same numbers the chart shows
  const reportInsight = useMemo(() => {
    const totalPlanned = expenseData.reduce((sum, row) => sum + row.planned, 0);
    const totalActual = expenseData.reduce((sum, row) => sum + row.actual, 0);
    if (totalActual <= 0) {
      return "No spending logged for this month yet. Add transactions to compare them with your plan.";
    }
    if (totalPlanned <= 0) {
      return `You spent ${formatCurrency(totalActual)} this month with no budget planned. Add budget items to compare.`;
    }
    const totalVariance = totalActual - totalPlanned;
    const variancePercentage = totalVariance / totalPlanned * 100;
    if (Math.abs(variancePercentage) < 5) {
      return `Excellent budget accuracy! You spent ${formatCurrency(totalActual)} against a ${formatCurrency(totalPlanned)} plan.`;
    } else if (variancePercentage > 20) {
      return `Spending is ${variancePercentage.toFixed(1)}% over budget. Review high-variance categories.`;
    } else if (variancePercentage < -20) {
      return `Spending is ${Math.abs(variancePercentage).toFixed(1)}% under budget so far: ${formatCurrency(totalActual)} of ${formatCurrency(totalPlanned)} planned.`;
    } else {
      return `Spending is ${variancePercentage > 0 ? 'over' : 'under'} budget by ${Math.abs(variancePercentage).toFixed(1)}%: ${formatCurrency(totalActual)} of ${formatCurrency(totalPlanned)} planned.`;
    }
  }, [expenseData]);
  const reportTypes = [{
    title: "Income Report",
    description: "Track your monthly income sources",
    icon: DollarSign,
    href: "/reports/income",
    color: "text-success"
  }, {
    title: "Available for Debt",
    description: "See your surplus funds available for debt payments",
    icon: Target,
    href: "/reports/available",
    color: "text-warning"
  }, {
    title: "Net Worth",
    description: "Monitor your assets, debts, and overall net worth",
    icon: TrendingUp,
    href: "/reports/net-worth",
    color: "text-primary"
  }, {
    title: "Subscriptions Report",
    description: "Analyze your recurring subscription costs",
    icon: CreditCard,
    href: "/reports/subscriptions",
    color: "text-accent"
  }];
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border bg-muted/50">
          <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Label className="text-sm font-medium">Month:</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({
              length: 12
            }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const monthStr = date.toISOString().slice(0, 7);
              return <SelectItem key={monthStr} value={monthStr}>
                    {formatMonthDisplay(monthStr)}
                  </SelectItem>;
            })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {reportTypes.map(report => <Link key={report.href} to={report.href}>
            <Card className="cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <report.icon className={`h-5 w-5 ${report.color}`} aria-hidden="true" />
                  {report.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {report.description}
                </p>
              </CardContent>
            </Card>
          </Link>)}
      </div>

      {/* Budget Variance Alerts */}
      {varianceAlerts.length > 0 && <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className={`h-px flex-1 bg-border transition-all duration-300 ${isSecondaryLoading ? 'animate-pulse opacity-70' : ''}`}></div>
            <h2 className={`text-lg font-semibold transition-all duration-300 ${isSecondaryLoading ? 'animate-pulse' : ''}`}>
              Budget Variance Alerts {isSecondaryLoading && <span className="text-xs ml-2 text-muted-foreground">Loading...</span>}
            </h2>
            <div className={`h-px flex-1 bg-border transition-all duration-300 ${isSecondaryLoading ? 'animate-pulse opacity-70' : ''}`}></div>
          </div>
          <div className="grid gap-3">
            {varianceAlerts.map(({
          expense,
          planned,
          actual
        }) => <BudgetVarianceAlert key={expense.id} planned={planned} actual={actual} categoryName={expense.name} />)}
          </div>
        </div>}
      
      {isSecondaryLoading ? <ChartCardSkeleton /> : <Card className="overflow-hidden animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" aria-hidden="true" />
            Planned vs Actual - {formatMonthDisplay(selectedMonth)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasTransactionData ? <>
              <div className="h-[350px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseData} margin={{
                left: 20,
                right: 20,
                top: 20,
                bottom: 60
              }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={60} stroke="hsl(var(--muted-foreground))" fontSize={12} tick={{
                  fill: "hsl(var(--muted-foreground))"
                }} />
                    <YAxis tickFormatter={value => formatCurrency(value)} stroke="hsl(var(--muted-foreground))" fontSize={12} tick={{
                  fill: "hsl(var(--muted-foreground))"
                }} />
                    <Tooltip formatter={(value, name, props) => {
                  const variance = props.payload?.variance || 0;
                  const varianceText = variance !== 0 ? ` (${variance > 0 ? '+' : ''}${formatCurrency(variance)} variance)` : '';
                  return [formatCurrency(Number(value)) + varianceText, name];
                }} labelFormatter={label => {
                  const item = expenseData.find(d => d.name === label);
                  return item?.fullName || label;
                }} contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px hsl(var(--foreground) / 0.1)",
                  fontSize: "14px"
                }} />
                    <Legend wrapperStyle={{
                  fontSize: "12px",
                  color: "hsl(var(--foreground))"
                }} />
                    <Bar dataKey="planned" name="Planned" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} strokeWidth={1} stroke="hsl(var(--primary))" />
                    <Bar dataKey="actual" name="Actual" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} strokeWidth={1} stroke="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <ChartInsight insight={reportInsight} type="info" />
              </div>
            </> : <EmptyChartNotice />}
        </CardContent>
      </Card>}
    </div>;
};