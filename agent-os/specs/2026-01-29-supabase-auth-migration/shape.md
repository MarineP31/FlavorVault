# Shaping Notes: Supabase Migration

## Problem Statement

FlavorVault currently uses local SQLite storage, which limits the app to single-device use. Users want to:
- Access their recipes from multiple devices
- Share recipes with family members (future)
- Not lose data if they change devices

## Solution Approach

Migrate to Supabase which provides:
- PostgreSQL database with excellent mobile SDKs
- Built-in authentication (Supabase Auth)
- Row-Level Security for multi-user data isolation
- Real-time capabilities (future use)

## Key Trade-offs

### Why Supabase over alternatives?

| Option | Pros | Cons |
|--------|------|------|
| **Supabase** | Great mobile SDK, built-in auth, free tier | Lock-in to platform |
| Firebase | Mature, real-time | NoSQL, complex pricing |
| Better Auth | Flexible | Requires separate DB setup |
| Clerk | Great DX | Auth-only, still need DB |

**Decision:** Supabase provides both auth AND database in one solution, reducing complexity.

### Why no offline support?

- Significantly increases complexity
- Conflict resolution is hard
- Most users have consistent internet
- Can add later if needed

### Why email/password only initially?

- Simplest to implement
- Works on all devices
- Social login can be added later without schema changes

## Data Model Changes

### Current SQLite Schema
- `recipes` - standalone
- `meal_plans` - references recipes
- `shopping_list_items` - references recipes, meal_plans
- `custom_categories` - standalone
- `recipe_tags` - references recipes

### New Supabase Schema
All tables gain:
- `user_id UUID REFERENCES auth.users(id)` - required, no default
- RLS policies restricting access to owner

## Migration Strategy

**No data migration** - Users start fresh in Supabase.

Rationale:
- Simpler implementation
- No edge cases with corrupted local data
- Clean slate for multi-user support
- Most users have few recipes (MVP stage)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Network latency | Loading states, optimistic updates |
| Auth token expiry | Auto-refresh in auth context |
| Supabase outage | Error handling, user-friendly messages |
| Data loss | RLS ensures isolation, Supabase handles backups |

## Open Questions (Resolved)

1. ~~Should we keep SQLite as cache?~~ → No, full Supabase
2. ~~What auth providers?~~ → Email/password only for MVP
3. ~~How to handle existing users?~~ → Start fresh, no migration
