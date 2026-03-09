

# Enhance Chat Bubble: Thought-Bubble Tooltip & Larger Bot Icon

## Changes — `src/components/ChatbotWidget.tsx`

### 1. Thought-bubble style tooltip (lines 340–347)
Replace the plain pill with a speech-bubble shape that looks like it's coming from the bot icon:
- Use `rounded-2xl` with a small CSS triangle/tail pointing right toward the bubble button
- Add the tail via an `after:` pseudo-element or a small inline SVG triangle on the right side
- Keep the `animate-fade-in` entrance and auto-dismiss on first open

```text
  ╭──────────────────╮
  │ Ask me anything ✨ │ ◁── tail ──▶  (Bot bubble)
  ╰──────────────────╯
```

Implementation: wrap the text in a container with `relative`, add a `<div>` acting as the triangle tail (absolute positioned, right edge, using border-trick for a CSS triangle matching `bg-card` and `border-border`).

### 2. Enlarge the bot icon (lines 355–365)
- Increase button from `h-14 w-14` → `h-16 w-16`
- Increase Bot icon from `h-7 w-7` → `h-8 w-8`
- Increase X icon proportionally to `h-7 w-7`

