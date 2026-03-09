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
  type LucideIcon,
} from "lucide-react";

export interface DefaultCategoryItem {
  name: string;
  suggestedAmount: number;
}

export interface DefaultCategoryGroup {
  name: string;
  icon: LucideIcon;
  items: DefaultCategoryItem[];
}

export const DEFAULT_BUDGET_CATEGORIES: DefaultCategoryGroup[] = [
  {
    name: "Housing",
    icon: Home,
    items: [
      { name: "Rent / Mortgage", suggestedAmount: 0 },
      { name: "Property Taxes", suggestedAmount: 0 },
      { name: "Home Insurance", suggestedAmount: 0 },
    ],
  },
  {
    name: "Utilities",
    icon: Zap,
    items: [
      { name: "Internet", suggestedAmount: 0 },
    ],
  },
  {
    name: "Transportation",
    icon: Car,
    items: [
      { name: "Car Payment", suggestedAmount: 0 },
      { name: "Gas / Fuel", suggestedAmount: 0 },
      { name: "Car Insurance", suggestedAmount: 0 },
      { name: "Maintenance / Repairs", suggestedAmount: 0 },
      { name: "Public Transportation", suggestedAmount: 0 },
    ],
  },
  {
    name: "Food",
    icon: UtensilsCrossed,
    items: [
      { name: "Groceries", suggestedAmount: 0 },
      { name: "Restaurants / Takeout", suggestedAmount: 0 },
      { name: "Coffee / Snacks", suggestedAmount: 0 },
    ],
  },
  {
    name: "Health",
    icon: Heart,
    items: [
      { name: "Health Insurance", suggestedAmount: 0 },
      { name: "Medical / Doctor", suggestedAmount: 0 },
      { name: "Pharmacy", suggestedAmount: 0 },
    ],
  },
  {
    name: "Lifestyle",
    icon: Sparkles,
    items: [
      { name: "Shopping", suggestedAmount: 0 },
      { name: "Entertainment", suggestedAmount: 0 },
      { name: "Hobbies", suggestedAmount: 0 },
      { name: "Subscriptions", suggestedAmount: 0 },
    ],
  },
  {
    name: "Financial",
    icon: PiggyBank,
    items: [
      { name: "Savings", suggestedAmount: 0 },
      { name: "Investments", suggestedAmount: 0 },
      { name: "Debt Payments", suggestedAmount: 0 },
      { name: "Emergency Fund", suggestedAmount: 0 },
    ],
  },
  {
    name: "Family / Personal",
    icon: Users,
    items: [
      { name: "Childcare", suggestedAmount: 0 },
      { name: "Education", suggestedAmount: 0 },
      { name: "Pets", suggestedAmount: 0 },
      { name: "Personal Care", suggestedAmount: 0 },
    ],
  },
  {
    name: "Other",
    icon: MoreHorizontal,
    items: [
      { name: "Gifts / Donations", suggestedAmount: 0 },
      { name: "Travel", suggestedAmount: 0 },
      { name: "Miscellaneous", suggestedAmount: 0 },
    ],
  },
];

/** Map group names to their Lucide icon for use elsewhere (e.g. GroupCard headers) */
export const CATEGORY_GROUP_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  DEFAULT_BUDGET_CATEGORIES.map((g) => [g.name, g.icon])
);
