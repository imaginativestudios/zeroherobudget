import { useMemo, useState } from "react";
import { Target, ArrowLeft, TrendingUp, Download, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyChartNotice } from "@/components/EmptyChartNotice";
import { useTransactions } from "@/hooks/useTransactions";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DEFAULT_EXPENSES, formatCurrency } from "@/lib/constants";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ComposedChart, Bar } from 'recharts';
import { CustomComposedLegend } from "@/components/charts/CustomChartLegend";
import { STANDARD_TOOLTIP_STYLE, currencyFormatter } from "@/lib/chartConfig";
import { exportDebtReportCSV, exportDebtReportPDF } from '@/lib/reportExports';
import { toast } from 'sonner';

const formatMonthDisplay = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export const AvailableForDebtReport = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [income] = useLocalStorage("bdt_income", 18254);
  const [expenses] = useLocalStorage("bdt_expenses", DEFAULT_EXPENSES);
  const { getTotalActualSpending, getTransactionsByMonth } = useTransactions();

  // Calculate data for the last 12 months
  const monthlyData = useMemo(() => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      
      const actualSpending = getTotalActualSpending(monthStr);
      const incomeTransactions = getTransactionsByMonth(monthStr).filter(t => t.flow === 'in');
      const actualIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const monthlyIncome = actualIncome > 0 ? actualIncome : income;
      const available = monthlyIncome - actualSpending;
      
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        monthStr,
        income: monthlyIncome,
        spending: actualSpending,
        available: Math.max(0, available),
        deficit: available < 0 ? Math.abs(available) : 0
      });
    }
    return data;
  }, [income, getTotalActualSpending, getTransactionsByMonth]);

  // Current month data
  const currentData = useMemo(() => {
    const actualSpending = getTotalActualSpending(selectedMonth);
    const incomeTransactions = getTransactionsByMonth(selectedMonth).filter(t => t.flow === 'in');
    const actualIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const monthlyIncome = actualIncome > 0 ? actualIncome : income;
    const planned = expenses.reduce((sum, expense) => sum + (expense.planned || 0), 0);
    
    return {
      income: monthlyIncome,
      actualSpending,
      plannedSpending: planned,
      available: Math.max(0, monthlyIncome - actualSpending),
      plannedAvailable: Math.max(0, monthlyIncome - planned),
      hasActualSpending: actualSpending > 0
    };
  }, [selectedMonth, income, expenses, getTotalActualSpending, getTransactionsByMonth]);

  const hasAnyTransactions = useMemo(() => 
    monthlyData.some(month => month.spending > 0 || month.income !== income),
    [monthlyData, income]
  );

  const handleExport = (format: 'csv' | 'pdf') => {
    const exportData = {
      currentMonth: formatMonthDisplay(selectedMonth),
      totalIncome: currentData.income,
      totalExpenses: currentData.hasActualSpending ? currentData.actualSpending : currentData.plannedSpending,
      availableForDebt: currentData.hasActualSpending ? currentData.available : currentData.plannedAvailable
    };

    if (format === 'csv') {
      exportDebtReportCSV(exportData);
      toast.success('Available for debt report exported as CSV');
    } else {
      exportDebtReportPDF(exportData);
      toast.success('Available for debt report exported as PDF');
    }
  };

  return (
    <div className="pt-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/reports">
              <ArrowLeft className="h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              Available for Debt Report
            </h1>
            <p className="text-muted-foreground mt-2">
              Track funds available for debt payments over time
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Month Selector */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Select Month for Snapshot</CardTitle>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const monthStr = date.toISOString().slice(0, 7);
                  return (
                    <SelectItem key={monthStr} value={monthStr}>
                      {formatMonthDisplay(monthStr)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Current Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(currentData.income)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              {currentData.hasActualSpending ? "Actual Spending" : "Planned Spending"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(currentData.hasActualSpending ? currentData.actualSpending : currentData.plannedSpending)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Available for Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(currentData.hasActualSpending ? currentData.available : currentData.plannedAvailable)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatMonthDisplay(selectedMonth)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 12-Month Trend Chart */}
      <Card className="shadow-royal overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2 sm:gap-3">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            12-Month Available Funds Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasAnyTransactions ? (
            <>
              <CustomComposedLegend items={[
                { label: "Income", color: "hsl(var(--primary))", type: "bar" },
                { label: "Spending", color: "hsl(var(--destructive))", type: "bar" },
                { label: "Available for Debt", color: "hsl(var(--accent))", type: "line" }
              ]} />
              <div className="h-80 sm:h-96 lg:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis 
                      dataKey="month" 
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
                      formatter={(value, name) => [formatCurrency(Number(value)), name]}
                      contentStyle={STANDARD_TOOLTIP_STYLE}
                    />
                    <Bar 
                      dataKey="income" 
                      name="Income" 
                      fill="hsl(var(--primary) / 0.3)" 
                      stroke="hsl(var(--primary))"
                    />
                    <Bar 
                      dataKey="spending" 
                      name="Spending" 
                      fill="hsl(var(--destructive) / 0.3)" 
                      stroke="hsl(var(--destructive))"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="available" 
                      name="Available for Debt" 
                      strokeWidth={3} 
                      dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "hsl(var(--accent))", strokeWidth: 2 }}
                      stroke="hsl(var(--accent))"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <EmptyChartNotice 
              title="No Transaction Data" 
              message="This trend chart will populate once you enter or upload transactions to track your income and spending patterns"
            />
          )}
        </CardContent>
      </Card>

      {/* Calculation Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How This is Calculated</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Available for Debt</strong> = Monthly Income - Total Spending
          </p>
          <p>
            • <strong>Income:</strong> Uses actual income transactions when available, otherwise falls back to your planned monthly income ({formatCurrency(income)})
          </p>
          <p>
            • <strong>Spending:</strong> Uses actual spending from transactions when available, otherwise uses planned expenses
          </p>
          <p>
            • Negative amounts indicate spending exceeded income for that month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};