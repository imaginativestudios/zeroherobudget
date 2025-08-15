import { useState } from "react";
import { Crown, DollarSign, Plus, Download, Upload, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DEFAULT_EXPENSES, DEFAULT_ASSETS, formatCurrency } from "@/lib/constants";
import { toCsv, downloadCsv, parseCsv, mapExpenseCsv, type Expense, type Asset } from "@/lib/csvUtils";

export const Budget = () => {
  const [income, setIncome] = useLocalStorage("bdt_income", 18254);
  const [expenses, setExpenses] = useLocalStorage("bdt_expenses", DEFAULT_EXPENSES);
  const [assets, setAssets] = useLocalStorage("bdt_assets", DEFAULT_ASSETS);

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.planned || 0), 0);
  const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const leftover = Math.max(0, (income || 0) - totalExpenses);

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
    
    const text = await file.text();
    const rows = parseCsv(text);
    const mapped = mapExpenseCsv(rows);
    
    if (mapped.length) {
      setExpenses(mapped);
    }
    
    event.target.value = "";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 text-accent" />
          <h1 className="text-3xl font-bold text-foreground">Budget Management</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportExpenses}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
            <Upload className="h-4 w-4" />
            Import CSV
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-semibold">Category</th>
                  <th className="text-left p-3 font-semibold">Planned</th>
                  <th className="text-left p-3 font-semibold">Notes</th>
                  <th className="text-center p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-border">
                    <td className="p-3">
                      <Input
                        value={expense.name}
                        onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                        className="min-w-0"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={expense.planned}
                        onChange={(e) => updateExpense(expense.id, 'planned', parseFloat(e.target.value) || 0)}
                        className="w-32"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        value={expense.notes || ""}
                        onChange={(e) => updateExpense(expense.id, 'notes', e.target.value)}
                        className="min-w-0"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExpense(expense.id)}
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
            <Button onClick={addExpense} variant="royal">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
            <div className="space-y-1 text-right">
              <div className="text-lg font-semibold">
                Total Expenses: {formatCurrency(totalExpenses)}
              </div>
              <div className={`text-lg font-bold ${leftover >= 0 ? 'text-success' : 'text-destructive'}`}>
                Leftover: {formatCurrency(leftover)}
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
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-semibold">Asset</th>
                  <th className="text-left p-3 font-semibold">Value</th>
                  <th className="text-center p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="border-b border-border">
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