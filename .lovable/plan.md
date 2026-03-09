

# Chat Bubble: "HI!" Speech Bubble Style

Inspired by the reference image, replace the current "Ask me anything ✨" thought bubble with a simple, bold **"HI!"** speech bubble that feels like the bot is greeting the user.

## Changes — `src/components/ChatbotWidget.tsx`

### 1. Replace tooltip text and style
- Change text from "Ask me anything ✨" to **"HI!"**
- Style it as a compact, rounded speech bubble: `bg-accent text-accent-foreground font-bold text-base rounded-2xl px-4 py-2`
- Keep the downward-pointing tail and positioning above the bot icon
- Keep the auto-dismiss on first open logic (`!isOpen && !hasOpened`)

### 2. Adjust bubble sizing
- Make the bubble smaller/tighter to match the compact "HI!" text (remove `whitespace-nowrap` width constraints from the wider text)
- Center it above the bot icon with `w-16 flex justify-center`

