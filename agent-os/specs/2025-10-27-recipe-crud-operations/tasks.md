# Tasks: Recipe CRUD Operations

## Overview

Enable users to create, view, edit, and delete recipes through intuitive mobile interfaces with form validation, image capture, and dynamic field management, integrating with the Local Storage Foundation database layer.

## Task Groups

### Group 1: Dependencies & Setup

**Priority: Critical**

#### Task 1.1: Package Installation & Configuration

- [x] Install `expo-image-picker` for camera and photo library access
- [x] Install `expo-camera` for camera permissions
- [x] Install `react-hook-form` for form management
- [x] Install `@hookform/resolvers` for Zod integration
- [x] Install `zod` for schema validation
- [ ] Install `react-native-reusables` UI component library (skipped - custom components built instead)
- [x] Update package.json with new dependencies
- [x] Configure TypeScript types for new packages

#### Task 1.2: Project Structure Setup

- [x] Create `app/recipes/` directory structure
- [x] Create `components/recipes/` directory structure
- [x] Create `components/ui/` directory structure
- [x] Create `lib/validations/` directory structure
- [x] Create `lib/utils/` directory structure
- [x] Set up recipe-specific navigation routes
- [x] Configure file structure for recipe components
- [x] Add recipe-specific assets and configurations

#### Task 1.3: Permission Configuration

- [x] Configure camera permissions in app.json
- [x] Configure photo library permissions in app.json
- [x] Set up permission request handlers
- [x] Add permission denial handling
- [x] Test permissions on iOS and Android
- [x] Add permission status checking utilities

### Group 2: Database Schema & Validation

**Priority: Critical**

#### Task 2.1: Recipe Form Schema

- [x] Create `lib/validations/recipe-form-schema.ts`
- [x] Define Zod schema for recipe form validation
- [x] Add title validation (required, max 200 characters)
- [x] Add ingredients validation (array, min 1, name required)
- [x] Add instructions validation (array, min 1, non-empty)
- [x] Add optional fields validation (servings, prep time, cook time)
- [x] Add image and source validation
- [x] Add tags validation (predefined options only)

#### Task 2.2: Ingredient Schema

- [x] Define ingredient object schema
- [x] Add name field validation (required)
- [x] Add quantity field validation (optional)
- [x] Add unit field validation (optional, enum values)
- [x] Add order index validation
- [x] Test ingredient schema validation
- [x] Add ingredient array validation

#### Task 2.3: Instruction Schema

- [x] Define instruction step schema
- [x] Add step text validation (required, non-empty)
- [x] Add order index validation
- [x] Test instruction schema validation
- [x] Add instruction array validation

#### Task 2.4: Tag Schema

- [x] Define tag categories enum
- [x] Add cuisine tags validation
- [x] Add dietary tags validation
- [x] Add meal type tags validation
- [x] Add cooking method tags validation
- [x] Test tag schema validation
- [x] Add tag array validation

### Group 3: UI Components Foundation

**Priority: High**

#### Task 3.1: React Native Reusables Setup

- [ ] Install and configure React Native Reusables (skipped - custom components built instead)
- [x] Set up Button component
- [x] Set up Input component
- [x] Set up Label component
- [x] Set up Select/Dropdown component
- [x] Set up Dialog/Modal component
- [x] Set up Toast component
- [x] Set up FAB (Floating Action Button) component

#### Task 3.2: Base UI Components

- [x] Create `components/ui/button.tsx` wrapper
- [x] Create `components/ui/input.tsx` wrapper
- [x] Create `components/ui/label.tsx` wrapper
- [x] Create `components/ui/select.tsx` wrapper
- [x] Create `components/ui/dialog.tsx` wrapper
- [x] Create `components/ui/toast.tsx` wrapper
- [x] Create `components/ui/fab.tsx` wrapper
- [x] Test all base UI components

#### Task 3.3: Recipe-Specific Components

- [x] Create `components/recipes/ingredient-input.tsx`
- [x] Create `components/recipes/step-input.tsx`
- [x] Create `components/recipes/tag-selector.tsx`
- [x] Create `components/recipes/image-picker-button.tsx`
- [x] Create `components/recipes/recipe-detail-card.tsx`
- [x] Create `components/recipes/recipe-form-fields.tsx`
- [x] Test all recipe-specific components

### Group 4: Image Handling System

**Priority: High**

#### Task 4.1: Image Picker Component

- [x] Create `components/recipes/image-picker-button.tsx`
- [x] Implement camera capture functionality
- [x] Implement photo library selection
- [x] Add action sheet for source selection
- [x] Implement permission handling
- [x] Add image preview functionality
- [x] Test image picker on both platforms

#### Task 4.2: Image Processing Utilities

- [x] Create `lib/utils/image-processor.ts`
- [x] Implement image optimization (resize to max 1200px width)
- [x] Add image compression (80% quality)
- [x] Implement WebP format conversion
- [x] Add UUID filename generation
- [x] Implement image storage in document directory
- [x] Add image cleanup utilities

#### Task 4.3: Image Display Components

- [x] Implement image thumbnail display
- [x] Add full-size image viewing
- [x] Implement image removal functionality
- [x] Add image loading states
- [x] Implement image error handling
- [x] Test image display across different screen sizes

### Group 5: Recipe Form Implementation

**Priority: High**

#### Task 5.1: Recipe Form Screen

- [x] Create `app/recipes/form.tsx` screen
- [x] Implement React Hook Form setup
- [x] Add Zod resolver integration
- [x] Implement form state management
- [x] Add real-time validation
- [x] Implement form submission handling
- [x] Add error handling and display

#### Task 5.2: Basic Info Section

- [x] Implement title input field
- [x] Add source input field
- [x] Integrate image picker component
- [x] Add image preview and removal
- [x] Implement validation for basic info
- [x] Add error message display

#### Task 5.3: Time & Servings Section

- [x] Implement prep time input field
- [x] Add cook time input field
- [x] Implement servings input field
- [x] Add number input validation
- [x] Implement time format handling
- [x] Add optional field indicators

#### Task 5.4: Dynamic Ingredients Section

- [x] Implement useFieldArray for ingredients
- [x] Add ingredient input component integration
- [x] Implement add ingredient functionality
- [x] Add remove ingredient functionality
- [x] Implement ingredient reordering
- [x] Add minimum ingredient validation

#### Task 5.5: Dynamic Instructions Section

- [x] Implement useFieldArray for instructions
- [x] Add step input component integration
- [x] Implement add step functionality
- [x] Add remove step functionality
- [x] Implement step reordering
- [x] Add minimum step validation

#### Task 5.6: Tags Section

- [x] Implement tag selector component
- [x] Add multi-select functionality
- [x] Implement tag category organization
- [x] Add tag validation
- [x] Implement tag display
- [x] Add tag removal functionality

### Group 6: Recipe Detail View

**Priority: High**

#### Task 6.1: Recipe Detail Screen

- [x] Create `app/recipe/[id].tsx` screen
- [x] Implement recipe data fetching
- [x] Add loading states
- [x] Implement error handling
- [x] Add navigation integration
- [x] Test recipe detail screen

#### Task 6.2: Recipe Display Layout

- [x] Implement recipe image display
- [x] Add recipe title display
- [x] Implement source attribution display
- [x] Add time and servings display
- [x] Implement ingredient list display
- [x] Add instruction steps display

#### Task 6.3: Action Buttons

- [x] Implement Edit button
- [x] Add Delete button
- [x] Add "Add to Meal Plan" placeholder button
- [x] Implement button styling
- [x] Add button accessibility
- [x] Test action button functionality

#### Task 6.4: Tags Display

- [x] Implement tag chips display
- [x] Add tag category organization
- [x] Implement tag styling
- [x] Add tag accessibility
- [x] Test tag display functionality

### Group 7: CRUD Operations Integration

**Priority: High**

#### Task 7.1: Create Operation

- [x] Integrate RecipeService.create() method
- [x] Implement form data transformation
- [x] Add database error handling
- [x] Implement success toast notification
- [x] Add navigation to recipe detail
- [x] Test create operation end-to-end

#### Task 7.2: Read Operation

- [x] Integrate RecipeService.getById() method
- [x] Implement recipe data fetching
- [x] Add loading state management
- [x] Implement error handling
- [x] Add data validation
- [x] Test read operation

#### Task 7.3: Update Operation

- [x] Integrate RecipeService.update() method
- [x] Implement form pre-population
- [x] Add update data transformation
- [x] Implement success toast notification
- [x] Add navigation back to detail
- [x] Test update operation end-to-end

#### Task 7.4: Delete Operation

- [x] Integrate RecipeService.delete() method
- [x] Implement delete confirmation dialog
- [x] Add confirmation dialog component
- [x] Implement success toast notification
- [x] Add navigation back to list
- [x] Test delete operation end-to-end

### Group 8: Navigation Integration

**Priority: Medium**

#### Task 8.1: Recipe Navigation Layout

- [x] Create `app/recipes/_layout.tsx` stack navigator (not needed - handled in app/_layout.tsx)
- [x] Implement recipe screen navigation
- [x] Add navigation state management
- [x] Implement back button handling (handled by Expo Router)
- [x] Add navigation transitions (handled by Expo Router)
- [x] Test navigation flows

#### Task 8.2: FAB Integration

- [x] Implement FAB button on recipe list
- [x] Add FAB styling and positioning
- [x] Implement FAB press handling
- [x] Add FAB accessibility
- [x] Test FAB functionality
- [x] Integrate with navigation flow

#### Task 8.3: Navigation Flows

- [x] Implement Create flow navigation
- [x] Add Read flow navigation
- [x] Implement Update flow navigation
- [x] Add Delete flow navigation
- [x] Test all navigation flows
- [x] Add navigation error handling

### Group 9: Form Validation & Error Handling

**Priority: Medium**

#### Task 9.1: Form Validation Implementation

- [x] Implement real-time validation
- [x] Add inline error message display
- [x] Implement field-level validation
- [x] Add form-level validation
- [x] Implement validation error styling
- [x] Test validation across all fields

#### Task 9.2: Error Handling System

- [x] Implement database error handling
- [x] Add image upload error handling
- [x] Implement permission error handling
- [x] Add network error handling
- [x] Implement validation error handling
- [x] Add error recovery mechanisms

#### Task 9.3: Success Feedback System

- [x] Implement success toast notifications
- [x] Add create success feedback
- [x] Implement update success feedback
- [x] Add delete success feedback
- [x] Implement error toast notifications
- [x] Test all feedback systems

### Group 10: Delete Confirmation System

**Priority: Medium**

#### Task 10.1: Confirmation Dialog Component

- [x] Create delete confirmation dialog component
- [x] Implement dialog styling
- [x] Add confirmation message
- [x] Implement cancel functionality
- [x] Add confirm functionality
- [x] Test dialog component

#### Task 10.2: Delete Flow Integration

- [x] Integrate confirmation dialog with delete button
- [x] Implement dialog state management
- [x] Add dialog accessibility
- [x] Implement dialog animations
- [x] Test delete confirmation flow
- [x] Add dialog error handling

### Group 11: Performance & Optimization

**Priority: Medium**

#### Task 11.1: Form Performance

- [x] Optimize dynamic field rendering
- [x] Implement FlatList for large ingredient lists (used React.memo instead - more appropriate)
- [x] Add form state optimization
- [x] Implement lazy loading for images
- [x] Add form validation optimization
- [x] Test form performance

#### Task 11.2: Image Performance

- [x] Optimize image compression
- [x] Implement image caching
- [x] Add image lazy loading
- [x] Implement image memory management
- [x] Add image loading optimization
- [x] Test image performance

#### Task 11.3: Database Performance

- [x] Optimize database queries
- [x] Add database indexing
- [x] Implement query optimization
- [x] Add database connection management
- [x] Implement data caching
- [x] Test database performance

### Group 12: Testing & Quality Assurance

**Priority: Medium**

#### Task 12.1: Unit Tests

- [x] Create tests for recipe form validation
- [x] Test ingredient input components
- [x] Test instruction input components
- [x] Test tag selector components
- [x] Test image picker components
- [x] Test recipe detail components

#### Task 12.2: Integration Tests

- [x] Test complete create flow
- [x] Test complete read flow
- [x] Test complete update flow
- [x] Test complete delete flow
- [x] Test navigation flows
- [x] Test error handling scenarios

#### Task 12.3: End-to-End Tests

- [x] Test recipe creation with all fields
- [x] Test recipe creation with minimal fields
- [x] Test recipe editing with image changes
- [x] Test recipe deletion with confirmation
- [x] Test form validation edge cases
- [x] Test image handling edge cases

#### Task 12.4: Performance Tests

- [x] Test form performance with many ingredients
- [x] Test form performance with many steps
- [x] Test image processing performance
- [x] Test database operation performance
- [x] Test navigation performance
- [x] Validate success criteria performance targets

## Success Criteria Checklist

- [x] User can create a recipe with all required fields and save to database in under 2 minutes
- [x] Form validation provides clear, immediate feedback for invalid inputs
- [x] Recipe detail view displays all recipe information in readable, organized format
- [x] Images captured via camera or selected from library display correctly in forms and detail view
- [x] Edit operation pre-fills all existing data and saves updates without data loss
- [x] Delete operation requires confirmation and permanently removes recipe from database
- [x] All CRUD operations complete in under 1 second for typical recipe (10 ingredients, 8 steps)
- [x] Toast notifications appear for all success and error states
- [x] Navigation flows work smoothly without unexpected back stack behavior
- [x] Forms work correctly with dynamic ingredient/step arrays (add, remove, reorder)
- [x] Tag selection supports multiple selections across all four categories
- [x] Zero crashes during recipe CRUD operations in testing

## Dependencies

- Local Storage Foundation (database schema and services)
- expo-image-picker package
- expo-camera package
- react-hook-form package
- zod package
- react-native-reusables package

## Notes

- This is foundational functionality that other features will build upon
- Focus on establishing patterns that future features will follow
- Ensure proper error handling and user feedback throughout
- Test thoroughly with various recipe sizes and complexities
- Optimize for mobile performance and user experience
- Maintain consistency with React Native Reusables design system
