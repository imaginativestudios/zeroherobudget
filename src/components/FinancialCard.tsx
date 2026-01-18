import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown, Minus, RefreshCw, Building2, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface FinancialCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
  to?: string;
  previousAmount?: number;
  insight?: string;
  syncStatus?: {
    isSyncing: boolean;
    lastSync: string | null;
    connectedBanks: number;
  };
}

export const FinancialCard = ({ 
  title, 
  amount, 
  icon: Icon, 
  trend = "neutral",
  className,
  to,
  previousAmount,
  insight,
  syncStatus
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
      "h-full flex flex-col transition-all duration-300 ease-out",
      to && "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 transition-transform duration-200 group-hover:scale-105 min-w-0 flex-1">
            <Icon className="h-5 w-5 text-accent flex-shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" aria-hidden="true" />
            <CardTitle className="text-sm font-medium text-muted-foreground min-w-0 truncate">
              {title}
            </CardTitle>
          </div>
          {syncStatus && syncStatus.connectedBanks > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {syncStatus.isSyncing ? (
                <RefreshCw className="h-3 w-3 text-info animate-spin" aria-hidden="true" />
              ) : (
                <Building2 className="h-3 w-3 text-success" aria-hidden="true" />
              )}
              <span className="text-xs text-muted-foreground">{syncStatus.connectedBanks}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between transition-all duration-200">
        {/* Primary: Amount */}
        <div className={cn("text-xl sm:text-2xl font-bold transition-all duration-200 group-hover:scale-105", getAmountColor())}>
          {formatCurrency(amount)}
        </div>
        
        {/* Secondary: Trend section */}
        {hasChange && Math.abs(changeAmount) >= 1 && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className={`${getTrendColor()} border-current animate-scale-in`}>
              <TrendIcon className="h-3 w-3 mr-1" aria-hidden="true" />
              {changePercentage.toFixed(1)}%
            </Badge>
            <span className={`text-xs ${getTrendColor()}`}>
              {isIncrease ? "+" : ""}{formatCurrency(changeAmount)} vs last month
            </span>
          </div>
        )}
        
        {/* Tertiary: Insight or Sync Status */}
        {syncStatus && syncStatus.lastSync && (
          <div className="mt-3 p-2 bg-muted/50 rounded-md border border-border/50">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <RefreshCw className={cn("h-3 w-3", syncStatus.isSyncing && "animate-spin text-info")} aria-hidden="true" />
              {syncStatus.isSyncing ? "Syncing..." : `Updated ${formatDistanceToNow(new Date(syncStatus.lastSync), { addSuffix: true })}`}
            </p>
          </div>
        )}
        
        {!syncStatus && insight && (
          <div className="mt-3 p-2 bg-muted/50 rounded-md flex items-start gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-accent-dark fill-accent-dark flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-accent-dark font-medium leading-relaxed line-clamp-2">
              {insight}
            </p>
          </div>
        )}
        
        {/* Footer: Link */}
        {to && (
          <p className="text-xs text-muted-foreground mt-auto pt-3 transition-all duration-200 group-hover:text-accent-dark group-hover:translate-x-1">
            View detailed report →
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="block group">
        {cardContent}
      </Link>
    );
  }

  return <div className="group">{cardContent}</div>;
};