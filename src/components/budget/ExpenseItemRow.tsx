import { useState } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    <>
      {/* Mobile Card Layout */}
      <div
        ref={setNodeRef}
        style={style}
        className="block sm:hidden"
      >
        <div className="space-y-3 p-3 border border-border/50 rounded-lg bg-card/50 hover:bg-muted/50 transition-all duration-200">
          {/* Row 1: Drag handle + Name */}
          <div className="flex items-center gap-2">
            <button
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors duration-200 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <Input
              value={expense.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              className="flex-1"
              aria-label="Expense name"
            />
          </div>
          
          {/* Row 2: Planned / Actual */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Planned</label>
              <Input
                type="number"
                step="0.01"
                value={expense.planned}
                onChange={(e) => onUpdate('planned', parseFloat(e.target.value) || 0)}
                aria-label="Planned amount"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Actual</label>
              <div className="min-h-[44px] px-3 py-2 text-sm bg-muted rounded-xl flex items-center">
                {formatCurrency(actual)}
              </div>
            </div>
          </div>
          
          {/* Row 3: Category + Delete */}
          <div className="flex items-center gap-2">
            <Select
              value={expense.category || 'Uncategorized'}
              onValueChange={onMoveToGroup}
            >
              <SelectTrigger className="flex-1 min-h-[44px]">
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
              onClick={() => setShowDeleteConfirm(true)}
              className="text-destructive hover:text-destructive min-h-[44px] min-w-[44px]"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Row Layout */}
      <div
        ref={setNodeRef}
        style={style}
        className="hidden sm:grid grid-cols-[1fr_8rem_8rem_8rem_auto] gap-4 items-center py-3 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-all duration-200 group"
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
            className="w-full transition-all duration-200 group-hover:border-primary/30"
          />
        </div>
        <div>
          <div className="w-full px-3 py-2 text-sm bg-muted rounded-md">
            {formatCurrency(actual)}
          </div>
        </div>
        <div>
          <Select
            value={expense.category || 'Uncategorized'}
            onValueChange={onMoveToGroup}
          >
            <SelectTrigger className="w-full bg-background z-50">
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
        </div>
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{expense.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onRemove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
