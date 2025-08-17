import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
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
      <div className="pt-8">
        <h1 className="text-3xl font-bold text-foreground">Financial Reports</h1>
      </div>
      
        <Card className="shadow-royal overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-accent" />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Planned Expenses (Monthly)
            </span>
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
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};