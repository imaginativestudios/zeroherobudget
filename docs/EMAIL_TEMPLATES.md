# Zero Hero Email Templates

> **Single source of truth** for all email designs used in the Zero Hero application.

---

## Table of Contents

1. [Design System](#design-system)
2. [Deliverability Best Practices](#deliverability-best-practices)
3. [Code-Based Templates](#code-based-templates)
   - [Waitlist Welcome](#1-waitlist-welcome)
   - [Household Invitation](#2-household-invitation)
   - [Account Deletion Code](#3-account-deletion-code)
4. [Supabase Auth Templates](#supabase-auth-templates)
   - [Confirm Signup](#1-confirm-signup)
   - [Reset Password](#2-reset-password)
   - [Magic Link](#3-magic-link)
   - [Change Email Address](#4-change-email-address)
5. [Testing Checklist](#testing-checklist)

---

## Design System

All emails follow a deliverability-optimized design system.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary (Teal) | `#0D7377` | Header background, buttons, links |
| White | `#ffffff` | Header text, button text |
| Body Text | `#333333` | Primary content |
| Secondary Text | `#6B7280` | Muted content, footers |
| Light Gray | `#e5e7eb` | Borders, dividers |
| Footer Background | `#f9fafb` | Footer section |
| Danger (Red) | `#dc2626` | Warning/deletion context only |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Header Title | System Sans | 28px | Bold |
| Body Text | System Sans | 16px | Normal |
| Secondary/Footer | System Sans | 14px | Normal |
| Small Text | System Sans | 12px | Normal |

**Font Stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

### Layout

| Property | Value |
|----------|-------|
| Max Width | 600px |
| Container Padding | 0 (no side gaps) |
| Section Padding | 32px horizontal, 24-32px vertical |
| Border Radius | 0 (email client compatibility) |

### Shared Styles Reference

```css
/* Container */
.container {
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Header */
.header {
  background-color: #0D7377;
  padding: 32px;
  text-align: center;
}

.header-title {
  color: #ffffff;
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}

/* Content */
.content {
  padding: 32px;
}

.paragraph {
  color: #333333;
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

/* Button */
.button {
  display: inline-block;
  background-color: #0D7377;
  color: #ffffff;
  padding: 14px 28px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
}

/* Footer */
.footer {
  background-color: #f9fafb;
  padding: 24px 32px;
  text-align: center;
  border-top: 1px solid #e5e7eb;
}

.footer-text {
  color: #6B7280;
  font-size: 14px;
  margin: 0;
}
```

---

## Deliverability Best Practices

All templates adhere to these anti-spam guidelines:

### ✅ Required

- [x] **Text-only headers** - No images in header (use `<h1>Zero Hero</h1>`)
- [x] **System fonts only** - No web fonts or @import
- [x] **Solid colors** - No gradients or complex backgrounds
- [x] **Transactional language** - Utility-focused, not promotional
- [x] **Alt text** - On any images (if used)
- [x] **Proper structure** - DOCTYPE, html, head, body tags

### ❌ Avoid

- [ ] Emojis in subject lines or headers
- [ ] Marketing buzzwords ("exclusive", "free", "limited time")
- [ ] Image-only emails or high image-to-text ratio
- [ ] Excessive links or large attachments
- [ ] ALL CAPS text
- [ ] Red/orange warning colors (except deletion emails)

### Marketing Email Requirements

For non-transactional emails (waitlist, newsletters):

- [x] `List-Unsubscribe` header (RFC 8058)
- [x] `List-Unsubscribe-Post` header (one-click unsubscribe)
- [x] Physical address in footer (CAN-SPAM compliance)
- [x] Visible unsubscribe link

---

## Code-Based Templates

These templates are defined in code and rendered using React Email.

### 1. Waitlist Welcome

**Location:** `supabase/functions/subscribe-waitlist/_templates/waitlist-welcome.tsx`

**Type:** Marketing (requires List-Unsubscribe)

| Property | Value |
|----------|-------|
| Subject | `You're on the Zero Hero waitlist` |
| Preview | `You're on the Zero Hero waitlist` |
| From | `Zero Hero <hello@zeroherobudget.com>` |

**Headers (set in edge function):**
```typescript
headers: {
  'List-Unsubscribe': `<${unsubscribeUrl}>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
}
```

**Template Notes:**
- Uses React Email components (`Html`, `Head`, `Body`, etc.)
- Includes unsubscribe link in footer
- Rendered via `renderAsync()` from `@react-email/components`

---

### 2. Household Invitation

**Location:** `supabase/functions/send-invitation/_templates/household-invite.tsx`

**Type:** Transactional

| Property | Value |
|----------|-------|
| Subject | `{inviterName} invited you to join {householdName} on Zero Hero` |
| Preview | Dynamic based on inviter/household |
| From | `Zero Hero <hello@zeroherobudget.com>` |

**Props:**
```typescript
interface HouseholdInviteEmailProps {
  inviterName: string;
  householdName: string;
  inviteeEmail: string;
  role: string;
  inviteUrl: string;
}
```

**Template Notes:**
- Displays inviter name and household
- Shows assigned role (owner, admin, member, viewer)
- Contains "Accept Invitation" CTA button
- Expires after 7 days (mentioned in footer)

---

### 3. Account Deletion Code

**Location:** `supabase/functions/send-deletion-code/index.ts` (inline HTML)

**Type:** Transactional (Security)

| Property | Value |
|----------|-------|
| Subject | `Zero Hero - Account Deletion Code` |
| Preview | N/A (inline template) |
| From | `Zero Hero <hello@zeroherobudget.com>` |

**Special Styling:**
- Uses **red accent** (`#dc2626`) for warning context
- Code displayed in large monospace font
- Expires in 10 minutes

**Template Structure:**
```html
<!-- Header uses red for warning context -->
<div style="background-color: #dc2626; padding: 32px; text-align: center;">
  <h1 style="color: #ffffff; font-size: 28px; margin: 0;">
    Account Deletion Request
  </h1>
</div>

<!-- Code display -->
<div style="background-color: #fef2f2; padding: 24px; text-align: center; border-radius: 8px;">
  <p style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #dc2626;">
    {code}
  </p>
</div>
```

---

## Supabase Auth Templates

These templates are configured in the Supabase Dashboard under **Authentication → Email Templates**.

Copy the full HTML into each template field.

---

### 1. Confirm Signup

**Subject:** `Confirm your Zero Hero account`

**Dashboard Location:** Authentication → Email Templates → Confirm signup

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Confirm your email</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    Confirm your email to get started with Zero Hero
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0D7377; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Zero Hero
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Confirm your email address
              </h2>
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Thanks for signing up for Zero Hero. Please confirm your email address by clicking the button below.
              </p>
              
              <!-- Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="background-color: #0D7377;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Confirm Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                If you didn't create an account with Zero Hero, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Zero Hero - Your path to financial freedom
              </p>
              <p style="color: #9CA3AF; font-size: 12px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                This is an automated message. Please do not reply.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 2. Reset Password

**Subject:** `Zero Hero - Reset your password`

**Dashboard Location:** Authentication → Email Templates → Reset password

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset your password</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    Reset your Zero Hero password
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0D7377; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Zero Hero
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Reset your password
              </h2>
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                We received a request to reset your password. Click the button below to choose a new password.
              </p>
              
              <!-- Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="background-color: #0D7377;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                This link will expire in 24 hours.
              </p>
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Zero Hero - Your path to financial freedom
              </p>
              <p style="color: #9CA3AF; font-size: 12px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                This is an automated message. Please do not reply.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 3. Magic Link

**Subject:** `Your Zero Hero sign-in link`

**Dashboard Location:** Authentication → Email Templates → Magic link

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Sign in to Zero Hero</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    Sign in to Zero Hero
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0D7377; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Zero Hero
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Sign in to your account
              </h2>
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Click the button below to sign in to your Zero Hero account. No password needed.
              </p>
              
              <!-- Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="background-color: #0D7377;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Sign In
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                This link will expire in 1 hour.
              </p>
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                If you didn't request this link, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Zero Hero - Your path to financial freedom
              </p>
              <p style="color: #9CA3AF; font-size: 12px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                This is an automated message. Please do not reply.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 4. Change Email Address

**Subject:** `Confirm your new email address`

**Dashboard Location:** Authentication → Email Templates → Change email address

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Confirm email change</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    Confirm your email address change for Zero Hero
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0D7377; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Zero Hero
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Confirm your new email
              </h2>
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                You requested to change your email address. Click the button below to confirm this change.
              </p>
              
              <!-- Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="background-color: #0D7377;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Confirm New Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                If you didn't request this change, please contact support immediately.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Zero Hero - Your path to financial freedom
              </p>
              <p style="color: #9CA3AF; font-size: 12px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                This is an automated message. Please do not reply.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Testing Checklist

Before deploying email template changes, verify across these clients:

### Desktop Clients
- [ ] Gmail (web) - Check Primary vs Promotions tab
- [ ] Outlook (desktop & web)
- [ ] Apple Mail
- [ ] Yahoo Mail

### Mobile Clients
- [ ] iOS Mail app
- [ ] Gmail app (iOS & Android)
- [ ] Outlook app

### Spam Testing Tools
- [ ] [Mail Tester](https://www.mail-tester.com/) - Score should be 9+/10
- [ ] [Litmus](https://www.litmus.com/) - Preview across 90+ clients
- [ ] Send test to personal Gmail account

### Validation Checks
- [ ] All links work correctly
- [ ] Button is tappable on mobile (min 44px height)
- [ ] Text is readable without images loaded
- [ ] Footer displays correctly
- [ ] No broken layouts at 320px width

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-18 | Initial documentation created | AI |

---

*Last updated: January 2026*
