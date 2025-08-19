import { useLocalStorage } from './useLocalStorage';
import { type Expense } from '@/lib/csvUtils';

export interface GroupedExpenses {
  [groupName: string]: Expense[];
}

export function useExpenseGroups(expenses: Expense[]) {
  const [groupOrder, setGroupOrder] = useLocalStorage<string[]>('bdt_group_order', []);

  const ensureGroupOrder = (currentExpenses: Expense[]) => {
    const existingGroups = Array.from(new Set(currentExpenses.map(e => e.category || 'Uncategorized')));
    const missingGroups = existingGroups.filter(group => !groupOrder.includes(group));
    
    if (missingGroups.length > 0) {
      setGroupOrder([...groupOrder, ...missingGroups]);
    }
  };

  const deriveGroups = (currentExpenses: Expense[]): GroupedExpenses => {
    ensureGroupOrder(currentExpenses);
    
    const grouped: GroupedExpenses = {};
    const currentGroupOrder = [...groupOrder];
    
    // Add any new groups that might have been added
    const allGroups = Array.from(new Set(currentExpenses.map(e => e.category || 'Uncategorized')));
    allGroups.forEach(group => {
      if (!currentGroupOrder.includes(group)) {
        currentGroupOrder.push(group);
      }
    });
    
    // Initialize groups in order
    currentGroupOrder.forEach(groupName => {
      grouped[groupName] = currentExpenses.filter(e => (e.category || 'Uncategorized') === groupName);
    });
    
    return grouped;
  };

  const addGroup = (name: string) => {
    if (!groupOrder.includes(name)) {
      setGroupOrder([...groupOrder, name]);
    }
  };

  const renameGroup = (oldName: string, newName: string, expenses: Expense[], setExpenses: (expenses: Expense[]) => void) => {
    // Update all expenses in this group
    const updatedExpenses = expenses.map(expense => 
      (expense.category || 'Uncategorized') === oldName 
        ? { ...expense, category: newName }
        : expense
    );
    setExpenses(updatedExpenses);
    
    // Update group order
    const updatedOrder = groupOrder.map(group => group === oldName ? newName : group);
    setGroupOrder(updatedOrder);
  };

  const deleteGroup = (name: string, expenses: Expense[]) => {
    const hasExpenses = expenses.some(e => (e.category || 'Uncategorized') === name);
    if (hasExpenses) {
      return false; // Cannot delete non-empty group
    }
    
    setGroupOrder(groupOrder.filter(group => group !== name));
    return true;
  };

  const reorderGroups = (newOrder: string[]) => {
    setGroupOrder(newOrder);
  };

  const moveItemToGroup = (itemId: string, targetGroup: string, expenses: Expense[], setExpenses: (expenses: Expense[]) => void) => {
    const updatedExpenses = expenses.map(expense => 
      expense.id === itemId 
        ? { ...expense, category: targetGroup }
        : expense
    );
    setExpenses(updatedExpenses);
    
    // Ensure target group is in order
    if (!groupOrder.includes(targetGroup)) {
      setGroupOrder([...groupOrder, targetGroup]);
    }
  };

  return {
    groupOrder,
    deriveGroups,
    addGroup,
    renameGroup,
    deleteGroup,
    reorderGroups,
    moveItemToGroup,
  };
}