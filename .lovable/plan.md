

## Fix Focus Ring Overflow Across All Modals

### Problem
On mobile, `DialogContent` and `AlertDialogContent` use `w-full` with no horizontal margin and no `overflow-hidden`. Form elements inside (inputs, textareas, buttons) use `focus-visible:ring-offset-2` which pushes the focus ring 2px beyond the element boundary. Combined with `p-6` padding, the ring just barely clips the dialog edge and bleeds outside the viewport on small screens. The screenshot shows this clearly on the textarea and "Add Transaction" button.

### Root Cause
Three compounding issues:
1. **Dialog/AlertDialog** have `w-full` on mobile with no margin or overflow clipping
2. **Textarea** uses `focus-visible:ring-offset-2` (old shadcn default) while Input was already updated to `ring-offset-0`
3. **CurrencyInput** wrapper uses `focus-within:ring-offset-2`
4. **Button base** uses `focus-visible:ring-offset-2`

### Changes

**1. `src/components/ui/dialog.tsx`** — Add mobile-safe containment
- Add `mx-4 rounded-lg` (always rounded, not just `sm:rounded-lg`)
- Add `overflow-hidden` to clip any stray focus rings at edges
- Change `max-w-lg` to `max-w-[calc(100vw-2rem)] sm:max-w-lg` so the dialog never touches viewport edges

**2. `src/components/ui/alert-dialog.tsx`** — Same treatment
- Mirror the dialog changes: `mx-4 rounded-lg overflow-hidden`, same max-width calc

**3. `src/components/ui/textarea.tsx`** — Align ring styling with Input
- Change `focus-visible:ring-offset-2` to `focus-visible:ring-offset-0` (matching Input's existing pattern)
- Change `focus-visible:ring-ring` to `focus-visible:ring-primary/30` (matching Input's softer ring)
- Update border to `border-input/50` and add `rounded-xl bg-muted/30` to match Input styling

**4. `src/components/ui/currency-input.tsx`** — Fix ring offset
- Change `focus-within:ring-offset-2` to `focus-within:ring-offset-0`

**5. `src/components/ui/button.tsx`** — Fix ring offset
- Change base `focus-visible:ring-offset-2` to `focus-visible:ring-offset-0` in the cva base string

### Files changed
1. `src/components/ui/dialog.tsx`
2. `src/components/ui/alert-dialog.tsx`
3. `src/components/ui/textarea.tsx`
4. `src/components/ui/currency-input.tsx`
5. `src/components/ui/button.tsx`

