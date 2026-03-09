import { useCallback, useMemo } from "react";
import { useUserLocalStorage } from "./useUserLocalStorage";
import {
  DEFAULT_GROUPS,
  DEFAULT_CATEGORIES,
  type CategoryGroup,
  type CategoryDefinition,
  getGroupById,
} from "@/lib/categoryRegistry";

// ── Persisted overrides shape ────────────────────────────────────────
interface CategoryOverrides {
  disabled: string[];           // ids of disabled defaults
  enabled: string[];            // ids of enabled optional defaults
  renamed: Record<string, string>; // id → new name
  custom: CategoryDefinition[]; // user-added categories
  customGroups: CategoryGroup[];// user-added groups
}

const EMPTY_OVERRIDES: CategoryOverrides = {
  disabled: [],
  enabled: [],
  renamed: {},
  custom: [],
  customGroups: [],
};

export function useCategories() {
  const [overrides, setOverrides] = useUserLocalStorage<CategoryOverrides>(
    "category_overrides",
    EMPTY_OVERRIDES
  );

  // Merge defaults + overrides
  const categories = useMemo<CategoryDefinition[]>(() => {
    const merged = DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      name: overrides.renamed[c.id] ?? c.name,
      enabledByDefault: overrides.disabled.includes(c.id)
        ? false
        : overrides.enabled.includes(c.id)
        ? true
        : c.enabledByDefault,
    }));
    return [...merged, ...overrides.custom];
  }, [overrides]);

  const groups = useMemo<CategoryGroup[]>(
    () => [...DEFAULT_GROUPS, ...overrides.customGroups],
    [overrides]
  );

  const enabledCategories = useMemo(
    () => categories.filter((c) => c.enabledByDefault),
    [categories]
  );

  // ── Mutations ────────────────────────────────────────────────────
  const enableCategory = useCallback(
    (id: string) => {
      setOverrides({
        ...overrides,
        disabled: overrides.disabled.filter((d) => d !== id),
        enabled: [...new Set([...overrides.enabled, id])],
      });
    },
    [overrides, setOverrides]
  );

  const disableCategory = useCallback(
    (id: string) => {
      setOverrides({
        ...overrides,
        enabled: overrides.enabled.filter((e) => e !== id),
        disabled: [...new Set([...overrides.disabled, id])],
      });
    },
    [overrides, setOverrides]
  );

  const renameCategory = useCallback(
    (id: string, newName: string) => {
      // For custom categories, update in-place
      const isCustom = overrides.custom.some((c) => c.id === id);
      if (isCustom) {
        setOverrides({
          ...overrides,
          custom: overrides.custom.map((c) =>
            c.id === id ? { ...c, name: newName } : c
          ),
        });
      } else {
        setOverrides({
          ...overrides,
          renamed: { ...overrides.renamed, [id]: newName },
        });
      }
    },
    [overrides, setOverrides]
  );

  const addCustomCategory = useCallback(
    (name: string, groupId: string, icon = "tag") => {
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newCat: CategoryDefinition = {
        id,
        name,
        groupId,
        icon,
        enabledByDefault: true,
        keywords: [],
      };
      setOverrides({
        ...overrides,
        custom: [...overrides.custom, newCat],
      });
      return id;
    },
    [overrides, setOverrides]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      // Only custom categories can be deleted
      setOverrides({
        ...overrides,
        custom: overrides.custom.filter((c) => c.id !== id),
      });
    },
    [overrides, setOverrides]
  );

  const resetToDefaults = useCallback(() => {
    setOverrides(EMPTY_OVERRIDES);
  }, [setOverrides]);

  const isCustom = useCallback(
    (id: string) => overrides.custom.some((c) => c.id === id),
    [overrides]
  );

  return {
    categories,
    enabledCategories,
    groups,
    enableCategory,
    disableCategory,
    renameCategory,
    addCustomCategory,
    deleteCategory,
    resetToDefaults,
    isCustom,
  };
}
