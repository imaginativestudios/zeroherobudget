import { useState, useCallback } from "react";
import {
  ChevronDown,
  Plus,
  Rocket,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DEFAULT_BUDGET_CATEGORIES, INCOME_GROUP_NAME, type DefaultCategoryGroup } from "@/lib/defaultBudgetCategories";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SetupItem {
  id: string;
  name: string;
  amount: number;
  enabled: boolean;
  groupName: string;
}

interface SetupGroup {
  name: string;
  icon: DefaultCategoryGroup["icon"];
  items: SetupItem[];
  expanded: boolean;
}

interface BudgetSetupWizardProps {
  onComplete: (items: { name: string; amount: number; category: string }[]) => void;
  onSkip: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildInitialGroups(): SetupGroup[] {
  return DEFAULT_BUDGET_CATEGORIES.map((g) => ({
    name: g.name,
    icon: g.icon,
    expanded: true,
    items: g.items.map((item) => ({
      id: crypto.randomUUID(),
      name: item.name,
      amount: item.suggestedAmount,
      enabled: true,
      groupName: g.name,
    })),
  }));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BudgetSetupWizard({ onComplete, onSkip }: BudgetSetupWizardProps) {
  const [groups, setGroups] = useState<SetupGroup[]>(buildInitialGroups);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  /* ---- group-level helpers ---- */

  const toggleGroup = useCallback((groupName: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.name === groupName ? { ...g, expanded: !g.expanded } : g
      )
    );
  }, []);

  const toggleAllInGroup = useCallback((groupName: string, checked: boolean) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.name === groupName
          ? { ...g, items: g.items.map((i) => ({ ...i, enabled: checked })) }
          : g
      )
    );
  }, []);

  /* ---- item-level helpers ---- */

  const toggleItem = useCallback((itemId: string) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) =>
          i.id === itemId ? { ...i, enabled: !i.enabled } : i
        ),
      }))
    );
  }, []);

  const updateItemAmount = useCallback((itemId: string, amount: number) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) =>
          i.id === itemId ? { ...i, amount } : i
        ),
      }))
    );
  }, []);

  const startEditingName = useCallback((itemId: string, currentName: string) => {
    setEditingItemId(itemId);
    setEditingName(currentName);
  }, []);

  const commitNameEdit = useCallback(() => {
    if (!editingItemId) return;
    const trimmed = editingName.trim();
    if (trimmed) {
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          items: g.items.map((i) =>
            i.id === editingItemId ? { ...i, name: trimmed } : i
          ),
        }))
      );
    }
    setEditingItemId(null);
    setEditingName("");
  }, [editingItemId, editingName]);

  const cancelNameEdit = useCallback(() => {
    setEditingItemId(null);
    setEditingName("");
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.filter((i) => i.id !== itemId),
      }))
    );
  }, []);

  const addItemToGroup = useCallback((groupName: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.name === groupName
          ? {
              ...g,
              items: [
                ...g.items,
                {
                  id: crypto.randomUUID(),
                  name: "New Category",
                  amount: 0,
                  enabled: true,
                  groupName,
                },
              ],
            }
          : g
      )
    );
  }, []);

  /* ---- derived values ---- */

  const selectedItems = groups.flatMap((g) =>
    g.items.filter((i) => i.enabled)
  );
  const totalSelected = selectedItems.length;
  const totalPlanned = selectedItems.reduce((s, i) => s + i.amount, 0);

  /* ---- submit ---- */

  const handleComplete = () => {
    const items = selectedItems.map((i) => ({
      name: i.name,
      amount: i.amount,
      category: i.groupName,
    }));
    onComplete(items);
  };

  /* ---- render ---- */

  return (
    <Card className="shadow-royal max-w-3xl mx-auto">
      <CardHeader className="p-5 sm:p-8 pb-2 sm:pb-4 text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
          <Rocket className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl sm:text-2xl">Set Up Your Budget</CardTitle>
        <CardDescription className="text-sm sm:text-base max-w-md mx-auto">
          We've prepared common budget categories to get you started. Toggle items on or off, edit names and amounts, then hit start.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-8 pt-2 sm:pt-4 space-y-3">
        {/* Category groups */}
        {groups.map((group) => {
          const GroupIcon = group.icon;
          const enabledCount = group.items.filter((i) => i.enabled).length;
          const allEnabled = group.items.length > 0 && enabledCount === group.items.length;
          const someEnabled = enabledCount > 0 && !allEnabled;
          const groupTotal = group.items
            .filter((i) => i.enabled)
            .reduce((s, i) => s + i.amount, 0);

          return (
            <Collapsible
              key={group.name}
              open={group.expanded}
              onOpenChange={() => toggleGroup(group.name)}
            >
              <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden">
                {/* Group header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <Checkbox
                    checked={allEnabled}
                    // @ts-ignore – indeterminate is valid on the DOM element
                    data-state={someEnabled ? "indeterminate" : allEnabled ? "checked" : "unchecked"}
                    onCheckedChange={(checked) =>
                      toggleAllInGroup(group.name, !!checked)
                    }
                    aria-label={`Toggle all in ${group.name}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <CollapsibleTrigger asChild>
                    <button className="flex flex-1 items-center gap-2 text-left group">
                      <GroupIcon className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-semibold text-sm sm:text-base text-foreground">
                        {group.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto mr-2">
                        {enabledCount}/{group.items.length} · {formatCurrency(groupTotal)}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          group.expanded && "rotate-180"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                </div>

                {/* Group items */}
                <CollapsibleContent>
                  <div className="border-t border-border/40">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 transition-colors",
                          "hover:bg-muted/30",
                          !item.enabled && "opacity-50"
                        )}
                      >
                        <Checkbox
                          checked={item.enabled}
                          onCheckedChange={() => toggleItem(item.id)}
                          aria-label={`Toggle ${item.name}`}
                        />

                        {/* Name – inline editable */}
                        {editingItemId === item.id ? (
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitNameEdit();
                                if (e.key === "Escape") cancelNameEdit();
                              }}
                              className="h-8 text-sm flex-1"
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={commitNameEdit}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={cancelNameEdit}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            className="flex items-center gap-1.5 flex-1 min-w-0 text-left group/name"
                            onClick={() => startEditingName(item.id, item.name)}
                          >
                            <span className="text-sm text-foreground truncate">
                              {item.name}
                            </span>
                            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0" />
                          </button>
                        )}

                        {/* Amount */}
                        <CurrencyInput
                          prefix="$"
                          value={item.amount}
                          onChange={(e) =>
                            updateItemAmount(
                              item.id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-8 w-24 sm:w-28 text-sm text-right"
                          disabled={!item.enabled}
                        />

                        {/* Remove */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}

                    {/* Add custom item */}
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/5 w-full transition-colors"
                      onClick={() => addItemToGroup(group.name)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add category
                    </button>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}

        {/* Footer */}
        <div className="pt-4 border-t border-border/40 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {totalSelected} categories selected
            </span>
            <span className="font-semibold text-foreground">
              Total: {formatCurrency(totalPlanned)}/mo
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              onClick={handleComplete}
              className="btn-glow flex-1 sm:flex-none"
              disabled={totalSelected === 0}
            >
              <Rocket className="h-4 w-4" />
              Start with Selected ({totalSelected})
            </Button>
            <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
              Start from Scratch
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
