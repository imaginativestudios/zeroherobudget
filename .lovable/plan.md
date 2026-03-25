

## Fix Button Scale Expansion Clipping in Modals

### Problem
Several button variants use `hover:scale-105` which enlarges the button by 5% on hover/press. Inside modals with `overflow-hidden`, buttons near the edges get visually clipped during this expansion. The dialog close button also still uses the old `ring-offset-2` pattern.

### Solution
Two targeted fixes:

1. **Remove `hover:scale-105`** from button variants that appear inside modals (`default`, `royal`, `inverse`). Replace with a subtler effect that doesn't change the element's bounding box — use `hover:brightness-110` or simply remove the scale entirely, keeping only the shadow and color change as the hover indicator.

2. **Fix dialog close button** ring style in `dialog.tsx` — update from `focus:ring-offset-2` to `focus:ring-2 focus:ring-inset focus:ring-ring focus:ring-offset-0` to match the new inset pattern.

### Changes

**`src/components/ui/button.tsx`**
- Remove `hover:scale-105` from `default`, `royal`, and `inverse` variants
- The `hover:shadow-royal` and color changes remain as sufficient hover feedback

**`src/components/ui/dialog.tsx`**
- Update the close button's focus classes from `focus:ring-2 focus:ring-ring focus:ring-offset-2` to `focus:ring-2 focus:ring-inset focus:ring-ring focus:ring-offset-0`

**`src/components/ui/alert-dialog.tsx`**
- Check if it has a close button with the same old ring pattern; if so, apply the same fix

### Files changed
1. `src/components/ui/button.tsx`
2. `src/components/ui/dialog.tsx`

