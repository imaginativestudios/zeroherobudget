import { useState } from "react";
import { Download, ChevronDown, ChevronUp, CheckCircle2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatCurrency } from "@/lib/constants";
import { downloadCsv, toCsv } from "@/lib/csvUtils";
import type { DetailedPaymentSchedule } from "@/lib/debtCalculations";

interface PaymentScheduleTableProps {
  schedule: DetailedPaymentSchedule;
  strategy: "Snowball" | "Avalanche";
}

export const PaymentScheduleTable = ({ schedule, strategy }: PaymentScheduleTableProps) => {
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([1]));

  const toggleMonth = (month: number) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedMonths(new Set(schedule.months.map(m => m.month)));
  };

  const collapseAll = () => {
    setExpandedMonths(new Set());
  };

  const exportSchedule = () => {
    const rows = [
      ["Month", "Debt Name", "Starting Balance", "Interest", "Minimum Payment", "Extra Payment", "Total Payment", "Principal", "Ending Balance", "Status"],
      ...schedule.months.flatMap(month =>
        month.payments.map(payment => [
          month.label,
          payment.debtName,
          payment.startingBalance.toFixed(2),
          payment.interest.toFixed(2),
          payment.minimumPayment.toFixed(2),
          payment.extraPayment.toFixed(2),
          payment.totalPayment.toFixed(2),
          payment.principal.toFixed(2),
          payment.endingBalance.toFixed(2),
          payment.isPaidOff ? "PAID OFF" : "Active"
        ])
      )
    ];
    downloadCsv(`debt-schedule-${strategy.toLowerCase()}.csv`, toCsv(rows));
  };

  if (!schedule.months.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No debt data available. Add debts to see your payment schedule.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Months to Pay Off</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{schedule.summary.totalMonths}</p>
            <p className="text-xs text-muted-foreground mt-1">Payment periods</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(schedule.summary.totalInterest)}</p>
            <p className="text-xs text-muted-foreground mt-1">Interest paid over time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(schedule.summary.totalPaid)}</p>
            <p className="text-xs text-muted-foreground mt-1">All payments combined</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Debt Free Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent">{schedule.summary.debtFreeDate}</p>
            <p className="text-xs text-muted-foreground mt-1">Freedom achieved!</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={exportSchedule}>
          <Download className="h-4 w-4" />
          Export Schedule
        </Button>
      </div>

      {/* Monthly Breakdown */}
      <div className="space-y-3">
        {schedule.months.map((monthData) => {
          const isExpanded = expandedMonths.has(monthData.month);
          const hasPaidOff = monthData.debtsPaidOffThisMonth.length > 0;

          return (
            <Collapsible
              key={monthData.month}
              open={isExpanded}
              onOpenChange={() => toggleMonth(monthData.month)}
            >
              <Card className={hasPaidOff ? "border-accent" : ""}>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                        <CardTitle className="text-base font-semibold">
                          {monthData.label}
                          {hasPaidOff && (
                            <span className="ml-3 text-sm font-normal text-accent flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4" />
                              {monthData.debtsPaidOffThisMonth.join(", ")} PAID OFF!
                            </span>
                          )}
                        </CardTitle>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          Total: {formatCurrency(monthData.totals.totalPayment)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Remaining: {formatCurrency(monthData.totals.remainingBalance)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-2 font-medium text-muted-foreground">Debt</th>
                            <th className="text-right py-2 px-2 font-medium text-muted-foreground hidden sm:table-cell">Start</th>
                            <th className="text-right py-2 px-2 font-medium text-muted-foreground">Interest</th>
                            <th className="text-right py-2 px-2 font-medium text-muted-foreground">Payment</th>
                            <th className="text-right py-2 px-2 font-medium text-muted-foreground hidden md:table-cell">Principal</th>
                            <th className="text-right py-2 px-2 font-medium text-muted-foreground">End</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthData.payments.map((payment, idx) => (
                            <tr
                              key={payment.debtId}
                              className={`border-b border-border/50 ${
                                payment.isPaidOff ? "bg-accent/10" : idx % 2 === 0 ? "bg-muted/20" : ""
                              }`}
                            >
                              <td className="py-2 px-2">
                                <div className="flex items-center gap-2">
                                  {payment.isPaidOff && (
                                    <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                                  )}
                                  <span className={payment.isPaidOff ? "text-accent font-medium" : ""}>
                                    {payment.debtName}
                                  </span>
                                </div>
                              </td>
                              <td className="text-right py-2 px-2 text-muted-foreground hidden sm:table-cell">
                                {formatCurrency(payment.startingBalance)}
                              </td>
                              <td className="text-right py-2 px-2 text-destructive">
                                {formatCurrency(payment.interest)}
                              </td>
                              <td className="text-right py-2 px-2 font-semibold">
                                {formatCurrency(payment.totalPayment)}
                                {payment.extraPayment > 0 && (
                                  <span className="block text-xs text-accent">
                                    +{formatCurrency(payment.extraPayment)} extra
                                  </span>
                                )}
                              </td>
                              <td className="text-right py-2 px-2 text-muted-foreground hidden md:table-cell">
                                {formatCurrency(payment.principal)}
                              </td>
                              <td className="text-right py-2 px-2 font-medium">
                                {payment.isPaidOff ? (
                                  <span className="text-accent">$0.00</span>
                                ) : (
                                  formatCurrency(payment.endingBalance)
                                )}
                              </td>
                            </tr>
                          ))}
                          {/* Totals Row */}
                          <tr className="bg-muted font-semibold">
                            <td className="py-2 px-2">TOTALS</td>
                            <td className="text-right py-2 px-2 hidden sm:table-cell">—</td>
                            <td className="text-right py-2 px-2 text-destructive">
                              {formatCurrency(monthData.totals.totalInterest)}
                            </td>
                            <td className="text-right py-2 px-2">
                              {formatCurrency(monthData.totals.totalPayment)}
                            </td>
                            <td className="text-right py-2 px-2 hidden md:table-cell">
                              {formatCurrency(monthData.totals.totalPrincipal)}
                            </td>
                            <td className="text-right py-2 px-2">
                              {formatCurrency(monthData.totals.remainingBalance)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};
