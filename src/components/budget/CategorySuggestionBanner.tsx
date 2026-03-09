import { useMemo } from 'react';
import { Lightbulb, Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { detectUncoveredCategories, type CategorySuggestion } from '@/lib/categorySuggestionEngine';
import { formatCurrency } from '@/lib/utils';

interface TransactionLike {
  date: string;
  category: string;
  flow: 'in' | 'out';
  amount: number;
}

interface ExpenseLike {
  category: string;
}

interface CategorySuggestionBannerProps {
  expenses: ExpenseLike[];
  transactions: TransactionLike[];
  onAddCategory: (name: string, amount: number, category: string) => void;
}

export function CategorySuggestionBanner({
  expenses,
  transactions,
  onAddCategory,
}: CategorySuggestionBannerProps) {
  const [dismissed, setDismissed] = useUserLocalStorage<string[]>(
    'bdt_dismissed_category_suggestions',
    []
  );

  const suggestions = useMemo(
    () => detectUncoveredCategories(transactions, expenses),
    [transactions, expenses]
  );

  const visible = suggestions.filter(
    (s) => !dismissed.includes(s.category.toLowerCase())
  );

  if (visible.length === 0) return null;

  const handleDismiss = (category: string) => {
    setDismissed([...dismissed, category.toLowerCase()]);
  };

  const handleAdd = (suggestion: CategorySuggestion) => {
    onAddCategory(suggestion.category, suggestion.avgMonthlySpend, suggestion.category);
    handleDismiss(suggestion.category);
  };

  return (
    <Card variant="subtle" className="border-dashed border-primary/30 bg-primary/5">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 mt-0.5">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <p className="text-sm font-medium text-foreground">
              We noticed spending that isn't in your budget
            </p>
            <div className="flex flex-wrap gap-2">
              {visible.map((s) => (
                <div
                  key={s.category}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
                >
                  <span className="font-medium truncate">{s.category}</span>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    ~{formatCurrency(s.avgMonthlySpend)}/mo
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-success hover:text-success"
                    onClick={() => handleAdd(s)}
                    aria-label={`Add ${s.category} to budget`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground"
                    onClick={() => handleDismiss(s.category)}
                    aria-label={`Dismiss ${s.category}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
