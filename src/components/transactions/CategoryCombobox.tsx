import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  Home, Zap, Car, UtensilsCrossed, HeartPulse, Sparkles,
  PiggyBank, Users, GraduationCap, MoreHorizontal, TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CategoryDefinition, CategoryGroup } from "@/lib/categoryRegistry";

const ICON_MAP: Record<string, LucideIcon> = {
  "trending-up": TrendingUp,
  "home": Home,
  "zap": Zap,
  "car": Car,
  "utensils-crossed": UtensilsCrossed,
  "heart-pulse": HeartPulse,
  "sparkles": Sparkles,
  "piggy-bank": PiggyBank,
  "users": Users,
  "graduation-cap": GraduationCap,
  "more-horizontal": MoreHorizontal,
};

interface GroupedCategory extends CategoryGroup {
  categories: CategoryDefinition[];
}

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  flow: "in" | "out";
  groupedCategories: GroupedCategory[];
  incomeCategories: CategoryDefinition[];
  placeholder?: string;
}

const GroupIcon = ({ iconName }: { iconName: string }) => {
  const Icon = ICON_MAP[iconName];
  if (!Icon) return null;
  return <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />;
};

export function CategoryCombobox({
  value,
  onChange,
  flow,
  groupedCategories,
  incomeCategories,
  placeholder = "Select category",
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  const allCategoryNames = useMemo(() => {
    if (flow === "in") {
      return incomeCategories.map((c) => c.name.toLowerCase());
    }
    return groupedCategories.flatMap((g) =>
      g.categories.map((c) => c.name.toLowerCase())
    );
  }, [flow, groupedCategories, incomeCategories]);

  const trimmedSearch = search.trim();
  const isExactMatch = allCategoryNames.includes(trimmedSearch.toLowerCase());
  const showCustomOption = trimmedSearch.length > 0 && !isExactMatch;

  const selectedGroup = useMemo(() => {
    if (!value) return null;
    if (flow === "in") {
      return { color: "hsl(var(--chart-8))", icon: "trending-up" };
    }
    for (const group of groupedCategories) {
      if (group.categories.some((c) => c.name === value)) {
        return group;
      }
    }
    return null;
  }, [value, flow, groupedCategories]);

  const handleSelect = (categoryName: string) => {
    onChange(categoryName);
    setOpen(false);
    setSearch("");
  };

  const triggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className={cn(
        "w-full justify-between font-normal h-10 shadow-sm",
        "transition-colors duration-150",
        value && "font-medium"
      )}
    >
      <span className="flex items-center gap-2 truncate">
        {value && selectedGroup && (
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: selectedGroup.color }}
          />
        )}
        <span className={cn(!value && "text-muted-foreground")}>
          {value || placeholder}
        </span>
      </span>
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  const commandContent = (
    <Command shouldFilter={true}>
      <CommandInput
        placeholder="Search categories..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className={cn(isMobile ? "max-h-[50vh]" : "max-h-[280px]")}>
        <CommandEmpty>
          {trimmedSearch ? (
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted rounded-sm cursor-pointer transition-colors"
              onClick={() => handleSelect(trimmedSearch)}
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span>
                Use "<span className="font-medium">{trimmedSearch}</span>" as category
              </span>
            </button>
          ) : (
            "No categories found."
          )}
        </CommandEmpty>

        {flow === "in" ? (
          <CommandGroup
            heading={
              <span className="flex items-center gap-1.5">
                <GroupIcon iconName="trending-up" />
                Income
              </span>
            }
          >
            {incomeCategories.map((cat) => (
              <CommandItem
                key={cat.id}
                value={cat.name}
                onSelect={() => handleSelect(cat.name)}
                className="py-2"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === cat.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {cat.name}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : (
          groupedCategories.map((group) => (
            <CommandGroup
              key={group.id}
              heading={
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <GroupIcon iconName={group.icon} />
                  {group.name}
                </span>
              }
            >
              {group.categories.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={cat.name}
                  onSelect={() => handleSelect(cat.name)}
                  className="py-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === cat.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {cat.name}
                </CommandItem>
              ))}
            </CommandGroup>
          ))
        )}

        {showCustomOption && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Custom">
              <CommandItem
                value={`custom-${trimmedSearch}`}
                onSelect={() => handleSelect(trimmedSearch)}
                className="py-2"
              >
                <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                Use "<span className="font-medium">{trimmedSearch}</span>" as category
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );

  if (isMobile) {
    return (
      <>
        <div onClick={() => setOpen(true)}>{triggerButton}</div>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[75vh]">
            <DrawerHeader className="border-b border-border pb-3">
              <DrawerTitle className="text-center text-sm">Select Category</DrawerTitle>
            </DrawerHeader>
            <div className="p-2">
              {commandContent}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        {commandContent}
      </PopoverContent>
    </Popover>
  );
}
