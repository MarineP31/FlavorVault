# Profile Tab Feature - Shaping Notes

## Problem Statement

Users need a way to:
- View their account information
- Change their password
- Sign out of the app

## Approach

### Password Reset Strategy

**Decision:** Use email-based password reset instead of in-app password change form.

**Rationale:**
- Simpler implementation (no need for current password verification)
- More secure (email verification step)
- Consistent with Supabase auth patterns
- Less UI complexity (no multi-field form)

### Navigation Placement

**Decision:** Add as 5th tab in bottom navigation.

**Rationale:**
- Profile/account settings are commonly accessed via bottom nav
- Consistent with user expectations from other apps
- Easy access without deep navigation

### UI Design

**Decision:** Card-based sections matching existing app styling.

**Structure:**
```
┌─────────────────────────────┐
│ Profile                     │  ← Header
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 👤 Account              │ │  ← Section card
│ │ Email: user@example.com │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ⚙️ Settings             │ │  ← Section card
│ │ [Change Password]       │ │
│ │ [Sign Out]              │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## Technical Notes

- Uses `useAuth` hook for user data and auth actions
- Uses `useToast` for feedback on password reset
- Loading states for async operations
- Sign out redirects to `/(auth)/login`
