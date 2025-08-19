import { useState } from "react";
import { GripVertical, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/constants";
import { type Expense } from "@/lib/csvUtils";
import { ExpenseItemRow } from "./ExpenseItemRow";

interface GroupCardProps {
  groupName: string;
  expenses: Expense[];
  monthlyActuals: { [expenseId: string]: number };
  availableGroups: string[];
  onAddExpense: (groupName: string) => void;
  onUpdateExpense: (id: string, field: keyof Expense, value: string | number) => void;
  onRemoveExpense: (id: string) => void;
  onMoveToGroup: (itemId: string, targetGroup: string) => void;
  onRenameGroup: (oldName: string, newName: string) => void;
  onDeleteGroup: (groupName: string) => void;
}

export function GroupCard({
  groupName,
  expenses,
  monthlyActuals,
  availableGroups,
  onAddExpense,
  onUpdateExpense,
  onRemoveExpense,
  onMoveToGroup,
  onRenameGroup,
  onDeleteGroup,
}: GroupCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(groupName);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `group-${groupName}`,
    data: {
      type: "group",
      groupName,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const plannedTotal = expenses.reduce((sum, expense) => sum + (expense.planned || 0), 0);
  const actualTotal = expenses.reduce((sum, expense) => sum + (monthlyActuals[expense.id] || 0), 0);
  const varianceTotal = actualTotal - plannedTotal;

  const handleRename = () => {
    if (editName.trim() && editName !== groupName) {
      onRenameGroup(groupName, editName.trim());
    }
    setIsEditing(false);
    setEditName(groupName);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(groupName);
  };

  const handleDeleteGroup = () => {
    if (expenses.length > 0) {
      alert("Cannot delete group with expenses. Move or delete all expenses first.");
      return;
    }
    if (confirm(`Delete group "${groupName}"?`)) {
      onDeleteGroup(groupName);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-border rounded-lg bg-card ${isDragging ? 'opacity-50' : ''}`}
    >
      <Accordion type="single" collapsible defaultValue={`group-${groupName}`}>
        <AccordionItem value={`group-${groupName}`} className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center justify-between w-full mr-4">
              <div className="flex items-center gap-3">
                <button
                  className="cursor-grab text-muted-foreground hover:text-foreground"
                  {...attributes}
                  {...listeners}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 w-40"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={handleRename}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{groupName}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
               <div className="flex items-center gap-6 text-sm">
                
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddExpense(groupName);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup();
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="px-4 pb-4">
            {expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                     <tr className="border-b">
                       <th className="text-left p-3 font-semibold">Item</th>
                       <th className="text-left p-3 font-semibold">Planned</th>
                       <th className="text-left p-3 font-semibold">Actual</th>
                       <th className="text-center p-3 font-semibold">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                    <SortableContext
                      items={expenses.map(e => e.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {expenses.map((expense) => (
                        <ExpenseItemRow
                          key={expense.id}
                          expense={expense}
                          actual={monthlyActuals[expense.id] || 0}
                          availableGroups={availableGroups}
                          onUpdate={(field, value) => onUpdateExpense(expense.id, field, value)}
                          onRemove={() => onRemoveExpense(expense.id)}
                          onMoveToGroup={(groupName) => onMoveToGroup(expense.id, groupName)}
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No expenses in this group. Click + to add one.
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}