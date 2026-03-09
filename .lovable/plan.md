

# Fix: Linked accounts not appearing after bank linking

## Root Cause

`BankLinkingFlow` and `LinkedAccountsList` each call `useLinkedAccounts()` independently. This creates **two separate React state instances**. When `BankLinkingFlow` adds accounts via its own hook instance, the parent `LinkedAccountsList` still holds stale (empty) state. When the flow completes and `isLinking` flips to `false`, the list renders with the old empty array.

## Fix

Pass the `addAccounts` function from the parent's hook instance down to `BankLinkingFlow` as a prop, and remove the independent `useLinkedAccounts()` call inside `BankLinkingFlow`.

### Changes

**`LinkedAccountsList.tsx`** — pass `addAccounts` to the child:
```tsx
<BankLinkingFlow
  onComplete={() => setIsLinking(false)}
  onCancel={() => setIsLinking(false)}
  addAccounts={addAccounts}   // ← from parent's useLinkedAccounts
/>
```

**`BankLinkingFlow.tsx`** — accept `addAccounts` as a prop instead of calling the hook:
- Add `addAccounts` to `BankLinkingFlowProps`
- Remove the `useLinkedAccounts()` import and call
- Use the prop directly in `handleSelectInstitution`

This ensures both components share the same React state, so the list updates immediately when the flow completes.

