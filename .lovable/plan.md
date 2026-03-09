

# Remove HI Bubble, Sparkles Icon, Add Glow

## Changes — `src/components/ChatbotWidget.tsx`

### 1. Remove the "HI!" tooltip (lines 340–348)
Delete the entire helper tooltip block.

### 2. Replace Bot icon with Sparkles (line 1 + line 365)
- Replace `Bot` import from lucide-react with `Sparkles`
- Change the closed-state icon from `<Bot className="h-12 w-12" />` to `<Sparkles className="h-8 w-8" />` (standard AI sparkles icon, sized to fit the circle)
- Keep `Bot` import for the chat header

### 3. Add glow to the floating button (line 357)
- Add `shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]` or a similar glow using a box-shadow with the primary color
- Since CSS variable format may not support rgba directly, use a hardcoded subtle glow like `shadow-[0_0_20px_rgba(99,102,241,0.4)]` or leverage ring utilities: `ring-4 ring-primary/20`

