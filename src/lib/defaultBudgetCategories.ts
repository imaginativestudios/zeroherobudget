/**
 * Default Budget Categories — backward-compatible re-export from categoryRegistry.
 */

import {
  Home,
  Zap,
  Car,
  UtensilsCrossed,
  Heart,
  Sparkles,
  PiggyBank,
  Users,
  MoreHorizontal,
  TrendingUp,
  GraduationCap,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";

import {
  DEFAULT_GROUPS,
  DEFAULT_CATEGORIES,
  getCategoriesByGroup,
  type CategoryGroup as RegistryGroup,
} from "./categoryRegistry";

export interface DefaultCategoryItem {
  name: string;
  suggestedAmount: number;
}

export interface DefaultCategoryGroup {
  name: string;
  icon: LucideIcon;
  items: DefaultCategoryItem[];
}

export const INCOME_GROUP_NAME = "Income";

// Map registry icon strings to Lucide components
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

/**
 * Derive DEFAULT_BUDGET_CATEGORIES from the registry so there's one source of truth.
 * Only includes categories that are enabled by default.
 */
export const DEFAULT_BUDGET_CATEGORIES: DefaultCategoryGroup[] = DEFAULT_GROUPS.map(
  (group) => ({
    name: group.name,
    icon: ICON_MAP[group.icon] ?? MoreHorizontal,
    items: getCategoriesByGroup(group.id)
      .filter((c) => c.enabledByDefault)
      .map((c) => ({ name: c.name, suggestedAmount: 0 })),
  })
).filter((g) => g.items.length > 0);

/** Map group names to their Lucide icon for use elsewhere (e.g. GroupCard headers) */
export const CATEGORY_GROUP_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  DEFAULT_BUDGET_CATEGORIES.map((g) => [g.name, g.icon])
);
