

# Optimize Auth Modal for Onboarding Trial Signup

## Problem Analysis

When users click "Start 7-Day Free Trial" during onboarding, the current Auth Modal:

1. **Defaults to Login tab** instead of Sign Up (the `defaultMode` prop is not being passed)
2. **Gives equal visual weight** to both Login and Sign Up tabs
3. **Creates cognitive friction** for new users who are clearly in a "create account" mindset

This contradicts the user's intent and can cause abandonment. Research shows **74% of users abandon signups** that feel complicated or create confusion.

---

## UX Best Practices for Trial Signup Flows

| Practice | Rationale |
|----------|-----------|
| **Context-aware defaults** | If someone clicks "Start Trial", default to signup - they've expressed new user intent |
| **Minimize secondary options** | Sign In should be present but de-emphasized for the minority who already have accounts |
| **Reinforce the action** | Modal title and CTA should match what they clicked ("Start Your Free Trial") |
| **Reduce friction** | Consider whether all fields are necessary (e.g., is Last Name required?) |
| **Social proof** | Add trust signals in the modal ("No credit card required", "Join 10,000+ users") |

---

## Proposed Solution

### Option A: Minimal Fix (Recommended)
Simply pass `defaultMode="signup"` from PricingStep and keep the tabs.

### Option B: Signup-First Layout (Better UX)
Create a signup-focused mode where:
- Sign Up form is the primary view
- "Already have an account? Sign in" is a subtle link below the form
- Modal header reinforces the trial context

**I recommend Option B** because it better matches user intent and reduces visual noise.

---

## Implementation Plan

### 1. Add `signupFirst` Mode to AuthModal

Create a new prop to enable signup-focused layout:

```tsx
interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
  signupFirst?: boolean; // NEW: Hide tabs, show signup with "Sign in" link
  contextTitle?: string; // NEW: Custom title like "Start Your Free Trial"
}
```

### 2. Create Signup-First View

When `signupFirst={true}`:

```text
┌───────────────────────────────────────┐
│            [Zero Hero Logo]           │
│                                       │
│      Start Your Free Trial            │
│   7 days free, then $5/mo             │
│                                       │
│   ┌─────────────┐ ┌─────────────┐     │
│   │ First Name  │ │ Last Name   │     │
│   └─────────────┘ └─────────────┘     │
│   ┌─────────────────────────────┐     │
│   │ Email                       │     │
│   └─────────────────────────────┘     │
│   ┌─────────────────────────────┐     │
│   │ Password                    │     │
│   └─────────────────────────────┘     │
│                                       │
│   [ ======= Create Account ======= ]  │
│                                       │
│   Already have an account? Sign in    │
│                                       │
│   🔒 No credit card required          │
└───────────────────────────────────────┘
```

### 3. Update PricingStep

Pass the new props when opening the modal:

```tsx
<AuthModal 
  open={showAuthModal} 
  onOpenChange={setShowAuthModal}
  signupFirst={true}
  contextTitle="Start Your Free Trial"
/>
```

---

## Detailed Changes

### File: `src/components/AuthModal.tsx`

**1. Update interface (line 21-25):**
```tsx
interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
  signupFirst?: boolean;
  contextTitle?: string;
}
```

**2. Add signupFirst mode state (around line 29):**
```tsx
export function AuthModal({ 
  open, 
  onOpenChange, 
  defaultMode = 'login',
  signupFirst = false,
  contextTitle
}: AuthModalProps) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  // ... rest of state
```

**3. Create conditional header for signupFirst mode (in the view === 'auth' block):**

When `signupFirst && !showLoginForm`:
- Show custom title (or "Create Your Account")
- Show subtitle based on context
- Hide the tabs entirely
- Show signup form directly
- Add "Already have an account? Sign in" link at bottom

When `signupFirst && showLoginForm`:
- Show login form with back arrow to return to signup
- Similar to existing "forgot-password" pattern

**4. Add trust badge below the form:**
```tsx
<p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1 mt-4">
  <Lock className="h-3 w-3" />
  No credit card required
</p>
```

### File: `src/components/onboarding/PricingStep.tsx`

**Update AuthModal usage (lines 317-320):**
```tsx
<AuthModal 
  open={showAuthModal} 
  onOpenChange={setShowAuthModal}
  signupFirst={true}
  contextTitle="Start Your Free Trial"
/>
```

---

## Visual Comparison

```text
CURRENT (Confusing):                   PROPOSED (Clear Intent):
┌────────────────────────┐             ┌────────────────────────┐
│   [Logo]               │             │        [Logo]          │
│   Welcome to Zero Hero │             │                        │
│                        │             │  Start Your Free Trial │
│ ┌────────┬────────┐    │             │   7 days free          │
│ │ Login* │ SignUp │    │             │                        │
│ └────────┴────────┘    │             │ [First] [Last]         │
│                        │             │ [Email............]    │
│ [Email............]    │             │ [Password.........]    │
│ [Password.........]    │             │                        │
│ ☑ Remember me          │             │ [=== Create Account ==]│
│                        │             │                        │
│ [====== Sign In ======]│             │ Already have an        │
│                        │             │ account? Sign in       │
└────────────────────────┘             │                        │
                                       │ 🔒 No credit card      │
* defaults to Login tab               └────────────────────────┘
  (wrong context!)
```

---

## Additional Considerations

### Make Last Name Optional
Currently `lastName` is a required field visually but not marked as required in the code. Consider:
- Keeping it optional with `(optional)` label
- Or removing it entirely for reduced friction

### Social Proof
Could add a small line like:
- "Join 1,000+ users building financial freedom"
- "Trusted by families across the country"

### Error Handling
The current error handling is good - it shows confirmation sent screens appropriately.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/AuthModal.tsx` | Add `signupFirst` and `contextTitle` props, create signup-focused layout with "Sign in" link |
| `src/components/onboarding/PricingStep.tsx` | Pass `signupFirst={true}` and `contextTitle` to AuthModal |

---

## Accessibility Maintained

- All form inputs retain proper labels
- Focus management continues to work
- Keyboard navigation preserved
- "Sign in" link is accessible as a button

