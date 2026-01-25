

# Account Management Page

## Overview

Create a dedicated page at `/accounts` where users can view, create, edit, and delete their bank accounts. This builds upon the existing `useLocalAccounts` hook and follows the established patterns from the Subscriptions page.

---

## Architecture

### Components to Create

| Component | Purpose |
|-----------|---------|
| `src/pages/Accounts.tsx` | Main page component with account list and management UI |
| `src/components/accounts/AccountForm.tsx` | Reusable dialog form for creating/editing accounts |
| `src/components/accounts/AccountRow.tsx` | Table row component with inline actions |

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/accounts` route |
| `src/components/Layout.tsx` | Add "Accounts" link to navigation sidebar |

---

## Page Design

### Header Section
- Title: "Accounts"
- Subtitle: "Manage your bank accounts, credit cards, and cash accounts"
- Primary action button: "+ Add Account"

### Summary Cards (3-column grid)
1. **Total Balance** - Sum of all account balances
2. **Active Accounts** - Count of active accounts
3. **Account Types** - Breakdown by type (checking, savings, credit, etc.)

### Accounts Table
| Column | Content |
|--------|---------|
| Account Name | Name with type badge below |
| Type | Icon + label (checking, savings, credit, cash, investment) |
| Balance | Formatted currency (negative shown in red for credit) |
| Status | Active/Inactive badge |
| Actions | Edit, Toggle Active, Delete buttons |

### Empty State
When no accounts exist:
- Illustrated empty state with wallet icon
- "No accounts yet" message
- "Add your first account to start tracking your finances"
- Primary CTA button to open the add form

---

## Account Form Dialog

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Account Name | Text input | Yes | e.g., "Chase Checking", "Visa Card" |
| Account Type | Select dropdown | Yes | checking, savings, credit, cash, investment |
| Current Balance | Currency input | Yes | With $ prefix, supports negative for credit |
| Active | Switch | No | Default: true |

### Form Behavior
- Dialog title changes: "Add Account" vs "Edit Account"
- Form validation before submit
- Toast notification on success
- Form resets after successful submission

---

## Delete Confirmation

Use `AlertDialog` pattern (consistent with ExpenseItemRow):
- Title: "Delete Account?"
- Description: "This will permanently delete '{accountName}'. Transactions linked to this account will lose their account reference."
- Actions: "Cancel" (outline) | "Delete" (destructive)

---

## Technical Details

### Account Types with Icons

```text
checking    -> Wallet icon
savings     -> PiggyBank icon
credit      -> CreditCard icon
cash        -> Banknote icon
investment  -> TrendingUp icon
```

### Page Structure (Accounts.tsx)

```text
<div className="pt-8 space-y-6">
  <!-- Header with title + Add button -->
  <div className="flex items-center justify-between">
    <div>
      <h1>Accounts</h1>
      <p>Manage your bank accounts...</p>
    </div>
    <Button onClick={openAddForm}>+ Add Account</Button>
  </div>

  <!-- Summary Cards -->
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    <Card>Total Balance</Card>
    <Card>Active Accounts</Card>
    <Card>Account Types</Card>
  </div>

  <!-- Accounts Table -->
  <Card>
    <CardHeader>
      <CardTitle>All Accounts</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>...</Table>
    </CardContent>
  </Card>

  <!-- Form Dialog -->
  <AccountForm open={showForm} ... />

  <!-- Delete Confirmation -->
  <AlertDialog open={showDeleteConfirm} ... />
</div>
```

### Navigation Item (Layout.tsx)

Add to the `navigationItems` array:
```text
{ name: "Accounts", href: "/accounts", icon: Wallet }
```

Place after "Transactions" in the navigation order.

### Route (App.tsx)

Add inside the protected routes section:
```text
<Route path="/accounts" element={<Accounts />} />
```

---

## Mobile Considerations

- Table columns hide on mobile: Type column hidden below `sm:`
- Action buttons collapse to icon-only on mobile
- Form dialog uses `ScrollArea` with `max-h-[calc(90vh-80px)]` for scrollability
- Touch-friendly button sizes (min-h-[44px])

---

## Validation Rules

1. Account name is required (min 1 character)
2. Account type must be selected
3. Balance is required (can be 0 or negative)
4. Cannot delete the last active account (show warning toast)

---

## Files Summary

### New Files
1. `src/pages/Accounts.tsx` - Main accounts management page
2. `src/components/accounts/AccountForm.tsx` - Add/Edit dialog component

### Modified Files
1. `src/App.tsx` - Add route for `/accounts`
2. `src/components/Layout.tsx` - Add navigation item

---

## Implementation Order

1. Create `AccountForm.tsx` component
2. Create `Accounts.tsx` page
3. Add route to `App.tsx`
4. Add navigation link in `Layout.tsx`

