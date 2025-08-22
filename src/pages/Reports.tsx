import { useState, useMemo } from "react";
import { BarChart3, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTransactions } from "@/hooks/useTransactions";
import { DEFAULT_EXPENSES, formatCurrency } from "@/lib/constants";
import { getCurrentMonth, formatMonthDisplay } from "@/lib/dateUtils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [expenses] = useLocalStorage("bdt_expenses", DEFAULT_EXPENSES);
  const { getMonthlyActuals } = useTransactions();
  const monthlyActuals = getMonthlyActuals(selectedMonth);

  const expenseData = useMemo(() => 
    expenses.map(expense => ({
      name: expense.name.length > 15 ? expense.name.substring(0, 15) + '...' : expense.name,
      planned: expense.planned || 0,
      actual: monthlyActuals[expense.id] || 0
    })), [expenses, monthlyActuals]
  );

  return (
    <div className="space-y-8">
      <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Financial Reports</h1>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Month:</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
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
      </div>
      
        <Card className="shadow-royal overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2 sm:gap-3">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            Planned vs Actual - {formatMonthDisplay(selectedMonth)}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="h-96 sm:h-[450px] lg:h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData} margin={{ left: 20, right: 20, top: 20, bottom: 60 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  strokeOpacity={0.5}
                />
                <XAxis 
                  dataKey="name" 
                  angle={-30} 
                  textAnchor="end" 
                  interval={0} 
                  height={60}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
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
                <Bar 
                  dataKey="planned" 
                  name="Planned" 
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                  strokeWidth={1}
                  stroke="hsl(var(--primary))"
                  filter="drop-shadow(0 2px 4px hsl(var(--primary) / 0.2))"
                />
                <Bar 
                  dataKey="actual" 
                  name="Actual" 
                  fill="hsl(var(--accent))"
                  radius={[4, 4, 0, 0]}
                  strokeWidth={1}
                  stroke="hsl(var(--accent))"
                  filter="drop-shadow(0 2px 4px hsl(var(--accent) / 0.2))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};