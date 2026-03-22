

## Clean Up Dead Code in Bank Linking Modules

### Changes

**1. `src/hooks/useLinkedAccounts.ts`**
- Remove `useRef` import (if only used by `persistRef`)
- Remove lines 58-61: the unused `persistRef` declaration and assignment

**2. No other dead code found** in `mockBankProvider.ts`, `BankLinkingFlow.tsx`, or `LinkedAccountsList.tsx` — all exports, functions, and variables are actively used.

