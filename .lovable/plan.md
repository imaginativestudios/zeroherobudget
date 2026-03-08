

## Flatten Debt Crusher into a Single Scrollable Page

### Problem
Content hidden behind tabs (Schedule, Compare, Simulator) is unlikely to be discovered. Users see only the Overview tab and miss the most impactful features.

### Solution
Remove the tab structure entirely. Present all modules as sequential sections on one scrollable page, ordered by user journey priority:

```text
┌─────────────────────────────┐
│ Header + Import/Export      │
│ Coach Banner                │
│ Overall Progress Bar        │
├─────────────────────────────┤
│ § Strategy Toggle + Cards   │
│ § Your Debts (priority list)│
│ § Freedom Slider            │
│ § Debt Balance Timeline     │
├─────────────────────────────┤
│ § What-If Simulator         │  ← was "Simulator" tab
│   (strategy + slider +      │
│    results + chart)          │
│ § Coach Tips                │
├─────────────────────────────┤
│ § Strategy Comparison       │  ← was "Compare" tab
│ § Payment Schedule          │  ← was "Schedule" tab
│   (collapsed by default)    │
├─────────────────────────────┤
│ § Commit to Plan CTA        │
└─────────────────────────────┘
```

### Key decisions
- **Payment Schedule** gets wrapped in a Collapsible (accordion) since it's a large data table most users won't need on every visit. Collapsed by default with a "View Full Schedule" trigger.
- **Strategy Comparison** stays fully visible — it's a key decision-making module.
- **Potential Savings card** remains conditionally shown between Strategy and Debts list.
- All existing functionality preserved, just the `<Tabs>` wrapper removed.

### File changes

| File | Change |
|---|---|
| `src/pages/DebtSnowball.tsx` | Remove `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` wrapper. Render all sections sequentially in a single `space-y-8` container. Wrap `PaymentScheduleTable` in a `Collapsible` with a toggle button. |

No new files or dependencies needed.

