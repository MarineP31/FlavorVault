# Specification: Navigation System Implementation

## Goal

Implement a comprehensive navigation system for Recipe Keeper V2 with tab-based navigation, stack-based detail views, and cross-tab navigation support. Enable users to browse recipes, view details, create/edit recipes, and navigate between Shopping List, Meal Plan, and recipe details seamlessly.

## User Stories

- As a user, I want to navigate between Home, Add Recipe, Shopping List, and Meal Plan tabs so that I can access different features quickly
- As a user, I want to tap a recipe card to view its full details including ingredients and steps
- As a user, I want to edit or delete a recipe from its detail screen so that I can manage my recipe collection
- As a user, I want to add a recipe to my meal plan directly from the recipe detail screen
- As a user, I want to create a new recipe by choosing between camera capture and manual entry
- As a user, I want to be warned about unsaved changes when navigating away from the recipe form so that I don't lose my work
- As a user, I want to navigate from shopping list items to their source recipes so that I can see the full recipe context
- As a user, I want the back button to work consistently whether I use gestures or the Android back button

## Core Requirements

### Navigation Architecture

**Bottom Tab Navigation:**
- 4 tabs with icons and labels:
  - Home (house icon) - Shows RecipeRepositoryScreen with recipe browsing
  - Add Recipe (plus icon) - Shows choice screen for Camera vs Manual Entry
  - Shopping List (cart icon) - Shows shopping list with items (placeholder for now)
  - Meal Plan (calendar icon) - Shows meal planning interface (placeholder for now)
- Tab bar always visible at bottom of screen
- Active tab indicated with tint color (#007AFF)
- Haptic feedback on tab press (using existing HapticTab component)

**Stack Navigation:**
- Each tab has its own navigation stack
- Recipe Detail screen pushes onto Home tab stack
- Recipe Form (Add/Edit) pushes onto current stack
- Standard back navigation with header back button
- Support for iOS swipe-back gesture and Android back button

**Cross-Tab Navigation:**
- Shopping list items can navigate to recipe details
- Recipe detail screen works consistently regardless of entry point (Home tab or Shopping List tab)
- Navigation maintains proper back stack context

### Recipe Detail Screen

**Layout and Content:**
- Large hero image at top (or placeholder with category icon)
- Recipe title and metadata (prep time, cook time, servings, category)
- Tags displayed as chips
- Ingredients section with quantities and checkboxes
- Steps section with numbered instructions
- Scrollable content with proper spacing

**Actions:**
- Three-dot menu button in header (opens bottom sheet)
- Bottom sheet actions: Edit Recipe, Delete Recipe
- "Add to Meal Plan" floating action button (positioned bottom-right)
- Back button in header

**Bottom Sheet:**
- Uses @gorhom/bottom-sheet library
- Snap points: 25% and 50% of screen height
- Actions list with icons:
  - Edit Recipe (pencil icon) - Navigates to recipe form in edit mode
  - Delete Recipe (trash icon) - Shows confirmation dialog
- Backdrop overlay that dismisses sheet on tap
- Smooth animations with react-native-reanimated

**Delete Confirmation:**
- Alert dialog with title "Delete Recipe?"
- Message: "This action cannot be undone."
- Buttons: Cancel (default style), Delete (destructive style)
- On confirm: Call recipeService.deleteRecipe(id), navigate back to Home

### Add Recipe Choice Screen

**Layout:**
- Root screen of Add Recipe tab
- Two large action cards:
  - Scan Recipe (camera icon) - "From photos or books"
  - Add Recipe (plus icon) - "Create manually"
- Orange gradient background matching RecipeCapture.png mockup
- Optional: Recent recipes section below (can be added in future)

**Navigation:**
- Scan Recipe → Navigate to camera screen (placeholder for now)
- Add Recipe → Navigate to recipe form in create mode
- Tab press when already on this screen: No action (already at root)

### Recipe Form Screen (Add/Edit Mode)

**Form Fields:**
- Recipe title (text input, required)
- Servings (number input, 1-50, required)
- Category (picker/dropdown, required, uses DishCategory enum)
- Prep time (number input, minutes, optional)
- Cook time (number input, minutes, optional)
- Ingredients list (dynamic array with add/remove):
  - Name (text input, required)
  - Quantity (number input, optional)
  - Unit (picker, optional, uses MeasurementUnit enum)
- Steps list (dynamic array with add/remove, numbered automatically)
- Tags (text input with comma separation or multi-select)
- Image (optional, placeholder for camera/gallery integration)

**Form Behavior:**
- Create mode: Empty form, header title "Add Recipe"
- Edit mode: Pre-filled with recipe data, header title "Edit Recipe"
- Form validation on submit using RecipeUtils.validate()
- Error messages displayed inline near invalid fields
- Save button in header (disabled until form is valid)
- Cancel/Back button triggers unsaved changes check

**Unsaved Changes Dialog:**
- Triggered when user tries to navigate away with unsaved changes
- Detect changes by comparing form state to initial state
- Alert dialog with three buttons:
  - Save - Validate and save recipe, then navigate away
  - Discard - Navigate away without saving
  - Cancel - Stay on form, continue editing
- Applies to both gesture navigation and Android back button

**Data Operations:**
- Create: Use recipeService.createRecipe(CreateRecipeInput)
- Update: Use recipeService.updateRecipe(UpdateRecipeInput)
- On success: Navigate back to previous screen (recipe detail or home)
- On error: Show error alert with details

### State Management

**Navigation State:**
- Managed by Expo Router automatically
- Each tab maintains its own stack
- Navigation params passed for recipe ID in detail/edit screens

**Form State:**
- Local React state using useState for form fields
- Track "dirty" state to detect unsaved changes
- Store initial values on mount for comparison

**Recipe Data:**
- Use existing useRecipes hook for list views
- Fetch individual recipe using recipeService.getRecipeById()
- Optimistic updates for delete/edit operations
- Refresh recipe list after create/update/delete

### Error Handling

**Network/Database Errors:**
- Show Alert dialog with error message
- Provide retry option where applicable
- Log errors to console for debugging

**Validation Errors:**
- Display inline error messages near invalid fields
- Disable save button until all required fields are valid
- Show summary error alert if form submission fails

**Navigation Errors:**
- Gracefully handle missing recipe IDs (navigate to home)
- Handle race conditions (recipe deleted while viewing)

## Visual Design

**Mockup References:**
- `assets/images/ui/HomeScreen.png` - Bottom tab navigation, recipe list
- `assets/images/ui/RecipeDetails.png` - Recipe detail layout with three-dot menu
- `assets/images/ui/RecipeCapture.png` - Add recipe choice screen with action cards
- `assets/images/ui/PhotoCaptureOCR.png` - Camera flow reference (not in scope for navigation)

**Key UI Elements:**
- Bottom tab bar: 4 tabs with icons, active tint #007AFF
- Recipe detail: Hero image, metadata row, ingredients/steps sections
- Three-dot menu: Top-right header button
- Bottom sheet: Rounded corners, backdrop, smooth animations
- FAB: 56dp circle, #007AFF background, positioned bottom-right 20px offset
- Choice screen cards: Large touch targets, icons, descriptive text

**Responsive Considerations:**
- Bottom tab bar adapts to safe area insets
- Recipe detail scrollable content with proper padding
- Form inputs scale appropriately on different screen sizes
- Bottom sheet respects keyboard when open

## Reusable Components

### Existing Code to Leverage

**Navigation Components:**
- `app/(tabs)/_layout.tsx` - Existing tab navigation structure (update to 4 tabs)
- `app/_layout.tsx` - Root layout with Stack and ThemeProvider
- `components/haptic-tab.tsx` - HapticTab component for tab bar buttons
- `components/ui/icon-symbol.tsx` - IconSymbol for tab icons

**Recipe Components:**
- `components/recipes/RecipeRepositoryScreen.tsx` - Recipe list screen (already implemented)
- `components/recipes/RecipeCard.tsx` - Recipe card component for list/grid views
- `components/recipes/RecipeList.tsx` - List view container
- `components/recipes/RecipeGrid.tsx` - Grid view container
- `components/ui/FAB.tsx` - Floating action button (reuse for "Add to Meal Plan")
- `components/ui/EmptyState.tsx` - Empty state component

**Data Layer:**
- `lib/db/schema/recipe.ts` - Recipe, Ingredient interfaces and RecipeUtils
- `lib/db/services/recipe-service.ts` - RecipeService with CRUD operations
- `lib/hooks/useRecipes.ts` - Hook for recipe list management
- `constants/enums.ts` - DishCategory, MeasurementUnit enums

**UI Utilities:**
- `constants/theme.ts` - Theme colors and styling
- `hooks/use-color-scheme.ts` - Dark mode detection

### New Components Required

**RecipeDetailScreen:**
- Full recipe view with hero image, metadata, ingredients, steps
- Three-dot menu button in header
- Bottom sheet integration for actions
- FAB for "Add to Meal Plan"
- WHY NEW: Complex layout with multiple sections, bottom sheet, and FAB coordination not present in existing code

**RecipeActionsBottomSheet:**
- Bottom sheet with Edit/Delete actions
- Uses @gorhom/bottom-sheet
- Handles action callbacks for edit and delete
- WHY NEW: Bottom sheet implementation is new to the app

**RecipeFormScreen:**
- Form for creating/editing recipes
- Dynamic fields for ingredients and steps
- Validation and error handling
- Create/Edit mode support
- WHY NEW: Complex form with dynamic arrays and validation logic not present in existing code

**AddRecipeChoiceScreen:**
- Choice screen with Camera vs Manual Entry cards
- Large action cards with icons and descriptions
- WHY NEW: Unique layout pattern not present in existing screens

**UnsavedChangesDialog:**
- Reusable hook or utility for unsaved changes detection
- Alert dialog with Save/Discard/Cancel options
- WHY NEW: Navigation guard logic not present in existing code

**Navigation Utilities:**
- Custom hook for handling Android back button with unsaved changes
- Navigation helpers for cross-tab navigation
- WHY NEW: Specific navigation patterns not present in existing code

## Technical Approach

### Expo Router File Structure

```
app/
├── _layout.tsx (existing - no changes needed)
├── (tabs)/
│   ├── _layout.tsx (update to 4 tabs)
│   ├── index.tsx (existing - Home tab with RecipeRepositoryScreen)
│   ├── add-recipe.tsx (new - Add Recipe tab with choice screen)
│   ├── shopping-list.tsx (new - Shopping List tab placeholder)
│   └── meal-plan.tsx (new - Meal Plan tab placeholder)
├── recipe/
│   └── [id].tsx (new - Recipe detail screen)
└── recipe-form/
    ├── create.tsx (new - Create recipe form)
    └── edit/
        └── [id].tsx (new - Edit recipe form)
```

### Navigation Patterns

**Navigating to Recipe Detail:**
```typescript
// From any screen
router.push(`/recipe/${recipe.id}`);
```

**Navigating to Edit Recipe:**
```typescript
// From recipe detail
router.push(`/recipe-form/edit/${recipe.id}`);
```

**Navigating to Create Recipe:**
```typescript
// From Add Recipe choice screen
router.push('/recipe-form/create');
```

**Cross-Tab Navigation:**
```typescript
// From Shopping List to Recipe Detail
router.push(`/recipe/${recipeId}`);
// Back button returns to Shopping List due to stack
```

### Bottom Sheet Integration

**Installation:**
```bash
yarn add @gorhom/bottom-sheet
# Dependencies already installed: react-native-reanimated, react-native-gesture-handler
```

**Usage in Recipe Detail:**
```typescript
import BottomSheet from '@gorhom/bottom-sheet';

// In component:
const bottomSheetRef = useRef<BottomSheet>(null);
const snapPoints = ['25%', '50%'];

// Open sheet
bottomSheetRef.current?.expand();

// Close sheet
bottomSheetRef.current?.close();
```

### Unsaved Changes Detection

**Form State Tracking:**
```typescript
// Track initial values
const [initialValues] = useState(formValues);
const [isDirty, setIsDirty] = useState(false);

// Check if form has changes
const hasChanges = JSON.stringify(formValues) !== JSON.stringify(initialValues);

// Intercept navigation
usePreventRemove(hasChanges, ({ data }) => {
  // Show unsaved changes dialog
});
```

**Android Back Button:**
```typescript
import { BackHandler } from 'react-native';

useEffect(() => {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    if (hasChanges) {
      // Show dialog
      return true; // Prevent default back
    }
    return false; // Allow default back
  });

  return () => backHandler.remove();
}, [hasChanges]);
```

### TypeScript Strict Mode

- All components use proper TypeScript types
- Recipe interfaces from `lib/db/schema/recipe.ts`
- Navigation params typed with Expo Router's type system
- Strict null checks for optional fields
- Enum usage for DishCategory and MeasurementUnit

### Performance Considerations

- Recipe detail: Lazy load image, memoize expensive computations
- Bottom sheet: Use native driver for animations
- Form: Debounce validation checks
- Lists: Virtualization handled by FlatList (already in RecipeGrid/RecipeList)

## Out of Scope

**Features NOT in this spec:**
- Deep linking to specific recipes (future enhancement)
- Custom navigation transitions/animations (using defaults)
- Advanced gesture-based navigation beyond swipe-back
- Tab badge notifications (e.g., shopping list item count)
- Navigation analytics/tracking
- Camera screen implementation (referenced but not implemented)
- OCR/recipe scanning functionality (referenced but not implemented)
- Shopping List screen implementation (placeholder only)
- Meal Plan screen implementation (placeholder only)
- Manual recipe form implementation details (separate spec)
- Recipe favoriting functionality
- Social sharing from recipe details
- Print recipe functionality
- Recipe duplication feature
- Offline sync and conflict resolution

**Future Enhancements:**
- Deep linking with URL schemes (recipe-keeper://recipe/123)
- Custom screen transitions with shared element animations
- Advanced gestures (swipe to delete on lists)
- Tab state persistence beyond Expo Router defaults
- Navigation history tracking for analytics
- Breadcrumb navigation for complex flows

## Success Criteria

**Functional Requirements:**
- Users can navigate between all 4 tabs smoothly with haptic feedback
- Recipe cards navigate to detail screen showing complete recipe information
- Three-dot menu opens bottom sheet with Edit/Delete actions
- Delete action shows confirmation dialog and removes recipe from list
- Edit action navigates to pre-filled form and updates recipe on save
- Add Recipe tab shows choice screen with Camera/Manual options
- Manual option navigates to empty recipe form
- Form detects unsaved changes and shows dialog on back navigation
- Android back button behaves identically to gesture navigation
- Shopping list items can navigate to recipe details
- Back navigation maintains proper context across tabs

**Performance Metrics:**
- Tab navigation responds within 16ms (60fps)
- Recipe detail screen loads within 300ms
- Bottom sheet animations are smooth (no dropped frames)
- Form validation provides feedback within 100ms
- No memory leaks from unclosed bottom sheets or listeners

**User Experience Goals:**
- Navigation feels intuitive and predictable
- No data loss from accidental navigation away from forms
- Consistent behavior across iOS and Android
- Visual feedback for all interactive elements
- Proper loading states during data fetches
- Graceful error handling with actionable messages

**Code Quality:**
- All components have TypeScript strict mode enabled
- Navigation patterns are consistent across the app
- Reusable components properly abstracted
- Proper cleanup of event listeners and subscriptions
- Unit tests for navigation utilities and form validation
- Integration tests for critical user flows

**Accessibility:**
- Tab labels readable by screen readers
- Interactive elements have proper accessibility labels
- Bottom sheet can be dismissed with standard gestures
- Form errors announced to screen readers
- Proper focus management during navigation
