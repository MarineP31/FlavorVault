# Task Breakdown: Meal Plan Queue

## Overview
Total Tasks: 14

This feature implements a simple recipe queue display that shows queued recipes in a compact list format with shopping list integration. The implementation leverages existing database services (`mealPlanService`) and shopping list context.

## Task List

### Hook & State Management

#### Task Group 1: useMealPlanQueue Hook
**Dependencies:** None

- [x] 1.0 Complete meal plan queue hook
  - [x] 1.1 Write 3-5 focused tests for useMealPlanQueue hook
    - Test fetching queued recipes returns correct data structure
    - Test removeRecipe calls correct services and updates state
    - Test clearAll removes all recipes and syncs shopping list
    - Test loading and error states
  - [x] 1.2 Create `useMealPlanQueue` hook in `lib/hooks/use-meal-plan-queue.ts`
    - State: `queuedRecipes: MealPlanWithRecipe[]`, `isLoading`, `error`
    - Fetch using `mealPlanService.getMealPlansWithRecipe()` with 30-day date range
    - Deduplicate recipes by recipeId (same recipe may appear multiple times)
    - Expose `removeRecipe(recipeId)`, `clearAll()`, `refresh()` functions
  - [x] 1.3 Implement `removeRecipe` function
    - Call `mealPlanService.deleteMealPlansByRecipe(recipeId)`
    - Call `shoppingListService.deleteByRecipeId(recipeId)` to sync shopping list
    - Update local state optimistically then refresh
    - Use `useShoppingList().handleRecipeRemovedFromQueue()` for debounced regeneration
  - [x] 1.4 Implement `clearAll` function
    - Get all unique recipe IDs from queue
    - Batch delete all meal plans using `deleteMealPlansBatch()`
    - Trigger shopping list regeneration via context
    - Clear local state
  - [x] 1.5 Ensure hook tests pass
    - Run ONLY the 3-5 tests written in 1.1
    - Verify data fetching and state management works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 1.1 pass
- Hook fetches and returns queued recipes with recipe details
- Remove and clear operations sync with shopping list
- Loading and error states handled correctly

### UI Components

#### Task Group 2: MealPlanQueueItem Component
**Dependencies:** Task Group 1

- [x] 2.0 Complete queue item component
  - [x] 2.1 Write 3-4 focused tests for MealPlanQueueItem
    - Test renders recipe thumbnail, title, category, and cooking time
    - Test trash icon tap calls onRemove callback
    - Test item tap calls onPress callback for navigation
    - Test handles missing image gracefully (placeholder)
  - [x] 2.2 Create `MealPlanQueueItem` component in `components/meal-plan/MealPlanQueueItem.tsx`
    - Props: `item: MealPlanWithRecipe`, `onRemove: (recipeId: string) => void`, `onPress: () => void`
    - Layout: square thumbnail (~80x80, 8px border radius) | title + metadata | trash icon
    - Use `StyleSheet` consistent with `shopping-list.tsx` patterns
  - [x] 2.3 Style the component to match mockup
    - Thumbnail: 80x80, rounded corners (borderRadius: 8)
    - Title: bold, dark (#111827), fontSize: 16
    - Metadata: uppercase category + cooking time, gray (#6B7280), fontSize: 12
    - Format: "DINNER - 25 MINS" (category from mealType, time from recipePrepTime + recipeCookTime)
    - Trash icon: orange (#FF6B35), size 24, Ionicons "trash-outline"
    - Divider: #E5E7EB, 1px bottom border
    - Row padding: horizontal 16, vertical 12
  - [x] 2.4 Handle edge cases
    - Missing image: show placeholder (gray background with fork/knife icon)
    - Missing cooking time: show "- MINS" or omit time display
    - Long titles: truncate with ellipsis (numberOfLines={1})
  - [x] 2.5 Ensure component tests pass
    - Run ONLY the 3-4 tests written in 2.1
    - Verify rendering and interactions work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-4 tests written in 2.1 pass
- Component matches mockup design exactly
- Tap on item triggers navigation callback
- Tap on trash icon triggers remove callback
- Handles missing data gracefully

#### Task Group 3: MealPlanEmptyState Component
**Dependencies:** None

- [x] 3.0 Complete empty state component
  - [x] 3.1 Write 2-3 focused tests for MealPlanEmptyState
    - Test renders guacamole message text
    - Test "Add Recipes" button triggers onAddRecipes callback
    - Test accessibility labels present
  - [x] 3.2 Create `MealPlanEmptyState` component in `components/meal-plan/MealPlanEmptyState.tsx`
    - Props: `onAddRecipes: () => void`
    - Can extend or compose with existing `EmptyState` component
    - Message: "Holy guacamole! There are no recipes selected. Browse recipes to add to your meal plan"
  - [x] 3.3 Style the component
    - Center content vertically and horizontally
    - Icon: use food-related icon (e.g., "restaurant-outline" or "fast-food-outline")
    - Title style: bold, dark text
    - Message style: gray (#6B7280), centered
    - Button: full-width, peach background (#FFF5EB), orange text (#FF6B35), plus icon
  - [x] 3.4 Ensure component tests pass
    - Run ONLY the 2-3 tests written in 3.1
    - Verify rendering and button interaction work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-3 tests written in 3.1 pass
- Displays fun guacamole message
- "Add Recipes" button navigates to recipe list
- Styling matches app design system

### Screen Implementation

#### Task Group 4: MealPlanScreen Integration
**Dependencies:** Task Groups 1, 2, 3

- [x] 4.0 Complete meal plan screen
  - [x] 4.1 Write 4-6 focused tests for MealPlanScreen
    - Test renders header with "Meal Plan Queue" title and "Clear All" button
    - Test displays list of queued recipes using FlatList
    - Test shows empty state when no recipes queued
    - Test "Clear All" button calls clearAll and shows loading state
    - Test tapping recipe item navigates to recipe detail
    - Test "Add More Recipes" button navigates to Home tab
  - [x] 4.2 Replace placeholder `app/(tabs)/meal-plan.tsx` with full implementation
    - Import `useMealPlanQueue` hook
    - Import `MealPlanQueueItem` and `MealPlanEmptyState` components
    - Use `SafeAreaView` with `edges={['top']}`
    - Use `StyleSheet` consistent with `shopping-list.tsx`
  - [x] 4.3 Implement header section
    - Left: "Meal Plan Queue" title (fontSize: 28, fontWeight: 700, color: #111827)
    - Right: "Clear All" button (orange text #FF6B35, fontSize: 16)
    - Header style: white background, bottom border #E5E7EB
    - Match header pattern from `shopping-list.tsx`
  - [x] 4.4 Implement recipe list with FlatList
    - Data: queued recipes from `useMealPlanQueue`
    - RenderItem: `MealPlanQueueItem` component
    - ItemSeparatorComponent: 1px divider line
    - ListFooterComponent: "Add More Recipes" button
    - keyExtractor: use recipeId (deduplicated)
  - [x] 4.5 Implement "Add More Recipes" button
    - Full-width button below list
    - Style: peach background (#FFF5EB), orange text (#FF6B35)
    - Plus icon on left (Ionicons "add-circle-outline")
    - Text: "Add More Recipes"
    - Margin: horizontal 16, vertical spacing from list
    - onPress: `router.push('/(tabs)/')`
  - [x] 4.6 Implement navigation handlers
    - onItemPress: `router.push(\`/recipe/\${recipeId}\`)` to navigate to recipe detail
    - onAddRecipes: `router.push('/(tabs)/')` to navigate to Home tab
    - Import `useRouter` from `expo-router`
  - [x] 4.7 Handle loading and error states
    - Loading: show ActivityIndicator centered
    - Error: show error message with retry option (follow shopping-list.tsx pattern)
  - [x] 4.8 Ensure screen tests pass
    - Run ONLY the 4-6 tests written in 4.1
    - Verify screen renders correctly in all states
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 4.1 pass
- Screen matches mockup design
- Header displays title and Clear All button
- List shows queued recipes with correct layout
- Empty state shows when no recipes
- Navigation works to recipe detail and Home tab
- Remove and clear operations sync with shopping list

### Testing

#### Task Group 5: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-4

- [x] 5.0 Review existing tests and fill critical gaps only
  - [x] 5.1 Review tests from Task Groups 1-4
    - Review the 3-5 tests written for useMealPlanQueue hook (Task 1.1)
    - Review the 3-4 tests written for MealPlanQueueItem (Task 2.1)
    - Review the 2-3 tests written for MealPlanEmptyState (Task 3.1)
    - Review the 4-6 tests written for MealPlanScreen (Task 4.1)
    - Total existing tests: approximately 12-18 tests
  - [x] 5.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to meal plan queue feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows: add recipe -> view in queue -> remove -> verify shopping list sync
  - [x] 5.3 Write up to 8 additional strategic tests maximum
    - Integration test: removing recipe updates both meal plan and shopping list
    - Integration test: clear all updates both stores correctly
    - Edge case: handle empty recipe image gracefully
    - Edge case: handle recipe with no cooking time
    - User flow: navigate to recipe detail and back
    - Do NOT write comprehensive coverage for all scenarios
  - [x] 5.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, 4.1, and 5.3)
    - Expected total: approximately 20-26 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 20-26 tests total)
- Critical user workflows for this feature are covered
- No more than 8 additional tests added when filling in testing gaps
- Testing focused exclusively on meal plan queue feature requirements

## Execution Order

Recommended implementation sequence:
1. **Task Group 1: useMealPlanQueue Hook** - Foundation for data fetching and state management
2. **Task Group 3: MealPlanEmptyState Component** - Can be built in parallel with Task Group 2
3. **Task Group 2: MealPlanQueueItem Component** - Depends on understanding data shape from hook
4. **Task Group 4: MealPlanScreen Integration** - Combines all pieces into final screen
5. **Task Group 5: Test Review & Gap Analysis** - Final validation and coverage gaps

## Files to Create/Modify

### New Files
- `lib/hooks/use-meal-plan-queue.ts` - Hook for queue data and operations
- `components/meal-plan/MealPlanQueueItem.tsx` - List item component
- `components/meal-plan/MealPlanEmptyState.tsx` - Empty state component

### Modified Files
- `app/(tabs)/meal-plan.tsx` - Replace placeholder with full implementation

### Test Files
- `__tests__/hooks/use-meal-plan-queue.test.ts`
- `__tests__/components/meal-plan/MealPlanQueueItem.test.tsx`
- `__tests__/components/meal-plan/MealPlanEmptyState.test.tsx`
- `__tests__/screens/meal-plan.test.tsx`

## Key Design Decisions

1. **Use StyleSheet over NativeWind** - Consistent with `shopping-list.tsx` patterns in this codebase
2. **FlatList over SectionList** - No grouping/categorization needed for simple queue
3. **Deduplicate by recipeId** - Same recipe may have multiple meal plan entries; show once in queue
4. **Optimistic updates** - Remove items from UI immediately, then sync with database
5. **Shopping list sync** - Use existing `handleRecipeRemovedFromQueue()` for debounced regeneration
6. **No confirmation dialogs** - Per spec, remove actions are immediate

## Color Reference

| Element | Color | Hex |
|---------|-------|-----|
| Orange accent | Primary action color | #FF6B35 |
| Peach button bg | Add button background | #FFF5EB |
| Gray text | Metadata, secondary | #6B7280 |
| Dark text | Titles | #111827 |
| Divider | List separators | #E5E7EB |
| White | Screen background | #FFFFFF |
