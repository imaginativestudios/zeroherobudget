import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_GROUPS, DEFAULT_CATEGORIES, type CategoryDefinition } from '@/lib/categoryRegistry';

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
      <PopoverContent className="w-56 p-1 max-h-72 overflow-y-auto" align="start">
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

          {DEFAULT_GROUPS.filter(g => !g.isIncome).map((group) => {
            const cats = DEFAULT_CATEGORIES.filter(c => c.groupId === group.id);
            if (cats.length === 0) return null;
            return (
              <div key={group.id}>
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.name}
                </div>
                {cats.map((cat) => (
                  <Button
                    key={cat.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-xs h-7 px-2",
                      value === cat.name && "bg-accent/20"
                    )}
                    onClick={() => handleSelect(cat.name)}
                  >
                    {value === cat.name && <Check className="h-3 w-3 mr-1" />}
                    <span className="truncate">{cat.name}</span>
                  </Button>
                ))}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
