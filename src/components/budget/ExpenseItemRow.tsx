import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const variance = actual - expense.planned;
  const variancePercent = expense.planned > 0 ? (variance / expense.planned) * 100 : 0;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <td className="p-3">
        <div className="flex items-center gap-2">
          <button
            className="cursor-grab text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <Input
            value={expense.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            className="min-w-0"
          />
        </div>
      </td>
      <td className="p-3">
        <Input
          type="number"
          step="0.01"
          value={expense.planned}
          onChange={(e) => onUpdate('planned', parseFloat(e.target.value) || 0)}
          className="w-32"
        />
      </td>
      <td className="p-3">
        <div className="w-32 px-3 py-2 text-sm bg-muted rounded-md">
          {formatCurrency(actual)}
        </div>
      </td>
      <td className="p-3">
        <div className={`w-36 px-3 py-2 text-sm rounded-md font-medium ${
          variance === 0 
            ? 'bg-muted text-muted-foreground' 
            : variance > 0 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-success/10 text-success'
        }`}>
          {variance === 0 ? 'No data' : `${formatCurrency(variance)} (${variancePercent > 0 ? '+' : ''}${variancePercent.toFixed(1)}%)`}
        </div>
      </td>
      <td className="p-3">
        <Input
          value={expense.notes || ""}
          onChange={(e) => onUpdate('notes', e.target.value)}
          className="min-w-0"
        />
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
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
      </td>
    </tr>
  );
}