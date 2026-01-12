import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { CustomLineLegend, CustomBarLegend } from "@/components/charts/CustomChartLegend";
import { STANDARD_TOOLTIP_STYLE, currencyFormatter } from "@/lib/chartConfig";
import { 
  TrendingDown, Calendar, DollarSign, Award, 
  Snowflake, Flame, CheckCircle2, Clock
} from "lucide-react";
import { simulatePayoff, PayoffResult, DebtItem } from "@/lib/debtCalculations";
import { format, addMonths } from "date-fns";

interface StrategyComparisonProps {
  debts: DebtItem[];
  extraBudget: number;
  currentStrategy: "Snowball" | "Avalanche";
  onStrategyChange: (strategy: "Snowball" | "Avalanche") => void;
}

export function StrategyComparison({ 
  debts, 
  extraBudget, 
  currentStrategy,
  onStrategyChange 
}: StrategyComparisonProps) {
  const snowballResult = useMemo(
    () => simulatePayoff(debts, extraBudget, "Snowball"),
    [debts, extraBudget]
  );

  const avalancheResult = useMemo(
    () => simulatePayoff(debts, extraBudget, "Avalanche"),
    [debts, extraBudget]
  );

  const comparison = useMemo(() => {
    const snowballMonths = snowballResult.timeline.length - 1;
    const avalancheMonths = avalancheResult.timeline.length - 1;
    const snowballInterest = snowballResult.totalInterest;
    const avalancheInterest = avalancheResult.totalInterest;
    
    const interestSavings = snowballInterest - avalancheInterest;
    const timeSavings = snowballMonths - avalancheMonths;
    const betterStrategy: "Snowball" | "Avalanche" = interestSavings > 0 ? "Avalanche" : "Snowball";
    
    // Calculate debt-free dates
    const today = new Date();
    const snowballDebtFree = snowballMonths > 0 ? addMonths(today, snowballMonths) : today;
    const avalancheDebtFree = avalancheMonths > 0 ? addMonths(today, avalancheMonths) : today;
    
    return {
      snowballMonths,
      avalancheMonths,
      snowballInterest,
      avalancheInterest,
      interestSavings: Math.abs(interestSavings),
      timeSavings: Math.abs(timeSavings),
      betterStrategy,
      snowballDebtFree: format(snowballDebtFree, "yyyy-MM-dd"),
      avalancheDebtFree: format(avalancheDebtFree, "yyyy-MM-dd")
    };
  }, [snowballResult, avalancheResult]);

  // Prepare dual timeline data
  const chartData = useMemo(() => {
    const maxLength = Math.max(snowballResult.timeline.length, avalancheResult.timeline.length);
    return Array.from({ length: maxLength }, (_, i) => ({
      month: i,
      label: i === 0 ? "Start" : `Month ${i}`,
      snowball: snowballResult.timeline[i]?.totalBalance || 0,
      avalanche: avalancheResult.timeline[i]?.totalBalance || 0
    }));
  }, [snowballResult.timeline, avalancheResult.timeline]);

  // Prepare per-debt comparison data
  const debtComparison = useMemo(() => {
    const today = new Date();
    return debts.map(debt => {
      const snowballDebt = snowballResult.perDebt.find(d => d.name === debt.name);
      const avalancheDebt = avalancheResult.perDebt.find(d => d.name === debt.name);
      
      const snowballMonths = snowballDebt?.months || 0;
      const avalancheMonths = avalancheDebt?.months || 0;
      
      return {
        name: debt.name,
        balance: debt.balance,
        snowballMonths,
        avalancheMonths,
        snowballDate: snowballMonths > 0 ? format(addMonths(today, snowballMonths), "yyyy-MM-dd") : "",
        avalancheDate: avalancheMonths > 0 ? format(addMonths(today, avalancheMonths), "yyyy-MM-dd") : ""
      };
    });
  }, [debts, snowballResult.perDebt, avalancheResult.perDebt]);

  // Prepare total cost breakdown
  const totalPrincipal = debts.reduce((sum, d) => sum + d.balance, 0);
  const costData = [
    {
      name: "Principal",
      Snowball: totalPrincipal,
      Avalanche: totalPrincipal
    },
    {
      name: "Interest",
      Snowball: comparison.snowballInterest,
      Avalanche: comparison.avalancheInterest
    }
  ];

  if (debts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Add debts to see strategy comparison
          </p>
        </CardContent>
      </Card>
    );
  }

  const isFasterSnowball = comparison.snowballMonths < comparison.avalancheMonths;
  const isCheaperSnowball = comparison.snowballInterest < comparison.avalancheInterest;

  return (
    <div className="space-y-6">
      {/* Winner Banner */}
      <Card className="border-2 border-success bg-success/5">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <Award className="h-6 w-6 sm:h-8 sm:w-8 text-success flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-2xl">
                {comparison.betterStrategy === "Avalanche" ? (
                  <span className="flex items-center gap-2 flex-wrap">
                    <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-chart-4" />
                    <span>Recommended: Avalanche</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2 flex-wrap">
                    <Snowflake className="h-5 w-5 sm:h-6 sm:w-6 text-chart-1" />
                    <span>Recommended: Snowball</span>
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2">
                {comparison.betterStrategy === "Avalanche" ? (
                  <>
                    Save <strong className="text-success">${comparison.interestSavings.toFixed(2)}</strong> in interest
                    {comparison.timeSavings > 0 && (
                      <> and become debt-free <strong className="text-success">{comparison.timeSavings} months</strong> sooner</>
                    )}
                    ! This is the mathematically optimal approach.
                  </>
                ) : (
                  <>
                    Pay off debt <strong className="text-success">{comparison.timeSavings} months</strong> faster! 
                    Quick wins keep you motivated on your debt-free journey.
                  </>
                )}
              </CardDescription>
              {currentStrategy !== comparison.betterStrategy && (
                <Button
                  onClick={() => onStrategyChange(comparison.betterStrategy)}
                  variant="default"
                  className="mt-4"
                  size="sm"
                >
                  Switch to {comparison.betterStrategy}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Snowball Card */}
        <Card className={currentStrategy === "Snowball" ? "border-2 border-chart-1" : ""}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Snowflake className="h-5 w-5 text-chart-1" />
              <CardTitle>Snowball Strategy</CardTitle>
            </div>
            <CardDescription>Smallest balance first</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time to debt-free</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{comparison.snowballMonths} months</span>
                  {isFasterSnowball && (
                    <Badge variant="default" className="bg-success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Faster
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Total interest</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">${comparison.snowballInterest.toFixed(2)}</span>
                  {isCheaperSnowball && (
                    <Badge variant="default" className="bg-success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Less
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Debt-free date</span>
                </div>
                <span className="font-semibold">
                  {comparison.snowballDebtFree ? format(new Date(comparison.snowballDebtFree), "MMM yyyy") : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avalanche Card */}
        <Card className={currentStrategy === "Avalanche" ? "border-2 border-chart-4" : ""}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-chart-4" />
              <CardTitle>Avalanche Strategy</CardTitle>
            </div>
            <CardDescription>Highest interest rate first</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time to debt-free</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{comparison.avalancheMonths} months</span>
                  {!isFasterSnowball && (
                    <Badge variant="default" className="bg-success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Faster
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Total interest</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">${comparison.avalancheInterest.toFixed(2)}</span>
                  {!isCheaperSnowball && (
                    <Badge variant="default" className="bg-success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Less
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Debt-free date</span>
                </div>
                <span className="font-semibold">
                  {comparison.avalancheDebtFree ? format(new Date(comparison.avalancheDebtFree), "MMM yyyy") : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dual Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Balance Reduction Timeline
          </CardTitle>
          <CardDescription>Compare how each strategy reduces your total debt over time</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomLineLegend items={[
            { label: "Snowball", color: "hsl(var(--chart-1))" },
            { label: "Avalanche", color: "hsl(var(--chart-4))" }
          ]} />
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis 
                dataKey="label" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={currencyFormatter}
                contentStyle={STANDARD_TOOLTIP_STYLE}
              />
              <Line
                type="monotone"
                dataKey="snowball"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                name="Snowball"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="avalanche"
                stroke="hsl(var(--chart-4))"
                strokeWidth={3}
                name="Avalanche"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Per-Debt Payoff Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payoff Order Comparison</CardTitle>
          <CardDescription>See when each debt gets paid off under each strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 sm:px-4 font-semibold text-sm">Debt Name</th>
                  <th className="text-right py-3 px-2 sm:px-4 font-semibold text-sm hidden sm:table-cell">Balance</th>
                  <th className="text-center py-3 px-2 sm:px-4 font-semibold text-sm">
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <Snowflake className="h-3 w-3 sm:h-4 sm:w-4 text-chart-1" />
                      <span className="hidden xs:inline">Snowball</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-2 sm:px-4 font-semibold text-sm">
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-chart-4" />
                      <span className="hidden xs:inline">Avalanche</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {debtComparison.map((debt, index) => (
                  <tr key={debt.name} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="py-3 px-2 sm:px-4 font-medium text-sm">
                      <div className="truncate max-w-[120px] sm:max-w-none">{debt.name}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">${debt.balance.toFixed(0)}</div>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right hidden sm:table-cell">${debt.balance.toFixed(2)}</td>
                    <td className="py-3 px-2 sm:px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs sm:text-sm">{debt.snowballDate ? format(new Date(debt.snowballDate), "MMM yy") : "N/A"}</span>
                        {debt.snowballMonths < debt.avalancheMonths && (
                          <Badge variant="default" className="bg-chart-1 text-[10px] sm:text-xs px-1">
                            {debt.avalancheMonths - debt.snowballMonths}mo faster
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs sm:text-sm">{debt.avalancheDate ? format(new Date(debt.avalancheDate), "MMM yy") : "N/A"}</span>
                        {debt.avalancheMonths < debt.snowballMonths && (
                          <Badge variant="default" className="bg-chart-4 text-[10px] sm:text-xs px-1">
                            {debt.snowballMonths - debt.avalancheMonths}mo faster
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Total Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Total Cost Breakdown</CardTitle>
          <CardDescription>Compare the total amount you'll pay (principal + interest)</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomBarLegend items={[
            { label: "Snowball", color: "hsl(var(--chart-1))" },
            { label: "Avalanche", color: "hsl(var(--chart-4))" }
          ]} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={currencyFormatter}
                contentStyle={STANDARD_TOOLTIP_STYLE}
              />
              <Bar 
                dataKey="Snowball" 
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="Avalanche" 
                fill="hsl(var(--chart-4))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Snowball Total Cost</p>
              <p className="text-2xl font-bold text-chart-1">
                ${(totalPrincipal + comparison.snowballInterest).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avalanche Total Cost</p>
              <p className="text-2xl font-bold text-chart-4">
                ${(totalPrincipal + comparison.avalancheInterest).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Snowflake className="h-5 w-5 text-chart-1" />
              <CardTitle className="text-lg">When to Choose Snowball</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                <span>You need motivation from quick wins</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                <span>You have several small debts you can eliminate quickly</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                <span>Psychology matters more than math for your situation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                <span>You've struggled to stay consistent with debt payoff in the past</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-chart-4" />
              <CardTitle className="text-lg">When to Choose Avalanche</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                <span>You want to minimize total interest paid</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                <span>You're disciplined and don't need quick wins for motivation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                <span>You have high-interest debt draining your finances</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                <span>Math and optimization matter most to you</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
