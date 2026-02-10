# Task Breakdown: Delete Account

## Overview
Total Tasks: 9

This feature adds a "Delete Account" option to the profile screen, backed by a Supabase RPC function that securely deletes the user's account and all associated data server-side.

## Task List

### Database Layer

#### Task Group 1: Supabase RPC Function
**Dependencies:** None

- [x] 1.0 Complete RPC function for account deletion
  - [x] 1.1 Add `delete_user_account()` function to `lib/supabase/schema.sql`
    - `SECURITY DEFINER` to execute with elevated privileges
    - `SET search_path = public` for security
    - Guard: `RAISE EXCEPTION` if `auth.uid()` is NULL
    - Delete from `storage.objects` (wrapped in BEGIN/EXCEPTION to not block account deletion if storage fails)
    - Delete from `auth.users` where `id = auth.uid()` (cascades to all tables)
  - [x] 1.2 Verify SQL syntax is valid
    - Ensure function compiles (user runs in Supabase SQL Editor)

**Acceptance Criteria:**
- Function uses `SECURITY DEFINER` with restricted `search_path`
- Only deletes the calling user (scoped to `auth.uid()`)
- Cleans up storage objects before deleting auth user
- All user data cascades via existing `ON DELETE CASCADE`

### Auth Context Layer

#### Task Group 2: Add deleteAccount to Auth Context
**Dependencies:** Task Group 1

- [x] 2.0 Complete auth context integration
  - [x] 2.1 Add `deleteAccount` to `AuthContextType` interface
    - Signature: `deleteAccount: () => Promise<{ error: Error | null }>`
  - [x] 2.2 Implement `deleteAccount` method in `AuthProvider`
    - Call `supabase.rpc('delete_user_account')`
    - On success: call `supabase.auth.signOut()`
    - Return `{ error }` following existing pattern
    - Wrap in `useCallback` like other auth methods
  - [x] 2.3 Add `deleteAccount` to context value and useMemo dependencies

**Acceptance Criteria:**
- `deleteAccount` available via `useAuth()` hook
- Calls RPC then signs out on success
- Returns error object on failure
- Follows existing auth context patterns (`useCallback`, `{ error }` return)

### UI Layer

#### Task Group 3: Profile Screen — Delete Account UI
**Dependencies:** Task Group 2

- [x] 3.0 Complete delete account UI on profile screen
  - [x] 3.1 Add `isDeletingAccount` loading state
  - [x] 3.2 Implement `confirmDeleteAccount` with double confirmation
    - First alert: warns about permanent data loss, "Delete Account" destructive button
    - Second alert: "Delete Forever" final confirmation
    - Uses `Alert.alert()` matching existing `confirmSignOut` pattern
  - [x] 3.3 Implement `handleDeleteAccount` async handler
    - Set loading state
    - Call `deleteAccount()` from auth context
    - On error: show toast, reset loading
    - On success: redirect to `/(auth)/login`
  - [x] 3.4 Add themed styles for Danger Zone section
    - Red border: `#FCA5A5` (light) / `#7F1D1D` (dark)
    - Red section header border
  - [x] 3.5 Add Danger Zone section to render tree
    - Position after existing settings section
    - Warning icon + "Danger Zone" title in red
    - Delete Account button with trash icon, red text
    - Loading spinner during deletion
    - Same `actionButton` layout as other buttons

**Acceptance Criteria:**
- "Danger Zone" section visible at bottom of profile screen
- Red border distinguishes it from other sections
- Double confirmation prevents accidental deletion
- Loading spinner shown during deletion
- Toast on error, redirect to login on success
- Dark mode styling consistent

### Verification

#### Task Group 4: Manual Verification
**Dependencies:** Task Groups 1-3

- [ ] 4.0 Verify the feature end-to-end
  - [ ] 4.1 Run SQL function in Supabase SQL Editor
    - Paste the `delete_user_account()` function from `schema.sql`
    - Verify it creates without errors
  - [ ] 4.2 Visual verification on profile screen
    - Open profile tab
    - Verify Danger Zone section renders at bottom
    - Verify dark mode styling
  - [ ] 4.3 Test deletion flow
    - Tap "Delete Account" → first confirmation appears
    - Tap "Delete Account" → second confirmation appears
    - Tap "Delete Forever" → loading state → redirect to login
    - Verify account no longer exists in Supabase Auth dashboard
    - Verify user data removed from all tables
    - Verify storage images removed

**Acceptance Criteria:**
- SQL function deploys without errors
- UI renders correctly in light and dark mode
- Full deletion flow works: tap → confirm × 2 → deleted → login screen
- No orphaned data in any table or storage bucket

## Execution Order

Recommended implementation sequence:
1. **Task Group 1: RPC Function** — Database foundation
2. **Task Group 2: Auth Context** — Client-side bridge to RPC
3. **Task Group 3: Profile UI** — User-facing feature
4. **Task Group 4: Manual Verification** — End-to-end validation

## Files Modified

### Modified Files
- `lib/supabase/schema.sql` — Add `delete_user_account()` RPC function
- `lib/auth/auth-context.tsx` — Add `deleteAccount` method
- `app/(tabs)/profile.tsx` — Add Danger Zone section with delete button

### No New Files
Feature is fully contained within existing files.

## Key Design Decisions

1. **RPC over Edge Function** — Simpler deployment, no additional infrastructure, same security via `SECURITY DEFINER`
2. **Double confirmation** — Prevents accidental deletion of irreversible action
3. **No soft delete** — Clean permanent deletion, simpler implementation
4. **Storage cleanup in SQL** — Direct `storage.objects` delete avoids needing Storage API credentials in client
5. **Sign out after delete** — Clears local session state after server-side deletion
6. **Storage cleanup is non-blocking** — Wrapped in BEGIN/EXCEPTION so storage errors don't prevent account deletion
