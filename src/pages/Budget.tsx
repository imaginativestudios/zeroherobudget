import { useState, useMemo } from "react";
import { Crown, DollarSign, Plus, Download, Upload, Trash2, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useIncome, useAssets } from "@/hooks/useLocalSettings";
import { useLocalExpenses } from "@/hooks/useLocalExpenses";
import { useLocalTransactions } from "@/hooks/useLocalTransactions";
import { DEFAULT_EXPENSES, DEFAULT_ASSETS, formatCurrency } from "@/lib/constants";
import { getCurrentMonth, formatMonthDisplay } from "@/lib/dateUtils";
import { toCsv, downloadCsv, parseCsv, mapExpenseCsv, validateCsvFile, type Expense, type Asset } from "@/lib/csvUtils";
import { GroupableExpenses } from "@/components/budget/GroupableExpenses";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { CustomPieLegend, CustomBarLegend } from "@/components/charts/CustomChartLegend";
export const Budget = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [income, setIncome] = useIncome();
  const [assets, setAssets] = useAssets();
  const {
    expenses,
    addExpense: addSupabaseExpense,
    updateExpense: updateSupabaseExpense,
    removeExpense: removeSupabaseExpense,
    setExpensesOrder
  } = useLocalExpenses();
  const {
    getMonthlyActualsByCategory
  } = useLocalTransactions();
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

  // Consistent category color mapping for all charts
  const CATEGORY_COLORS: Record<string, string> = {
    "Housing": "hsl(var(--chart-1))",
    "Utilities": "hsl(var(--chart-2))",
    "Transportation": "hsl(var(--chart-3))",
    "Food": "hsl(var(--chart-4))",
    "Insurance & Healthcare": "hsl(var(--chart-5))",
    "Personal Care": "hsl(var(--chart-6))",
    "Entertainment": "hsl(var(--chart-7))",
    "Savings & Investments": "hsl(var(--chart-8))",
    "Debt Payments": "hsl(var(--chart-9))",
    "Miscellaneous": "hsl(var(--chart-10))"
  };

  // Fallback colors for categories not in the mapping
  const FALLBACK_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--chart-6))", "hsl(var(--chart-7))", "hsl(var(--chart-8))", "hsl(var(--chart-9))", "hsl(var(--chart-10))"];
  const getCategoryColor = (categoryName: string, index: number) => {
    return CATEGORY_COLORS[categoryName] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  };

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
      alert(`Import failed: ${validation.error}`);
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
      } else {
        alert("No valid expense data found in the file");
      }
    } catch (error) {
      alert("Failed to import file. Please check the format and try again.");
      console.error("Import error:", error);
    }
    event.target.value = "";
  };
  return <div className="space-y-8">
      <div className="pt-8 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground">Budget Management</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Compare Section */}
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-44 bg-background">
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

            {/* Actions Section */}
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
              <Button variant="outline" size="sm" onClick={exportExpenses} className="bg-background">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Export</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()} className="bg-background">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Import</span>
              </Button>
              <input id="import-file" type="file" accept=".csv" className="hidden" onChange={importExpenses} />
            </div>
          </div>
        </div>
      </div>
      {/* Income Section */}
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-accent" />
            Monthly Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-muted-foreground font-medium">Income Amount:</label>
            <Input type="number" step="0.01" value={income} onChange={e => setIncome(parseFloat(e.target.value) || 0)} className="w-48" />
            <span className="text-2xl font-bold text-success">
              {formatCurrency(income)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Budget Summary Section */}
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-chart-1" />
            Budget Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Total Planned</div>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(totalExpenses)}
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Total Actual</div>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(totalActual)}
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Variance</div>
              <div className={`text-2xl font-bold flex items-center gap-1 ${variance <= 0 ? 'text-success' : 'text-destructive'}`}>
                {variance <= 0 ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                {formatCurrency(Math.abs(variance))}
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Budget Used</div>
              <div className={`text-2xl font-bold ${budgetUsedPercent <= 100 ? 'text-success' : 'text-destructive'}`}>
                {budgetUsedPercent.toFixed(1)}%
              </div>
            </div>
          </div>


          {/* Category Variance Table */}
          {categoryData.length > 0 && <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Category Variance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 font-semibold text-muted-foreground">Category</th>
                      <th className="text-right p-2 font-semibold text-muted-foreground">Planned</th>
                      <th className="text-right p-2 font-semibold text-muted-foreground">Actual</th>
                      <th className="text-right p-2 font-semibold text-muted-foreground">Variance</th>
                      <th className="text-right p-2 font-semibold text-muted-foreground">% Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((cat, idx) => <tr key={cat.name} className="border-b border-border/50">
                        <td className="p-2 font-medium text-foreground">{cat.name}</td>
                        <td className="text-right p-2 text-foreground">{formatCurrency(cat.planned)}</td>
                        <td className="text-right p-2 text-foreground">{formatCurrency(cat.actual)}</td>
                        <td className={`text-right p-2 font-semibold ${cat.variance <= 0 ? 'text-success' : 'text-destructive'}`}>
                          {cat.variance <= 0 ? '-' : '+'}{formatCurrency(Math.abs(cat.variance))}
                        </td>
                        <td className={`text-right p-2 font-semibold ${cat.variance <= 0 ? 'text-success' : 'text-destructive'}`}>
                          {cat.variancePercent > 0 ? '+' : ''}{cat.variancePercent.toFixed(1)}%
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>}
        </CardContent>
      </Card>

      {/* Planned Spending by Category - Donut Chart */}
      {categoryData.length > 0 && <Card className="shadow-royal">
          <CardHeader className="p-4 sm:p-5">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-chart-1" />
              Planned Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
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
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }} />
              </PieChart>
            </ResponsiveContainer>
            <CustomPieLegend data={pieLegendData} />
          </CardContent>
        </Card>}

      {/* Planned vs Actual by Category - Bar Chart */}
      {categoryData.length > 0 && <Card className="shadow-royal">
          <CardHeader className="p-4 sm:p-5">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-2" />
              Planned vs Actual by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
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
                <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name === 'planned' ? 'Planned' : 'Actual']} labelFormatter={label => label} contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }} />
                <Bar dataKey="planned" fill="hsl(var(--chart-8))" radius={[0, 4, 4, 0]} name="planned" />
                <Bar dataKey="actual" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} name="actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>}

      {/* Expenses Section */}
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle className="text-xl">Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
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
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
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
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle className="text-xl">Assets (for Net Worth Calculation)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-3 font-semibold">Asset</th>
                  <th className="text-left p-3 font-semibold">Value</th>
                  <th className="text-center p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => <tr key={asset.id}>
                    <td className="p-3 break-anywhere">
                      <Input value={asset.name} onChange={e => updateAsset(asset.id, 'name', e.target.value)} className="min-w-0" />
                    </td>
                    <td className="p-3">
                      <Input type="number" step="0.01" value={asset.value} onChange={e => updateAsset(asset.id, 'value', parseFloat(e.target.value) || 0)} className="w-40" />
                    </td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="sm" onClick={() => removeAsset(asset.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
            <Button onClick={addAsset} variant="royal">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
            <div className="text-lg font-semibold">
              Total Assets: {formatCurrency(totalAssets)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};