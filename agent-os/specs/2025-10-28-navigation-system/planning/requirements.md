# Spec Requirements: Navigation System Implementation

## Initial Description

Implement comprehensive navigation system for FlavorVault, including navigation to recipe details, recipe creation/editing, and proper screen transitions. This should integrate with the existing Recipe Repository UI and prepare the foundation for future features.

## Context

- We have just completed the Recipe Repository UI (browsing, search, filtering)
- The app currently shows placeholder alerts when tapping recipe cards or the FAB
- We need to implement full navigation between screens
- The app uses Expo Router for navigation

## Requirements Discussion

### First Round Questions

**Q1: Navigation Architecture - What level of navigation complexity do we need?**

I'm assuming we need tab-based navigation with a bottom bar, plus stack navigation within each tab for things like recipe details. Is that correct, or do you prefer a different structure (like drawer navigation or simple stack only)?

**Answer:** Tab-based navigation with bottom bar and stack navigation within tabs is correct.

**Q2: Bottom Navigation Tabs - Which main sections should appear as tabs?**

Based on Recipe Keeper, I'm thinking:
- Home (recipe list - your current RecipeRepositoryScreen)
- Add Recipe (probably opens a form or camera)
- Shopping List
- Profile/Settings

Should we use these four tabs, or do you have different sections in mind?

**Answer:** Home and Shopping List are correct. Instead of Profile/Settings, we need a Meal Plan tab. The Add Recipe tab should trigger a choice screen (camera vs manual entry).

**Q3: Recipe Card Tap Behavior - What should happen when a user taps a recipe card?**

I assume tapping a recipe card should navigate to a Recipe Detail screen showing the full recipe. Should this detail screen have actions like Edit, Delete, Add to Meal Plan? Or should those actions be in a different place (like a context menu on the list)?

**Answer:** Yes, navigate to Recipe Detail screen. Actions should be in a bottom sheet accessed via an "actions" button (three dots). Bottom sheet actions: Edit Recipe, Delete Recipe. Note: "Add to Meal Plan" should be a floating action button on the recipe detail screen, NOT in the bottom sheet.

**Q4: Add Recipe Tab Flow - How should the Add Recipe tab work?**

When the user taps the Add Recipe tab, should it:
A) Immediately open the camera for photo capture?
B) Go directly to a manual recipe entry form?
C) Show a choice screen where they can select Camera or Manual Entry?

**Answer:** Option C - Show a choice screen (Camera vs Manual Entry) that navigates to the appropriate screen.

**Q5: Shopping List Navigation - Should shopping list items link back to recipes?**

I'm assuming the Shopping List should allow users to tap on an item/ingredient to navigate to the source recipe details. Is this correct, or should the shopping list be standalone without recipe navigation?

**Answer:** Yes, navigate to recipe details from shopping list items.

**Q6: Meal Planning Access - Where should meal planning features be accessed?**

Should meal planning be:
A) A fourth tab in the bottom navigation?
B) Accessed from the Profile/Settings tab?
C) A modal that appears when adding recipes to meal plan?
D) Something else?

**Answer:** Option A - A fourth tab in the bottom navigation.

**Q7: Bottom Sheet Library - Which bottom sheet library should we use?**

For the bottom sheet (actions menu on recipe detail), should we use:
- @gorhom/bottom-sheet (popular, feature-rich)
- react-native-bottom-sheet
- A custom implementation
- Another library you prefer?

**Answer:** @gorhom/bottom-sheet (need to install this library).

**Q8: Navigation Guards - Should we prevent navigation when there are unsaved changes?**

If a user is filling out a recipe form and tries to navigate away, should we:
A) Show a confirmation dialog ("You have unsaved changes, are you sure?")
B) Auto-save as draft
C) Just let them navigate away (lose changes)
D) Different behavior depending on the screen?

**Answer:** Show confirmation dialog, but only on the Add/Edit Recipe form. Dialog options: Save / Discard / Cancel.

**Q9: Edit Recipe Navigation - How should editing work?**

When a user wants to edit a recipe, should we:
A) Navigate to the same Add Recipe screen but pre-fill it with the recipe data?
B) Have a separate Edit Recipe screen?
C) Use an in-place editing mode on the detail screen?

**Answer:** Option A - Use the same Add Recipe screen but pre-filled with data. This means the form can be in "create" or "edit" mode.

**Q10: Android Back Button - Should we handle the Android back button specially?**

On Android, users often use the hardware/gesture back button. Should this:
- Follow standard stack navigation behavior (just pop)?
- Also trigger the unsaved changes dialog when appropriate?
- Have special handling for certain screens?

**Answer:** Show the same confirmation dialog as gesture navigation when there are unsaved changes.

**Q11: Scope Boundaries - Are there any features explicitly out of scope?**

Is there anything navigation-related we should NOT implement in this spec? For example:
- Deep linking to specific recipes?
- Tab persistence (remembering which tab was active)?
- Custom transitions/animations?
- Gesture-based navigation?

**Answer:** Focus on core navigation structure. Deep linking, custom transitions, and advanced gesture-based navigation are out of scope for this spec. Tab persistence using Expo Router defaults is fine.

### Existing Code to Reference

**Similar Features Identified:**
- Current RecipeRepositoryScreen implements the recipe list/browsing interface at `app/(tabs)/index.tsx`
- Tab navigation structure already exists with basic Expo Router setup
- Recipe data models and types in `types/` directory can be referenced for detail screen implementation

### Follow-up Questions

**Follow-up 1: Bottom Sheet Actions Clarification**

You mentioned Edit, Delete, and "Add to Meal Plan" as a FAB. Just to confirm the complete interaction flow:
- User taps recipe card → Navigate to Recipe Detail
- User taps three-dot actions button on detail screen → Bottom sheet appears with Edit/Delete
- User sees "Add to Meal Plan" as a separate floating action button (not in bottom sheet)
- Is this correct?

**Answer:** Confirmed. Bottom sheet has Edit Recipe and Delete Recipe. "Add to Meal Plan" is a floating button on the recipe detail screen (NOT in bottom sheet).

**Follow-up 2: Add Recipe Tab Flow Confirmation**

For the Add Recipe tab showing a choice screen - should this choice screen be:
- A persistent screen that's always shown when tapping the tab?
- Or does it navigate to Camera/Form and then reset back to the choice screen when returning to the tab?

**Answer:** Show a choice screen (Camera vs Manual Entry) that navigates to the appropriate screen. The tab should show the choice screen as its root.

**Follow-up 3: Shopping List Navigation Details**

When navigating to recipe details from shopping list items - should this use the same Recipe Detail screen as navigating from the Home tab? And should the back button from there return to the Shopping List?

**Answer:** Yes, use the same Recipe Detail screen. Navigation should properly return to the Shopping List tab.

**Follow-up 4: Unsaved Changes Scope**

You mentioned the unsaved changes dialog should only appear on Add/Edit Recipe form. Should this apply to:
- Only the manual recipe entry form?
- Or also the camera/OCR flow if they've captured a photo?

**Answer:** Only Add/Edit Recipe form. The camera/OCR flow is handled separately.

**Follow-up 5: Edit Recipe Navigation Clarification**

When using the same Add Recipe screen in "edit mode" - how should the navigation work:
- User taps Edit in bottom sheet → Navigate to Add Recipe screen (pre-filled)
- Does this push onto the stack (so back button returns to detail)?
- Or does it navigate to the Add Recipe tab and somehow pre-fill it there?

**Answer:** Navigate to the same Add Recipe screen (which is in the Add Recipe tab) but pre-filled with data in edit mode. This should push onto the current stack, so back button returns to the recipe detail screen.

**Follow-up 6: Android Back Button Behavior**

For Android back button - should it:
- Show the unsaved changes dialog when navigating back from Add/Edit Recipe form?
- Follow normal stack behavior everywhere else?

**Answer:** Yes, show the same confirmation dialog as gesture navigation. Treat Android back button the same as iOS back gesture.

## Visual Assets

### Files Provided:

Visual assets found in `/assets/images/ui/`:
- `HomeScreen.png`: Shows the recipe list interface with bottom navigation
- `PhotoCaptureOCR.png`: Shows the OCR review screen with confidence indicators
- `RecipeCapture.png`: Shows the choice screen for Scan Recipe vs Add Recipe
- `RecipeDetails.png`: Shows the recipe detail screen with ingredients and cooking controls

### Visual Insights:

**HomeScreen.png Analysis:**
- Bottom navigation bar with 4 tabs: Home (Recipes), Search icon, Shopping cart icon, Profile/User icon
- Recipe cards display: image, title, description, prep time, servings, and rating
- Category filter chips at top (All, Favorites, Quick, Healthy)
- Search bar with menu icon
- FAB (floating action button) with plus icon for adding recipes
- Clean card-based layout with high-quality food photography
- Heart icons on recipe cards for favoriting

**PhotoCaptureOCR.png Analysis:**
- OCR Review screen showing captured recipe image
- Confidence indicator showing 78% with color-coded confidence levels
- Extracted text displayed with color coding: green (high confidence), yellow (moderate), pink (low)
- Warning banner for low confidence sections
- "Edit Text" and "Continue" action buttons at bottom
- Ability to tap image to expand
- "Re-parse" option for extracted text
- Back button in header

**RecipeCapture.png Analysis:**
- Choice screen with two large action cards:
  1. "Scan Recipe" - From photos or books (with camera icon)
  2. "Add Recipe" - Create manually (with plus icon)
- Orange gradient background with chef hat icon
- "Recipe Chef" branding
- "Recent Recipes" section below showing Chocolate Chip Cookies and Pasta Carbonara
- Bottom navigation visible with Home, Recipes, Shopping, Profile tabs
- Clean, simple two-option interface

**RecipeDetails.png Analysis:**
- Large hero image of the recipe at top
- Recipe title "Grandma's Apple Pie" with subtitle
- Recipe metadata: cooking time (1h 30min), servings (8), difficulty (Medium)
- Category tags: Dessert, Traditional, Family
- Heart icon for favoriting
- Serving size adjuster with minus/plus buttons
- "Start Cooking" button (blue, prominent)
- "Shopping List" button (gray, secondary)
- Ingredients section with checkboxes and quantities
- Collapsible sections (dropdown arrow visible)
- Three-dot menu in top right corner for actions

**Fidelity Level:** High-fidelity mockups with complete branding, colors, and design system.

**Design Patterns Identified:**
- Tab navigation at bottom with 4 sections
- Card-based recipe list layout
- Bottom sheets for actions (implied by three-dot menu)
- FAB for primary actions (adding recipes)
- Color coding for information hierarchy (confidence levels in OCR)
- Choice screens with large actionable cards
- Metadata displayed with icons (time, servings, difficulty)
- Collapsible sections for detailed content

**User Flow Implications:**
1. Home tab shows recipe list with filtering and search
2. Tapping recipe card navigates to detail screen
3. Detail screen has three-dot menu (top right) for Edit/Delete actions
4. Add Recipe tab shows choice screen (Scan vs Manual)
5. Camera flow leads to OCR review with editing capabilities
6. Shopping list accessible via tab navigation
7. Recipe detail shows "Shopping List" button for ingredient management

## Requirements Summary

### Functional Requirements

**Core Navigation Structure:**
- Bottom tab navigation with 4 tabs: Home, Add Recipe, Shopping List, Meal Plan
- Stack navigation within each tab for detail screens
- Recipe list on Home tab (existing RecipeRepositoryScreen)
- Add Recipe tab shows choice screen (Camera vs Manual Entry)
- Shopping List tab with navigation to recipe details
- Meal Plan tab (navigation patterns TBD in this spec)

**Recipe Detail Navigation:**
- Tapping recipe card navigates to Recipe Detail screen
- Recipe Detail screen displays full recipe information
- Three-dot actions button opens bottom sheet with Edit/Delete options
- "Add to Meal Plan" appears as floating action button (not in bottom sheet)
- Back navigation returns to previous screen (Home or Shopping List)

**Add Recipe Flow:**
- Add Recipe tab displays choice screen as root
- Choice screen offers: Scan Recipe (Camera) or Add Recipe (Manual Entry)
- Selecting camera navigates to camera screen
- Selecting manual entry navigates to recipe form
- Form can be in "create" mode or "edit" mode

**Edit Recipe Flow:**
- Edit action in bottom sheet navigates to Add Recipe form
- Form pre-filled with existing recipe data (edit mode)
- Navigation pushes onto current stack
- Back button returns to recipe detail screen

**Unsaved Changes Detection:**
- Only applies to Add/Edit Recipe form (not camera/OCR flow)
- Dialog appears when navigating away with unsaved changes
- Dialog options: Save / Discard / Cancel
- Applies to both gesture navigation and Android back button

**Cross-Tab Navigation:**
- Shopping list items link to recipe details
- Recipe detail screen works consistently from any entry point (Home tab, Shopping List tab)
- Proper back navigation maintains context

**Bottom Sheet Implementation:**
- Use @gorhom/bottom-sheet library (requires installation)
- Actions menu on recipe detail screen
- Contains: Edit Recipe, Delete Recipe
- Delete action shows confirmation dialog before deletion

**Android Back Button Handling:**
- Follows standard stack navigation behavior
- Triggers unsaved changes dialog on Add/Edit Recipe form
- Consistent with iOS gesture navigation behavior

### Reusability Opportunities

**Components to Reference:**
- RecipeRepositoryScreen at `app/(tabs)/index.tsx` for recipe list interface
- Existing tab navigation structure with Expo Router
- Recipe card components from current implementation
- Recipe data models and types from `types/` directory
- Existing UI components and styling patterns

**Backend Patterns:**
- Recipe data fetching patterns from current implementation
- State management for recipe operations
- Data models for recipe, ingredients, and related entities

### Scope Boundaries

**In Scope:**
- Complete bottom tab navigation setup (4 tabs)
- Stack navigation within tabs
- Recipe detail screen implementation
- Bottom sheet for recipe actions (Edit/Delete)
- Add Recipe choice screen
- Navigation to camera and manual entry screens
- Edit recipe flow using same form as add recipe
- Unsaved changes detection and confirmation dialog
- Cross-tab navigation (Shopping List to Recipe Details)
- Android back button handling
- Recipe deletion with confirmation
- "Add to Meal Plan" FAB on detail screen
- Integration with existing RecipeRepositoryScreen

**Out of Scope:**
- Deep linking to specific recipes
- Custom navigation transitions/animations
- Advanced gesture-based navigation
- Meal plan screen implementation (navigation structure only)
- Camera screen implementation details
- OCR/recipe scanning implementation
- Shopping list screen implementation details
- Manual recipe form implementation
- Actual meal planning functionality
- Recipe favoriting implementation
- Tab badge notifications
- Navigation analytics/tracking

**Future Enhancements Mentioned:**
- Deep linking capabilities
- Custom transitions between screens
- Advanced gestures for navigation
- Tab state persistence beyond defaults

### Technical Considerations

**Existing System Constraints:**
- App uses Expo Router for navigation
- Current RecipeRepositoryScreen exists at `app/(tabs)/index.tsx`
- React Native environment with TypeScript
- Recipe data models and types already defined

**Integration Points:**
- Bottom sheet library (@gorhom/bottom-sheet) needs installation
- Navigation must integrate with existing Expo Router setup
- Recipe detail screen needs access to recipe data
- Edit flow must interface with recipe update functionality
- Delete functionality requires confirmation and data removal
- Navigation state must work across tab boundaries

**Technology Stack:**
- Expo Router for navigation architecture
- @gorhom/bottom-sheet for action sheets
- React Navigation (underlying Expo Router)
- TypeScript for type safety
- Existing UI component library and design system

**Similar Code Patterns to Follow:**
- Use existing tab structure in Expo Router
- Follow current component architecture patterns
- Maintain consistency with RecipeRepositoryScreen UI patterns
- Use existing recipe data types and interfaces
- Follow established state management patterns

**Design System Considerations:**
- Follow high-fidelity mockups provided in `/assets/images/ui/`
- Maintain visual consistency with recipe card design
- Use established color scheme (orange accent, blue CTAs)
- Follow spacing and layout patterns from mockups
- Implement three-dot menu pattern for actions
- Use FAB pattern for primary actions
- Maintain bottom navigation design from mockups
