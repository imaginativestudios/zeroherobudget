
# Audit All Cards & Enhance Demo Data for Full Application Testing

## Executive Summary

This plan audits every card/widget in the application and enhances the demo data loader to populate realistic data that showcases the full capacity of each component. Currently, the demo data exists but is incomplete for several behavioral features.

---

## Complete Card Inventory

### Dashboard Cards (`src/components/dashboard/`)

| Card | Purpose | Current Demo Support | Needs Enhancement |
|------|---------|---------------------|-------------------|
| **BossCard** | Shows current target debt with "Make Extra Payment" button | Yes - Has demo debts | No |
| **EmergencyFundCard** | Editable emergency fund with milestone markers | Yes - 65% complete ($650/$1000) | No |
| **BehavioralHintCard** | AI-driven financial insights | Partial - Needs more diverse states | Yes |
| **CommandCenter** | 3-column layout (Debts, Budget, Strategy) | Yes | No |
| **PayoffStrategyCard** | Current path + What-If Simulator | Yes - Has debts and strategy | No |
| **GettingStartedChecklist** | 6-task onboarding checklist | Partial - Missing investing step | Yes |
| **IntelFeed** | Quest Insights (progressive cards) | Partial - Missing streak/shadow data | Yes |
| **StatusBanner** | Motivational status message | Yes | No |
| **InitializeMissionCard** | Empty state for new users | N/A - Not shown in demo mode | No |
| **TrialCountdownBanner** | Trial expiration warning | N/A - Demo doesn't use trials | No |

### Behavioral Cards (`src/components/behavioral/`)

| Card | Purpose | Current Demo Support | Needs Enhancement |
|------|---------|---------------------|-------------------|
| **StreakTrackerWidget** | Consistency streak with level badges | Missing - No streak data | **Yes** |
| **SurplusPowerCard** | Income - Survival - Debt Minimums | Yes - Calculated from demo data | No |
| **ShadowBudgetSummary** | Hidden costs of discretionary spending | Partial - Needs discretionary transactions | Yes |
| **FreedomTimelineWidget** | Debt-free date visualization | Yes - Uses demo debts | No |
| **HeroMoatCard** | Alternative emergency fund display | Yes - Uses hero profile | No |
| **ShadowCostPreview** | Transaction-level shadow cost | Yes - Calculated | No |
| **ShadowCostToast** | Toast notification for shadow costs | Yes - Triggered by transactions | No |
| **ShadowImpactCard** | Detailed shadow cost breakdown | Yes - Calculated | No |
| **FreedomSlider** | Extra payment impact slider | Yes - Uses leftover | No |
| **HeroTipsFeed** | Dynamic tips based on state | Partial - Needs diverse states | Yes |
| **DebtVictoryModal** | Celebration when debt paid off | N/A - Triggered by action | No |
| **LevelUpModal** | Strategy upgrade celebration | N/A - Triggered by action | No |
| **StrategyPivotDialog** | Strategy change confirmation | N/A - Triggered by action | No |
| **SurplusStrikeModal** | Extra payment modal | N/A - Triggered by action | No |

### Defense Cards (`src/components/defense/`)

| Card | Purpose | Current Demo Support | Needs Enhancement |
|------|---------|---------------------|-------------------|
| **MoatBuilder** | Enhanced emergency fund with water animation | Yes - Uses hero profile | No |
| **FortressLevelBadge** | Castle level indicator | Yes - Calculated from moat % | No |
| **RegroupingBanner** | Recovery mode indicator | Missing - No breach state | Yes |

### Page-Specific Cards

| Card/Component | Page | Current Demo Support | Needs Enhancement |
|----------------|------|---------------------|-------------------|
| **JourneyStepCard** | Journey | Partial - Missing investment tracking | Yes |
| **AchievementCard** | Achievements | Missing - No achievements tracked | **Yes** |
| **BudgetOverviewCard** | Budget | Yes - Has demo expenses | No |
| **PaymentScheduleTable** | Debt Snowball | Yes - Uses demo debts | No |
| **StrategyComparison** | Debt Snowball | Yes - Uses demo debts | No |
| **SubscriptionForm** | Subscriptions | Yes - Has demo subscriptions | No |

---

## Data Gaps Identified

### 1. **Consistency Streak Data** (Critical)
The `StreakTrackerWidget` and `useBehavioralEngine` rely on stored streak data that isn't populated.

**Missing localStorage key:** `{DEMO_USER_ID}_bdt_consistency_streak`

**Required structure:**
```typescript
{
  currentStreak: 5,
  longestStreak: 12,
  lastLogDate: "2026-01-27"
}
```

### 2. **Savings Vault Data** (Enhancement)
Current demo has basic vault data but missing some fields for full feature display.

**Missing fields:**
- `achieved_milestones: [25, 50]` - Shows milestone badges
- `was_secure: false` - For RegroupingBanner
- `last_secure_date: null`
- `breach_acknowledged: false`
- `repair_mode_active: false`

### 3. **Accounts Data** (Critical)
The `useLocalAccounts` hook auto-creates a default account, but demo should have realistic accounts for:
- Journey Step 5 (investment tracking)
- Transaction account assignment
- Account balance display

**Missing localStorage key:** `{DEMO_USER_ID}_accounts`

**Required structure:**
```typescript
[
  { id: 'acc-1', name: 'Main Checking', type: 'checking', balance: 2450, is_active: true },
  { id: 'acc-2', name: 'Emergency Savings', type: 'savings', balance: 650, is_active: true },
  { id: 'acc-3', name: 'Credit Card', type: 'credit', balance: -3500, is_active: true },
  { id: 'acc-4', name: '401k', type: 'investment', balance: 25000, is_active: true },
]
```

### 4. **Achievement Tracking** (Missing)
No achievements are currently tracked in demo mode.

**Missing localStorage key:** `{DEMO_USER_ID}_bdt_achievements`

**Required structure:**
```typescript
[
  { id: 'first_budget', unlockedAt: '2026-01-15T...', type: 'milestone' },
  { id: 'first_debt_payment', unlockedAt: '2026-01-20T...', type: 'action' },
  { id: 'moat_25', unlockedAt: '2026-01-22T...', type: 'milestone' },
  { id: 'moat_50', unlockedAt: '2026-01-25T...', type: 'milestone' },
]
```

### 5. **Hero Profile Enhancement**
Current demo hero profile is missing some fields.

**Missing/incomplete fields:**
- `onboarding_completed: true` - Ensures onboarding doesn't show
- `trial_started: true` - For trial flow testing
- Richer `activity_log` with more dates for streak calculation

---

## Implementation Plan

### File: `src/lib/demoDataLoader.ts`

#### Step 1: Add Accounts Demo Data
```typescript
const DEMO_ACCOUNTS = [
  { 
    id: 'acc-checking', 
    name: 'Main Checking', 
    type: 'checking', 
    balance: 2450, 
    is_active: true 
  },
  { 
    id: 'acc-savings', 
    name: 'Emergency Savings', 
    type: 'savings', 
    balance: 650,  // Matches moat_current
    is_active: true 
  },
  { 
    id: 'acc-credit', 
    name: 'Amex Card', 
    type: 'credit', 
    balance: -3500,  // Matches demo debt
    is_active: true 
  },
  { 
    id: 'acc-401k', 
    name: '401k Retirement', 
    type: 'investment', 
    balance: 25000, 
    is_active: true 
  },
];
```

#### Step 2: Add Consistency Streak Data
```typescript
const DEMO_CONSISTENCY_STREAK = {
  currentStreak: 5,
  longestStreak: 12,
  lastLogDate: format(new Date(), 'yyyy-MM-dd'),
};
```

#### Step 3: Enhance Savings Vault Data
```typescript
export const DEMO_SAVINGS_VAULT = {
  moat_balance: 650,
  moat_target: 1000,
  last_deposit_date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
  deposit_history: [
    { amount: 200, date: format(subDays(new Date(), 30), 'yyyy-MM-dd') },
    { amount: 150, date: format(subDays(new Date(), 20), 'yyyy-MM-dd') },
    { amount: 100, date: format(subDays(new Date(), 14), 'yyyy-MM-dd') },
    { amount: 100, date: format(subDays(new Date(), 7), 'yyyy-MM-dd') },
    { amount: 100, date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
  ],
  achieved_milestones: [25, 50],  // NEW: Shows milestone badges
  was_secure: false,
  last_secure_date: null,
  breach_acknowledged: false,
  repair_mode_active: false,
};
```

#### Step 4: Add Achievements Data
```typescript
const DEMO_ACHIEVEMENTS = [
  { 
    id: 'first_budget', 
    unlockedAt: format(subDays(new Date(), 40), 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
    type: 'milestone' 
  },
  { 
    id: 'first_debt_payment', 
    unlockedAt: format(subDays(new Date(), 35), 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
    type: 'action' 
  },
  { 
    id: 'moat_25', 
    unlockedAt: format(subDays(new Date(), 25), 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
    type: 'milestone' 
  },
  { 
    id: 'moat_50', 
    unlockedAt: format(subDays(new Date(), 10), 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
    type: 'milestone' 
  },
  { 
    id: 'streak_7', 
    unlockedAt: format(subDays(new Date(), 5), 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
    type: 'consistency' 
  },
];
```

#### Step 5: Enhance Hero Profile with Activity Log
```typescript
export const DEMO_HERO_PROFILE = {
  onboarding_completed: true,
  hourly_wage: 28,
  moat_target: 1000,
  moat_current: 650,
  last_active_date: format(new Date(), 'yyyy-MM-dd'),
  activity_log: [
    format(subDays(new Date(), 0), 'yyyy-MM-dd'),
    format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    format(subDays(new Date(), 4), 'yyyy-MM-dd'),
    format(subDays(new Date(), 6), 'yyyy-MM-dd'),  // Gap for realism
  ],
  onboarding_step: undefined,
  onboarding_data: undefined,
  trial_started: true,
};
```

#### Step 6: Update loadDemoData() Function
Add new localStorage writes:

```typescript
// Accounts
const accounts = convertDemoAccounts();
localStorage.setItem(`${prefix}accounts`, JSON.stringify(accounts));

// Consistency Streak
localStorage.setItem(`${prefix}bdt_consistency_streak`, JSON.stringify(DEMO_CONSISTENCY_STREAK));

// Achievements
localStorage.setItem(`${prefix}bdt_achievements`, JSON.stringify(DEMO_ACHIEVEMENTS));

// Update summary
const summary = `Loaded ${expenses.length} expenses, ${debts.length} debts, ${transactions.length} transactions, ${subscriptions.length} subscriptions, ${accounts.length} accounts, ${DEMO_ACHIEVEMENTS.length} achievements`;
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/demoDataLoader.ts` | Add accounts, streak, achievements, enhance vault & profile |

---

## Testing Checklist

After implementation, verify these cards show data:

- [ ] **Dashboard**: All 3 Command Center columns populated
- [ ] **Emergency Fund Card**: 65% progress with 2 milestone badges
- [ ] **Behavioral Hints**: At least 1-2 relevant hints showing
- [ ] **Streak Tracker**: "5 day streak" with "Building Habits" level
- [ ] **Surplus Power**: Positive surplus calculated from budget
- [ ] **Shadow Budget**: Hidden costs calculated from discretionary spending
- [ ] **Freedom Timeline**: Debt-free date ~24 months out
- [ ] **Journey Page**: Steps 1-2 complete, Step 3 in progress
- [ ] **Getting Started**: 5/6 tasks complete (investing pending)
- [ ] **Accounts Page**: 4 accounts with realistic balances

---

## Expected Outcome

When a user clicks "Explore Demo", they will see a fully populated dashboard that demonstrates:

1. A user 45 days into their debt payoff journey
2. $54,300 total debt across 5 accounts
3. $650 emergency fund (65% of $1,000 goal)
4. 5-day consistency streak
5. Positive surplus power with behavioral coaching
6. Hidden costs calculated on discretionary spending
7. Journey progress showing steps 1-2 complete
8. Investment account for Journey step 5 visibility
