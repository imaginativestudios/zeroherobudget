import { useState } from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useExpenseGroups } from "@/hooks/useExpenseGroups";
import { formatCurrency } from "@/lib/constants";
import { type Expense } from "@/lib/csvUtils";
import { GroupCard } from "./GroupCard";
import { haptics } from "@/lib/haptics";
import { soundEffects } from "@/lib/soundEffects";

interface GroupableExpensesProps {
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  monthlyActuals: { [expenseId: string]: number };
}

export function GroupableExpenses({
  expenses,
  setExpenses,
  monthlyActuals,
}: GroupableExpensesProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [showAddGroup, setShowAddGroup] = useState(false);

  const {
    groupOrder,
    deriveGroups,
    addGroup,
    renameGroup,
    deleteGroup,
    reorderGroups,
    moveItemToGroup,
  } = useExpenseGroups(expenses);

  const groupedExpenses = deriveGroups(expenses);
  const availableGroups = [...groupOrder];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    haptics.light();
    soundEffects.pickup();
  };

  // Get the active item for drag overlay
  const getActiveItem = () => {
    if (!activeId) return null;
    
    if (activeId.startsWith('group-')) {
      const groupName = activeId.replace('group-', '');
      const groupExpenses = groupedExpenses[groupName] || [];
      const groupTotal = groupExpenses.reduce((sum, e) => sum + (e.planned || 0), 0);
      return { type: 'group', groupName, count: groupExpenses.length, total: groupTotal };
    } else {
      const expense = expenses.find(e => e.id === activeId);
      return expense ? { type: 'expense', expense } : null;
    }
  };

  const activeItem = getActiveItem();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeData = active.data.current;
    const overData = over.data.current;

    let actionPerformed = false;

    if (activeData?.type === "group") {
      // Reordering groups
      const activeIndex = groupOrder.findIndex(group => `group-${group}` === activeId);
      const overIndex = groupOrder.findIndex(group => `group-${group}` === overId);
      
      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const newOrder = arrayMove(groupOrder, activeIndex, overIndex);
        reorderGroups(newOrder);
        actionPerformed = true;
      }
    } else if (activeData?.type === "expense") {
      // Moving expense
      const expense = activeData.expense as Expense;
      const currentGroup = expense.category || 'Uncategorized';

      if (overData?.type === "group") {
        // Moving to a different group
        const targetGroup = overData.groupName;
        if (currentGroup !== targetGroup) {
          moveItemToGroup(expense.id, targetGroup, expenses, setExpenses);
          actionPerformed = true;
        }
      } else if (overData?.type === "expense") {
        // Reordering within same group or moving to different group
        const targetExpense = overData.expense as Expense;
        const targetGroup = targetExpense.category || 'Uncategorized';
        
        if (currentGroup !== targetGroup) {
          moveItemToGroup(expense.id, targetGroup, expenses, setExpenses);
          actionPerformed = true;
        } else {
          // Reorder within same group
          const newExpenses = [...expenses];
          
          // Find the actual indexes in the full expenses array
          const activeArrayIndex = newExpenses.findIndex(e => e.id === expense.id);
          const overArrayIndex = newExpenses.findIndex(e => e.id === targetExpense.id);
          
          if (activeArrayIndex !== -1 && overArrayIndex !== -1 && activeArrayIndex !== overArrayIndex) {
            const reordered = arrayMove(newExpenses, activeArrayIndex, overArrayIndex);
            setExpenses(reordered);
            actionPerformed = true;
          }
        }
      }
    }

    if (actionPerformed) {
      haptics.success();
      soundEffects.drop();
    }

    setActiveId(null);
  };

  const handleAddExpense = (groupName: string) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      name: "New Expense",
      planned: 0,
      notes: "",
      category: groupName
    };
    setExpenses([...expenses, newExpense]);
  };

  const handleUpdateExpense = (id: string, field: keyof Expense, value: string | number) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const handleMoveToGroup = (itemId: string, targetGroup: string) => {
    moveItemToGroup(itemId, targetGroup, expenses, setExpenses);
  };

  const handleRenameGroup = (oldName: string, newName: string) => {
    renameGroup(oldName, newName, expenses, setExpenses);
  };

  const handleDeleteGroup = (groupName: string) => {
    if (deleteGroup(groupName, expenses)) {
      // Successfully deleted
    }
  };

  const handleAddGroup = () => {
    if (newGroupName.trim() && !availableGroups.includes(newGroupName.trim())) {
      addGroup(newGroupName.trim());
      setNewGroupName("");
      setShowAddGroup(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.planned || 0), 0);
  const totalActual = Object.values(monthlyActuals).reduce((sum, actual) => sum + actual, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center" data-tour="budget-add-group">
        <Dialog open={showAddGroup} onOpenChange={setShowAddGroup}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddGroup();
                }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddGroup(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddGroup}>Add Group</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={groupOrder.map(group => `group-${group}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4" data-tour="budget-expense-list">
            {groupOrder.map((groupName, index) => (
              <GroupCard
                key={groupName}
                groupName={groupName}
                expenses={groupedExpenses[groupName] || []}
                monthlyActuals={monthlyActuals}
                availableGroups={availableGroups}
                onAddExpense={handleAddExpense}
                onUpdateExpense={handleUpdateExpense}
                onRemoveExpense={handleRemoveExpense}
                onMoveToGroup={handleMoveToGroup}
                onRenameGroup={handleRenameGroup}
                onDeleteGroup={handleDeleteGroup}
                isFirstGroup={index === 0}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeItem && (
            <div className="opacity-90 rotate-3 scale-105 transition-transform animate-fade-in">
              {activeItem.type === 'group' ? (
                <div className="bg-gradient-to-br from-primary/10 to-chart-1/10 border-2 border-primary/50 rounded-lg p-4 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-lg text-foreground">{activeItem.groupName}</div>
                    <div className="text-sm text-muted-foreground">
                      {activeItem.count} {activeItem.count === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-primary mt-2">
                    {formatCurrency(activeItem.total)}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-background to-muted border-2 border-primary/50 rounded-lg shadow-2xl backdrop-blur-sm">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center p-3">
                    <div className="font-medium text-foreground truncate pr-2">
                      {activeItem.expense.name}
                    </div>
                    <div className="text-sm font-semibold text-primary whitespace-nowrap">
                      {formatCurrency(activeItem.expense.planned || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatCurrency(monthlyActuals[activeItem.expense.id] || 0)}
                    </div>
                    <div className="w-32"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <div className="flex justify-between items-center pt-4 border-t border-border">
        <div></div>
        <div className="space-y-1 text-right">
          <div className="text-lg font-semibold">
            Total Planned: {formatCurrency(totalExpenses)}
          </div>
          <div className="text-lg font-semibold">
            Total Actual: {formatCurrency(totalActual)}
          </div>
        </div>
      </div>
    </div>
  );
}