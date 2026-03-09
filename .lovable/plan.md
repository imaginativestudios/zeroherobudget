

# Remove Chat Header and Disclaimer Note

## Changes — `src/components/ChatbotWidget.tsx`

### 1. Remove the teal header block (lines 230–248)
Delete the entire header div (gradient background, Bot icon, "Zora" title, subtitle, close button). Replace with a minimal close button in the top-right corner of the messages area.

### 2. Remove the disclaimer paragraph (lines 258–260)
Delete the "Note: I may occasionally provide inaccurate information..." italic block. The bottom input area already has legal copy.

### 3. Add a minimal close button
Place a small `X` button absolutely positioned in the top-right of the chat card (inside the rounded-lg container) so users can still close the panel without the full header bar.

