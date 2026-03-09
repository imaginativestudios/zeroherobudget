

# Move Bank Linking Into Accounts Page & Add Value Messaging

## Current State

- `/link-bank` is a standalone page with the full multi-step flow (consent → search → connecting → success)
- `/accounts` already shows `LinkedAccountsList` at the bottom, but clicking "Link Account" navigates away to `/link-bank`
- No messaging anywhere explains *why* linking a bank account matters
- No prompts on the dashboard or onboarding guide users toward bank linking

## Plan

### 1. Inline the bank linking flow into `/accounts`

Instead of navigating to `/link-bank`, the consent → search → connecting → success flow will happen inline on the Accounts page. Move the multi-step state machine from `LinkBank.tsx` into a new `BankLinkingFlow` component that `LinkedAccountsList` renders in-place when the user clicks "Link Account."

Remove:
- `src/pages/LinkBank.tsx`
- Route `/link-bank` from `App.tsx`
- Import of `LinkBank` from `App.tsx`

### 2. Add a value proposition card

Above the linked accounts section on `/accounts`, add a brief card explaining why linking matters:

> **Why link your bank?**
> Linking gives you real account names and types without manual entry. Your data stays encrypted on this device — nothing is sent to our servers.

This replaces the generic empty-state copy and gives returning users context too. Show it when no accounts are linked; collapse to a subtle inline hint once accounts exist.

### 3. Add a prompt on the Dashboard

In the `GettingStartedChecklist`, add a task: "Link a bank account" pointing to `/accounts`. This gives first-time users a nudge from the dashboard.

### Technical Details

- Extract the step state machine (consent/search/connecting/success/error) from `LinkBank.tsx` into `src/components/linked-accounts/BankLinkingFlow.tsx`
- `LinkedAccountsList` gains internal state: when `onLinkNew` is triggered, it renders `BankLinkingFlow` inline instead of navigating
- On completion/cancel, `BankLinkingFlow` calls back to hide itself and refresh the list
- The `StepIndicator`, institution search, connecting/success/error cards all move into `BankLinkingFlow`
- `GettingStartedChecklist` gets a new task checking `linkedAccounts.length > 0`

