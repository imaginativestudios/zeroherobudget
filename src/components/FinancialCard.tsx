import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export const FinancialCard = ({ 
  title, 
  amount, 
  icon: Icon, 
  trend = "neutral",
  className 
}: FinancialCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up": return amount >= 0 ? "text-success" : "text-destructive";
      case "down": return amount >= 0 ? "text-destructive" : "text-success";
      default: return "text-foreground";
    }
  };

  return (
    <Card className={cn("shadow-elegant hover:shadow-royal transition-royal", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground min-w-0 truncate">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-accent" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold min-w-0 truncate", getTrendColor())}>
          {formatCurrency(amount)}
        </div>
      </CardContent>
    </Card>
  );
};