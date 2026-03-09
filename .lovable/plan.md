

# Unified Category System with Editing UI

## Problem

The app has **two disconnected category lists** that are out of sync:
- `defaultBudgetCategories.ts` — 10 groups with sub-items (budget seeding)
- `batchCategorization.ts` — 10 flat categories (AI categorization, import)
- `categorize-transaction` edge function — same 10 flat categories hardcoded
- `chartConfig.ts` — color map for the old 10 flat categories

This means AI-suggested categories don't match budget groups, and there's no user editing capability.

## Solution

Create a single source of truth for categories with metadata, group structure, enabled/disabled state, and a management UI.

---

### 1. New file: `src/lib/categoryRegistry.ts`

Single source of truth replacing both `BUDGET_CATEGORIES` and `DEFAULT_BUDGET_CATEGORIES`.

```text
CategoryDefinition {
  id: string              // stable key e.g. "food-groceries"
  name: string            // "Groceries"
  group: string           // "Food"
  icon: string            // lucide icon name "shopping-cart"
  enabledByDefault: boolean
  keywords: string[]      // transaction matching hints ["whole foods", "kroger", "aldi"]
}

CategoryGroup {
  id: string
  name: string
  icon: string            // lucide icon name
  color: string           // chart color token
  isIncome: boolean
}
```

- Export `DEFAULT_GROUPS` (11 groups: Income, Housing, Utilities, Transportation, Food, Health, Lifestyle, Financial, Family/Personal, Children & Education, Other)
- Export `DEFAULT_CATEGORIES` (~35 items with keywords for transaction mapping)
- Export helper functions: `getCategoriesByGroup()`, `getEnabledCategories()`, `getCategoryByName()`
- Export flat `CATEGORY_NAMES` array for backward compatibility with AI/import

### 2. New hook: `src/hooks/useCategories.ts`

Manages user's category customizations via `useUserLocalStorage`.

- Stores user overrides (renamed, disabled, added categories)
- `categories` — merged default + user customizations
- `groups` — merged groups
- `enableCategory(id)` / `disableCategory(id)`
- `addCustomCategory(name, group, icon)`
- `renameCategory(id, newName)`
- `deleteCategory(id)` (only custom ones)
- `resetToDefaults()`

### 3. New component: `src/components/budget/CategoryManager.tsx`

Full-page or dialog UI for managing categories. Accessible from Budget page settings.

- Groups displayed as collapsible sections with group icon + color dot
- Each category row: icon, name, enabled toggle (Switch), edit/delete buttons
- "Add Category" button per group opens inline form
- "Add Group" button at bottom
- Search/filter bar at top
- Visual indicators for custom vs default categories
- Framer-motion stagger animations on mount

### 4. Update existing files

**`src/lib/batchCategorization.ts`**
- Replace hardcoded `BUDGET_CATEGORIES` with import from `categoryRegistry`
- `BUDGET_CATEGORIES` becomes `getEnabledCategoryNames()`

**`src/lib/defaultBudgetCategories.ts`**
- Refactor to re-export from `categoryRegistry` for backward compatibility
- `DEFAULT_BUDGET_CATEGORIES` derived from new registry

**`src/lib/chartConfig.ts`**
- `CATEGORY_COLORS` generated from `DEFAULT_GROUPS` color tokens instead of hardcoded map

**`supabase/functions/categorize-transaction/index.ts`**
- Update the `CATEGORIES` array to match the new group names
- Add keyword hints to the AI prompt for better mapping

**`src/components/import/CategoryBadgeSelect.tsx`**
- Import categories from registry, show grouped in the popover

**`src/pages/Budget.tsx`**
- Add "Manage Categories" button (Settings icon) in the header
- Auto-seed uses new registry

**`src/components/budget/BudgetSetupWizard.tsx`**
- Pull from new registry instead of old `DEFAULT_BUDGET_CATEGORIES`

### 5. Transaction-to-category mapping examples

Built into `categoryRegistry.ts` as `keywords` arrays:

| Category | Keywords |
|---|---|
| Groceries | whole foods, kroger, aldi, trader joe, walmart grocery |
| Restaurants / Takeout | doordash, uber eats, grubhub, chipotle, mcdonald |
| Gas / Fuel | shell, chevron, exxon, bp, speedway |
| Subscriptions | netflix, spotify, hulu, disney+, apple music |
| Rent / Mortgage | rent, mortgage, landlord, zillow |

These keywords feed into the AI categorization prompt for better accuracy.

### 6. Icon recommendations per group

| Group | Icon |
|---|---|
| Income | `trending-up` |
| Housing | `home` |
| Utilities | `zap` |
| Transportation | `car` |
| Food | `utensils-crossed` |
| Health | `heart-pulse` |
| Lifestyle | `sparkles` |
| Financial | `piggy-bank` |
| Family / Personal | `users` |
| Children & Education | `graduation-cap` |
| Other | `more-horizontal` |

---

## Files created
- `src/lib/categoryRegistry.ts`
- `src/hooks/useCategories.ts`
- `src/components/budget/CategoryManager.tsx`

## Files modified
- `src/lib/defaultBudgetCategories.ts` — thin re-export wrapper
- `src/lib/batchCategorization.ts` — import from registry
- `src/lib/chartConfig.ts` — derive colors from registry
- `src/components/import/CategoryBadgeSelect.tsx` — grouped category list
- `src/pages/Budget.tsx` — add manage button, use new seeding
- `src/components/budget/BudgetSetupWizard.tsx` — use new registry
- `supabase/functions/categorize-transaction/index.ts` — updated categories + keywords in prompt

