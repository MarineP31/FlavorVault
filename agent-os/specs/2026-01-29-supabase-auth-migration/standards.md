# Supabase Standards for Recipe Keeper V2

## Client Configuration

```typescript
// lib/supabase/client.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Database Conventions

### Table Naming
- Use snake_case for table and column names
- Match existing SQLite naming where possible

### User Scoping
- All user-owned tables include `user_id UUID REFERENCES auth.users(id)`
- All queries filter by authenticated user's ID
- RLS policies enforce this at database level

### Timestamps
- Use ISO 8601 strings for consistency with existing code
- `created_at`, `updated_at`, `deleted_at` columns

## Row-Level Security (RLS)

All tables must have RLS enabled with policies:

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policy template
CREATE POLICY "Users can manage own data"
ON table_name
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

## Error Handling

```typescript
// Standard error handling pattern
try {
  const { data, error } = await supabase
    .from('recipes')
    .select('*');

  if (error) {
    throw new DatabaseError(error.code, error.message);
  }

  return data;
} catch (error) {
  // Handle network errors, etc.
  throw new DatabaseError('NETWORK_ERROR', 'Failed to connect to server');
}
```

## Auth Patterns

### Getting Current User
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('Not authenticated');
```

### Auth State Subscription
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth state changes
});
```

## Query Patterns

### Basic CRUD
```typescript
// Create
const { data, error } = await supabase
  .from('recipes')
  .insert({ ...recipe, user_id: user.id })
  .select()
  .single();

// Read
const { data, error } = await supabase
  .from('recipes')
  .select('*')
  .eq('user_id', user.id)
  .is('deleted_at', null);

// Update
const { data, error } = await supabase
  .from('recipes')
  .update({ title: 'New Title' })
  .eq('id', recipeId)
  .eq('user_id', user.id);

// Delete (soft)
const { error } = await supabase
  .from('recipes')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', recipeId);
```

### Joins
```typescript
// Get meal plans with recipe details
const { data, error } = await supabase
  .from('meal_plans')
  .select(`
    *,
    recipes (
      title,
      image_uri,
      servings
    )
  `)
  .eq('user_id', user.id);
```

## Type Generation

Generate TypeScript types from Supabase schema:

```bash
npx supabase gen types typescript --project-id "your-project-id" > lib/supabase/database.types.ts
```

## Environment Variables

Required in `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Never commit actual values. Use `.env.example` as template.
