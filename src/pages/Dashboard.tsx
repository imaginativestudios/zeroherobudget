import { Crown, DollarSign, TrendingUp, Target, AlertTriangle } from "lucide-react";
import { FinancialCard } from "@/components/FinancialCard";
import { DebtCard } from "@/components/DebtCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockDebts = [
  {
    name: "Credit Card A",
    currentBalance: 2500,
    originalBalance: 5000,
    minimumPayment: 50,
    interestRate: 18.99,
    isTarget: true
  },
  {
    name: "Student Loan",
    currentBalance: 15000,
    originalBalance: 20000,
    minimumPayment: 150,
    interestRate: 6.5,
    isTarget: false
  },
  {
    name: "Car Loan",
    currentBalance: 8500,
    originalBalance: 25000,
    minimumPayment: 300,
    interestRate: 4.2,
    isTarget: false
  }
];

export const Dashboard = () => {
  const totalDebt = mockDebts.reduce((sum, debt) => sum + debt.currentBalance, 0);
  const monthlyIncome = 5500;
  const monthlyExpenses = 3200;
  const monthlyDebtPayments = mockDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const availableForDebt = monthlyIncome - monthlyExpenses - monthlyDebtPayments;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Crown className="h-8 w-8 text-accent" />
            Royal Financial Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Your path to financial sovereignty
          </p>
        </div>
        <Button variant="gold" size="lg">
          <TrendingUp className="h-5 w-5" />
          View Reports
        </Button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard
          title="Monthly Income"
          amount={monthlyIncome}
          icon={DollarSign}
          trend="up"
        />
        <FinancialCard
          title="Total Debt"
          amount={totalDebt}
          icon={AlertTriangle}
          trend="down"
        />
        <FinancialCard
          title="Monthly Expenses"
          amount={monthlyExpenses}
          icon={TrendingUp}
          trend="neutral"
        />
        <FinancialCard
          title="Extra for Debt"
          amount={availableForDebt}
          icon={Target}
          trend="up"
        />
      </div>

      {/* Debt Snowball Section */}
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-3">
            <Target className="h-6 w-6 text-accent" />
            Debt Snowball Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mockDebts.map((debt, index) => (
              <DebtCard
                key={index}
                name={debt.name}
                currentBalance={debt.currentBalance}
                originalBalance={debt.originalBalance}
                minimumPayment={debt.minimumPayment}
                interestRate={debt.interestRate}
                isTarget={debt.isTarget}
              />
            ))}
          </div>
          <div className="mt-6 p-4 bg-gradient-subtle rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground">Next Payment Strategy</h4>
                <p className="text-sm text-muted-foreground">
                  Focus ${availableForDebt.toFixed(2)} extra on Credit Card A (smallest balance)
                </p>
              </div>
              <Button variant="royal">
                Make Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};