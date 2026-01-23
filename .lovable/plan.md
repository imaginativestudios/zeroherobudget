
# Zero Hero Design System (Stoic Edition) - Master Refactor

## Overview

This comprehensive refactor aligns the entire application with the "Stoic Hero" design system by implementing three core changes:
1. **Semantic Color Overrides** - Vitality vs. Shadow color model for financial concepts
2. **Terminology Standardization** - Functional headers with lore in subtexts only
3. **Visual Polish** - Dark sidebar, gold active states, and typography hierarchy

---

## Phase 1: Critical Color Override (Semantic Fix)

### The "Vitality vs. Shadow" Color Model

| Financial Concept | Current Color | New Color | HSL Value |
|-------------------|---------------|-----------|-----------|
| **Income / Revenue** | Various | Emerald (#10B981) | `160 84% 39%` |
| **Debt / Liabilities** | Coral/Red | Purple/Violet (#8B5CF6) | `263 70% 66%` |
| **Expenses** | Various | Slate/Blue (#64748B) | `215 16% 47%` |
| **Savings** | Green | Amber/Gold (#F59E0B) | `38 92% 50%` |

### File: `src/index.css`

Add new semantic color tokens in the `:root` section (after line 91):

```css
/* Semantic Financial Colors - Vitality vs Shadow Model */
--color-income: 160 84% 39%;       /* Emerald - Revenue/Growth */
--color-debt: 263 70% 66%;         /* Purple - Liabilities/Shadow */
--color-expense: 215 16% 47%;      /* Slate - Expenses/Outflow */
--color-savings: 38 92% 50%;       /* Amber - Savings/Wealth */
```

Update dark mode section (after line 167):

```css
/* Semantic Financial Colors - Dark Mode */
--color-income: 160 70% 45%;
--color-debt: 263 60% 60%;
--color-expense: 215 20% 55%;
--color-savings: 38 85% 55%;
```

Update sidebar to neutral slate (lines 93-100):

```css
--sidebar-background: 222 47% 6%;  /* Neutral slate instead of teal */
--sidebar-foreground: 210 40% 98%;
--sidebar-primary: 38 92% 50%;     /* Gold for active state */
--sidebar-primary-foreground: 222 47% 6%;
--sidebar-accent: 222 47% 12%;     /* Subtle hover */
--sidebar-accent-foreground: 210 40% 98%;
--sidebar-border: 222 47% 12%;
--sidebar-ring: 38 92% 50%;
```

### File: `tailwind.config.ts`

Add semantic color mappings (after line 125):

```ts
// Semantic financial colors
income: 'hsl(var(--color-income))',
debt: 'hsl(var(--color-debt))',
expense: 'hsl(var(--color-expense))',
savings: 'hsl(var(--color-savings))',
```

Add serif font family (update line 40):

```ts
fontFamily: {
  'sans': ['Inter', 'system-ui', 'sans-serif'],
  'serif': ['Playfair Display', 'Georgia', 'serif'],
},
```

### File: `src/lib/chartConfig.ts`

Add semantic financial colors for charts:

```ts
// Semantic Financial Colors for Charts
export const FINANCIAL_COLORS = {
  income: 'hsl(160 84% 39%)',    // Emerald
  debt: 'hsl(263 70% 66%)',      // Purple
  expense: 'hsl(215 16% 47%)',   // Slate
  savings: 'hsl(38 92% 50%)',    // Amber/Gold
};

// Helper for financial chart data
export const getFinancialColor = (type: 'income' | 'debt' | 'expense' | 'savings'): string => {
  return FINANCIAL_COLORS[type];
};
```

---

## Phase 2: Terminology Update (Clarity Dictionary)

### Core Terminology Changes

| Current (Lore-Heavy) | New Header (Functional) | Subtext (Lore) |
|---------------------|------------------------|----------------|
| The Atlas | Dashboard | "Chart Your Path" |
| The Sanctuary | Emergency Fund | "Your Financial Sanctuary" |
| The Shadow | Your Debts | "Conquer the Shadow" |
| Stamina | Disposable Income | - |
| Add Expense | Log Transaction | - |
| War Chest | Available for Debt | - |
| The Boss | Current Target | - |
| Strike | Extra Payment | - |
| Battle Plan | Debt Strategy | - |

### File: `src/lib/functionalVocabulary.ts`

Already mostly correct. Ensure all mappings are complete and add any missing terms.

### File: `src/lib/heroicVocabulary.ts`

Keep this file for reference but ensure the codebase primarily uses `functionalVocabulary.ts` for headers.

### File: `src/pages/reports/NetWorthReport.tsx`

Update lines 389-400:

```tsx
<CardHeader>
  <CardTitle className="text-lg">Take Action</CardTitle>
</CardHeader>
<CardContent>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Button variant="outline" asChild>
      <Link to="/budgets">Update Your Budget</Link>
    </Button>
    <Button variant="outline" asChild>
      <Link to="/debts">View Debt Strategy</Link>
    </Button>
  </div>
</CardContent>
```

### File: `src/pages/Landing.tsx`

Update the "Three Oaths" section (lines 25-43):

```tsx
const oaths = [
  {
    icon: Shield,
    title: 'Build Your Emergency Fund',
    quote: '"Build a safe haven before the storm."',
    description: 'Your first goal: A $1,000 emergency fund. This safety net protects 80% of people from falling back into debt.',
  },
  {
    icon: Zap,
    title: 'Know Your True Costs',
    quote: '"Every dollar saved is an hour of life reclaimed."',
    description: 'We calculate the TRUE cost of purchases—in hours of work, not just dollars.',
  },
  {
    icon: Sprout,
    title: 'Growth Over Guilt',
    quote: '"There are no failures here—only lessons."',
    description: 'Overspent? That\'s just a \'Detour\' not a character flaw. Behind on goals? You\'re \'Finding the Way.\'',
  },
];
```

### File: `src/pages/ComingSoon.tsx`

Apply the same terminology updates to the oaths section (lines 30-48).

### File: `src/pages/Legal.tsx`

Update line 98:

```tsx
Your financial data, including all transaction history and debt records, is stored locally...
```

---

## Phase 3: Visual Polish (Dark Mode Standard)

### Sidebar Styling

The sidebar should use a neutral dark slate background (`bg-slate-950`) with gold active states.

### File: `src/components/Layout.tsx`

Update the nav link styling (lines 238-249):

```tsx
<Link
  to={item.href}
  onClick={() => setIsMobileMenuOpen(false)}
  className={cn(
    "flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-all text-sm lg:text-base min-w-0",
    isActive
      ? "text-amber-400 bg-white/5 border-l-2 border-amber-400 shadow-sm"
      : "text-slate-300 hover:text-white hover:bg-white/5"
  )}
  aria-current={isActive ? "page" : undefined}
  data-tour={tourId}
>
  <item.icon className={cn("h-5 w-5", isActive && "text-amber-400")} aria-hidden="true" />
  <span className="font-medium truncate">{item.name}</span>
</Link>
```

Update the sidebar nav container (line 206):

```tsx
<nav className="bg-slate-950 shadow-royal border-r border-slate-800 h-full flex flex-col">
```

Update mobile header (line 166):

```tsx
<header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950 shadow-royal border-b border-slate-800">
```

### Typography System

### File: `src/index.css`

Add serif heading styles (update lines 192-214):

```css
h1 {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  line-height: 1.2;
  text-wrap: balance;
  font-family: 'Playfair Display', Georgia, serif;
}

h2 {
  font-size: clamp(1.25rem, 3.5vw, 1.875rem);
  line-height: 1.3;
  text-wrap: balance;
  font-family: 'Playfair Display', Georgia, serif;
}

h3, h4 {
  /* Keep sans-serif for smaller headings */
}
```

### File: `index.html`

Add Google Fonts import (in the `<head>` section):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
```

---

## Summary of Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add semantic financial colors, update sidebar tokens, add serif heading styles |
| `tailwind.config.ts` | Add income/debt/expense/savings colors, add serif font family |
| `src/lib/chartConfig.ts` | Add FINANCIAL_COLORS constant and helper |
| `src/components/Layout.tsx` | Update sidebar to slate-950, gold active states with glowing border |
| `src/pages/reports/NetWorthReport.tsx` | Replace lore headers with functional text |
| `src/pages/Landing.tsx` | Update Three Oaths terminology |
| `src/pages/ComingSoon.tsx` | Update Three Oaths terminology |
| `src/pages/Legal.tsx` | Replace "Atlas" with "financial data" |
| `index.html` | Add Google Fonts for Inter and Playfair Display |

---

## Visual Result: Sidebar

```text
┌────────────────────────────────┐
│  [LOGO]  Zero Hero             │  ← bg-slate-950
├────────────────────────────────┤
│                                │
│  ▌█ Dashboard        [active]  │  ← Gold text + left border glow
│    Journey                     │  ← slate-300 text
│    Budget                      │
│    Debt Strategy               │
│    Transactions                │
│    Data Management             │
│    Achievements                │
│    Financial Tips              │
│    Reports                     │
│                                │
├─ Tools ────────────────────────┤
│    Bank Connector              │
│                                │
├────────────────────────────────┤
│  user@email.com                │
│  Account Settings              │
│  Sign Out                      │
└────────────────────────────────┘
```

---

## Chart Color Usage Guide

After refactoring, charts should use the semantic colors:

- **Income charts**: Use `FINANCIAL_COLORS.income` (Emerald)
- **Debt balance/payoff charts**: Use `FINANCIAL_COLORS.debt` (Purple)
- **Expense breakdowns**: Use `FINANCIAL_COLORS.expense` (Slate) or category colors
- **Savings/Emergency Fund**: Use `FINANCIAL_COLORS.savings` (Amber/Gold)

This ensures cognitive consistency—users will always associate:
- **Green = Money In (Good)**
- **Purple = Debt/Shadow (To Conquer)**
- **Slate = Money Out (Neutral)**
- **Gold = Wealth Building (Aspirational)**
