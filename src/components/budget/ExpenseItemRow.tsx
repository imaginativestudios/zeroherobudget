import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/constants";
import { type Expense } from "@/lib/csvUtils";

interface ExpenseItemRowProps {
  expense: Expense;
  actual: number;
  availableGroups: string[];
  onUpdate: (field: keyof Expense, value: string | number) => void;
  onRemove: () => void;
  onMoveToGroup: (groupName: string) => void;
}

export function ExpenseItemRow({
  expense,
  actual,
  availableGroups,
  onUpdate,
  onRemove,
  onMoveToGroup,
}: ExpenseItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: expense.id,
    data: {
      type: "expense",
      expense,
    }
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
    zIndex: isDragging ? 0 : 10,
    opacity: isDragging ? 0.3 : 1,
  };

  const variance = actual - expense.planned;
  const variancePercent = expense.planned > 0 ? (variance / expense.planned) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center py-3 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-all duration-200 group"
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors duration-200 flex-shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Input
          value={expense.name}
          onChange={(e) => onUpdate('name', e.target.value)}
          className="min-w-0 transition-all duration-200 group-hover:border-primary/30"
        />
      </div>
      <div>
        <Input
          type="number"
          step="0.01"
          value={expense.planned}
          onChange={(e) => onUpdate('planned', parseFloat(e.target.value) || 0)}
          className="w-32 transition-all duration-200 group-hover:border-primary/30"
        />
      </div>
      <div>
        <div className="w-32 px-3 py-2 text-sm bg-muted rounded-md">
          {formatCurrency(actual)}
        </div>
      </div>
      <div className="flex items-center gap-2 justify-center">
        <Select
          value={expense.category || 'Uncategorized'}
          onValueChange={onMoveToGroup}
        >
          <SelectTrigger className="w-32 bg-background z-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {availableGroups.map(group => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}