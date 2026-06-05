## Goal
Enhance the `/join` beta invite page so that:
1. A `?code=` URL parameter automatically pre-fills the invite code input.
2. A static helper text below the input suggests the expected code format.

## Plan

### Step 1 — Auto-fill from URL parameter
- In `src/pages/JoinBeta.tsx`, import `useSearchParams` from `react-router-dom`.
- On mount, read the `code` query parameter. If present and non-empty, set it as the initial `code` state (uppercased).
- Preserve existing `autoFocus` behavior.

### Step 2 — Add format helper text
- Below the input field (and above the submit button), add a small helper text line:  
  `Example format: ZH-XXXX-XXXX (3–64 characters, letters, numbers, dashes, underscores)`
- Style with `text-xs text-muted-foreground` to match existing helper patterns.

## Files changed
- `src/pages/JoinBeta.tsx` — single-file frontend edit only.

## Out of scope
- No backend or database changes.
- No input masking or auto-formatting dashes.
- No new routes or components.