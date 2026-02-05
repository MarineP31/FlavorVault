# Recipe Repository UI

Complete implementation of the Recipe Repository browsing interface for FlavorVault.

## Overview

The Recipe Repository UI provides users with an intuitive interface to browse, search, and filter their recipe collection. It features grid and list view modes, real-time search, tag-based filtering, and smooth animations.

## Components

### Core Screen

**RecipeRepositoryScreen** - `RecipeRepositoryScreen.tsx`
- Main browsing interface
- Integrates all sub-components
- Manages global state with `useRecipes` hook
- Handles navigation to recipe details (TODO)
- Features:
  - Search by recipe name or ingredients
  - Tag-based filtering with counts
  - Grid/list view toggle
  - Pull-to-refresh
  - Infinite scroll pagination
  - Empty states for various scenarios
  - Loading indicators

### UI Components

**SearchBar** - `components/ui/SearchBar.tsx`
- Text input with search icon
- Clear button when text is entered
- Auto-capitalize disabled for better UX
- Themed for light/dark mode

**TagFilter** - `components/ui/TagFilter.tsx`
- Horizontal scrollable tag chips
- Shows recipe count per tag
- Active/inactive states
- Sorted by frequency (most popular first)

**ViewModeToggle** - `components/ui/ViewModeToggle.tsx`
- Toggle between grid and list views
- Icon-based buttons
- Persists preference via AsyncStorage

**EmptyState** - `components/ui/EmptyState.tsx`
- Displays friendly messages when no content
- Optional action button
- Custom icon support
- Used for:
  - No recipes in database
  - No search results
  - Empty filtered results
  - Error states

**FAB** - `components/ui/FAB.tsx`
- Floating Action Button for primary actions
- Positioned bottom-right
- Elevation/shadow for depth
- Currently navigates to "Add Recipe" (placeholder)

### Recipe Components

**RecipeCard** - `components/recipes/RecipeCard.tsx`
- Displays recipe information
- Two variants: grid and list
- Shows:
  - Recipe image or category icon
  - Title
  - Prep + cook time
  - Servings
  - Category
  - Tags (limited display)
- Responsive to theme changes

**RecipeGrid** - `components/recipes/RecipeGrid.tsx`
- Two-column grid layout
- FlatList-based with numColumns={2}
- Supports pull-to-refresh
- Infinite scroll with onEndReached

**RecipeList** - `components/recipes/RecipeList.tsx`
- Vertical list layout
- Larger cards with more information
- Supports pull-to-refresh
- Infinite scroll with onEndReached

### Custom Hooks

**useRecipes** - `lib/hooks/useRecipes.ts`
- Centralized recipe state management
- Features:
  - Load recipes from database
  - Real-time search filtering
  - Tag-based filtering
  - View mode persistence
  - Selected tags persistence
  - Pagination support (ready for implementation)
  - Error handling
- Returns:
  ```typescript
  {
    recipes: Recipe[];
    filteredRecipes: Recipe[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    selectedTags: string[];
    viewMode: 'grid' | 'list';
    page: number;
    hasMore: boolean;
    setSearchQuery: (query: string) => void;
    toggleTag: (tag: string) => void;
    clearFilters: () => void;
    setViewMode: (mode: ViewMode) => void;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
  }
  ```

## File Structure

```
components/
├── recipes/
│   ├── RecipeRepositoryScreen.tsx    # Main screen
│   ├── RecipeCard.tsx                # Base card component
│   ├── RecipeGrid.tsx                # Grid layout
│   ├── RecipeList.tsx                # List layout
│   └── README.md                     # This file
├── ui/
│   ├── SearchBar.tsx                 # Search input
│   ├── TagFilter.tsx                 # Tag chips
│   ├── ViewModeToggle.tsx            # View switcher
│   ├── EmptyState.tsx                # Empty messages
│   └── FAB.tsx                       # Floating button
lib/
├── hooks/
│   └── useRecipes.ts                 # Recipe state hook
└── db/
    ├── services/                     # Database services
    └── schema/                       # Type definitions
```

## Database Integration

The Recipe Repository UI is fully integrated with the SQLite database:

- Loads recipes on mount via `recipeService.getAllRecipes()`
- Filters happen in-memory for instant results
- Supports future server-side pagination
- Handles database errors gracefully

## State Management

### Local State
- Search query (controlled input)
- Selected tags (multi-select)
- View mode (grid/list)
- Loading/error states

### Persisted State (AsyncStorage)
- View mode preference
- Selected tags across app restarts

### Database State
- Recipe data loaded from SQLite
- Auto-seeded with 8 sample recipes on first launch

## Search & Filtering

### Search Algorithm
```typescript
// Searches in:
// 1. Recipe title
// 2. Ingredient names
const matchesSearch = (recipe: Recipe, query: string) => {
  const lowerQuery = query.toLowerCase();
  return (
    recipe.title.toLowerCase().includes(lowerQuery) ||
    recipe.ingredients.some(ing =>
      ing.name.toLowerCase().includes(lowerQuery)
    )
  );
};
```

### Tag Filtering
- Uses AND logic (all selected tags must match)
- Case-insensitive matching
- Tags displayed with recipe counts
- Sorted by popularity (most common first)

## Performance Optimizations

### Current Optimizations
1. **Memoized Callbacks**: `useCallback` for event handlers
2. **FlatList**: Native list virtualization
3. **Key Extractors**: Stable keys for list items
4. **Filtered Data**: Computed once, reused in layouts

### Planned Optimizations
- [ ] React.memo for RecipeCard
- [ ] useMemo for filtered recipes
- [ ] Image lazy loading
- [ ] Pagination with windowing

## Theme Support

All components support light and dark themes via `useColorScheme()`:

**Light Theme Colors:**
- Background: `#F2F2F7`
- Card: `#FFFFFF`
- Text Primary: `#000000`
- Text Secondary: `#8E8E93`
- Accent: `#007AFF`

**Dark Theme Colors:**
- Background: `#000000`
- Card: `#1C1C1E`
- Text Primary: `#FFFFFF`
- Text Secondary: `#8E8E93`
- Accent: `#007AFF`

## Navigation

### Current State
- Recipe card press shows Alert (placeholder)
- FAB shows Alert (placeholder)

### Future Implementation
```typescript
// To be implemented in next phase
const handleRecipePress = (recipe: Recipe) => {
  router.push(`/recipes/${recipe.id}`);
};

const handleAddRecipe = () => {
  router.push('/recipes/new');
};
```

## Testing

### Manual Testing Checklist
- [ ] Search by recipe title
- [ ] Search by ingredient name
- [ ] Select/deselect tags
- [ ] Clear filters button works
- [ ] Switch between grid/list views
- [ ] View mode persists on app restart
- [ ] Pull to refresh works
- [ ] Scroll to bottom (infinite scroll trigger)
- [ ] Empty states display correctly
- [ ] Dark mode works
- [ ] Light mode works
- [ ] FAB is visible and clickable
- [ ] Recipe cards display all information
- [ ] Images/placeholders render correctly

### Unit Tests (TODO)
- useRecipes hook functionality
- Search/filter logic
- Component rendering
- User interactions

## Known Limitations

1. **Images**: No recipe images in seed data (uses placeholder icons)
2. **Pagination**: Loads all recipes at once (future: windowed pagination)
3. **Navigation**: Placeholder alerts (next phase: full navigation)
4. **Offline**: No offline indicator yet
5. **Sync**: No sync status indicator

## Future Enhancements

### Phase 2: Recipe Details
- Navigate to full recipe view
- Edit recipe functionality
- Delete recipe with confirmation
- Share recipe

### Phase 3: Advanced Features
- Sort options (date, name, rating)
- Category filters
- Favorite recipes
- Recipe rating system
- Recent recipes list

### Phase 4: Performance
- Image caching
- Database query optimization
- Virtual scrolling for large datasets
- Progressive image loading

## Dependencies

### Required
- `@react-native-async-storage/async-storage`: Preference persistence
- `react-native-vector-icons`: Icon library
- `expo-router`: Navigation (ready for use)
- `react-native-safe-area-context`: Safe area handling

### Internal
- `@/lib/db`: Database services and types
- `@/lib/hooks/useRecipes`: Recipe state management

## Integration Guide

### Using RecipeRepositoryScreen

**In a tab navigator:**
```typescript
// app/(tabs)/index.tsx
export { RecipeRepositoryScreen as default } from '@/components/recipes/RecipeRepositoryScreen';
```

**Standalone:**
```typescript
import { RecipeRepositoryScreen } from '@/components/recipes/RecipeRepositoryScreen';

export default function RecipesScreen() {
  return <RecipeRepositoryScreen />;
}
```

### Customizing Components

**Custom empty state:**
```typescript
<RecipeGrid
  recipes={recipes}
  onRecipePress={handlePress}
  ListEmptyComponent={
    <EmptyState
      icon="pizza-outline"
      title="No pizzas found"
      message="Time to add some pizza recipes!"
    />
  }
/>
```

**Custom search placeholder:**
```typescript
<SearchBar
  value={query}
  onChangeText={setQuery}
  placeholder="Find your favorite dish..."
/>
```

## Troubleshooting

### "Module not found: @/lib/db"
Ensure tsconfig.json has path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Icons not displaying
Install vector icons types:
```bash
yarn add --dev @types/react-native-vector-icons
```

### Database not initializing
Check app/_layout.tsx has database initialization:
```typescript
useEffect(() => {
  initializeDatabase().then(() => setDbReady(true));
}, []);
```

### Search not working
Verify recipes are loaded:
```typescript
console.log('Recipes:', recipes.length);
console.log('Filtered:', filteredRecipes.length);
```

## Contributing

When adding new features to the Recipe Repository UI:

1. Follow existing component patterns
2. Support both grid and list variants
3. Handle light/dark themes
4. Add loading states
5. Include error handling
6. Update this README
7. Add TypeScript types
8. Write JSDoc comments

## License

Part of FlavorVault - Internal project documentation.
