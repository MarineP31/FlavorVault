# Spec Requirements: Add Recipe to Shopping List

## Initial Description
The user wants to add a button on each recipe (both on the recipe list view and on the recipe detail view) to add the recipe's ingredients to the shopping list.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the button should add ALL ingredients from a recipe at once (rather than letting users select specific ingredients). Is that correct?
**Answer:** Yes, add all ingredients at once.

**Q2:** When adding ingredients to the shopping list, should quantities be aggregated with existing items? For example, if the shopping list already has "2 eggs" and the recipe needs "3 eggs," should it become "5 eggs"?
**Answer:** Yes, ingredients should be aggregated with existing items in the shopping list. User can modify how ingredients are aggregated and categorized.

**Q3:** For the recipe card in the list view, I'm thinking of adding a small icon button (like a cart or plus icon) in the corner. Should this replace the existing favorite/bookmark button, or appear alongside it?
**Answer:** Replace the existing heart/favorite button with "add to shopping list" button.

**Q4:** For the recipe detail view, should the "add to shopping list" button be positioned near the ingredients section, or at the top-right like the existing favorite icon?
**Answer:** Button should be positioned at top-right of the screen. Button should remain visible (sticky/fixed) when scrolling.

**Q5:** After adding ingredients, should we show a confirmation (like a toast notification) or navigate the user to the shopping list?
**Answer:** Toast notification confirms when ingredients are added (and when removed).

**Q6:** Should users be able to adjust servings before adding to shopping list (which would scale ingredient quantities), or just use the recipe's default servings?
**Answer:** No servings adjustment - use recipe default.

**Q7:** The meal plan feature can already add ingredients to the shopping list. Should this new button integrate with meal planning (e.g., mark recipe as planned), or be completely independent?
**Answer:** Completely independent from meal plan. Do not modify meal plan integration.

**Q8:** Is there anything that should explicitly NOT be part of this feature that I might incorrectly assume should be included?
**Answer:** Meal plan integration should not be modified. No partial ingredient selection. No servings adjustment.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Shopping List Generation - Path: `agent-os/specs/2025-10-27-shopping-list-generation/`
- Feature: Shopping List Service - Path: `lib/db/services/shopping-list-service.ts`
- Components to potentially reuse: `components/shopping-list/` for shopping list UI patterns
- Backend logic to reference: Ingredient aggregation and categorization logic in `lib/utils/`

### Follow-up Questions

**Follow-up 1:** When the recipe is already in the shopping list, should the button allow removing those ingredients, or should it be disabled/hidden?
**Answer:** The button should act as a toggle - add OR remove from the shopping list. If the user taps on the button when the recipe is already in the shopping list, it should remove those ingredients from the shopping list.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No visuals were provided for this feature.

## Requirements Summary

### Functional Requirements
- Add a toggle button to recipe cards (list view) and recipe detail view
- Button adds ALL ingredients from a recipe to the shopping list at once
- Button removes all recipe ingredients from shopping list if already added
- Ingredients are aggregated with existing shopping list items (e.g., "2 eggs" + "3 eggs" = "5 eggs")
- Toast notification confirms add/remove actions
- Button appearance reflects current state (in shopping list or not)

### UI Requirements

**Recipe Card (List View):**
- Replace existing heart/favorite button with shopping list toggle button
- Button visual state indicates whether recipe is in shopping list

**Recipe Detail View:**
- Button positioned at top-right of screen
- Button remains visible (sticky/fixed) when scrolling
- Button visual state indicates whether recipe is in shopping list

### Reusability Opportunities
- Shopping list service already exists at `lib/db/services/shopping-list-service.ts`
- Ingredient aggregation logic may exist in `lib/utils/`
- Shopping list components in `components/shopping-list/` for UI patterns
- Existing shopping list generation spec for reference

### Scope Boundaries
**In Scope:**
- Toggle button on recipe cards (list view)
- Toggle button on recipe detail view (sticky at top-right)
- Add all recipe ingredients to shopping list
- Remove all recipe ingredients from shopping list
- Ingredient quantity aggregation with existing items
- Toast notifications for add/remove actions
- Visual state indication on buttons

**Out of Scope:**
- Servings adjustment before adding
- Partial ingredient selection
- Meal plan integration or modifications
- Navigation to shopping list after adding

### Technical Considerations
- Must track which recipes have been added to shopping list (for toggle state)
- Need to handle ingredient aggregation when adding
- Need to identify and remove specific ingredients when removing (by recipe source)
- Button state must update reactively when shopping list changes
- Leverage existing shopping-list-service.ts for database operations
