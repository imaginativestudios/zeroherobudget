

# Enhance Chat Bubble with Bot Icon and Helper Text

## Changes — `src/components/ChatbotWidget.tsx`

### 1. Replace MessageCircle with Bot icon
- Import `Bot` from `lucide-react`
- Swap the bubble's `MessageCircle` (line 351) for `Bot` icon
- Also swap the header icon (line 232) for consistency

### 2. Add floating helper tooltip
- Add a small pill/label next to the bubble that says **"Ask me anything"**
- Only show it when the chat is **closed** — hide when open
- Animate it with a subtle fade/slide-in using Tailwind transitions
- Position it to the left of the bubble (`right-16`) with an arrow or rounded pill style
- Auto-dismiss after first open (optional: use local state so it only shows until first interaction)

### Layout
```text
┌──────────────────┐
│  Ask me anything  │  ●  (Bot icon bubble)
└──────────────────┘
```

The pill uses `bg-card border shadow-lg rounded-full px-3 py-1.5 text-sm font-medium` styling with a gentle `animate-bounce` or pulse to draw attention, settling after a moment.

