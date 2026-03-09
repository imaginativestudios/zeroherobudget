import { useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import { DollarSign, Download, Upload, Calendar, ChevronDown, BarChart3, Plus, Trash2, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartCardSkeleton } from "@/components/ChartCardSkeleton";
import { useIncome, useAssets } from "@/hooks/useLocalSettings";
import { useLocalExpenses } from "@/hooks/useLocalExpenses";
import { useLocalTransactions } from "@/hooks/useLocalTransactions";
import { formatCurrency } from "@/lib/constants";
import { getCurrentMonth, formatMonthDisplay } from "@/lib/dateUtils";
import { toCsv, downloadCsv, parseCsv, mapExpenseCsv, validateCsvFile } from "@/lib/csvUtils";
import { GroupableExpenses } from "@/components/budget/GroupableExpenses";
import { BudgetOverviewCard } from "@/components/budget/BudgetOverviewCard";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { CustomPieLegend, CustomBarLegend } from "@/components/charts/CustomChartLegend";
import { CATEGORY_COLORS, getCategoryColor, STANDARD_TOOLTIP_STYLE, currencyFormatter } from "@/lib/chartConfig";
import { SwipeablePageWrapper } from '@/components/SwipeablePageWrapper';
import { BudgetSetupWizard } from '@/components/budget/BudgetSetupWizard';
import { CategorySuggestionBanner } from '@/components/budget/CategorySuggestionBanner';

export const Budget = () => {
  const budgetSectionRef = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [income, setIncome] = useIncome();
  const [assets, setAssets] = useAssets();
  const [chartsExpanded, setChartsExpanded] = useState(false);

  // Critical: Load expenses first (needed for budget display)
  const {
    expenses,
    isLoading: isLoadingExpenses,
    addExpense: addSupabaseExpense,
    updateExpense: updateSupabaseExpense,
    removeExpense: removeSupabaseExpense,
    setExpensesOrder
  } = useLocalExpenses('critical');

  // Secondary: Load transactions for actuals comparison
  const {
    transactions,
    getMonthlyActualsByCategory,
    isLoading: isLoadingTransactions
  } = useLocalTransactions('secondary');
  const isCriticalLoading = isLoadingExpenses;
  const isSecondaryLoading = isLoadingTransactions;
  const monthlyActuals = getMonthlyActualsByCategory(selectedMonth, expenses);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const totalActual = Object.values(monthlyActuals).reduce((sum, actual) => sum + actual, 0);
  const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const leftover = Math.max(0, (income || 0) - totalExpenses);
  const actualLeftover = Math.max(0, (income || 0) - totalActual);

  // Calculate category totals for budget summary
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, {
      planned: number;
      actual: number;
    }>();
    expenses.forEach(expense => {
      const category = expense.category || "Uncategorized";
      const current = categoryMap.get(category) || {
        planned: 0,
        actual: 0
      };
      current.planned += expense.amount || 0;
      categoryMap.set(category, current);
    });

    // Add actual amounts by category
    expenses.forEach(expense => {
      const category = expense.category || "Uncategorized";
      const actualAmount = monthlyActuals[expense.id] || 0;
      const current = categoryMap.get(category) || {
        planned: 0,
        actual: 0
      };
      current.actual += actualAmount;
      categoryMap.set(category, current);
    });

    // Convert to array and calculate percentages
    return Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      planned: data.planned,
      actual: data.actual,
      percentage: totalExpenses > 0 ? data.planned / totalExpenses * 100 : 0,
      variance: data.actual - data.planned,
      variancePercent: data.planned > 0 ? (data.actual - data.planned) / data.planned * 100 : 0
    })).filter(cat => cat.planned > 0).sort((a, b) => b.planned - a.planned);
  }, [expenses, monthlyActuals, totalExpenses]);

  // Category colors imported from shared config

  // Prepare legend data for pie chart
  const pieLegendData = categoryData.map((cat, index) => ({
    name: cat.name,
    value: cat.planned,
    percentage: `${cat.percentage.toFixed(1)}%`,
    color: getCategoryColor(cat.name, index)
  }));
  const variance = totalActual - totalExpenses;
  const budgetUsedPercent = totalExpenses > 0 ? totalActual / totalExpenses * 100 : 0;
  const addExpense = () => {
    addSupabaseExpense({
      name: "New Expense",
      amount: 0,
      category: "Uncategorized",
      is_income: false
    });
  };
  const updateExpense = (id: string, field: string, value: string | number) => {
    const updates = {
      [field]: value
    };
    updateSupabaseExpense(id, updates);
  };
  const removeExpense = (id: string) => {
    removeSupabaseExpense(id);
  };
  const addAsset = () => {
    const newAssets = [...assets, {
      id: crypto.randomUUID(),
      name: "New Asset",
      value: 0
    }];
    setAssets(newAssets);
  };
  const updateAsset = (id: string, field: string, value: string | number) => {
    const newAssets = assets.map(asset => asset.id === id ? {
      ...asset,
      [field]: value
    } : asset);
    setAssets(newAssets);
  };
  const removeAsset = (id: string) => {
    const newAssets = assets.filter(asset => asset.id !== id);
    setAssets(newAssets);
  };
  const exportExpenses = () => {
    const rows = [["name", "planned", "notes", "category"], ...expenses.map(expense => [expense.name, expense.amount.toString(), "",
    // notes field doesn't exist in new schema
    expense.category || ""])];
    downloadCsv("expenses.csv", toCsv(rows));
  };
  const importExpenses = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const mapped = mapExpenseCsv(rows);
      if (mapped.length) {
        // Clear existing expenses and add new ones
        expenses.forEach(expense => removeSupabaseExpense(expense.id));
        mapped.forEach(expense => addSupabaseExpense({
          name: expense.name,
          amount: expense.planned || 0,
          category: expense.category || "Uncategorized",
          is_income: false
        }));
        toast.success(`Successfully imported ${mapped.length} expenses`);
      } else {
        toast.error("No valid expense data found in the file");
      }
    } catch (error) {
      toast.error("Failed to import file. Please check the format and try again.");
      console.error("Import error:", error);
    }
    event.target.value = "";
  };
  // Scroll handler for interactive cards
  const scrollToBudget = () => {
    budgetSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSetupComplete = (items: { name: string; amount: number; category: string; isIncome: boolean }[]) => {
    items.forEach((item) => {
      addSupabaseExpense({
        name: item.name,
        amount: item.amount,
        category: item.category,
        is_income: item.isIncome,
      });
    });
  };

  const showSetupWizard = expenses.length === 0 && !isLoadingExpenses;

  if (showSetupWizard) {
    return (
      <SwipeablePageWrapper leftRoute="/debts" rightRoute="/dashboard">
        <div className="space-y-4 sm:space-y-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Budget</h1>
          <BudgetSetupWizard
            onComplete={handleSetupComplete}
            onSkip={() => {
              // Add a single empty expense so the wizard dismisses
              addSupabaseExpense({
                name: "New Expense",
                amount: 0,
                category: "Uncategorized",
                is_income: false,
              });
            }}
          />
        </div>
      </SwipeablePageWrapper>
    );
  }

  return <SwipeablePageWrapper leftRoute="/debts" rightRoute="/dashboard">
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Budget</h1>
          
          {/* Combined controls row on mobile */}
          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
            {/* Month Selector */}
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <Calendar className="h-4 w-4 text-muted-foreground hidden sm:block" />
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

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={exportExpenses} className="h-10 sm:h-9 px-2 sm:px-3">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Export</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()} className="h-10 sm:h-9 px-2 sm:px-3">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Import</span>
              </Button>
              <input id="import-file" type="file" accept=".csv" className="hidden" onChange={importExpenses} />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Overview Card with segmented progress, interactive cards, and tips */}
      <BudgetOverviewCard
        categoryData={categoryData}
        totalPlanned={totalExpenses}
        totalActual={totalActual}
        income={income}
        selectedMonth={selectedMonth}
        budgetItemCount={expenses.length}
        onScrollToBudget={scrollToBudget}
      />

      {/* Income Section */}
      <Card className="shadow-royal hover-lift" data-tour="budget-income">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2 sm:gap-3">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-success" aria-hidden="true" />
            Monthly Income
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <label htmlFor="income-amount" className="text-sm sm:text-base text-muted-foreground font-medium whitespace-nowrap">
              Income Amount:
            </label>
            <CurrencyInput 
              id="income-amount"
              prefix="$"
              value={income} 
              onChange={e => setIncome(parseFloat(e.target.value) || 0)} 
              className="w-full sm:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Expenses Section */}
      <Card ref={budgetSectionRef} className="shadow-royal hover-lift">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl text-foreground">Monthly Budget</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <GroupableExpenses expenses={expenses.map(e => ({
          id: e.id,
          name: e.name,
          planned: e.amount,
          notes: "",
          // notes not available in new schema
          category: e.category
        }))} setExpenses={newExpenses => {
            // Check if this is just a reorder operation
            const newOrder = newExpenses.map(e => e.id);
            const oldOrder = expenses.map(e => e.id);
            const isReorder = newOrder.length === oldOrder.length && newOrder.every(id => oldOrder.includes(id)) && JSON.stringify(newOrder) !== JSON.stringify(oldOrder);
            if (isReorder) {
              setExpensesOrder(newOrder);
              return;
            }

            // Handle updating expenses through Supabase
            expenses.forEach(expense => {
              const updatedExpense = newExpenses.find(ne => ne.id === expense.id);
              if (updatedExpense) {
                if (updatedExpense.planned !== expense.amount || updatedExpense.name !== expense.name || updatedExpense.category !== expense.category) {
                  updateSupabaseExpense(expense.id, {
                    amount: updatedExpense.planned,
                    name: updatedExpense.name,
                    category: updatedExpense.category
                  });
                }
              } else {
                // Expense was removed
                removeSupabaseExpense(expense.id);
              }
            });

            // Handle new expenses
            newExpenses.forEach(newExpense => {
              if (!expenses.find(e => e.id === newExpense.id)) {
                addSupabaseExpense({
                  name: newExpense.name,
                  amount: newExpense.planned,
                  category: newExpense.category,
                  is_income: false
                });
              }
            });
          }} monthlyActuals={monthlyActuals} />
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div></div>
            <div className="space-y-1 text-right">
              <div className={`text-lg font-bold ${leftover >= 0 ? 'text-success' : 'text-destructive'}`}>
                Planned Leftover: {formatCurrency(leftover)}
              </div>
              <div className={`text-lg font-bold ${actualLeftover >= 0 ? 'text-success' : 'text-destructive'}`}>
                Actual Leftover: {formatCurrency(actualLeftover)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Section */}
      <Card className="shadow-royal hover-lift">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl text-foreground">Assets (for Net Worth)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {/* Mobile Card Layout */}
          <div className="block sm:hidden space-y-3">
            {assets.map(asset => (
              <div key={asset.id} className="p-3 border border-border/50 rounded-lg bg-card/50 space-y-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Asset Name</label>
                  <Input value={asset.name} onChange={e => updateAsset(asset.id, 'name', e.target.value)} className="min-w-0" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">Value</label>
                    <Input type="number" step="0.01" value={asset.value} onChange={e => updateAsset(asset.id, 'value', parseFloat(e.target.value) || 0)} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeAsset(asset.id)} className="text-destructive hover:text-destructive min-h-[44px] min-w-[44px]">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table Layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-3 font-semibold text-muted-foreground">Asset</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground">Value</th>
                  <th className="text-center p-3 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => <tr key={asset.id} className="border-t">
                    <td className="p-3 break-anywhere">
                      <Input value={asset.name} onChange={e => updateAsset(asset.id, 'name', e.target.value)} className="min-w-0" />
                    </td>
                    <td className="p-3">
                      <Input type="number" step="0.01" value={asset.value} onChange={e => updateAsset(asset.id, 'value', parseFloat(e.target.value) || 0)} className="w-40" />
                    </td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="sm" onClick={() => removeAsset(asset.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 sm:mt-6 pt-4 border-t">
            <Button onClick={addAsset} variant="default" className="btn-glow w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
            <div className="text-base sm:text-lg font-semibold text-primary">
              Total Assets: {formatCurrency(totalAssets)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Visualizations (Collapsible) */}
      {categoryData.length > 0 && (
        <Collapsible open={chartsExpanded} onOpenChange={setChartsExpanded}>
          <Card className="shadow-royal">
            <CollapsibleTrigger asChild>
              <CardHeader className="p-6 cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Budget Visualizations
                  </CardTitle>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    chartsExpanded && "rotate-180"
                  )} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  View spending breakdown charts
                </p>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-6 pt-0 space-y-8">
                {/* Pie Chart Section */}
                <div>
                  <h3 className="text-base font-medium mb-4 flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-primary" />
                    Planned Spending by Category
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="planned" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={2} label={({
                        name,
                        percentage
                      }) => `${percentage.toFixed(1)}%`} labelLine={{
                        stroke: 'hsl(var(--muted-foreground))',
                        strokeWidth: 1
                      }}>
                        {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, index)} />)}
                      </Pie>
                      <Tooltip formatter={currencyFormatter} contentStyle={STANDARD_TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                  <CustomPieLegend data={pieLegendData} />
                </div>
                
                {/* Bar Chart Section */}
                <div>
                  <h3 className="text-base font-medium mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Planned vs Actual by Category
                  </h3>
                  <CustomBarLegend items={[{
                    label: "Planned Budget",
                    color: "hsl(var(--chart-8))"
                  }, {
                    label: "Actual Spent",
                    color: "hsl(var(--chart-4))"
                  }]} />
                  <ResponsiveContainer width="100%" height={Math.max(400, categoryData.length * 60)}>
                    <BarChart data={categoryData} layout="vertical" margin={{
                      left: 0,
                      right: 20,
                      top: 20,
                      bottom: 20
                    }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 12
                      }} tickFormatter={value => `$${(value / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" width={120} tick={props => {
                        const {
                          x,
                          y,
                          payload
                        } = props;
                        const text = payload.value as string;
                        const truncated = text.length > 18 ? text.substring(0, 15) + '...' : text;
                        return <text x={x} y={y} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize={12} dy={4}>
                              {truncated}
                            </text>;
                      }} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [formatCurrency(value), name === 'planned' ? 'Planned' : 'Actual']} 
                        labelFormatter={label => label} 
                        contentStyle={STANDARD_TOOLTIP_STYLE} 
                      />
                      <Bar dataKey="planned" fill="hsl(var(--chart-8))" radius={[0, 4, 4, 0]} name="planned" />
                      <Bar dataKey="actual" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} name="actual" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  </SwipeablePageWrapper>;
};