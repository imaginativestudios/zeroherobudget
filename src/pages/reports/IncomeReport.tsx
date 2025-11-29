import { useMemo, useState } from "react";
import { DollarSign, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTransactions } from "@/hooks/useTransactions";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatCurrency } from "@/lib/constants";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const formatMonthDisplay = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export const IncomeReport = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [income] = useLocalStorage("bdt_income", 18254);
  const { getTransactionsByMonth } = useTransactions();

  const monthTransactions = useMemo(() => 
    getTransactionsByMonth(selectedMonth).filter(t => t.flow === 'in'),
    [getTransactionsByMonth, selectedMonth]
  );

  const totalActualIncome = useMemo(() => 
    monthTransactions.reduce((sum, t) => sum + t.amount, 0),
    [monthTransactions]
  );

  const incomeByCategory = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    monthTransactions.forEach(transaction => {
      const category = transaction.category || "Other";
      categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [monthTransactions]);

  const displayIncome = totalActualIncome > 0 ? totalActualIncome : income;
  const hasActualTransactions = totalActualIncome > 0;

  return (
    <div className="pt-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/reports">
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
            Monthly Income Report
          </h1>
          <p className="text-muted-foreground mt-2">
            Income analysis for {formatMonthDisplay(selectedMonth)}
          </p>
        </div>
      </div>

      {/* Month Selector */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Select Month</CardTitle>
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

      {/* Income Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2 sm:gap-3">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            Total Income - {formatMonthDisplay(selectedMonth)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-success mb-2">
            {formatCurrency(displayIncome)}
          </div>
          <p className="text-muted-foreground text-sm">
            {hasActualTransactions 
              ? `Based on ${monthTransactions.length} income transaction(s)` 
              : "Based on planned monthly income (no transactions recorded)"}
          </p>
        </CardContent>
      </Card>

      {hasActualTransactions && incomeByCategory.length > 0 && (
        <>
          {/* Income by Category Chart */}
          <Card className="shadow-royal overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2 sm:gap-3">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                Income by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 sm:h-96 lg:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeByCategory} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis 
                      dataKey="name" 
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
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--primary))" 
                      className="hover:brightness-110 transition-all duration-300"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Income Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-foreground">
                Income Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.category || "Uncategorized"}</TableCell>
                        <TableCell className="text-right font-medium text-success">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!hasActualTransactions && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Income Transactions</h3>
              <p className="mb-4">
                No income transactions recorded for {formatMonthDisplay(selectedMonth)}. 
                Charts and detailed analysis will populate once you enter or upload transactions.
              </p>
              <Button asChild>
                <Link to="/transactions">Add Income Transaction</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};