import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/constants";

interface BudgetVarianceAlertProps {
  planned: number;
  actual: number;
  categoryName: string;
}

export const BudgetVarianceAlert = ({ planned, actual, categoryName }: BudgetVarianceAlertProps) => {
  const variance = actual - planned;
  const variancePercentage = planned > 0 ? (variance / planned) * 100 : 0;
  const isOverBudget = variance > 0;
  const isSignificant = Math.abs(variancePercentage) > 20;
  
  if (!isSignificant) return null;

  const getAlertType = () => {
    if (isOverBudget && variancePercentage > 50) return "destructive";
    if (isOverBudget && variancePercentage > 20) return "default";
    return "default"; // Under budget
  };

  const getIcon = () => {
    if (isOverBudget && variancePercentage > 50) return AlertTriangle;
    if (isOverBudget) return AlertCircle;
    return CheckCircle;
  };

  const Icon = getIcon();
  const alertType = getAlertType();

  return (
    <Alert variant={alertType as any} className="animate-fade-in">
      <Icon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <span className="font-medium">{categoryName}</span> is{" "}
          <span className={isOverBudget ? "text-destructive" : "text-success"}>
            {Math.abs(variancePercentage).toFixed(1)}%{" "}
            {isOverBudget ? "over" : "under"} budget
          </span>
        </div>
        <Badge variant={isOverBudget ? "destructive" : "secondary"}>
          {isOverBudget ? "+" : ""}{formatCurrency(variance)}
        </Badge>
      </AlertDescription>
    </Alert>
  );
};