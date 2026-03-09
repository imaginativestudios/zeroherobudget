

# Reposition Thought Bubble & Enlarge Bot Icon

## Changes — `src/components/ChatbotWidget.tsx`

### 1. Move tooltip above the button (lines 340–349)
- Change position from `bottom-4 right-[5rem]` (side) to `bottom-[5.5rem] right-0` (above, centered over button)
- Replace the right-pointing tail with a downward-pointing tail (centered at bottom of bubble)
- Tail uses border-trick: `border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-border` positioned at `bottom-[-8px] left-1/2 -translate-x-1/2`

### 2. Enlarge bot icon (line 367)
- Increase `Bot` icon from `h-8 w-8` to `h-12 w-12` (50% larger)
- Button circle stays `h-16 w-16`

