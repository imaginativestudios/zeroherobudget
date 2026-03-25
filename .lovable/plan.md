

## Remove "Scroll to explore" Text from ScrollCue

Remove line 32 (the `<span>` with "Scroll to explore") from `src/components/ScrollCue.tsx`, and clean up the `gap-1.5` since only the icon remains.

### File: `src/components/ScrollCue.tsx`
- Delete the `<span>` element containing "Scroll to explore"
- Remove `gap-1.5` from the button class (no longer needed with single child)

