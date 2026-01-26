
# Mobile App Features Implementation Plan

## Overview

Transform Zero Hero into a native-feeling mobile experience by adding touch gestures, pull-to-refresh, bottom navigation tabs, expanded haptic feedback, and optimized mobile forms. This builds upon existing infrastructure (framer-motion, embla-carousel, haptics.ts, and 44px touch target standards).

---

## Feature 1: Bottom Navigation Tabs

Create a fixed bottom navigation bar for mobile devices that provides quick thumb access to core sections.

### New Component: `src/components/MobileBottomNav.tsx`

| Tab | Icon | Route | Label |
|-----|------|-------|-------|
| Dashboard | Home | /dashboard | Home |
| Budget | Compass | /budgets | Budget |
| Debts | Cloud | /debts | Debts |
| Transactions | Scroll | /transactions | Log |
| More | Menu | (opens drawer) | More |

**Design Specifications:**
- Fixed to bottom of screen: `fixed bottom-0 left-0 right-0`
- Only visible on mobile/tablet: `lg:hidden`
- Safe area padding for notched devices: `pb-safe` using `env(safe-area-inset-bottom)`
- Height: 64px + safe area
- Background: Matches sidebar color scheme (`bg-sidebar`)
- Active tab: Primary color with subtle animation
- Z-index: 50 (same level as mobile header)
- Haptic feedback on tab press

**"More" Drawer:**
- Slides up from bottom using Vaul drawer component
- Contains: Journey, Accounts, Achievements, Reports, Data Management, Financial Tips, Settings

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add MobileBottomNav component inside Layout wrapper |
| `src/components/Layout.tsx` | Add padding-bottom on mobile to account for bottom nav height |
| `src/index.css` | Add `pb-safe` utility class for safe area inset |

---

## Feature 2: Pull-to-Refresh

Add native-feeling pull-to-refresh for data pages using framer-motion for the gesture detection and animation.

### New Hook: `src/hooks/usePullToRefresh.ts`

```text
Parameters:
- onRefresh: () => Promise<void> | void
- threshold: number (default 80px)
- disabled?: boolean

Returns:
- containerRef: RefObject<HTMLDivElement>
- isRefreshing: boolean
- pullProgress: number (0-1)
```

**Implementation:**
- Track touch start/move/end events
- Only activate when scrolled to top (`scrollTop <= 0`)
- Show progress indicator as user pulls down
- Trigger haptic feedback at threshold
- Animate spinner during refresh
- Auto-reset after completion

### New Component: `src/components/PullToRefreshContainer.tsx`

Wrapper component that adds pull-to-refresh behavior:

```text
<PullToRefreshContainer onRefresh={handleRefresh}>
  <DashboardContent />
</PullToRefreshContainer>
```

**Visual Design:**
- Spinner appears above content when pulled
- Uses primary color spinner
- Subtle opacity change on content during pull
- "Release to refresh" text at threshold

### Pages to Wrap

| Page | Refresh Action |
|------|----------------|
| Dashboard | Re-fetch all dashboard data |
| Transactions | Refresh transaction list |
| Budget | Reload expense groups |
| Accounts | Refresh account balances |

---

## Feature 3: Swipe Gestures for Screen Transitions

Enable swipe navigation between related screens using framer-motion's gesture system.

### New Hook: `src/hooks/useSwipeNavigation.ts`

```text
Parameters:
- routes: { left?: string; right?: string }
- threshold: number (default 100px)
- enabled?: boolean

Returns:
- containerProps: MotionProps for the container
- direction: 'left' | 'right' | null
```

**Behavior:**
- Swipe right: Navigate to previous screen in sequence
- Swipe left: Navigate to next screen in sequence
- Visual feedback: Content follows finger during swipe
- Haptic feedback on successful swipe
- Edge resistance when no route available

### Navigation Sequences

| Group | Swipe Left → | Swipe Right ← |
|-------|--------------|---------------|
| Dashboard | Budget | (edge) |
| Budget | Debts | Dashboard |
| Debts | Transactions | Budget |
| Transactions | (edge) | Debts |

### New Component: `src/components/SwipeablePageWrapper.tsx`

Wraps page content to add swipe navigation:

```text
<SwipeablePageWrapper leftRoute="/debts" rightRoute="/dashboard">
  <BudgetPageContent />
</SwipeablePageWrapper>
```

---

## Feature 4: Enhanced Haptic Feedback

Expand the existing haptics utility to cover more interactions and add visual feedback pairing.

### Modify: `src/lib/haptics.ts`

Add new patterns:

| Pattern | Duration | Use Case |
|---------|----------|----------|
| `tap` | 5ms | Button/tab press |
| `light` | 10ms | Drag start (existing) |
| `medium` | 20ms | Successful drop (existing) |
| `success` | [10, 50, 10]ms | Completed actions (existing) |
| `warning` | [20, 40, 20]ms | Destructive action confirmation |
| `error` | [50, 30, 50, 30, 50]ms | Error/failure notification |
| `selection` | 8ms | Toggle/selection change |

### New Hook: `src/hooks/useHapticFeedback.ts`

Provides haptic-enabled event handlers:

```text
const { withHaptic } = useHapticFeedback();

<Button onClick={withHaptic('tap', handleClick)}>
  Save
</Button>
```

### Integration Points

| Component/Action | Haptic Pattern |
|------------------|----------------|
| Bottom nav tab press | `tap` |
| Pull-to-refresh threshold | `medium` |
| Successful form submission | `success` |
| Delete confirmation | `warning` |
| Form validation error | `error` |
| Toggle switches | `selection` |
| Swipe navigation complete | `medium` |

---

## Feature 5: Mobile-Optimized Forms

Enhance form inputs for better mobile usability beyond the existing 44px touch targets.

### Enhancements to Existing Components

**Input Components:**
- Add `inputMode` attributes for appropriate mobile keyboards
- Currency inputs: `inputMode="decimal"`
- Date inputs: Use native date picker on mobile
- Text inputs: `inputMode="text"` with appropriate `autocomplete`

**Form Layout Patterns:**
- Single-column layout on mobile by default
- Sticky submit buttons at bottom of form
- Larger tap targets for radio/checkbox groups
- Visual feedback on input focus (slight scale)

### New Component: `src/components/ui/mobile-form-footer.tsx`

Sticky footer for form actions:

```text
<MobileFormFooter>
  <Button variant="outline">Cancel</Button>
  <Button type="submit">Save</Button>
</MobileFormFooter>
```

**Design:**
- Sticks to bottom of viewport
- Background blur effect
- Safe area padding
- Visible only on mobile (`lg:hidden`)

### Form Input Optimizations

| Input Type | inputMode | autocomplete | Additional |
|------------|-----------|--------------|------------|
| Currency | decimal | off | Prefix/suffix visible |
| Email | email | email | Lower keyboard |
| Phone | tel | tel | Number pad |
| Date | - | off | Native picker |
| Search | search | off | Search keyboard |
| Name | text | name | Auto-capitalize |

---

## Implementation Details

### MobileBottomNav Component Structure

```text
<nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-sidebar border-t border-sidebar-border">
  <div className="flex items-center justify-around h-16 pb-safe">
    {tabs.map(tab => (
      <NavButton 
        key={tab.route}
        icon={tab.icon}
        label={tab.label}
        isActive={location.pathname === tab.route}
        onClick={() => handleTabPress(tab)}
      />
    ))}
    <MoreDrawerTrigger />
  </div>
</nav>
```

### Layout Padding Adjustment

Add to main content container in `Layout.tsx`:

```text
className={cn(
  // ... existing classes
  "pb-20 lg:pb-0" // Space for bottom nav on mobile
)}
```

### Safe Area CSS Utility

Add to `src/index.css`:

```text
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `src/components/MobileBottomNav.tsx` | Bottom navigation bar for mobile |
| `src/components/MobileMoreDrawer.tsx` | Drawer for additional nav items |
| `src/components/PullToRefreshContainer.tsx` | Pull-to-refresh wrapper |
| `src/components/SwipeablePageWrapper.tsx` | Swipe navigation wrapper |
| `src/components/ui/mobile-form-footer.tsx` | Sticky form action footer |
| `src/hooks/usePullToRefresh.ts` | Pull-to-refresh gesture hook |
| `src/hooks/useSwipeNavigation.ts` | Swipe navigation hook |
| `src/hooks/useHapticFeedback.ts` | Haptic feedback utilities |

### Modified Files

| File | Change |
|------|--------|
| `src/lib/haptics.ts` | Add new haptic patterns (tap, warning, error, selection) |
| `src/components/Layout.tsx` | Add bottom padding for nav, integrate bottom nav |
| `src/index.css` | Add safe area utilities |
| `src/pages/Dashboard.tsx` | Wrap in PullToRefreshContainer and SwipeablePageWrapper |
| `src/pages/Budget.tsx` | Wrap in PullToRefreshContainer and SwipeablePageWrapper |
| `src/pages/Transactions.tsx` | Wrap in PullToRefreshContainer and SwipeablePageWrapper |
| `src/pages/DebtSnowball.tsx` | Wrap in SwipeablePageWrapper |
| Various form dialogs | Add inputMode and mobile-form-footer |

---

## Implementation Order

1. **Haptic Feedback** - Extend `haptics.ts` and create `useHapticFeedback` hook
2. **Bottom Navigation** - Create `MobileBottomNav` and `MobileMoreDrawer` components
3. **Layout Updates** - Modify `Layout.tsx` for bottom nav integration
4. **Pull-to-Refresh** - Create hook and container component
5. **Swipe Navigation** - Create hook and wrapper component
6. **Page Integration** - Wrap pages with new containers
7. **Form Optimizations** - Create mobile-form-footer and update input components

---

## Visual Design Reference

### Bottom Navigation (Mobile)
```text
┌─────────────────────────────────────────────────────┐
│                    App Content                       │
│                                                     │
│                                                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  🏠     🧭     ☁️     📜     ≡                      │
│ Home  Budget  Debts   Log   More                    │
└─────────────────────────────────────────────────────┘
```

### Pull-to-Refresh Animation
```text
     ↓ Pull down
┌─────────────────────────────────────────────────────┐
│           ⟳ Release to refresh                       │
├─────────────────────────────────────────────────────┤
│                    App Content                       │
│                    (pulled down)                     │
└─────────────────────────────────────────────────────┘
```

---

## Accessibility Considerations

1. **Bottom navigation**: Proper `aria-current` for active tab
2. **Swipe gestures**: Don't interfere with screen reader navigation
3. **Haptics**: Respect system haptic settings
4. **Pull-to-refresh**: Announce loading state to screen readers
5. **Touch targets**: Maintain 44px minimum throughout

---

## Performance Notes

- Swipe detection uses passive touch listeners
- Animations use `transform` and `opacity` for GPU acceleration
- Pull-to-refresh uses `requestAnimationFrame` for smooth updates
- Bottom nav is rendered once at app level, not per-page
