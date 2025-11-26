import { useState } from "react";
import { Crown, DollarSign, Plus, Download, Upload, Trash2, Calendar } from "lucide-react";
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

export const Budget = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [income, setIncome] = useIncome();
  const [assets, setAssets] = useAssets();
  const { expenses, addExpense: addSupabaseExpense, updateExpense: updateSupabaseExpense, removeExpense: removeSupabaseExpense } = useLocalExpenses();
  const { getMonthlyActualsByCategory } = useLocalTransactions();
  const monthlyActuals = getMonthlyActualsByCategory(selectedMonth, expenses);

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const totalActual = Object.values(monthlyActuals).reduce((sum, actual) => sum + actual, 0);
  const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const leftover = Math.max(0, (income || 0) - totalExpenses);
  const actualLeftover = Math.max(0, (income || 0) - totalActual);

  const addExpense = () => {
    addSupabaseExpense({
      name: "New Expense",
      amount: 0,
      category: "Uncategorized",
      is_income: false,
    });
  };

  const updateExpense = (id: string, field: string, value: string | number) => {
    const updates = { [field]: value };
    updateSupabaseExpense(id, updates);
  };

  const removeExpense = (id: string) => {
    removeSupabaseExpense(id);
  };

  const addAsset = () => {
    const newAssets = [
      ...assets,
      {
        id: crypto.randomUUID(),
        name: "New Asset",
        value: 0
      }
    ];
    setAssets(newAssets);
  };

  const updateAsset = (id: string, field: string, value: string | number) => {
    const newAssets = assets.map(asset => 
      asset.id === id ? { ...asset, [field]: value } : asset
    );
    setAssets(newAssets);
  };

  const removeAsset = (id: string) => {
    const newAssets = assets.filter(asset => asset.id !== id);
    setAssets(newAssets);
  };

  const exportExpenses = () => {
    const rows = [
      ["name", "planned", "notes", "category"],
      ...expenses.map(expense => [
        expense.name,
        expense.amount.toString(),
        "", // notes field doesn't exist in new schema
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
        // Clear existing expenses and add new ones
        expenses.forEach(expense => removeSupabaseExpense(expense.id));
        mapped.forEach(expense => addSupabaseExpense({
          name: expense.name,
          amount: expense.planned || 0,
          category: expense.category || "Uncategorized",
          is_income: false,
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
            expenses={expenses.map(e => ({
              id: e.id,
              name: e.name,
              planned: e.amount,
              notes: "", // notes not available in new schema
              category: e.category
            }))}
            setExpenses={(newExpenses) => {
              // Handle updating expenses through Supabase
              expenses.forEach(expense => {
                const updatedExpense = newExpenses.find(ne => ne.id === expense.id);
                if (updatedExpense) {
                  if (updatedExpense.planned !== expense.amount || 
                      updatedExpense.name !== expense.name || 
                      updatedExpense.category !== expense.category) {
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
                    is_income: false,
                  });
                }
              });
            }}
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
                    <td className="p-3 break-anywhere">
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