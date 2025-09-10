import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FinancialCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
  to?: string;
  previousAmount?: number;
  insight?: string;
}

export const FinancialCard = ({ 
  title, 
  amount, 
  icon: Icon, 
  trend = "neutral",
  className,
  to,
  previousAmount,
  insight
}: FinancialCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Calculate trend indicators
  const hasChange = previousAmount !== undefined && previousAmount !== 0;
  const changeAmount = hasChange ? amount - previousAmount! : 0;
  const changePercentage = hasChange ? Math.abs(changeAmount / previousAmount!) * 100 : 0;
  const isIncrease = changeAmount > 0;
  const isDecrease = changeAmount < 0;
  
  const getTrendIcon = () => {
    if (!hasChange || Math.abs(changeAmount) < 1) return Minus;
    return isIncrease ? TrendingUp : TrendingDown;
  };
  
  const getTrendColor = () => {
    if (!hasChange || Math.abs(changeAmount) < 1) return "text-muted-foreground";
    // For income and available funds, increase is good
    if (title.includes("Income") || title.includes("Available")) {
      return isIncrease ? "text-success" : "text-destructive";
    }
    // For expenses and subscriptions, decrease is good
    if (title.includes("Expenses") || title.includes("Subscriptions")) {
      return isDecrease ? "text-success" : "text-destructive";
    }
    // For Net Worth, increase is always good
    return isIncrease ? "text-success" : "text-destructive";
  };

  const getAmountColor = () => {
    switch (trend) {
      case "up": return amount >= 0 ? "text-success" : "text-destructive";
      case "down": return amount >= 0 ? "text-destructive" : "text-success";
      default: return "text-foreground";
    }
  };
  
  const TrendIcon = getTrendIcon();

  const cardContent = (
    <Card className={cn(
      "shadow-elegant hover:shadow-royal transition-royal animate-fade-in",
      to && "cursor-pointer hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-[1.02]",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground min-w-0 truncate">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-accent" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className={cn("text-2xl font-bold min-w-0 truncate", getAmountColor())}>
            {formatCurrency(amount)}
          </div>
          {hasChange && Math.abs(changeAmount) >= 1 && (
            <Badge variant="outline" className={`${getTrendColor()} border-current animate-scale-in`}>
              <TrendIcon className="h-3 w-3 mr-1" />
              {changePercentage.toFixed(1)}%
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          {hasChange && Math.abs(changeAmount) >= 1 && (
            <p className={`text-xs ${getTrendColor()}`}>
              {isIncrease ? "+" : ""}{formatCurrency(changeAmount)} vs last month
            </p>
          )}
          
          {insight && (
            <div className="flex items-start gap-1">
              <span className="text-xs">💡</span>
              <p className="text-xs text-accent font-medium leading-relaxed">
                {insight}
              </p>
            </div>
          )}
          
          {to && (
            <p className="text-xs text-muted-foreground">
              View detailed report →
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};