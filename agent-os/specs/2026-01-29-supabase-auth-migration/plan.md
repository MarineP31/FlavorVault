# Supabase Migration + Authentication Plan

## Summary

Migrate Recipe Keeper V2 from local SQLite to Supabase (Postgres) with Supabase Auth for user authentication. This enables multi-user support with cloud storage.

## Key Decisions

- Full migration to Supabase (no offline support needed)
- Supabase Auth for authentication (simpler than Better Auth for mobile)
- Email/password only (can add social login later)
- Users start fresh (no local data migration)
- Online-only operation

## Implementation Tasks

### Task 1: Supabase Project Setup
- Create `.env` with Supabase credentials
- Install dependencies: `@supabase/supabase-js`, `react-native-url-polyfill`
- Create `lib/supabase/client.ts`

### Task 2: Database Schema
Create Supabase tables with user_id foreign keys and RLS policies:
- `recipes` - with `user_id` foreign key
- `meal_plans` - with `user_id` foreign key
- `shopping_list_items` - with `user_id` foreign key
- `custom_categories` - with `user_id` foreign key
- `recipe_tags` - with `user_id` foreign key

### Task 3: Auth Context & Provider
- `lib/auth/auth-context.tsx` - AuthProvider with session management
- `lib/auth/use-auth.ts` - useAuth hook export
- Session persistence with AsyncStorage
- signUp, signIn, signOut methods

### Task 4: Auth Screens
- `app/(auth)/_layout.tsx` - Auth stack layout
- `app/(auth)/login.tsx` - Login screen
- `app/(auth)/signup.tsx` - Signup screen
- `app/(auth)/forgot-password.tsx` - Password reset

### Task 5: Update Root Layout
- Add AuthProvider to provider hierarchy
- Conditional rendering based on auth state
- Remove database initialization

### Task 6: Refactor Services
Convert all services from SQLite to Supabase:
- recipe-service.ts
- meal-plan-service.ts
- shopping-list-service.ts
- tag-service.ts

### Task 7: Update Context Providers
- shopping-list-context.tsx
- meal-plan-context.tsx

### Task 8: Cleanup
Delete old SQLite code:
- lib/db/connection.ts
- lib/db/init.ts
- lib/db/migrations/
- lib/db/seed/

## Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Dependencies

```json
{
  "@supabase/supabase-js": "^2.45.0",
  "react-native-url-polyfill": "^2.0.0"
}
```

## Verification Checklist

- [ ] Supabase project created with Email Auth enabled
- [ ] Environment variables configured
- [ ] Can create account and login
- [ ] Can create/read/update/delete recipes
- [ ] RLS working (users see only their data)
- [ ] Shopping list and meal plan features working
- [ ] Old SQLite code removed
- [ ] App works on fresh install
