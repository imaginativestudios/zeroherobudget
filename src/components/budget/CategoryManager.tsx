import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, RotateCcw, Pencil, Trash2, Check, X } from "lucide-react";
import type { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { useCategories } from "@/hooks/useCategories";
import { DEFAULT_GROUPS } from "@/lib/categoryRegistry";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronDown, Settings } from "lucide-react";

// ── Dynamic Icon ─────────────────────────────────────────────────────
const iconFallback = <div className="h-4 w-4 rounded bg-muted" />;

function DynamicIcon({ name, ...props }: { name: string } & Omit<LucideProps, "ref">) {
  const key = name as keyof typeof dynamicIconImports;
  if (!dynamicIconImports[key]) return iconFallback;
  const LazyIcon = lazy(dynamicIconImports[key]);
  return (
    <Suspense fallback={iconFallback}>
      <LazyIcon {...props} />
    </Suspense>
  );
}

// ── Main Component ───────────────────────────────────────────────────
export function CategoryManager() {
  const {
    categories,
    groups,
    enableCategory,
    disableCategory,
    renameCategory,
    addCustomCategory,
    deleteCategory,
    resetToDefaults,
    isCustom,
  } = useCategories();

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(DEFAULT_GROUPS.map((g) => g.id))
  );

  const filteredCategories = search.trim()
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const confirmEdit = () => {
    if (editingId && editName.trim()) {
      renameCategory(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  };

  const handleAdd = (groupId: string) => {
    if (newCatName.trim()) {
      addCustomCategory(newCatName.trim(), groupId);
      setNewCatName("");
      setAddingToGroup(null);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Manage Categories</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Budget Categories</SheetTitle>
        </SheetHeader>

        {/* Search + Reset */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={resetToDefaults} className="gap-1 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>

        {/* Groups */}
        <div className="space-y-2">
          {groups.map((group, gi) => {
            const groupCats = filteredCategories.filter(
              (c) => c.groupId === group.id
            );
            if (search && groupCats.length === 0) return null;

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.03 }}
              >
                <Collapsible
                  open={expandedGroups.has(group.id)}
                  onOpenChange={() => toggleGroup(group.id)}
                >
                  <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: group.color }}
                    />
                    <DynamicIcon name={group.icon} className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm flex-1 text-left">
                      {group.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {groupCats.filter((c) => c.enabledByDefault).length}/{groupCats.length}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        expandedGroups.has(group.id) && "rotate-180"
                      )}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="ml-5 border-l border-border/50 pl-3 mt-1 space-y-0.5">
                      <AnimatePresence initial={false}>
                        {groupCats.map((cat) => (
                          <motion.div
                            key={cat.id}
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/30 group/row"
                          >
                            <DynamicIcon
                              name={cat.icon}
                              className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                            />

                            {editingId === cat.id ? (
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
                                  className="h-7 text-xs"
                                  autoFocus
                                />
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={confirmEdit}>
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm flex-1 truncate">
                                  {cat.name}
                                </span>
                                {isCustom(cat.id) && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                    Custom
                                  </Badge>
                                )}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => startEdit(cat.id, cat.name)}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  {isCustom(cat.id) && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-destructive"
                                      onClick={() => deleteCategory(cat.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                                <Switch
                                  checked={cat.enabledByDefault}
                                  onCheckedChange={(checked) =>
                                    checked ? enableCategory(cat.id) : disableCategory(cat.id)
                                  }
                                  className="scale-75"
                                />
                              </>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Add category inline */}
                      {addingToGroup === group.id ? (
                        <div className="flex items-center gap-1 py-1.5 px-2">
                          <Input
                            placeholder="Category name"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd(group.id)}
                            className="h-7 text-xs flex-1"
                            autoFocus
                          />
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleAdd(group.id)}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setAddingToGroup(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground gap-1 w-full justify-start"
                          onClick={() => setAddingToGroup(group.id)}
                        >
                          <Plus className="h-3 w-3" />
                          Add category
                        </Button>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
