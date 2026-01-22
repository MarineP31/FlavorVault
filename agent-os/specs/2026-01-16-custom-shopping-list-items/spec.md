# Specification: Custom Shopping List Items

## Goal
Allow users to manually add custom items to their shopping list that persist independently from recipe-generated items, supporting items with optional quantity and unit fields.

## User Stories
- As a user, I want to add custom items to my shopping list so that I can include non-recipe items like household supplies
- As a user, I want to add items without specifying a unit so that I can simply write "paper towels" or "batteries"
- As a user, I want my custom items to persist when the shopping list regenerates from recipe changes
- As a user, I want to delete custom items I no longer need
- As a user, I want to assign categories to custom items so they appear in the correct section

## Core Requirements
- Add custom items via a dedicated dialog accessible from FAB button
- Name field is required, quantity and unit are optional
- Custom items default to "Other" category unless user selects one
- Custom items persist through shopping list regeneration (source: 'manual')
- Custom items have the same check-off functionality as recipe items
- Custom items can be individually deleted (with confirmation)
- Custom items visually distinguishable via delete button (recipe items cannot be deleted)

## Visual Design
No mockups provided. The implementation follows standard mobile patterns:
- FAB (Floating Action Button) with "+" icon to trigger add dialog
- Bottom sheet modal with form fields for item entry
- Category selection via chip/pill buttons
- Unit selection via horizontal scrollable chip list with "None" option
- Standard form validation with inline error messages

## Reusable Components

### Existing Code to Leverage
- **AddManualItemDialog**: `components/shopping-list/add-manual-item-dialog.tsx` - Full dialog implementation with name, quantity, unit, and category fields
- **ShoppingListItemComponent**: `components/shopping-list/shopping-list-item.tsx` - Displays items with delete button for manual items
- **ShoppingListService**: `lib/db/services/shopping-list-service.ts` - CRUD operations including source-based filtering
- **ShoppingListGenerator**: `lib/services/shopping-list-generator.ts` - `addManualItem()` method handles creation
- **ShoppingListContext**: `lib/contexts/shopping-list-context.tsx` - Exposes `addManualItem` and `deleteItem` functions
- **FAB Component**: `components/ui/FAB.tsx` - Floating action button
- **Button Component**: `components/ui/Button.tsx` - Primary/outline variants
- **EmptyShoppingList**: `components/shopping-list/empty-shopping-list.tsx` - Shows "Add Item" button in empty state

### New Components Required
None - feature is fully implemented in the existing codebase.

## Technical Approach

### Database Schema (Existing)
The `shopping_list_items` table already supports custom items:
- `source` column: 'recipe' | 'manual' distinguishes item origin
- `quantity` column: nullable, supports items without quantity
- `unit` column: nullable, supports items without unit
- `category` column: defaults to 'Other' for manual items

### Data Flow
1. User taps FAB to open `AddManualItemDialog`
2. User fills name (required), optionally quantity/unit/category
3. Dialog validates input via local state
4. On submit, calls `addManualItem()` from `ShoppingListContext`
5. Context calls `shoppingListGenerator.addManualItem()`
6. Generator creates item with `source: 'manual'` via `shoppingListService.createItem()`
7. Context refreshes list to display new item

### Persistence Through Regeneration
When shopping list regenerates (queue changes):
1. `regenerateList()` in context calls `deleteBySource('recipe')`
2. Manual items (source: 'manual') are preserved
3. New recipe items are generated and inserted
4. UI refreshes showing both manual and new recipe items

### Validation Rules
- Name: required, max 100 characters
- Quantity: optional, must be positive number if provided
- Unit: optional, must be valid `MeasurementUnit` enum value or null
- Category: optional, defaults to 'Other', must be valid `ShoppingListCategory`

## Out of Scope
- Editing existing custom items (name, quantity, unit, category)
- Bulk import of custom items
- Custom item templates/presets
- Syncing custom items across devices
- Custom item notes or descriptions
- Recurring custom items
- Custom item sorting preferences

## Success Criteria
- Custom items can be added with only a name (no quantity, no unit)
- Custom items appear in the correct category section
- Custom items persist when user adds/removes recipes from queue
- Custom items can be checked off and unchecked
- Custom items can be deleted with confirmation
- Delete button only appears on manual items, not recipe items
- Form validation prevents empty name submission
- Dialog resets form state when closed and reopened
