# Specification: Add Recipe to Shopping List

## Goal

Enable users to quickly add all ingredients from a recipe to the shopping list via a toggle button on both the recipe card (list view) and recipe detail view, with automatic ingredient aggregation.

## User Stories

- As a user, I want to tap a button on a recipe card to add all its ingredients to my shopping list so that I can quickly plan what to buy.
- As a user, I want to see the button state reflect whether the recipe's ingredients are already in my shopping list so that I know the current status.
- As a user, I want to tap the button again to remove those ingredients from my shopping list so that I can easily undo the action.
- As a user, I want to receive a toast notification confirming when ingredients are added or removed so that I have feedback on my action.
- As a user, I want the ingredients to be aggregated with existing items (e.g., "2 eggs" + "3 eggs" = "5 eggs") so that my shopping list stays organized.

## Core Requirements

- Toggle button replaces the existing favorite/heart button on RecipeCard
- Toggle button positioned at top-right of recipe detail screen (sticky when scrolling)
- Button adds ALL ingredients from the recipe at once
- Button removes ALL recipe ingredients when toggled off
- Ingredient quantities aggregate with existing shopping list items
- Toast notification confirms add/remove actions
- Button visual state indicates whether recipe is in shopping list

## Visual Design

No mockups provided. Follow existing UI patterns:

- RecipeCard: Replace heart button (currently at `styles.listFavoriteButton` / `styles.gridFavoriteButton`)
- Detail View: Sticky button at top-right, similar to existing action button styling
- Icon suggestions: `cart-outline` (not in list) / `cart` (in list) or similar shopping icon
- Color states: Match existing primary color (#007AFF) for "in list" state

## Reusable Components

### Existing Code to Leverage

**Services:**
- `lib/db/services/shopping-list-service.ts` - `getShoppingItemsByRecipe()`, `deleteByRecipeId()`, `createBulk()`
- `lib/services/shopping-list-generator.ts` - `generateFromQueue()`, ingredient processing logic
- `lib/services/ingredient-aggregator.ts` - `createShoppingListInputsFromRecipes()` for aggregation

**Utilities:**
- `lib/utils/ingredient-normalizer.ts` - `normalizeIngredientName()` for matching
- `lib/utils/unit-converter.ts` - `aggregateQuantities()` for combining amounts
- `lib/utils/category-classifier.ts` - `classifyIngredient()` for categorization

**Contexts:**
- `lib/contexts/shopping-list-context.tsx` - `useShoppingList()` hook, `refreshList()` method

**UI Components:**
- `components/ui/Toast.tsx` - `useToast()` hook for notifications
- `components/recipes/RecipeCard.tsx` - Base component to modify (replace heart button)
- `app/recipe/[id].tsx` - Detail screen to add sticky button

### New Components Required

**New Hook:**
- `lib/hooks/use-recipe-shopping-list.ts` - Custom hook to manage recipe-to-shopping-list toggle state
  - Needed because the toggle logic requires checking if a recipe's ingredients exist in shopping list and handling add/remove operations
  - Should encapsulate state checking, add, and remove logic for reuse in both RecipeCard and detail view

**New Service Method (extend existing):**
- Add `addRecipeToShoppingList(recipe: Recipe)` method to `ShoppingListGenerator`
- Add `isRecipeInShoppingList(recipeId: string)` method to `ShoppingListService`
  - These specialized methods simplify the toggle operation and state detection

## Technical Approach

### State Detection
- Query shopping list items by `recipeId` to determine if recipe is already added
- Use `shoppingListService.getShoppingItemsByRecipe(recipeId)` - returns items if recipe is in list

### Adding Ingredients
1. Get recipe with ingredients from `recipeService.getRecipeById()`
2. Use `createShoppingListInputsFromRecipes()` to prepare aggregated inputs
3. For each input, check if similar item exists in shopping list (by normalized name)
4. If exists with compatible units, update quantity; otherwise create new item
5. Store `recipeId` on items to enable removal tracking

### Removing Ingredients
1. Call `shoppingListService.deleteByRecipeId(recipeId)`
2. Refresh shopping list context

### Button State Management
- Hook provides: `isInShoppingList`, `isLoading`, `toggleShoppingList()`
- State updates reactively when shopping list changes (subscribe to context)

### Toast Integration
- Use existing `useToast()` hook from `components/ui/Toast.tsx`
- Messages: "Added [recipe name] ingredients to shopping list" / "Removed [recipe name] ingredients from shopping list"

### RecipeCard Modification
- Replace `onPress` handler for heart button with shopping list toggle
- Update icon from "heart" to cart-related icon
- Update accessibility labels accordingly
- Pass `recipeId` to hook for state management

### Detail View Modification
- Add sticky header with toggle button using `position: 'absolute'` or similar
- Ensure button remains visible during scroll
- Use same hook as RecipeCard for consistent behavior

## Out of Scope

- Servings adjustment before adding (use recipe defaults)
- Partial ingredient selection (all or nothing)
- Meal plan integration modifications
- Navigation to shopping list after adding
- Favorite functionality (completely replaced, not moved)

## Success Criteria

- Button correctly reflects shopping list state on initial render
- Tapping button adds all recipe ingredients to shopping list
- Tapping again removes all recipe ingredients from shopping list
- Ingredients aggregate correctly with existing items (e.g., eggs combine)
- Toast notifications appear for both add and remove actions
- Button state updates immediately (optimistic UI)
- Detail view button remains visible when scrolling
- No impact on existing meal plan shopping list integration
