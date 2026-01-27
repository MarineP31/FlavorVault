# Spec Requirements: Meal Plan (Simple Recipe Queue)

## Initial Description
A simple "recipe queue" feature - a list of selected recipes that feeds into the shopping list. Not a calendar-based meal planner.

## Requirements Discussion

### User's Core Requirements
- Simple list of selected recipes (NOT a calendar or weekly planner)
- Display the recipes user has selected
- Ability to remove a recipe from the meal plan list
- Removing from meal plan also removes from shopping list
- No planning features, no calendar, no meal types

### Clarifying Questions & Answers

**Adding Recipes:**
- Q: How do recipes get added?
- A: Cart button on recipe cards is enough - no additional button needed on recipe detail screen

**List Display:**
- Q: Full recipe cards or compact list?
- A: Compact list

**Empty State:**
- Q: What message for empty state?
- A: Fun message: "Holy guacamole! There are no recipes selected. Browse recipes to add to your meal plan"

**Removing Recipes:**
- Q: How to remove - trash icon, swipe, or both?
- A: Tap on trash icon

- Q: Need a "Clear All" button?
- A: Yes

- Q: Show confirmation before removing?
- A: No, remove immediately

### Confirmed Exclusions
- Drag-to-reorder
- Serving size adjustments
- Dates/scheduling
- Meal types (breakfast/lunch/dinner)
- Calendar view
- Weekly planning

## Visual Assets

### Files Provided
- `meal-plan-screen.png` - Main meal plan queue screen design

### Visual Insights
From the mockup:
- **Header**: "Meal Plan Queue" title with "Clear All" button (orange text) on the right
- **List Items**: Compact rows with:
  - Square recipe thumbnail on the left (rounded corners)
  - Recipe title (bold, dark text)
  - Category + cooking time below title (gray text, uppercase category, e.g., "DINNER • 25 MINS")
  - Orange trash icon on the right
- **Add Button**: "Add More Recipes" button at bottom of list (peach/light orange background with orange text and + icon)
- **Styling**: White background, subtle divider lines between items
- **Color scheme**: Orange accent color (#FF6B35) for interactive elements

## Requirements Summary

### Functional Requirements

**Core Functionality:**
- Display compact list of recipes in meal plan queue
- Each list item shows:
  - Square recipe thumbnail (rounded corners)
  - Recipe title (bold)
  - Category label + cooking time (e.g., "DINNER • 25 MINS")
  - Orange trash icon for removal
- Header with "Meal Plan Queue" title and "Clear All" button (orange text)
- Tap trash icon to remove recipe immediately (no confirmation)
- "Clear All" button to remove all recipes at once
- Removing recipe also removes its ingredients from shopping list
- "Add More Recipes" button at bottom (peach background, orange text with + icon)
- Fun empty state: "Holy guacamole! There are no recipes selected. Browse recipes to add to your meal plan"

**Adding Recipes:**
- Use existing cart button on recipe cards
- "Add More Recipes" button navigates to Home/recipe list
- Prevent duplicates (show "Already added" or similar feedback)

**User Actions Enabled:**
- View list of selected recipes
- Remove individual recipe (tap trash icon)
- Clear all recipes at once
- Navigate to recipe detail by tapping recipe item
- Navigate to recipe list via "Add More Recipes" button

### Reusability Opportunities
- Existing cart button on RecipeCard component
- Shopping list integration already exists
- Recipe queue data model may already exist
- Compact list item styling from shopping list

### Scope Boundaries

**In Scope:**
- Compact recipe list view
- Individual remove via trash icon
- Clear all button
- Fun empty state
- Shopping list sync (remove recipe = remove ingredients)

**Out of Scope:**
- Calendar/weekly view
- Meal types (breakfast/lunch/dinner)
- Date scheduling
- Drag-to-reorder
- Serving size adjustments per item
- Duplicate recipes in list
- Confirmation dialogs

### Technical Considerations
- Leverage existing shopping list context/service for queue management
- Reuse compact list item patterns from shopping list screen
- Ensure immediate UI feedback on remove actions
- Sync with shopping list regeneration logic
