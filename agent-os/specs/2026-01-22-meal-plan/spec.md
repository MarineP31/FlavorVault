# Specification: Meal Plan Queue

## Goal
Implement a simple recipe queue feature that displays selected recipes as a compact list and integrates with the shopping list for ingredient management.

## User Stories
- As a user, I want to see all recipes I've added to my meal plan as a compact list so I can review what I'm planning to cook
- As a user, I want to remove individual recipes from my meal plan so I can adjust my cooking plans
- As a user, I want to clear all recipes at once so I can start fresh
- As a user, I want removed recipes to automatically have their ingredients removed from my shopping list so my grocery list stays accurate
- As a user, I want to easily add more recipes to my meal plan by navigating to the recipe list

## Core Requirements
- Display compact list of queued recipes with thumbnail, title, category, and cooking time
- Remove individual recipe via orange trash icon (no confirmation dialog)
- Clear all recipes via header button
- Sync with shopping list: removing recipe removes its ingredients
- Navigate to recipe detail on item tap
- "Add More Recipes" button to navigate to Home tab
- Prevent duplicate recipes in queue (existing cart button logic already handles this)
- Fun empty state with guacamole message

## Visual Design
Mockup reference: `planning/visuals/meal-plan-screen.png`

### Key UI Elements
- **Header**: "Meal Plan Queue" title (bold, left) + "Clear All" button (orange text, right)
- **List Item Layout**:
  - Square thumbnail (rounded corners, ~80x80)
  - Recipe title (bold, dark)
  - Category + cooking time (gray, uppercase category, e.g., "DINNER - 25 MINS")
  - Orange trash icon on right
- **Add Button**: Full-width button with peach background (#FFF5EB), orange text, plus icon
- **Empty State**: Centered message "Holy guacamole! There are no recipes selected. Browse recipes to add to your meal plan"
- **Dividers**: Subtle gray lines between list items

### Color Values
- Orange accent: #FF6B35
- Peach button background: #FFF5EB
- Gray text (metadata): #6B7280
- White background: #FFFFFF
- Divider: #E5E7EB

## Reusable Components

### Existing Code to Leverage
- `EmptyState` component (`components/ui/EmptyState.tsx`) - for empty state display pattern
- `mealPlanService` (`lib/db/services/meal-plan-service.ts`) - has `getMealPlansWithRecipe()`, `deleteMealPlan()`, `deleteMealPlansByRecipe()` methods
- `MealPlanWithRecipe` type (`lib/db/schema/meal-plan.ts`) - includes recipe title, imageUri, prepTime, cookTime
- `useShoppingList` context (`lib/contexts/shopping-list-context.tsx`) - has `handleRecipeRemovedFromQueue()` for shopping list sync
- `shoppingListService.deleteByRecipeId()` - removes ingredients by recipe
- Existing tab navigation (`app/(tabs)/_layout.tsx`) - meal-plan tab already exists as placeholder
- Shopping list screen header pattern (`app/(tabs)/shopping-list.tsx`) - similar header layout with title and action button
- `ShoppingListItemComponent` styling patterns - for compact list item styling reference

### New Components Required
- `MealPlanQueueItem` - Compact list item component for displaying queued recipe (different layout than existing RecipeCard)
- `MealPlanEmptyState` - Custom empty state with fun guacamole message and "Add More Recipes" action
- `useMealPlanQueue` hook - Fetch, remove, and clear operations specific to queue view

## Technical Approach
- Replace placeholder meal-plan.tsx screen with full implementation
- Use FlatList for recipe list (not SectionList since no categories/grouping needed)
- Fetch queued recipes using existing `mealPlanService.getMealPlansWithRecipe()` with date range covering future 30 days (current behavior)
- On remove: call `mealPlanService.deleteMealPlansByRecipe(recipeId)` then `shoppingListService.deleteByRecipeId(recipeId)` to sync both stores
- On clear all: batch delete all meal plans, regenerate shopping list
- Navigate to recipe detail via `router.push(\`/recipe/\${recipeId}\`)`
- Navigate to recipes via `router.push('/(tabs)/')`
- Use StyleSheet for styling (consistent with shopping-list.tsx patterns)

## Out of Scope
- Calendar/weekly view
- Meal types assignment (breakfast/lunch/dinner planning)
- Date scheduling
- Drag-to-reorder functionality
- Serving size adjustments per queue item
- Duplicate recipes in queue
- Confirmation dialogs for remove actions
- Pull-to-refresh (not needed since list auto-updates)

## Success Criteria
- User can view all queued recipes in compact list format
- User can remove individual recipe with single tap on trash icon
- User can clear all recipes with single tap on "Clear All" button
- Removing recipe immediately updates shopping list (ingredients removed)
- Empty state displays fun guacamole message with action to browse recipes
- List items match mockup design (thumbnail, title, category/time, trash icon)
- Navigation to recipe detail and recipe list works correctly
