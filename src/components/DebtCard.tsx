import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface DebtCardProps {
  name: string;
  currentBalance: number;
  originalBalance: number;
  minimumPayment: number;
  interestRate: number;
  isTarget?: boolean;
}

export const DebtCard = ({
  name,
  currentBalance,
  originalBalance,
  minimumPayment,
  interestRate,
  isTarget = false
}: DebtCardProps) => {
  const progressPercentage = ((originalBalance - currentBalance) / originalBalance) * 100;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Card className={cn(
      "shadow-elegant transition-royal",
      isTarget && "ring-2 ring-accent shadow-gold"
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{name}</span>
          {isTarget && (
            <div className="flex items-center gap-2 text-accent">
              <Target className="h-5 w-5" />
              <span className="text-sm font-medium">TARGET</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Current Balance</div>
            <div className="font-semibold text-lg">
              {formatCurrency(currentBalance)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Min Payment</div>
            <div className="font-semibold text-lg">
              {formatCurrency(minimumPayment)}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm text-muted-foreground">
            {interestRate}% APR
          </span>
          <Button variant="royal" size="sm">
            <DollarSign className="h-4 w-4" />
            Pay Extra
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};