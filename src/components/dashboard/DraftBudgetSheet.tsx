import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Sparkles, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { BudgetDraft, BudgetAllocation } from "@/lib/budgetDraftEngine";
import { useState } from "react";

interface DraftBudgetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: BudgetDraft | null;
  isLoading: boolean;
  currentExpenses: Array<{ id: string; name: string; amount: number }>;
  onApply: (allocations: BudgetAllocation[]) => void;
}

function DeltaIndicator({ current, suggested }: { current: number; suggested: number }) {
  const delta = suggested - current;
  if (Math.abs(delta) < 1) return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  if (delta > 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
      <TrendingUp className="h-3.5 w-3.5" />+{formatCurrency(delta)}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-destructive">
      <TrendingDown className="h-3.5 w-3.5" />{formatCurrency(delta)}
    </span>
  );
}

export function DraftBudgetSheet({ open, onOpenChange, draft, isLoading, currentExpenses, onApply }: DraftBudgetSheetProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getCurrentAmount = (allocation: BudgetAllocation) => {
    const existing = currentExpenses.find((e) => e.id === allocation.expenseId);
    return existing?.amount ?? 0;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col overflow-hidden">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-base">Budget Coach</SheetTitle>
              <SheetDescription className="text-xs">AI-powered suggestions</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 -mx-6 px-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : draft ? (
            <>
              {/* Coach message */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-sm font-medium text-foreground mb-1">
                  Hey! I've drafted some jobs for your money based on your goals.
                </p>
                <p className="text-xs text-muted-foreground">{draft.summary}</p>
              </div>

              {/* Allocations */}
              <div className="space-y-1.5">
                {draft.allocations.map((allocation, i) => {
                  const current = getCurrentAmount(allocation);
                  const isExpanded = expandedId === `${allocation.expenseId}-${i}`;
                  const key = `${allocation.expenseId}-${i}`;
                  return (
                    <Collapsible key={key} open={isExpanded} onOpenChange={(open) => setExpandedId(open ? key : null)}>
                      <CollapsibleTrigger asChild>
                        <button className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors",
                          "hover:bg-muted/50",
                          isExpanded && "bg-muted/30 border-primary/20"
                        )}>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{allocation.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{allocation.category}</span>
                              <DeltaIndicator current={current} suggested={allocation.suggestedAmount} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <span className="text-sm font-semibold text-foreground tabular-nums">
                              {formatCurrency(allocation.suggestedAmount)}
                            </span>
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-3 pb-3 pt-1">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            💡 {allocation.reasoning}
                          </p>
                          {current > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Currently planned: {formatCurrency(current)}
                            </p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <span className="text-sm font-medium text-muted-foreground">Total Allocated</span>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {formatCurrency(draft.allocations.reduce((s, a) => s + a.suggestedAmount, 0))}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {draft && !isLoading && (
          <SheetFooter className="pt-4 border-t gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Dismiss
            </Button>
            <Button onClick={() => onApply(draft.allocations)} className="flex-1 gap-1.5">
              <Check className="h-4 w-4" />
              Apply All
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
