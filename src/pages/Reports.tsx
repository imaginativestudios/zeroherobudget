import { useMemo } from "react";
import { Crown, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DEFAULT_EXPENSES, formatCurrency } from "@/lib/constants";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export const Reports = () => {
  const [expenses] = useLocalStorage("bdt_expenses", DEFAULT_EXPENSES);
  const [schedule] = useLocalStorage("bdt_schedule", { timeline: [], totalInterest: 0, perDebt: [] });

  const expenseData = useMemo(() => 
    expenses.map(expense => ({
      name: expense.name,
      planned: expense.planned || 0
    })), [expenses]
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Crown className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold text-foreground">Financial Reports</h1>
      </div>
      
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-accent" />
            Planned Expenses (Monthly)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData} margin={{ left: 12, right: 12, top: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-30} 
                  textAnchor="end" 
                  interval={0} 
                  height={60}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar 
                  dataKey="planned" 
                  name="Planned" 
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};