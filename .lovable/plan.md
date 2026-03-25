

## Fix Remaining Focus Ring Clipping in Modals

### Problem
The `overflow-hidden` on `DialogContent` clips the outward-facing portion of `ring-2` focus rings (which are box-shadows that extend 2px outside each element). Even with `ring-offset-0`, the ring still paints outside the element's border-box and gets clipped at the dialog's rounded corners or scroll boundaries.

### Solution
Make all focus rings **inset** so they render inside the element boundary rather than outside. This eliminates any possibility of clipping by parent containers. Add `ring-inset` to the focus-visible styles on all form primitives.

### Changes

**1. `src/components/ui/input.tsx`**
- Add `ring-inset` to `focus-visible:ring-2 focus-visible:ring-primary/30`

**2. `src/components/ui/textarea.tsx`**
- Add `ring-inset` to the focus-visible ring classes

**3. `src/components/ui/button.tsx`**
- Add `ring-inset` to the base cva focus-visible ring

**4. `src/components/ui/currency-input.tsx`**
- Add `ring-inset` to the `focus-within:ring-2` wrapper

**5. `src/components/ui/select.tsx`**
- Add `ring-inset` to SelectTrigger's focus ring if present

### Why inset
- `ring-2` uses `box-shadow` which renders outside the border-box by default
- `ring-inset` flips it to an inward shadow — visually identical but contained within the element
- Zero clipping possible regardless of parent overflow, rounded corners, or scroll containers
- No layout shift, no padding changes needed

### Files changed
1. `src/components/ui/input.tsx`
2. `src/components/ui/textarea.tsx`
3. `src/components/ui/button.tsx`
4. `src/components/ui/currency-input.tsx`
5. `src/components/ui/select.tsx`

