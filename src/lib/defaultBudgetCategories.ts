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
      { name: "Rent / Mortgage", suggestedAmount: 1500 },
      { name: "Property Taxes", suggestedAmount: 200 },
      { name: "Home Insurance", suggestedAmount: 125 },
    ],
  },
  {
    name: "Utilities",
    icon: Zap,
    items: [
      { name: "Internet", suggestedAmount: 75 },
    ],
  },
  {
    name: "Transportation",
    icon: Car,
    items: [
      { name: "Car Payment", suggestedAmount: 400 },
      { name: "Gas / Fuel", suggestedAmount: 150 },
      { name: "Car Insurance", suggestedAmount: 130 },
      { name: "Maintenance / Repairs", suggestedAmount: 75 },
      { name: "Public Transportation", suggestedAmount: 0 },
    ],
  },
  {
    name: "Food",
    icon: UtensilsCrossed,
    items: [
      { name: "Groceries", suggestedAmount: 600 },
      { name: "Restaurants / Takeout", suggestedAmount: 200 },
      { name: "Coffee / Snacks", suggestedAmount: 50 },
    ],
  },
  {
    name: "Health",
    icon: Heart,
    items: [
      { name: "Health Insurance", suggestedAmount: 350 },
      { name: "Medical / Doctor", suggestedAmount: 50 },
      { name: "Pharmacy", suggestedAmount: 25 },
    ],
  },
  {
    name: "Lifestyle",
    icon: Sparkles,
    items: [
      { name: "Shopping", suggestedAmount: 100 },
      { name: "Entertainment", suggestedAmount: 75 },
      { name: "Hobbies", suggestedAmount: 50 },
      { name: "Subscriptions", suggestedAmount: 50 },
    ],
  },
  {
    name: "Financial",
    icon: PiggyBank,
    items: [
      { name: "Savings", suggestedAmount: 200 },
      { name: "Investments", suggestedAmount: 100 },
      { name: "Debt Payments", suggestedAmount: 0 },
      { name: "Emergency Fund", suggestedAmount: 200 },
    ],
  },
  {
    name: "Family / Personal",
    icon: Users,
    items: [
      { name: "Childcare", suggestedAmount: 0 },
      { name: "Education", suggestedAmount: 0 },
      { name: "Pets", suggestedAmount: 50 },
      { name: "Personal Care", suggestedAmount: 40 },
    ],
  },
  {
    name: "Other",
    icon: MoreHorizontal,
    items: [
      { name: "Gifts / Donations", suggestedAmount: 50 },
      { name: "Travel", suggestedAmount: 75 },
      { name: "Miscellaneous", suggestedAmount: 50 },
    ],
  },
];

/** Map group names to their Lucide icon for use elsewhere (e.g. GroupCard headers) */
export const CATEGORY_GROUP_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  DEFAULT_BUDGET_CATEGORIES.map((g) => [g.name, g.icon])
);
