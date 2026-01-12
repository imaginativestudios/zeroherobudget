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
    isLoading: isLoadingTransactions
  } = useLocalTransactions('secondary');
  const isSecondaryLoading = isLoadingTransactions;
  const monthlyActuals = getMonthlyActualsByCategory(selectedMonth, expenses);
  const expenseData = useMemo(() => expenses.map(expense => ({
    name: expense.name.length > 15 ? expense.name.substring(0, 15) + '...' : expense.name,
    planned: expense.amount || 0,
    actual: monthlyActuals[expense.id] || 0,
    fullName: expense.name,
    variance: (monthlyActuals[expense.id] || 0) - (expense.amount || 0)
  })), [expenses, monthlyActuals]);

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

  // Generate overall insights with heroic vocabulary
  const reportInsight = useMemo(() => {
    const totalPlanned = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalActual = Object.values(monthlyActuals).reduce((sum, actual) => sum + actual, 0);
    const totalVariance = totalActual - totalPlanned;
    const variancePercentage = totalPlanned > 0 ? totalVariance / totalPlanned * 100 : 0;
    if (Math.abs(variancePercentage) < 5) {
      return "Excellent tactical precision! Your deployment closely matches your war map.";
    } else if (variancePercentage > 20) {
      return `Deployment is ${variancePercentage.toFixed(1)}% in Tactical Overstretch. Review high-variance categories.`;
    } else if (variancePercentage < -20) {
      return `Heroic restraint! Deployment is ${Math.abs(variancePercentage).toFixed(1)}% in Strategic Surplus.`;
    } else {
      return `Deployment is ${variancePercentage > 0 ? 'in Tactical Overstretch' : 'in Strategic Surplus'} by ${Math.abs(variancePercentage).toFixed(1)}%.`;
    }
  }, [expenses, monthlyActuals]);
  const hasTransactionData = useMemo(() => Object.values(monthlyActuals).some(amount => amount > 0), [monthlyActuals]);
  const reportTypes = [{
    title: "Income Intel",
    description: "Track your monthly income sources and reinforcements",
    icon: DollarSign,
    href: "/reports/income",
    color: "text-success"
  }, {
    title: "War Chest Analysis",
    description: "See your funds available for slaying Balance Foes",
    icon: Target,
    href: "/reports/available",
    color: "text-warning"
  }, {
    title: "Kingdom Wealth",
    description: "Monitor your assets, Balance Foes, and overall worth",
    icon: TrendingUp,
    href: "/reports/net-worth",
    color: "text-primary"
  }, {
    title: "Recurring Obligations",
    description: "Analyze your recurring subscription deployments",
    icon: CreditCard,
    href: "/reports/subscriptions",
    color: "text-accent"
  }];
  return <div className="pt-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Intel Center</h1>
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border bg-primary-foreground">
          <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Label className="text-sm font-medium">Month:</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {reportTypes.map(report => <Link key={report.href} to={report.href}>
            <Card className="shadow-elegant hover:shadow-royal transition-royal cursor-pointer hover:translate-y-[-1px] h-full">
              <CardHeader className="p-4 sm:p-5">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <report.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${report.color}`} aria-hidden="true" />
                  {report.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0">
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
      
      {isSecondaryLoading ? <ChartCardSkeleton /> : <Card className="shadow-royal overflow-hidden animate-fade-in">
        <CardHeader className="p-4 sm:p-5">
          <CardTitle className="text-base sm:text-lg text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" aria-hidden="true" />
            Planned vs Actual - {formatMonthDisplay(selectedMonth)}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
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
                    <Bar dataKey="planned" name="Planned" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} strokeWidth={1} stroke="hsl(var(--primary))" filter="drop-shadow(0 2px 4px hsl(var(--primary) / 0.2))" />
                    <Bar dataKey="actual" name="Actual" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} strokeWidth={1} stroke="hsl(var(--accent))" filter="drop-shadow(0 2px 4px hsl(var(--accent) / 0.2))" />
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