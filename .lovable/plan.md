

## Floating Beta Tester Badge

### What it does
A small fixed-position badge in the bottom-left corner (above mobile nav) that appears when `localStorage.beta_access === 'true'`. It shows a "Beta Tester" label and expands to a feedback form when clicked.

### Changes

**1. Create `src/components/BetaTesterBadge.tsx`**
- Check `localStorage.getItem('beta_access') === 'true'` — render nothing if not set
- Floating badge: fixed bottom-left, z-50, with a flask/beaker icon + "Beta" label
- On click, toggle open a small feedback panel with:
  - A textarea for bug description
  - A "Submit Feedback" button that sends feedback via `mailto:` link (or stores in localStorage for now)
  - Current page URL auto-included in feedback
- Dismiss/collapse button to minimize back to badge
- Responsive: offset above mobile bottom nav on small screens

**2. Update `src/App.tsx`**
- Import and render `<BetaTesterBadge />` alongside the other floating components (OfflineBanner, ChatbotWidget, etc.)

### Technical details
- Uses existing UI primitives: Button, Textarea, Card
- Feedback method: opens a `mailto:` link pre-filled with bug details (page URL, description, user agent) — no backend needed
- Badge styling matches existing design tokens (primary colors, rounded-lg, shadow)
- Positioned to avoid overlap with ChatbotWidget (bottom-right) and MobileBottomNav

