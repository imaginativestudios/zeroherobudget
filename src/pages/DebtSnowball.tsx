import { useState, useMemo } from "react";
import { Crown, Target, Plus, Download, Upload, Trash2, DollarSign, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SAMPLE_DEBTS, formatCurrency } from "@/lib/constants";
import { simulatePayoff } from "@/lib/debtCalculations";
import { toCsv, downloadCsv, parseCsv, mapDebtCsv, validateCsvFile, type Debt } from "@/lib/csvUtils";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export const DebtSnowball = () => {
  const [debts, setDebts] = useLocalStorage("bdt_debts", SAMPLE_DEBTS);
  const [strategy, setStrategy] = useLocalStorage("bdt_strategy", "Snowball");
  const [income] = useLocalStorage("bdt_income", 18254);
  const [expenses] = useLocalStorage("bdt_expenses", []);

  const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + (expense.planned || 0), 0);
  const leftover = Math.max(0, (income || 0) - totalExpenses);

  const schedule = useMemo(() => 
    simulatePayoff(debts, leftover, strategy as "Snowball" | "Avalanche"), 
    [debts, leftover, strategy]
  );

  const addDebt = (type: "card" | "loan") => {
    const newDebt: Debt = {
      id: crypto.randomUUID(),
      name: type === "card" ? "New Credit Card" : "New Loan",
      balance: 0,
      apr: 0,
      min: 0,
      type,
      _orig: 0
    };
    setDebts([...debts, newDebt]);
  };

  const updateDebt = (id: string, field: keyof Debt, value: string | number) => {
    setDebts(debts.map(debt => {
      if (debt.id === id) {
        const updated = { ...debt, [field]: value };
        if (field === 'balance') {
          updated._orig = updated._orig ?? Number(value);
        }
        return updated;
      }
      return debt;
    }));
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  const exportDebts = () => {
    const rows = [
      ["name", "balance", "apr", "min", "type"],
      ...debts.map(debt => [
        debt.name,
        debt.balance.toString(),
        debt.apr.toString(),
        debt.min.toString(),
        debt.type || "debt"
      ])
    ];
    downloadCsv("debts.csv", toCsv(rows));
  };

  const importDebts = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const mapped = mapDebtCsv(rows);
      
      if (mapped.length) {
        setDebts(mapped);
      } else {
        alert("No valid debt data found in the file");
      }
    } catch (error) {
      alert("Failed to import file. Please check the format and try again.");
      console.error("Import error:", error);
    }
    
    event.target.value = "";
  };

  return (
    <div className="space-y-8">
      <div className="pt-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Debt Snowball Strategy</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportDebts}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-debt-file')?.click()}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <input
            id="import-debt-file"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={importDebts}
          />
        </div>
      </div>

      {/* Strategy Selection */}
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-3">
            <Target className="h-6 w-6 text-accent" />
            Payoff Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={strategy === "Snowball" ? "royal" : "ghost"}
                className="rounded-none"
                onClick={() => setStrategy("Snowball")}
              >
                Snowball (Smallest First)
              </Button>
              <Button
                variant={strategy === "Avalanche" ? "royal" : "ghost"}
                className="rounded-none"
                onClick={() => setStrategy("Avalanche")}
              >
                Avalanche (Highest APR First)
              </Button>
            </div>
            <div className="text-muted-foreground">
              Extra Budget Available: <span className="font-bold text-accent">{formatCurrency(leftover)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt Management */}
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle className="text-xl">Debt Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {debts.map((debt) => {
              const progressPercentage = debt._orig 
                ? ((debt._orig - debt.balance) / debt._orig) * 100 
                : 0;
              const payoffInfo = schedule.perDebt.find(d => d.id === debt.id);
              
              return (
                <div key={debt.id} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={debt.name}
                        onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                        className="font-semibold"
                      />
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="capitalize">{debt.type}</span>
                        <span>•</span>
                        <span>APR: {debt.apr}%</span>
                        {payoffInfo?.payoffLabel && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-accent">
                              Payoff: {payoffInfo.payoffLabel}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDebt(debt.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Balance</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={debt.balance}
                        onChange={(e) => updateDebt(debt.id, 'balance', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">APR (%)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={debt.apr}
                        onChange={(e) => updateDebt(debt.id, 'apr', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Min Payment</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={debt.min}
                        onChange={(e) => updateDebt(debt.id, 'min', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Current Balance: <span className="font-semibold">{formatCurrency(debt.balance)}</span>
                    {payoffInfo && (
                      <>
                        {" "}• Estimated Interest: <span className="font-semibold">{formatCurrency(payoffInfo.totalInterest)}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button onClick={() => addDebt("card")} variant="royal">
              <Plus className="h-4 w-4" />
              Add Credit Card
            </Button>
            <Button onClick={() => addDebt("loan")} variant="royal">
              <Plus className="h-4 w-4" />
              Add Loan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Chart */}
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl bg-gradient-royal bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
            <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            Total Balance Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={schedule.timeline} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="totalBalance" 
                  name="Total Balance" 
                  strokeWidth={3} 
                  dot={false}
                  stroke="hsl(var(--primary))"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {schedule.totalInterest > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">
                Total Interest Projected: <span className="font-bold text-destructive text-lg">
                  {formatCurrency(schedule.totalInterest)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};