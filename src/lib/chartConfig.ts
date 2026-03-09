import { formatCurrency } from "@/lib/constants";
import { buildCategoryColorMap, DEFAULT_GROUPS } from "@/lib/categoryRegistry";

// Standard tooltip styling for all charts
export const STANDARD_TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  boxShadow: '0 4px 12px hsl(var(--foreground) / 0.1)',
  fontSize: '14px'
};

// Consistent category colors derived from registry groups
export const CATEGORY_COLORS: Record<string, string> = buildCategoryColorMap();

// Fallback color palette for non-category charts
export const CHART_COLORS = DEFAULT_GROUPS
  .filter((g) => !g.isIncome)
  .map((g) => g.color);

// Helper function to get consistent category color
export const getCategoryColor = (categoryName: string, index: number): string => {
  return CATEGORY_COLORS[categoryName] || CHART_COLORS[index % CHART_COLORS.length];
};

// Standard currency formatter for tooltips
export const currencyFormatter = (value: number) => formatCurrency(value);
