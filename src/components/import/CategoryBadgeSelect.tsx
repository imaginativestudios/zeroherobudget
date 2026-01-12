import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BUDGET_CATEGORIES } from '@/lib/batchCategorization';

interface CategoryBadgeSelectProps {
  value: string;
  onChange: (category: string) => void;
  aiSuggested?: string;
  isAiCategory?: boolean;
  disabled?: boolean;
}

export function CategoryBadgeSelect({
  value,
  onChange,
  aiSuggested,
  isAiCategory = false,
  disabled = false,
}: CategoryBadgeSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (category: string) => {
    onChange(category);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-7 px-2 gap-1 text-xs font-medium",
            isAiCategory && "border-primary/50 bg-primary/5 text-primary"
          )}
        >
          {isAiCategory && <Sparkles className="h-3 w-3" />}
          <span className="truncate max-w-[100px]">{value}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start">
        <div className="space-y-0.5">
          {aiSuggested && (
            <>
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI Suggestion
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start text-xs h-8 px-2",
                  value === aiSuggested && "bg-primary/10"
                )}
                onClick={() => handleSelect(aiSuggested)}
              >
                {value === aiSuggested && <Check className="h-3 w-3 mr-1" />}
                <span className="truncate">{aiSuggested}</span>
              </Button>
              <div className="border-t my-1" />
            </>
          )}
          
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
            All Categories
          </div>
          
          {BUDGET_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start text-xs h-8 px-2",
                value === category && !isAiCategory && "bg-accent"
              )}
              onClick={() => handleSelect(category)}
            >
              {value === category && <Check className="h-3 w-3 mr-1" />}
              <span className="truncate">{category}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
