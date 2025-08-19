import { useState } from "react";
import { Crown, DollarSign, Plus, Download, Upload, Trash2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTransactions } from "@/hooks/useTransactions";
import { DEFAULT_EXPENSES, DEFAULT_ASSETS, formatCurrency } from "@/lib/constants";
import { getCurrentMonth, formatMonthDisplay } from "@/lib/dateUtils";
import { toCsv, downloadCsv, parseCsv, mapExpenseCsv, validateCsvFile, type Expense, type Asset } from "@/lib/csvUtils";
import { GroupableExpenses } from "@/components/budget/GroupableExpenses";

export const Budget = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [income, setIncome] = useLocalStorage("bdt_income", 18254);
  const [expenses, setExpenses] = useLocalStorage("bdt_expenses", DEFAULT_EXPENSES);
  const [assets, setAssets] = useLocalStorage("bdt_assets", DEFAULT_ASSETS);
  
  const { getMonthlyActuals } = useTransactions();
  const monthlyActuals = getMonthlyActuals(selectedMonth);

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.planned || 0), 0);
  const totalActual = Object.values(monthlyActuals).reduce((sum, actual) => sum + actual, 0);
  const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const leftover = Math.max(0, (income || 0) - totalExpenses);
  const actualLeftover = Math.max(0, (income || 0) - totalActual);

  const addExpense = () => {
    setExpenses([
      ...expenses,
      {
        id: crypto.randomUUID(),
        name: "New Expense",
        planned: 0,
        notes: "",
        category: "Uncategorized"
      }
    ]);
  };

  const updateExpense = (id: string, field: keyof Expense, value: string | number) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const addAsset = () => {
    setAssets([
      ...assets,
      {
        id: crypto.randomUUID(),
        name: "New Asset",
        value: 0
      }
    ]);
  };

  const updateAsset = (id: string, field: keyof Asset, value: string | number) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, [field]: value } : asset
    ));
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const exportExpenses = () => {
    const rows = [
      ["name", "planned", "notes", "category"],
      ...expenses.map(expense => [
        expense.name,
        expense.planned.toString(),
        expense.notes || "",
        expense.category || ""
      ])
    ];
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
        setExpenses(mapped);
        // Note: useExpenseGroups will automatically handle group order after import
      } else {
        alert("No valid expense data found in the file");
      }
    } catch (error) {
      alert("Failed to import file. Please check the format and try again.");
      console.error("Import error:", error);
    }
    
    event.target.value = "";
  };

  return (
    <div className="space-y-8">
      <div className="pt-8 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground">Budget Management</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Compare Section */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-44 bg-background">
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

            {/* Actions Section */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
              <Button variant="outline" size="sm" onClick={exportExpenses} className="bg-background">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Export</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()} className="bg-background">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Import</span>
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={importExpenses}
              />
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
            <Input
              type="number"
              step="0.01"
              value={income}
              onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
              className="w-48"
            />
            <span className="text-2xl font-bold text-success">
              {formatCurrency(income)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Section */}
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle className="text-xl">Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupableExpenses
            expenses={expenses}
            setExpenses={setExpenses}
            monthlyActuals={monthlyActuals}
          />
          
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
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="p-3">
                      <Input
                        value={asset.name}
                        onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                        className="min-w-0"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={asset.value}
                        onChange={(e) => updateAsset(asset.id, 'value', parseFloat(e.target.value) || 0)}
                        className="w-40"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAsset(asset.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
};