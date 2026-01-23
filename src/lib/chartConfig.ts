import { formatCurrency } from "@/lib/constants";

/**
 * Chart Configuration - Centralized styling for all Recharts visualizations
 * 
 * This file provides consistent styling across all charts in the application.
 */

// Standard tooltip styling for all charts
export const STANDARD_TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  boxShadow: '0 4px 12px hsl(var(--foreground) / 0.1)',
  fontSize: '14px'
};

// Semantic Financial Colors - Vitality vs Shadow Model
export const FINANCIAL_COLORS = {
  income: 'hsl(160 84% 39%)',     // Emerald - Revenue/Growth
  debt: 'hsl(263 70% 66%)',       // Purple - Liabilities/Shadow
  expense: 'hsl(215 16% 47%)',    // Slate - Expenses/Outflow
  savings: 'hsl(38 92% 50%)',     // Amber/Gold - Savings/Wealth
};

// Helper for financial chart data
export function getFinancialColor(type: 'income' | 'debt' | 'expense' | 'savings'): string {
  return FINANCIAL_COLORS[type];
}

// Consistent category colors for budget categories
export const CATEGORY_COLORS: Record<string, string> = {
  "Housing": "hsl(var(--chart-1))",
  "Utilities": "hsl(var(--chart-2))",
  "Transportation": "hsl(var(--chart-3))",
  "Food": "hsl(var(--chart-4))",
  "Insurance & Healthcare": "hsl(var(--chart-5))",
  "Personal Care": "hsl(var(--chart-6))",
  "Entertainment": "hsl(var(--chart-7))",
  "Savings & Investments": "hsl(var(--chart-8))",
  "Debt Payments": "hsl(var(--chart-9))",
  "Miscellaneous": "hsl(var(--chart-10))"
};

// Fallback color palette for non-category charts
export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
  "hsl(var(--chart-9))",
  "hsl(var(--chart-10))"
];

// Helper function to get consistent category color
export const getCategoryColor = (categoryName: string, index: number): string => {
  return CATEGORY_COLORS[categoryName] || CHART_COLORS[index % CHART_COLORS.length];
};

// Standard currency formatter for tooltips
export const currencyFormatter = (value: number) => formatCurrency(value);
