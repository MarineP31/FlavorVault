# Spec Requirements: Recipe CRUD Operations

## Initial Description
Recipe CRUD Operations - Create, Read, Update, Delete operations for recipes in the FlavorVault mobile app. This feature is part of MVP Phase 1 (Item #3 in the roadmap: "Recipe Editor & CRUD Operations") and provides the core functionality for users to manage their recipe collection.

## Requirements Discussion

### First Round Questions

**Q1:** For the Create operation, I assume you want a multi-step form interface (similar to modern recipe apps) with sections for basic info, ingredients, instructions, and metadata. Should we use a tabbed interface or scrollable sections with a single "Save" button at the end?
**Answer:** Scrollable sections with a single "Save" button at the end.

**Q2:** For ingredients, should each entry include structured fields (Name, Quantity, Unit) or just a single text input per ingredient line? I'm thinking structured fields would enable better shopping list aggregation later.
**Answer:** Structured fields approach is preferred. (Follow-up clarified: Name (required), Quantity (optional), Unit (optional))

**Q3:** For the Read operation, I assume you want a detailed recipe view showing all fields in a readable format with action buttons (Edit, Delete, Add to Meal Plan). Should this view also support scaling servings with automatic ingredient quantity adjustment, or is that out of scope for now?
**Answer:** Scaling servings is out of scope for this spec. Focus on displaying the recipe with action buttons.

**Q4:** For image handling in Create/Update, should we support both camera capture and photo library selection? And should the OCR feature be separate from manual recipe entry, or should there be an "Import with OCR" option in the Create flow?
**Answer:** Support both camera and photo library. OCR should be completely separate from manual CRUD operations - it's a different feature entirely.

**Q5:** For validation, I'm assuming required fields should be: Title, at least one ingredient, and at least one instruction step. Optional fields: Image, Cooking Time, Prep Time, Servings, Tags, Source. Is that correct?
**Answer:** Yes, that validation structure is correct.

**Q6:** For the Update operation, should users be able to edit all fields including the image, or should certain fields be locked after creation?
**Answer:** All fields should be editable, including the image (with ability to replace or remove it).

**Q7:** For the Delete operation, should there be a confirmation dialog before deletion, and should we implement soft deletes (recoverable) or hard deletes (permanent)?
**Answer:** Confirmation dialog is required. Hard deletes are acceptable for MVP - soft deletes can be a future enhancement.

**Q8:** For categorization, what tag options should be available? I'm thinking preset categories like: Cuisine Type (Italian, Mexican, Asian, etc.), Dietary (Vegetarian, Vegan, Gluten-Free, etc.), Meal Type (Breakfast, Lunch, Dinner, Snack), Cooking Method (Baking, Grilling, Slow Cooker, etc.). Should users be able to create custom tags or only select from predefined ones?
**Answer:** Preset categories are good. Custom tags can be a future enhancement - stick with predefined options for MVP. (Follow-up clarified: Use the suggested categories and maximize use of React Native Reusables components)

**Q9:** For navigation, I assume Create should be accessible from the main recipe list via a "+" FAB button, Update/Delete from the recipe detail view, and after Create/Update users should navigate to the recipe detail view. Is that the expected flow?
**Answer:** Yes, that navigation flow is correct.

**Q10:** What should be excluded from this spec to keep scope manageable? I'm thinking: Recipe duplication, bulk operations, recipe sharing, importing from URLs, nutrition calculation, and cooking mode interface. Anything else to explicitly exclude?
**Answer:** Correct, all those items are out of scope. Also exclude: Recipe collections, favoriting, rating system, and print/export functionality.

### Follow-up Questions

**Follow-up 1:** For the ingredient structure with Name/Quantity/Unit fields, should we provide a dropdown for common units (cup, tbsp, tsp, oz, lb, g, ml, etc.) or allow free-text entry? A dropdown would ensure consistency for future shopping list aggregation.
**Answer:** Each ingredient entry should include:
- Name (required)
- Quantity (optional)
- Unit (optional)
(Note: Unit implementation details - dropdown vs free-text - left to implementation decision. Dropdown suggested for better data consistency.)

**Follow-up 2:** For the tag chip categories (Cuisine, Dietary, Meal Type, Cooking Method), should these be displayed as separate sections in the form or combined into one multi-select tag picker? Also, what UI component library should we use - do you have a preference like React Native Elements, NativeBase, or React Native Paper?
**Answer:** Tag categories confirmed as acceptable. User specifically mentioned: "Use the maximum of elements from React Native Reusables" - indicating React Native Reusables should be the primary UI component library for all interface elements.

**Follow-up 3:** For success feedback after Create/Update/Delete operations, should we use toast notifications, inline success messages, or rely on navigation alone? If toasts, which library do you prefer (e.g., react-native-toast-message)?
**Answer:** Not explicitly answered. Assumption: Use React Native Reusables toast component for success/error feedback to maintain consistency with the chosen UI library.

**Follow-up 4:** Are there any existing form patterns, navigation flows, or UI components in your codebase that we should reference or maintain consistency with?
**Answer:** Not explicitly answered. Assumption: This is likely the first major feature being implemented in the app. Follow React Native and Expo Router best practices with React Native Reusables components.

### Existing Code to Reference

No similar existing features identified for reference. This appears to be foundational functionality for the FlavorVault app as part of MVP Phase 1.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual mockups or wireframes were provided. Implementation should follow standard mobile recipe app UI patterns and React Native Reusables component design system.

## Requirements Summary

### Functional Requirements

**Create Recipe:**
- Multi-screen scrollable form with sections for:
  - Basic Info: Title (required), Image (optional - camera or library), Source (optional)
  - Time & Servings: Prep Time (optional), Cooking Time (optional), Servings (optional)
  - Ingredients: Dynamic list of ingredient entries with Name (required), Quantity (optional), Unit (optional)
    - Add/remove ingredient fields dynamically
    - Minimum one ingredient required
  - Instructions: Dynamic list of instruction steps
    - Add/remove steps dynamically
    - Minimum one step required
  - Metadata: Tag selection from predefined categories (Cuisine, Dietary, Meal Type, Cooking Method)
- Single "Save" button at the end of the form
- Form validation using Zod schema
- Success toast notification after save
- Navigate to recipe detail view after successful creation

**Read Recipe:**
- Detailed recipe view displaying:
  - Recipe image (if available)
  - Title
  - Source attribution
  - Prep time, cooking time, servings
  - Complete ingredient list with quantities and units
  - Step-by-step instructions
  - Tags organized by category
- Action buttons:
  - Edit (navigates to Update form)
  - Delete (shows confirmation dialog)
  - Add to Meal Plan (integration point for future meal planning feature)

**Update Recipe:**
- Pre-populated form with existing recipe data
- Same form structure as Create
- All fields editable including image (replace or remove)
- Validation same as Create
- Success toast notification after save
- Navigate back to recipe detail view after successful update

**Delete Recipe:**
- Confirmation dialog before deletion: "Are you sure you want to delete [Recipe Title]? This cannot be undone."
- Hard delete from database (permanent removal)
- Success toast notification after deletion
- Navigate back to recipe list after successful deletion

**Navigation Flows:**
- Recipe List -> Tap "+" FAB -> Create Recipe Form -> Save -> Recipe Detail View
- Recipe List -> Tap Recipe Card -> Recipe Detail View
- Recipe Detail View -> Tap "Edit" -> Update Recipe Form -> Save -> Recipe Detail View
- Recipe Detail View -> Tap "Delete" -> Confirmation Dialog -> Confirm -> Recipe List

**Form Management:**
- Use React Hook Form for form state management
- Use Zod for schema validation
- Real-time validation with error messages
- Handle dynamic field arrays for ingredients and instructions

**Image Handling:**
- Support both camera capture (expo-camera) and photo library selection (expo-image-picker)
- Image upload in Create and Update flows
- Ability to replace or remove existing image in Update flow
- Image optimization and storage (WebP format, compression)
- OCR is completely separate - not part of manual CRUD operations

### Technical Approach

**Technology Stack:**
- React Native with Expo
- Expo Router for navigation
- React Hook Form for form management
- Zod for schema validation
- expo-sqlite for local data persistence
- expo-camera and expo-image-picker for image handling
- React Native Reusables for all UI components
- Nativewind for styling

**Data Schema (SQLite):**
```
recipes table:
- id (primary key)
- title (text, required)
- image_uri (text, nullable)
- source (text, nullable)
- prep_time (integer, nullable, minutes)
- cooking_time (integer, nullable, minutes)
- servings (integer, nullable)
- created_at (timestamp)
- updated_at (timestamp)

ingredients table:
- id (primary key)
- recipe_id (foreign key)
- name (text, required)
- quantity (text, nullable)
- unit (text, nullable)
- order_index (integer)

instructions table:
- id (primary key)
- recipe_id (foreign key)
- step_text (text, required)
- order_index (integer)

recipe_tags table:
- id (primary key)
- recipe_id (foreign key)
- category (text: cuisine, dietary, meal_type, cooking_method)
- tag_value (text)
```

**Predefined Tag Options:**
- Cuisine: Italian, Mexican, Asian, Chinese, Japanese, Thai, Indian, Mediterranean, French, American, Other
- Dietary: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Nut-Free, Low-Carb, Keto, Paleo, Other
- Meal Type: Breakfast, Lunch, Dinner, Snack, Dessert, Appetizer, Beverage, Other
- Cooking Method: Baking, Grilling, Roasting, Sautéing, Slow Cooker, Instant Pot, Stovetop, No-Cook, Other

**UI Components (React Native Reusables):**
- Form inputs (text, number, select/dropdown)
- Button components for actions
- Toast notifications for success/error feedback
- Dialog/Modal for delete confirmation
- Tag chips for category display
- Image picker/camera components
- FAB (Floating Action Button) for Create action

**Validation Rules:**
- Title: Required, max 200 characters
- Ingredients: At least one required, name field required for each
- Instructions: At least one required, non-empty text
- Prep Time / Cooking Time: Optional, positive integer (minutes)
- Servings: Optional, positive integer
- Image: Optional, validate file type and size
- Source: Optional, max 200 characters
- Tags: Optional, select from predefined options only

**Error Handling:**
- Form validation errors displayed inline
- Database operation errors shown via toast
- Image upload errors handled gracefully
- Network timeouts for future cloud sync (not in MVP)

### Reusability Opportunities

No existing similar features identified. This is foundational functionality. Future features that will build on this:
- Meal Planning Calendar (will reference recipe detail view)
- Shopping List Generator (will use ingredient data structure)
- OCR Recipe Capture (will use same database schema)
- Recipe Repository UI (will display created recipes)

### Scope Boundaries

**In Scope:**
- Complete CRUD operations for recipes (Create, Read, Update, Delete)
- Multi-section form with all recipe fields
- Image upload via camera or photo library
- Dynamic ingredient and instruction fields
- Predefined tag selection system
- Form validation with Zod
- Local SQLite data persistence
- Success/error feedback via toast notifications
- Delete confirmation dialog
- Navigation flows between list, detail, and form views

**Out of Scope:**
- OCR recipe capture (separate feature)
- Recipe scaling/serving adjustment
- Recipe duplication
- Bulk operations (multi-select, bulk delete)
- Recipe sharing/export
- Importing from URLs
- Nutrition calculation
- Cooking mode interface
- Recipe collections/grouping
- Favoriting system
- Rating/review system
- Print/export functionality
- Soft deletes (recoverable deletion)
- Custom tag creation (only predefined tags)
- Cloud sync and backup (Phase 2)
- Cross-device synchronization (Phase 2)

### Technical Considerations

**Integration Points:**
- Recipe detail view will need "Add to Meal Plan" button (integration point for future meal planning feature)
- Ingredient data structure designed to support future shopping list aggregation
- Database schema supports future features (tags, source tracking)
- Image storage pattern will be reused for OCR-captured recipes

**Performance Considerations:**
- Use FlatList for rendering dynamic ingredient/instruction fields in forms
- Optimize image compression for storage efficiency
- Index database on frequently queried fields (title, tags)
- Lazy load images in recipe list view

**Existing System Constraints:**
- Mobile-only (no web support)
- Local storage only (no cloud in MVP)
- Offline-first architecture
- React Native Reusables component library for consistent UI/UX

**Technology Preferences:**
- TypeScript strict mode
- Expo Router file-based routing
- React Hook Form + Zod validation pattern
- React Native Reusables for all UI components
- Nativewind for styling
- expo-sqlite for data persistence

**Similar Code Patterns:**
- None identified - this is foundational feature
- Establish patterns that future features will follow:
  - Form handling pattern (React Hook Form + Zod)
  - Navigation pattern (Expo Router)
  - Data persistence pattern (expo-sqlite)
  - UI component pattern (React Native Reusables)
  - Toast feedback pattern (React Native Reusables toast)
