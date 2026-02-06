# Task Breakdown: Add Recipe to Shopping List

## Overview
Total Tasks: 24 sub-tasks across 4 task groups

## Summary
Enable users to add/remove recipe ingredients to/from the shopping list via a toggle button on RecipeCard (list/grid views) and recipe detail view. The button replaces the existing favorite/heart button and provides visual feedback through state changes and toast notifications.

## Task List

### Service Layer

#### Task Group 1: Service Methods and Custom Hook
**Dependencies:** None

- [x] 1.0 Complete service layer and custom hook
  - [x] 1.1 Write 4-6 focused tests for service and hook functionality
    - Test `isRecipeInShoppingList()` returns true when recipe items exist
    - Test `isRecipeInShoppingList()` returns false when no items exist
    - Test `addRecipeToShoppingList()` creates shopping list items from recipe ingredients
    - Test `addRecipeToShoppingList()` aggregates with existing items
    - Test hook `toggleShoppingList()` adds ingredients when not in list
    - Test hook `toggleShoppingList()` removes ingredients when in list
  - [x] 1.2 Add `isRecipeInShoppingList()` method to `ShoppingListService`
    - Location: `lib/db/services/shopping-list-service.ts`
    - Returns boolean indicating if any items exist for given recipeId
    - Reuse existing `getShoppingItemsByRecipe()` internally
  - [x] 1.3 Add `addRecipeToShoppingList()` method to `ShoppingListGenerator`
    - Location: `lib/services/shopping-list-generator.ts`
    - Parameters: `recipe: Recipe`
    - Use `createShoppingListInputsFromRecipes()` from `lib/services/ingredient-aggregator.ts`
    - Handle aggregation with existing shopping list items (check by normalized name)
    - Store `recipeId` on created items for removal tracking
  - [x] 1.4 Create `use-recipe-shopping-list.ts` custom hook
    - Location: `lib/hooks/use-recipe-shopping-list.ts`
    - Parameters: `recipeId: string`, `recipeName: string`
    - Returns: `{ isInShoppingList: boolean, isLoading: boolean, toggleShoppingList: () => Promise<void> }`
    - Subscribe to shopping list context for reactive updates
    - Implement optimistic UI updates
    - Call `useToast()` for success/error notifications
    - Messages: "Added [recipe name] to shopping list" / "Removed [recipe name] from shopping list"
  - [x] 1.5 Ensure service layer tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify service methods work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- `isRecipeInShoppingList()` correctly detects recipe presence
- `addRecipeToShoppingList()` creates properly aggregated items
- Custom hook manages toggle state and loading correctly
- Toast notifications fire on add/remove

### UI Components - RecipeCard

#### Task Group 2: RecipeCard Button Modification
**Dependencies:** Task Group 1

- [x] 2.0 Complete RecipeCard toggle button
  - [x] 2.1 Write 3-5 focused tests for RecipeCard shopping list button
    - Test button renders with cart icon (not heart icon)
    - Test button shows "in list" state when `isInShoppingList` is true
    - Test button shows "not in list" state when `isInShoppingList` is false
    - Test button triggers `toggleShoppingList()` on press
    - Test loading state disables button interaction
  - [x] 2.2 Update RecipeCard props interface
    - Location: `components/recipes/RecipeCard.tsx`
    - Remove favorite-related state and handlers
    - Component will use hook internally (pass recipe.id)
  - [x] 2.3 Replace heart button with shopping list toggle button (list variant)
    - Replace icon from "heart" to "cart" / "cart-outline"
    - Update `onPress` to call `toggleShoppingList()` from hook
    - Update accessibility labels: "Add to shopping list" / "Remove from shopping list"
    - Style: Keep existing `listFavoriteButton` positioning and dimensions
    - Color states: Use `#007AFF` (primary) for "in list", `#8E8E93` for "not in list"
  - [x] 2.4 Replace heart button with shopping list toggle button (grid variant)
    - Same changes as list variant
    - Use existing `gridFavoriteButton` styling
    - Ensure icon size appropriate for grid (currently 16px)
  - [x] 2.5 Add loading state indicator
    - Show ActivityIndicator when `isLoading` is true
    - Disable button press during loading
  - [x] 2.6 Ensure RecipeCard tests pass
    - Run ONLY the 3-5 tests written in 2.1
    - Verify button renders and functions correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 2.1 pass
- Heart button replaced with cart icon in both variants
- Button visual state correctly reflects shopping list status
- Tapping button triggers toggle functionality
- Loading state shows spinner and disables interaction

### UI Components - Recipe Detail View

#### Task Group 3: Recipe Detail View Button
**Dependencies:** Task Group 1

- [x] 3.0 Complete recipe detail view toggle button
  - [x] 3.1 Write 3-5 focused tests for detail view shopping list button
    - Test sticky button renders at top-right position
    - Test button shows correct state based on shopping list
    - Test button triggers toggle on press
    - Test button remains visible when scrolling (sticky behavior)
    - Test toast notification appears on add/remove
  - [x] 3.2 Add sticky shopping list toggle button
    - Location: `app/recipe/[id].tsx`
    - Position: Absolute top-right, outside ScrollView
    - Use `position: 'absolute'` with `top` and `right` values
    - Ensure button overlays content and stays fixed
    - Use same hook `useRecipeShoppingList` with recipe.id and recipe.title
  - [x] 3.3 Style the sticky button
    - Match existing action button styling patterns
    - Button size: 44x44 minimum touch target
    - Background: White with shadow for visibility over content
    - Border radius: Circular (22px)
    - Icon: "cart" / "cart-outline" based on state
    - Color states: `#007AFF` for "in list", `#8E8E93` for "not in list"
  - [x] 3.4 Handle scroll visibility
    - Button must remain visible above scrolling content
    - Consider z-index and elevation for proper layering
    - Test with and without recipe image
  - [x] 3.5 Integrate with existing Toast component
    - Toast already exists in detail view
    - Hook will call `useToast()` from context
    - Ensure ToastProvider wraps the app (verify in _layout.tsx)
  - [x] 3.6 Ensure detail view tests pass
    - Run ONLY the 3-5 tests written in 3.1
    - Verify sticky button renders and functions correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 3.1 pass
- Sticky button renders at top-right of screen
- Button stays fixed when content scrolls
- Toggle functionality works correctly
- Toast notifications appear for add/remove actions

### Testing & Integration

#### Task Group 4: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 4-6 tests written for service layer (Task 1.1)
    - Review the 3-5 tests written for RecipeCard (Task 2.1)
    - Review the 3-5 tests written for detail view (Task 3.1)
    - Total existing tests: approximately 10-16 tests
  - [x] 4.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to add-recipe-to-shopping-list feature
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows: add flow, remove flow, aggregation
  - [x] 4.3 Write up to 8 additional strategic tests maximum
    - End-to-end: Add recipe from RecipeCard, verify items in shopping list
    - End-to-end: Remove recipe from detail view, verify items removed
    - Integration: Multiple recipes with same ingredient aggregate correctly
    - Integration: Hook state updates when shopping list context changes
    - Edge case: Add recipe with no ingredients (should show appropriate toast)
    - Edge case: Toggle rapidly (debounce/loading state prevents issues)
    - Focus on integration points between service, hook, and UI
    - Skip redundant unit tests, accessibility tests, and performance tests
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to this feature (tests from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 18-24 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 18-24 tests total)
- Critical user workflows covered: add, remove, toggle, aggregation
- No more than 8 additional tests added when filling gaps
- Testing focused exclusively on add-recipe-to-shopping-list feature

## Execution Order

Recommended implementation sequence:
1. **Service Layer (Task Group 1)** - Foundation for all UI work
   - Must complete first as UI components depend on service methods and hook
2. **RecipeCard Modification (Task Group 2)** - Can start after Group 1
   - Primary user interaction point in list/grid views
3. **Recipe Detail View (Task Group 3)** - Can run in parallel with Group 2
   - Secondary interaction point, uses same hook
4. **Test Review & Integration (Task Group 4)** - After Groups 1-3
   - Validates complete feature works end-to-end

## Files to Create/Modify

### New Files
- `lib/hooks/use-recipe-shopping-list.ts` - Custom hook for toggle state management

### Modified Files
- `lib/db/services/shopping-list-service.ts` - Add `isRecipeInShoppingList()` method
- `lib/services/shopping-list-generator.ts` - Add `addRecipeToShoppingList()` method
- `components/recipes/RecipeCard.tsx` - Replace heart button with cart toggle
- `app/recipe/[id].tsx` - Add sticky shopping list toggle button

### Test Files
- `lib/hooks/__tests__/use-recipe-shopping-list.test.ts`
- `lib/db/services/__tests__/shopping-list-service.test.ts` (extend existing)
- `components/recipes/__tests__/RecipeCard.test.tsx`
- `app/recipe/__tests__/recipe-detail.test.tsx`

## Technical Notes

### Existing Code to Leverage
- `shoppingListService.getShoppingItemsByRecipe(recipeId)` - Already exists for state detection
- `shoppingListService.deleteByRecipeId(recipeId)` - Already exists for removal
- `createShoppingListInputsFromRecipes()` - Aggregation logic in `ingredient-aggregator.ts`
- `useShoppingList()` context - Provides `refreshList()` for state sync
- `useToast()` hook - Global toast notifications

### Aggregation Strategy
When adding a recipe:
1. Get existing shopping list items
2. For each recipe ingredient, check if matching item exists (by normalized name)
3. If exists and units compatible: use `aggregateQuantities()` to combine
4. If exists but units incompatible: create separate item
5. If not exists: create new item with recipeId

### State Management
- Hook subscribes to shopping list context
- `isInShoppingList` derived from checking if items with recipeId exist
- Optimistic UI: Update local state immediately, revert on error
- Context `refreshList()` called after database operations
