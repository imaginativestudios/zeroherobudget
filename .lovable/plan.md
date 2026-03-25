

## Improve Category Combobox for Mobile

### Problem
On mobile (375px), the category popover opens as a floating dropdown that overlaps form fields above it. This is a common UX anti-pattern on small screens — a bottom drawer is more natural and provides more space for browsing and searching categories.

### Approach
Use the **Drawer on mobile, Popover on desktop** pattern (already used elsewhere in the app via `useIsMobile`). On mobile, tapping the category trigger opens a bottom Drawer with the same `Command` search/list inside. On desktop, keep the current Popover behavior.

### Changes

**`src/components/transactions/CategoryCombobox.tsx`**
- Import `useIsMobile` from `@/hooks/use-mobile`
- Import `Drawer`, `DrawerContent`, `DrawerTrigger` from the UI drawer component
- Extract the `Command` search + list into a shared inner component (or just inline JSX variable)
- Conditionally render:
  - **Mobile**: `Drawer` wrapping the trigger button + `DrawerContent` containing the Command list with a drag handle and taller max-height (`max-h-[60vh]`)
  - **Desktop**: Current `Popover` + `PopoverContent` (unchanged)
- The trigger button remains identical in both cases

### Scope
1 file changed: `src/components/transactions/CategoryCombobox.tsx`

