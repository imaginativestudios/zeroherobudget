
# Interactive Budget Summary & Tips System

## Overview

Replace the static "Budget Inventory" card with **Interactive Summary Cards** that provide at-a-glance insights, clickable filtering, and contextual tips. The current progress bar will be enhanced with segmented visualization showing category breakdowns.

---

## Design Concept

### Current State
```text
┌─────────────────────────────────────────────────────────────────────┐
│  Budget Progress At-a-Glance                                        │
│  ████████████████████░░░░░░  72%  |  $280 under budget              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  📍 Budget Inventory                                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│  │ Total   │ │ Total   │ │Variance │ │ Budget  │  ← Static cards   │
│  │ Planned │ │ Actual  │ │         │ │ Used    │                   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Proposed State
```text
┌─────────────────────────────────────────────────────────────────────┐
│  Budget Overview                                           May 2025 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── SEGMENTED PROGRESS BAR ────────────────────────────────────┐  │
│  │ Housing █████ | Utilities ██ | Food ███ | Transport ██ | ... │  │
│  │                         72% of $4,000 planned                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   $4,000    │  │   $2,880    │  │   -$280 ✓   │  │ 3 OVER ⚠   │ │
│  │   Planned   │  │   Spent     │  │   Variance  │  │ CATEGORIES │ │
│  │   ────────  │  │   ────────  │  │   ────────  │  │   ───────  │ │
│  │  [CLICK TO  │  │  [CLICK TO  │  │  [CLICK TO  │  │  [CLICK TO │ │
│  │ SEE ITEMS]  │  │ SEE ACTIVE] │  │ SEE ALERTS] │  │ FOCUS]     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│                                                                     │
│  ─────────────── Budget Tips ───────────────────── [▼ Collapse]    │
│                                                                     │
│  💡 Housing is your largest expense at 38%. The 50/30/20 rule      │
│     suggests keeping needs under 50% of income.                    │
│                                                                     │
│  ⚠️ Food spending is $120 over budget. Consider meal planning      │
│     to reduce grocery costs.                                       │
│                                                                     │
│  ✅ Transportation is $45 under budget this month. Great job!      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Segmented Progress Bar
- Visual representation of spending by category
- Color-coded segments using existing `CATEGORY_COLORS`
- Hover tooltips showing category name and amount
- Legend below or integrated into the segments

### 2. Interactive Summary Cards (4 cards)

| Card | Data | Click Action |
|------|------|--------------|
| **Planned** | Total planned budget | Scrolls to Monthly Budget section |
| **Spent** | Total actual spending | Highlights items with transactions |
| **Variance** | Over/under budget | Shows only variance alerts |
| **Alerts** | Count of over-budget categories | Filters to show only problem areas |

### 3. Collapsible Budget Tips Section
Personalized tips generated from variance analysis:

| Condition | Tip Type | Example |
|-----------|----------|---------|
| Category > 30% of total | `info` | "Housing is your largest expense at 38%..." |
| Category over budget | `warning` | "Food spending is $120 over budget..." |
| Category under budget | `success` | "Transportation is $45 under budget..." |
| Overall under budget | `success` | "You're on track this month!" |
| Overall over budget | `warning` | "Total spending exceeds budget by $X..." |
| Low savings rate | `info` | "Consider the 50/30/20 rule..." |

---

## Technical Implementation

### New Component: `BudgetOverviewCard.tsx`
A new component that combines:
- Segmented progress bar
- Interactive summary cards
- Collapsible tips section

### File: `src/components/budget/BudgetOverviewCard.tsx` (NEW)

```tsx
interface BudgetOverviewCardProps {
  categoryData: Array<{
    name: string;
    planned: number;
    actual: number;
    variance: number;
    variancePercent: number;
    percentage: number;
  }>;
  totalPlanned: number;
  totalActual: number;
  income: number;
  selectedMonth: string;
  onCardClick?: (filter: 'planned' | 'spent' | 'variance' | 'alerts') => void;
}
```

**Key logic:**
1. Calculate segment widths based on category percentages
2. Generate personalized tips using variance analysis
3. Track which summary card is "active" for filtering
4. Persist collapsed/expanded state for tips

### File: `src/pages/Budget.tsx`

**Changes:**
1. Remove the static "Budget Inventory" card (lines 304-342)
2. Replace "Budget Progress At-a-Glance" bar (lines 242-272) with new component
3. Import and render `BudgetOverviewCard`
4. Add state for active filter (optional - for future enhancement)

---

## Tip Generation Logic

```tsx
function generateBudgetTips(categoryData, totalPlanned, totalActual, income) {
  const tips = [];
  
  // Overall budget status
  const variance = totalActual - totalPlanned;
  if (variance > 0) {
    tips.push({
      type: 'warning',
      message: `Total spending is ${formatCurrency(variance)} over budget. Review categories below to find savings.`
    });
  } else if (variance < -100) {
    tips.push({
      type: 'success', 
      message: `You're ${formatCurrency(Math.abs(variance))} under budget. Consider allocating extra to savings or debt.`
    });
  }
  
  // Category-specific tips
  const overBudget = categoryData.filter(c => c.variance > 0);
  const underBudget = categoryData.filter(c => c.variance < -50);
  const largestCategory = categoryData[0]; // Already sorted by planned desc
  
  // Largest expense insight
  if (largestCategory && largestCategory.percentage > 30) {
    tips.push({
      type: 'info',
      message: `${largestCategory.name} is your largest expense at ${largestCategory.percentage.toFixed(0)}% of your budget.`
    });
  }
  
  // Over-budget warnings (top 2)
  overBudget.slice(0, 2).forEach(cat => {
    tips.push({
      type: 'warning',
      message: `${cat.name} is ${formatCurrency(cat.variance)} over budget (${cat.variancePercent.toFixed(0)}% overspent).`
    });
  });
  
  // Under-budget success (top 1)
  if (underBudget.length > 0) {
    const best = underBudget[0];
    tips.push({
      type: 'success',
      message: `${best.name} is ${formatCurrency(Math.abs(best.variance))} under budget. Great discipline!`
    });
  }
  
  return tips.slice(0, 4); // Limit to 4 tips
}
```

---

## Segmented Progress Bar Design

```tsx
<div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
  <div className="absolute inset-0 flex">
    {categoryData.map((cat, idx) => (
      <Tooltip key={cat.name}>
        <TooltipTrigger asChild>
          <div 
            className="h-full transition-all hover:opacity-80"
            style={{
              width: `${(cat.actual / totalActual) * 100}%`,
              backgroundColor: getCategoryColor(cat.name, idx)
            }}
          />
        </TooltipTrigger>
        <TooltipContent>
          {cat.name}: {formatCurrency(cat.actual)}
        </TooltipContent>
      </Tooltip>
    ))}
  </div>
  {/* Budget line indicator */}
  <div 
    className="absolute top-0 h-full w-0.5 bg-foreground/50"
    style={{ left: `${Math.min(100, (totalPlanned / totalActual) * 100)}%` }}
  />
</div>
```

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/components/budget/BudgetOverviewCard.tsx` | **CREATE** - New component with segmented bar, interactive cards, tips |
| `src/pages/Budget.tsx` | **MODIFY** - Remove old inventory card, import new component |

---

## Visual Mockup: Interactive Summary Cards

```text
┌──────────────────┐   ┌──────────────────┐
│    $4,000.00     │   │    $2,880.00     │
│  ───────────────  │   │  ───────────────  │
│  📋 Total Planned │   │  💳 Total Spent   │
│                   │   │                   │
│  10 budget items  │   │  45 transactions  │
└──────────────────┘   └──────────────────┘

┌──────────────────┐   ┌──────────────────┐
│     -$280.00     │   │    3 Categories   │
│  ───────────────  │   │  ───────────────  │
│  ✅ Under Budget  │   │  ⚠️ Over Budget   │
│                   │   │                   │
│  7% savings rate  │   │  Food, Personal,  │
│                   │   │  Entertainment    │
└──────────────────┘   └──────────────────┘
```

---

## Collapsible Tips Section

Uses the existing `Collapsible` component from Radix UI:

```tsx
<Collapsible open={tipsOpen} onOpenChange={setTipsOpen}>
  <div className="flex items-center justify-between border-t pt-4 mt-4">
    <h3 className="text-sm font-medium flex items-center gap-2">
      <Lightbulb className="h-4 w-4 text-warning" />
      Budget Tips
    </h3>
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="sm">
        {tipsOpen ? 'Hide' : 'Show'}
        <ChevronDown className={cn("h-4 w-4 ml-1", tipsOpen && "rotate-180")} />
      </Button>
    </CollapsibleTrigger>
  </div>
  <CollapsibleContent className="space-y-2 mt-3">
    {tips.map((tip, idx) => (
      <InlineAlert key={idx} variant={tip.type}>
        {tip.message}
      </InlineAlert>
    ))}
  </CollapsibleContent>
</Collapsible>
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/budget/BudgetOverviewCard.tsx` | Create new component |
| `src/pages/Budget.tsx` | Replace inventory card with new overview component |
