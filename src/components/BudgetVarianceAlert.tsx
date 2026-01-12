import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { InlineAlert } from "@/components/ui/inline-alert";
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

  const getVariant = () => {
    if (isOverBudget && variancePercentage > 50) return "destructive";
    if (isOverBudget) return "warning";
    return "success";
  };

  const getIcon = () => {
    if (isOverBudget && variancePercentage > 50) return AlertTriangle;
    if (isOverBudget) return AlertCircle;
    return CheckCircle;
  };

  return (
    <InlineAlert 
      variant={getVariant()} 
      icon={getIcon()} 
      className="animate-fade-in"
    >
      <div className="flex items-center justify-between w-full">
        <div>
          <span className="font-medium">{categoryName}</span> is{" "}
          <span className={isOverBudget ? "text-destructive" : "text-green-600"}>
            {Math.abs(variancePercentage).toFixed(1)}%{" "}
            {isOverBudget ? "in Tactical Overstretch" : "in Strategic Surplus"}
          </span>
        </div>
        <Badge variant={isOverBudget ? "destructive" : "secondary"}>
          {isOverBudget ? "+" : ""}{formatCurrency(variance)}
        </Badge>
      </div>
    </InlineAlert>
  );
};
