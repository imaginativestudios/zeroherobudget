import { useState, useMemo } from "react";
import { TrendingUp, Target, Calculator, Lightbulb, Clock, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/constants";
import { simulatePayoff, DebtItem } from "@/lib/debtCalculations";

interface OptimizeStrategyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debts: DebtItem[];
  currentLeftover: number;
  currentStrategy: string;
  onStrategyUpdate?: (strategy: string, extraPayment: number) => void;
}

export const OptimizeStrategyDialog = ({
  open,
  onOpenChange,
  debts,
  currentLeftover,
  currentStrategy,
  onStrategyUpdate
}: OptimizeStrategyDialogProps) => {
  const [extraPayment, setExtraPayment] = useState(currentLeftover);
  const [targetDate, setTargetDate] = useState("");
  const [customAllocations, setCustomAllocations] = useState<Record<string, number>>({});

  // Calculate scenarios
  const snowballResult = useMemo(() => 
    simulatePayoff(debts, extraPayment, "Snowball"), [debts, extraPayment]
  );
  
  const avalancheResult = useMemo(() => 
    simulatePayoff(debts, extraPayment, "Avalanche"), [debts, extraPayment]
  );

  // Find quick wins (debts that could be paid off in 6 months or less)
  const quickWins = useMemo(() => {
    return debts.filter(debt => {
      const monthsToPayoff = debt.balance / (debt.min + (extraPayment / debts.length));
      return monthsToPayoff <= 6 && debt.balance < 5000;
    }).sort((a, b) => a.balance - b.balance);
  }, [debts, extraPayment]);

  // Calculate required payment for target date
  const calculateRequiredPayment = (targetMonths: number) => {
    if (!targetMonths || targetMonths <= 0) return 0;
    
    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinPayments = debts.reduce((sum, debt) => sum + debt.min, 0);
    
    // Simplified calculation - would need more complex interest calculation for accuracy
    return Math.max(0, (totalBalance / targetMonths) - totalMinPayments);
  };

  const targetMonths = targetDate ? 
    Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)) : 0;
  
  const requiredPayment = calculateRequiredPayment(targetMonths);

  const handleStrategySelect = (strategy: string) => {
    onStrategyUpdate?.(strategy, extraPayment);
    onOpenChange(false);
  };

  const interestSavings = avalancheResult.totalInterest - snowballResult.totalInterest;
  const timeDifference = (avalancheResult.perDebt[0]?.months || 0) - (snowballResult.perDebt[0]?.months || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Optimize Your Debt Strategy
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="comparison" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="comparison">Compare</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="quickwins">Quick Wins</TabsTrigger>
          </TabsList>

          {/* Strategy Comparison */}
          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className={`border-2 flex flex-col h-full ${currentStrategy === 'Snowball' ? 'border-primary' : 'border-border'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Debt Snowball
                    {currentStrategy === 'Snowball' && <Badge variant="default">Current</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payoff Time</span>
                      <span className="font-semibold">{snowballResult.perDebt[0]?.payoffLabel || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Interest</span>
                      <span className="font-semibold">{formatCurrency(snowballResult.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Strategy</span>
                      <span className="text-sm">Smallest balance first</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Pros:</strong> Quick psychological wins, builds momentum
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Best for:</strong> Staying motivated, multiple small debts
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleStrategySelect('Snowball')}
                    variant={currentStrategy === 'Snowball' ? 'default' : 'outline'}
                    className="w-full mt-auto"
                  >
                    {currentStrategy === 'Snowball' ? 'Current Strategy' : 'Switch to Snowball'}
                  </Button>
                </CardContent>
              </Card>

              <Card className={`border-2 flex flex-col h-full ${currentStrategy === 'Avalanche' ? 'border-primary' : 'border-border'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-accent" />
                    Debt Avalanche
                    {currentStrategy === 'Avalanche' && <Badge variant="default">Current</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payoff Time</span>
                      <span className="font-semibold">{avalancheResult.perDebt[0]?.payoffLabel || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Interest</span>
                      <span className="font-semibold">{formatCurrency(avalancheResult.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Strategy</span>
                      <span className="text-sm">Highest interest first</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Pros:</strong> Saves the most money, mathematically optimal
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Best for:</strong> High-interest debts, disciplined approach
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleStrategySelect('Avalanche')}
                    variant={currentStrategy === 'Avalanche' ? 'default' : 'outline'}
                    className="w-full mt-auto"
                  >
                    {currentStrategy === 'Avalanche' ? 'Current Strategy' : 'Switch to Avalanche'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {Math.abs(interestSavings) > 100 && (
              <Card className="bg-gradient-subtle border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Strategy Impact</h4>
                      <p className="text-sm text-muted-foreground">
                        {interestSavings > 0 ? 'Snowball' : 'Avalanche'} saves you{' '}
                        <span className="font-semibold text-primary">
                          {formatCurrency(Math.abs(interestSavings))}
                        </span>
                        {' '}in interest
                        {Math.abs(timeDifference) > 0 && (
                          <span> and pays off debt {Math.abs(timeDifference)} months {timeDifference > 0 ? 'sooner' : 'later'}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* What-If Scenarios */}
          <TabsContent value="scenarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Payment Impact Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Extra Monthly Payment: {formatCurrency(extraPayment)}</Label>
                  <Slider
                    value={[extraPayment]}
                    onValueChange={(value) => setExtraPayment(value[0])}
                    max={currentLeftover * 3}
                    min={0}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>$0</span>
                    <span>Current: {formatCurrency(currentLeftover)}</span>
                    <span>{formatCurrency(currentLeftover * 3)}</span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {snowballResult.perDebt[0]?.months || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Months to Freedom</div>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-lg">
                    <div className="text-2xl font-bold text-accent">
                      {formatCurrency(snowballResult.totalInterest)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Interest</div>
                  </div>
                  <div className="text-center p-4 bg-success/5 rounded-lg">
                    <div className="text-2xl font-bold text-success">
                      {formatCurrency(extraPayment * (snowballResult.perDebt[0]?.months || 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Extra Paid</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goal-Based Planning */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Debt-Free Date Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target-date">Target Debt-Free Date</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {targetDate && targetMonths > 0 && (
                  <div className="p-4 bg-gradient-subtle rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Goal Analysis</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Months to goal:</span>
                        <span className="ml-2 font-semibold">{targetMonths}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Required extra payment:</span>
                        <span className="ml-2 font-semibold">{formatCurrency(requiredPayment)}</span>
                      </div>
                    </div>
                    
                    {requiredPayment > currentLeftover * 2 ? (
                      <div className="text-sm text-destructive">
                        ⚠️ This goal requires {formatCurrency(requiredPayment - currentLeftover)} more than your current available funds.
                      </div>
                    ) : requiredPayment > currentLeftover ? (
                      <div className="text-sm text-warning">
                        💡 This goal is achievable but requires {formatCurrency(requiredPayment - currentLeftover)} more than currently available.
                      </div>
                    ) : (
                      <div className="text-sm text-success">
                        ✅ This goal is achievable with your current available funds!
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Wins */}
          <TabsContent value="quickwins" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Quick Wins & Momentum Builders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quickWins.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      These debts can be eliminated quickly to build momentum:
                    </p>
                    <div className="space-y-3">
                      {quickWins.map((debt) => {
                        const monthsToPayoff = Math.ceil(debt.balance / (debt.min + (extraPayment / debts.length)));
                        return (
                          <div key={debt.id} className="p-4 border rounded-lg space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{debt.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {debt.type === 'card' ? 'Credit Card' : 'Loan'} • {debt.apr}% APR
                                </p>
                              </div>
                              <Badge variant="secondary">{monthsToPayoff} months</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Balance: {formatCurrency(debt.balance)}</span>
                              <span>Min Payment: {formatCurrency(debt.min)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No quick wins available with current payment amounts.</p>
                    <p className="text-sm mt-2">Try increasing your extra payment to create opportunities.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleStrategySelect(currentStrategy)}>
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};