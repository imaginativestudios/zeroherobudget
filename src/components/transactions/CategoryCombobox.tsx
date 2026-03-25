import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { CategoryDefinition, CategoryGroup } from "@/lib/categoryRegistry";

interface GroupedCategory {
  id: string;
  name: string;
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

  const handleSelect = (categoryName: string) => {
    onChange(categoryName);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-10"
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={true}>
          <CommandInput
            placeholder="Search categories..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {trimmedSearch ? (
                <button
                  className="w-full px-2 py-1.5 text-sm text-left hover:bg-accent rounded-sm cursor-pointer"
                  onClick={() => handleSelect(trimmedSearch)}
                >
                  Use "<span className="font-medium">{trimmedSearch}</span>" as category
                </button>
              ) : (
                "No categories found."
              )}
            </CommandEmpty>

            {flow === "in" ? (
              <CommandGroup heading="Income">
                {incomeCategories.map((cat) => (
                  <CommandItem
                    key={cat.id}
                    value={cat.name}
                    onSelect={() => handleSelect(cat.name)}
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
                <CommandGroup key={group.id} heading={group.name}>
                  {group.categories.map((cat) => (
                    <CommandItem
                      key={cat.id}
                      value={cat.name}
                      onSelect={() => handleSelect(cat.name)}
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
              ))
            )}

            {showCustomOption && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Custom">
                  <CommandItem
                    value={`custom-${trimmedSearch}`}
                    onSelect={() => handleSelect(trimmedSearch)}
                  >
                    Use "<span className="font-medium">{trimmedSearch}</span>" as category
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
