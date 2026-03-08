import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { InlineAlert } from "@/components/ui/inline-alert";
import { 
  Lightbulb, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  ClipboardList,
  Receipt,
  Target,
  Calendar
} from "lucide-react";
import { formatCurrency } from "@/lib/constants";
import { formatMonthDisplay } from "@/lib/dateUtils";
import { getCategoryColor } from "@/lib/chartConfig";
import { cn } from "@/lib/utils";

interface CategoryData {
  name: string;
  planned: number;
  actual: number;
  variance: number;
  variancePercent: number;
  percentage: number;
}

interface BudgetTip {
  type: "warning" | "success" | "info";
  message: string;
}

interface BudgetOverviewCardProps {
  categoryData: CategoryData[];
  totalPlanned: number;
  totalActual: number;
  income: number;
  selectedMonth: string;
  budgetItemCount: number;
  transactionCount?: number;
  onScrollToBudget?: () => void;
}

function generateBudgetTips(
  categoryData: CategoryData[], 
  totalPlanned: number, 
  totalActual: number, 
  income: number
): BudgetTip[] {
  const tips: BudgetTip[] = [];
  
  // Skip if no data
  if (categoryData.length === 0 || totalPlanned === 0) {
    tips.push({
      type: "info",
      message: "Add budget items below to get personalized spending insights and tips."
    });
    return tips;
  }
  
  // Overall budget status
  const variance = totalActual - totalPlanned;
  if (variance > 0) {
    tips.push({
      type: "warning",
      message: `Total spending is ${formatCurrency(variance)} over budget. Review categories below to find savings opportunities.`
    });
  } else if (variance < -100) {
    tips.push({
      type: "success",
      message: `You're ${formatCurrency(Math.abs(variance))} under budget this month. Consider allocating extra to savings or debt payoff.`
    });
  } else if (variance <= 0 && totalActual > 0) {
    tips.push({
      type: "success",
      message: "You're on track with your budget this month. Keep up the great work!"
    });
  }
  
  // Category-specific tips
  const overBudget = categoryData.filter(c => c.variance > 0 && c.actual > 0);
  const underBudget = categoryData.filter(c => c.variance < -50 && c.actual > 0);
  const sortedByPlanned = [...categoryData].sort((a, b) => b.planned - a.planned);
  const largestCategory = sortedByPlanned[0];
  
  // Largest expense insight (only if significant)
  if (largestCategory && largestCategory.percentage > 30) {
    tips.push({
      type: "info",
      message: `${largestCategory.name} is your largest expense category at ${largestCategory.percentage.toFixed(0)}% of your total budget.`
    });
  }
  
  // Over-budget warnings (top 2)
  overBudget.slice(0, 2).forEach(cat => {
    tips.push({
      type: "warning",
      message: `${cat.name} is ${formatCurrency(cat.variance)} over budget (${Math.abs(cat.variancePercent).toFixed(0)}% overspent).`
    });
  });
  
  // Under-budget success (top 1)
  if (underBudget.length > 0 && tips.filter(t => t.type === "success").length < 2) {
    const best = underBudget.reduce((a, b) => a.variance < b.variance ? a : b);
    tips.push({
      type: "success",
      message: `${best.name} is ${formatCurrency(Math.abs(best.variance))} under budget. Great discipline!`
    });
  }
  
  // 50/30/20 rule insight
  if (income > 0 && totalPlanned > 0) {
    const budgetToIncomeRatio = (totalPlanned / income) * 100;
    if (budgetToIncomeRatio > 80) {
      tips.push({
        type: "info",
        message: `Your planned expenses are ${budgetToIncomeRatio.toFixed(0)}% of income. The 50/30/20 rule suggests keeping needs under 50% for financial flexibility.`
      });
    }
  }
  
  return tips.slice(0, 4); // Limit to 4 tips
}

export function BudgetOverviewCard({
  categoryData,
  totalPlanned,
  totalActual,
  income,
  selectedMonth,
  budgetItemCount,
  transactionCount = 0,
  onScrollToBudget
}: BudgetOverviewCardProps) {
  const [tipsOpen, setTipsOpen] = useState(true);
  
  const variance = totalActual - totalPlanned;
  const budgetUsedPercent = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;
  const overBudgetCategories = categoryData.filter(c => c.variance > 0 && c.actual > 0);
  
  const tips = useMemo(
    () => generateBudgetTips(categoryData, totalPlanned, totalActual, income),
    [categoryData, totalPlanned, totalActual, income]
  );
  
  // Calculate segments for progress bar (only categories with actual spending)
  const categoriesWithSpending = categoryData.filter(c => c.actual > 0);
  const totalSpending = categoriesWithSpending.reduce((sum, c) => sum + c.actual, 0);

  return (
    <Card className="shadow-royal hover-lift">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2 sm:gap-3">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" aria-hidden="true" />
            Budget Overview
          </CardTitle>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {formatMonthDisplay(selectedMonth)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
        {/* Segmented Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(totalActual)} of {formatCurrency(totalPlanned)} spent
            </span>
            <span className={cn(
              "font-medium",
              budgetUsedPercent <= 100 ? "text-success" : "text-destructive"
            )}>
              {budgetUsedPercent.toFixed(0)}%
            </span>
          </div>
          
          {/* Segmented bar with category colors */}
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
            {totalSpending > 0 ? (
              <div className="absolute inset-0 flex">
                {categoriesWithSpending.map((cat, idx) => {
                  const segmentWidth = (cat.actual / Math.max(totalSpending, totalPlanned)) * 100;
                  return (
                    <Tooltip key={cat.name}>
                      <TooltipTrigger asChild>
                        <div 
                          className="h-full transition-all hover:opacity-80 cursor-pointer first:rounded-l-full"
                          style={{
                            width: `${segmentWidth}%`,
                            backgroundColor: getCategoryColor(cat.name, idx)
                          }}
                          aria-label={`${cat.name}: ${formatCurrency(cat.actual)}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(cat.actual)} spent
                          {cat.planned > 0 && ` of ${formatCurrency(cat.planned)} planned`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ) : (
              <Progress value={0} className="h-4" />
            )}
            
            {/* Budget limit indicator line */}
            {totalActual > totalPlanned && totalPlanned > 0 && (
              <div 
                className="absolute top-0 h-full w-0.5 bg-foreground/60"
                style={{ left: `${Math.min(100, (totalPlanned / totalActual) * 100)}%` }}
                title="Budget limit"
              />
            )}
          </div>
          
          {/* Category legend (compact) */}
          {categoriesWithSpending.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {categoriesWithSpending.slice(0, 6).map((cat, idx) => (
                <div key={cat.name} className="flex items-center gap-1.5">
                  <div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: getCategoryColor(cat.name, idx) }}
                  />
                  <span>{cat.name}</span>
                </div>
              ))}
              {categoriesWithSpending.length > 6 && (
                <span className="text-muted-foreground">
                  +{categoriesWithSpending.length - 6} more
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Interactive Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {/* Total Planned */}
          <button
            onClick={onScrollToBudget}
            className="p-3 sm:p-4 bg-muted/50 rounded-xl border text-left transition-all hover:bg-muted/80 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
              <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="truncate">Planned</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-foreground">
              {formatCurrency(totalPlanned)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
              {budgetItemCount} budget item{budgetItemCount !== 1 ? 's' : ''}
            </div>
          </button>
          
          {/* Total Spent */}
          <button
            onClick={onScrollToBudget}
            className="p-3 sm:p-4 bg-muted/50 rounded-xl border text-left transition-all hover:bg-muted/80 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
              <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="truncate">Spent</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-foreground">
              {formatCurrency(totalActual)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
              {transactionCount > 0 ? `${transactionCount} transaction${transactionCount !== 1 ? 's' : ''}` : 'No transactions yet'}
            </div>
          </button>
          
          {/* Variance */}
          <div className="p-3 sm:p-4 bg-muted/50 rounded-xl border">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
              {variance <= 0 ? (
                <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
              )}
              <span className="truncate">Variance</span>
            </div>
            <div className={cn(
              "text-lg sm:text-2xl font-bold flex items-center gap-1",
              variance <= 0 ? "text-success" : "text-destructive"
            )}>
              {variance <= 0 ? '-' : '+'}
              {formatCurrency(Math.abs(variance))}
            </div>
            <div className={cn(
              "text-xs mt-1 hidden sm:block",
              variance <= 0 ? "text-success" : "text-destructive"
            )}>
              {variance <= 0 ? "Under budget" : "Over budget"}
            </div>
          </div>
          
          {/* Alerts */}
          <div className={cn(
            "p-3 sm:p-4 rounded-xl border",
            overBudgetCategories.length > 0 
              ? "bg-warning/10 border-warning/30" 
              : "bg-success/10 border-success/30"
          )}>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
              <AlertTriangle className={cn(
                "h-3.5 w-3.5 sm:h-4 sm:w-4",
                overBudgetCategories.length > 0 ? "text-warning" : "text-success"
              )} />
              <span className="truncate">Status</span>
            </div>
            <div className={cn(
              "text-lg sm:text-2xl font-bold",
              overBudgetCategories.length > 0 ? "text-warning" : "text-success"
            )}>
              {overBudgetCategories.length > 0 
                ? `${overBudgetCategories.length} Over`
                : "On Track"}
            </div>
            <div className="text-xs text-muted-foreground mt-1 hidden sm:block line-clamp-2">
              {overBudgetCategories.length > 0 
                ? overBudgetCategories.slice(0, 2).map(c => c.name).join(', ')
                : "All categories on track"}
            </div>
          </div>
        </div>
        
        {/* Collapsible Budget Tips */}
        {tips.length > 0 && (
          <Collapsible open={tipsOpen} onOpenChange={setTipsOpen}>
            <div className="flex items-center justify-between border-t pt-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" aria-hidden="true" />
                Budget Tips
              </h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  {tipsOpen ? 'Hide' : 'Show'}
                  <ChevronDown className={cn(
                    "h-4 w-4 ml-1 transition-transform",
                    tipsOpen && "rotate-180"
                  )} />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2 mt-3">
              {tips.map((tip, idx) => (
                <InlineAlert key={idx} variant={tip.type}>
                  {tip.message}
                </InlineAlert>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
