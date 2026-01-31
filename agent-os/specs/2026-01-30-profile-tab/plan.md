# Profile Tab Feature - Implementation Plan

## Summary

Add a new "Profile" tab to the bottom navigation bar that allows users to view their account info, change password (via email reset), and sign out.

## Key Decisions

- Password change via email reset link (simpler, more secure)
- Profile tab as 5th tab in bottom navigation
- Match existing app styling (orange theme, card-based design)
- Use person icon for the tab

## Tasks

### Task 1: Add Profile Icon to IconSymbol
- **File:** `components/ui/IconSymbol.tsx`
- **Change:** Add icon mapping `'person.fill': 'person'`

### Task 2: Create Profile Screen
- **File:** `app/(tabs)/profile.tsx`
- **Features:**
  - Header with "Profile" title
  - User info section showing email
  - Settings section with Change Password and Sign Out buttons
  - Change Password sends reset email via Supabase
  - Sign Out calls signOut and redirects to login

### Task 3: Register Profile Tab
- **File:** `app/(tabs)/_layout.tsx`
- **Change:** Add new `Tabs.Screen` for profile tab

## Dependencies

Uses existing:
- `useAuth` hook from `lib/auth/auth-context.tsx`
- `useToast` hook from `components/ui/Toast`
- `useRouter` from `expo-router`

No new dependencies needed.

## Verification

1. Profile tab appears as 5th tab with person icon
2. Profile screen shows user's email
3. "Change Password" sends email and shows success toast
4. "Sign Out" logs out and redirects to login screen
5. Styling matches existing app design
