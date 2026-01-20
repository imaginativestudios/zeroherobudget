import { useMemo } from "react";
import { Scale, ArrowLeft, TrendingUp, TrendingDown, Download, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DEFAULT_ASSETS, SAMPLE_DEBTS, formatCurrency } from "@/lib/constants";
import { simulatePayoff } from "@/lib/debtCalculations";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CustomPieLegend, CustomLineLegend } from "@/components/charts/CustomChartLegend";
import { CHART_COLORS, STANDARD_TOOLTIP_STYLE, currencyFormatter } from "@/lib/chartConfig";
import { exportNetWorthCSV, exportNetWorthPDF } from '@/lib/reportExports';
import { toast } from 'sonner';

export const NetWorthReport = () => {
  const [assets] = useLocalStorage("bdt_assets", DEFAULT_ASSETS);
  const [debts] = useLocalStorage("bdt_debts", SAMPLE_DEBTS);
  const [income] = useLocalStorage("bdt_income", 18254);
  const [expenses] = useLocalStorage("bdt_expenses", []);
  const [strategy] = useLocalStorage("bdt_strategy", "Snowball");

  const totalAssets = useMemo(() => 
    assets.reduce((sum, asset) => sum + (asset.value || 0), 0), 
    [assets]
  );
  
  const totalDebt = useMemo(() => 
    debts.reduce((sum, debt) => sum + (debt.balance || 0), 0), 
    [debts]
  );
  
  const netWorth = totalAssets - totalDebt;
  
  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, expense) => sum + (expense.planned || 0), 0), 
    [expenses]
  );
  
  const leftover = Math.max(0, (income || 0) - totalExpenses);

  // Asset composition for pie chart
  const assetComposition = useMemo(() => 
    assets.filter(asset => asset.value > 0).map(asset => ({
      name: asset.name,
      value: asset.value
    })), 
    [assets]
  );

  // Debt payoff projection for net worth trend
  const schedule = useMemo(() => {
    if (leftover > 0 && debts.length > 0) {
      return simulatePayoff(debts, leftover, strategy as "Snowball" | "Avalanche");
    }
    return { timeline: [], totalInterest: 0, perDebt: [] };
  }, [debts, leftover, strategy]);

  // Net worth projection over time
  const netWorthProjection = useMemo(() => {
    if (schedule.timeline.length === 0) {
      return [{
        month: "Current",
        netWorth: netWorth,
        assets: totalAssets,
        debt: totalDebt
      }];
    }

    return [
      {
        month: "Current",
        netWorth: netWorth,
        assets: totalAssets,
        debt: totalDebt
      },
      ...schedule.timeline.slice(0, 60).map((point, index) => ({
        month: point.label,
        netWorth: totalAssets - point.totalBalance,
        assets: totalAssets,
        debt: point.totalBalance
      }))
    ];
  }, [schedule, netWorth, totalAssets, totalDebt]);

  // Prepare legend data for pie chart
  const pieLegendData = useMemo(() => 
    assetComposition.map((asset, index) => ({
      name: asset.name,
      value: asset.value,
      percentage: totalAssets > 0 ? `${((asset.value / totalAssets) * 100).toFixed(1)}%` : '0%',
      color: CHART_COLORS[index % CHART_COLORS.length]
    })), [assetComposition, totalAssets]
  );

  const handleExport = (format: 'csv' | 'pdf') => {
    const exportData = {
      assets: assets.map(a => ({ name: a.name, amount: a.value })),
      debts: debts.map(d => ({ name: d.name, amount: d.balance })),
      totalAssets,
      totalDebts: totalDebt,
      netWorth
    };

    if (format === 'csv') {
      exportNetWorthCSV(exportData);
      toast.success('Net worth report exported as CSV');
    } else {
      exportNetWorthPDF(exportData);
      toast.success('Net worth report exported as PDF');
    }
  };

  return (
    <div className="pt-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/reports">
              <ArrowLeft className="h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              Kingdom Wealth Report
            </h1>
            <p className="text-muted-foreground mt-2">
              Your financial kingdom&apos;s position and projected growth
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Net Worth Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(totalAssets)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Total Debt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totalDebt)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Net Worth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(netWorth)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Assets minus Debts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Asset Composition Chart */}
        {assetComposition.length > 0 && (
          <Card className="shadow-royal overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2 sm:gap-3">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                Asset Composition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 sm:h-96 lg:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetComposition}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="75%"
                      innerRadius="30%"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    >
                      {assetComposition.map((_, index) => (
                        <Cell 
                          key={index} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          className="drop-shadow-sm hover:brightness-110 transition-all duration-300"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={currencyFormatter}
                      contentStyle={STANDARD_TOOLTIP_STYLE}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <CustomPieLegend data={pieLegendData} />
            </CardContent>
          </Card>
        )}

        {/* Net Worth Projection */}
        {leftover > 0 && schedule.timeline.length > 0 && (
          <Card className="shadow-royal overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2 sm:gap-3">
                <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                Net Worth Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomLineLegend items={[{ label: "Net Worth", color: "hsl(var(--primary))" }]} />
              <div className="h-80 sm:h-96 lg:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={netWorthProjection} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip 
                      formatter={currencyFormatter}
                      contentStyle={STANDARD_TOOLTIP_STYLE}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netWorth" 
                      name="Net Worth" 
                      strokeWidth={3} 
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2 }}
                      stroke="hsl(var(--primary))"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-foreground">
            Assets Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell className="text-right font-medium text-success">
                      {formatCurrency(asset.value)}
                    </TableCell>
                    <TableCell className="text-right">
                      {totalAssets > 0 ? ((asset.value / totalAssets) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell className="font-bold">Total Assets</TableCell>
                  <TableCell className="text-right font-bold text-success">
                    {formatCurrency(totalAssets)}
                  </TableCell>
                  <TableCell className="text-right font-bold">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Debts Table */}
      {debts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-foreground">
              Debts Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Debt</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">APR</TableHead>
                    <TableHead className="text-right">Min Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="font-medium">{debt.name}</TableCell>
                      <TableCell className="capitalize">{debt.type}</TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        {formatCurrency(debt.balance)}
                      </TableCell>
                      <TableCell className="text-right">{debt.apr.toFixed(2)}%</TableCell>
                      <TableCell className="text-right">{formatCurrency(debt.min)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">Total Debt</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold text-destructive">
                      {formatCurrency(totalDebt)}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expand Your Kingdom</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" asChild>
              <Link to="/budgets">Update The Atlas</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/debts">Optimize Battle Strategy</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};