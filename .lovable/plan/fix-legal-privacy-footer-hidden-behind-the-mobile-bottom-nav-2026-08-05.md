# Fix: Legal & Privacy footer hidden behind the mobile bottom nav

## What's happening

On phone and small-tablet widths the app footer ("Local-first" badge, the **Legal & Privacy** link, and the copyright line) sits underneath the fixed bottom navigation bar, so the link is partly or fully unreachable.

Two causes, confirmed in the layout code:

1. The main content area sets padding with a shorthand (`p-2 sm:p-4`) *and* a separate bottom-spacer class. At 640px and wider the responsive shorthand re-sets the bottom padding to 16px, wiping out the 64px reserved for the nav bar. That is why it looks correct on a narrow phone but breaks on larger phones and small tablets.
2. Even when the spacer does apply, it reserves exactly the nav bar's height (64px) with zero breathing room, so the footer text ends up flush against the bar.

## The fix

- Change the main content area to use explicit horizontal and top padding instead of the all-sides shorthand, so nothing can override the reserved bottom space.
- Keep the bottom spacer active for all widths below the desktop breakpoint, and restore normal padding on desktop where there is no bottom nav.
- Give the bottom spacer a comfortable gap (nav height + 24px + device safe area) so the footer clears the bar rather than touching it.

Result: the Legal & Privacy link, badge, and copyright are fully visible and tappable above the bottom nav on every mobile and tablet width, and desktop is unchanged.

## Technical details

- `src/components/Layout.tsx` — `<main>` className: replace `"p-2 sm:p-4 lg:p-8 lg:pt-10"` with directional equivalents (`px-2 pt-2 sm:px-4 sm:pt-4 lg:px-8 lg:pt-10`) and keep `pb-bottom-nav lg:pb-8`.
- `src/index.css` — bump `.pb-bottom-nav` / `.mb-bottom-nav` from `calc(64px + safe-area)` to `calc(64px + 24px + safe-area)`.
- No changes to navigation, routing, or any business logic.
