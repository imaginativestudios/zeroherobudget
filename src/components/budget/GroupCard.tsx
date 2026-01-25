import { useState } from "react";
import type { CSSProperties } from "react";
import { GripVertical, Plus, MoreHorizontal, Edit, Trash2, Check, X } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/constants";
import { type Expense } from "@/lib/csvUtils";
import { ExpenseItemRow } from "./ExpenseItemRow";
import { toast } from "sonner";

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
  isFirstGroup?: boolean;
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
  isFirstGroup = false,
}: GroupCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(groupName);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 0 : 10,
    opacity: isDragging ? 0.4 : 1,
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
      toast.error("Cannot delete group with expenses. Move or delete all expenses first.");
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDeleteGroup = () => {
    onDeleteGroup(groupName);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="border border-border/50 rounded-lg bg-card/80 backdrop-blur-md transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover-lift"
      >
        <Accordion type="single" collapsible defaultValue={`group-${groupName}`}>
          <AccordionItem value={`group-${groupName}`} className="border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between w-full mr-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors duration-200"
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
                    <h3 className="font-semibold text-lg min-w-0 truncate text-balance">{groupName}</h3>
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
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="bg-background border z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Group
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup();
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-4 pb-4">
              {expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="w-full">
                    <div className="hidden sm:grid grid-cols-[1fr_8rem_8rem_8rem_auto] gap-4 border-b pb-3 mb-2">
                      <div className="text-left font-semibold">Item</div>
                      <div className="text-left font-semibold">Planned</div>
                      <div className="text-left font-semibold">Actual</div>
                      <div className="text-left font-semibold">Category</div>
                      <div className="text-center font-semibold">Actions</div>
                    </div>
                    <div className="space-y-3 sm:space-y-0">
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
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No budget items in this group. Click + to add one.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the group "{groupName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteGroup}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}