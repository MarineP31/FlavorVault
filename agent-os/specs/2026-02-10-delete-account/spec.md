# Specification: Delete Account

## Goal
Allow users to permanently delete their account and all associated data from the profile screen. Required by Google Play Store policy for apps with account creation.

## User Stories
- As a user, I want to delete my account so that all my personal data is permanently removed
- As a user, I want to be warned before deletion so that I don't accidentally lose my data
- As a user, I want deletion to be thorough so that no orphaned data remains in the system

## Core Requirements
- "Danger Zone" section at the bottom of the profile screen with a "Delete Account" button
- Double confirmation via native `Alert.alert()` before proceeding
- Server-side account deletion via Supabase RPC function (service_role key must NOT be in client)
- All user data cascades automatically via existing `ON DELETE CASCADE` constraints
- Storage images cleaned up manually (Storage doesn't cascade)
- On success: sign out and redirect to login screen
- On error: show toast with error message
- Loading state on button during deletion

## Visual Design
No mockups provided. Follow existing profile screen patterns:

```
┌─────────────────────────────┐
│ 👤 Account                  │  ← Existing section
│ Email: user@example.com     │
├─────────────────────────────┤
│ [Change Password]           │  ← Existing
│ [Sign Out]                  │  ← Existing
├─────────────────────────────┤
│ ⚠️ Danger Zone              │  ← New section (red border)
│ [🗑 Delete Account]         │  ← Red text, trash icon
└─────────────────────────────┘
```

- Danger Zone section has a red border (`#FCA5A5` light / `#7F1D1D` dark)
- Warning icon and "Danger Zone" title in red (`#EF4444`)
- Delete Account button with trash icon, red text
- Same action button layout as Change Password / Sign Out

## Reusable Components

### Existing Code to Leverage
- **Profile screen**: `app/(tabs)/profile.tsx` — existing section/button patterns to follow
- **Auth context**: `lib/auth/auth-context.tsx` — existing `useCallback` + `{ error }` return pattern
- **Toast**: `components/ui/Toast.tsx` — `showToast()` for error feedback
- **Alert**: React Native `Alert.alert()` — same pattern as sign-out confirmation

### New Components Required
None — the feature is contained within existing files.

## Technical Approach

### Architecture Decision
Supabase's `auth.admin.deleteUser()` requires the **service_role key** which must never be in the client app. The solution is a **Supabase Database Function (RPC)** that runs server-side with `SECURITY DEFINER` privileges.

### Data Cascade
All tables already have `ON DELETE CASCADE` on `user_id → auth.users(id)`:
- `recipes` — cascades
- `meal_plans` — cascades
- `shopping_list_items` — cascades
- `custom_categories` — cascades
- `recipe_tags` — cascades

### Storage Cleanup
Images in `recipe-images/{userId}/` must be deleted manually since Supabase Storage doesn't cascade. The RPC function deletes from `storage.objects` directly.

### RPC Function (`delete_user_account`)
- `SECURITY DEFINER` — executes with elevated privileges
- `SET search_path = public` — security best practice
- Scoped to `auth.uid()` — can only delete the calling user
- Deletes storage objects first, then auth user

### Client Flow
1. User taps "Delete Account"
2. First `Alert.alert`: warns about permanent data loss
3. Second `Alert.alert`: "Delete Forever" final confirmation
4. Call `supabase.rpc('delete_user_account')`
5. On success: `supabase.auth.signOut()` → redirect to login
6. On error: show toast

## Out of Scope
- Data export before deletion
- Soft delete / grace period
- Account recovery after deletion
- Email confirmation of deletion
- Deleting only specific data (partial deletion)

## Success Criteria
- SQL function compiles and can be run in Supabase SQL Editor
- "Danger Zone" section visible at bottom of profile screen
- Double confirmation prevents accidental deletion
- Account deletion removes all user data (recipes, meal plans, shopping list, categories, tags)
- Storage images cleaned up
- User redirected to login after successful deletion
- Error toast shown if deletion fails
- Loading state visible during deletion
- Dark mode styling consistent
