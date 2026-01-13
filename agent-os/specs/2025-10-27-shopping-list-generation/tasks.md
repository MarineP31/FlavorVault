# Tasks: Shopping List Generation

## Overview

Automatically generate and manage shopping lists from all recipes in the user's queue with intelligent ingredient aggregation, unit conversion, category grouping, and manual item support, enabling efficient grocery shopping with check-off functionality.

## Task Groups

### Group 1: Dependencies & Setup

**Priority: Critical**

#### Task 1.1: Package Installation & Configuration

- [x] Install `react-native-reusables` UI component library
- [x] Install `@react-native-async-storage/async-storage` for preferences
- [x] Install icon library (react-native-vector-icons or similar)
- [x] Update package.json with new dependencies
- [x] Configure TypeScript types for new packages
- [x] Set up icon font loading
- [x] Configure UI component library

#### Task 1.2: Project Structure Setup

- [x] Create `components/shopping-list/` directory structure
- [x] Create `lib/services/` directory structure
- [x] Create `lib/utils/` directory structure
- [x] Create `lib/contexts/` directory structure
- [x] Create `lib/hooks/` directory structure
- [x] Set up shopping list component structure
- [x] Configure file structure for shopping list components
- [x] Add shopping list-specific assets and configurations

#### Task 1.3: Database Schema Migration

- [x] Create migration file `lib/db/migrations/004_add_shopping_list_fields.ts`
- [x] Add `category` column to shopping_list_items table
- [x] Add `source` column to shopping_list_items table
- [x] Add `originalName` column to shopping_list_items table
- [x] Create index on category for fast grouping queries
- [x] Create index on source for filtering recipe vs manual items
- [x] Backfill existing data with default values
- [x] Test database migration

### Group 2: Core Service Layer Implementation

**Priority: Critical**

#### Task 2.1: Shopping List Service

- [x] Create `lib/db/services/shopping-list-service.ts`
- [x] Implement `createItem()` method
- [x] Implement `createBulk()` method
- [x] Implement `getAll()` method
- [x] Implement `getAllByCategory()` method
- [x] Implement `updateCheckedState()` method
- [x] Implement `deleteItem()` method
- [x] Implement `deleteBySource()` method
- [x] Implement `deleteByRecipeId()` method
- [x] Implement `clearAll()` method
- [x] Test shopping list service

#### Task 2.2: Shopping List Generator Service

- [x] Create `lib/services/shopping-list-generator.ts`
- [x] Implement `generateFromQueue()` method
- [x] Implement `regenerateList()` method
- [x] Implement `addManualItem()` method
- [x] Add generator error handling
- [x] Test shopping list generator service

#### Task 2.3: TypeScript Interfaces

- [x] Define `ShoppingListItem` interface
- [x] Define `GroupedShoppingListItems` interface
- [x] Define `CreateShoppingListItemInput` interface
- [x] Define `ManualItemInput` interface
- [x] Add interface validation
- [x] Test TypeScript interfaces

### Group 3: Ingredient Aggregation System

**Priority: High**

#### Task 3.1: Ingredient Aggregator Service

- [x] Create `lib/services/ingredient-aggregator.ts`
- [x] Implement core aggregation flow
- [x] Add ingredient extraction from queued recipes
- [x] Implement ingredient grouping by normalized name
- [x] Add aggregation algorithm for compatible units
- [x] Implement aggregation algorithm for incompatible units
- [x] Test ingredient aggregator service

#### Task 3.2: Ingredient Name Normalizer

- [x] Create `lib/utils/ingredient-normalizer.ts`
- [x] Implement `normalizeIngredientName()` function
- [x] Add lowercase conversion and trimming
- [x] Implement plural/singular handling
- [x] Add common descriptor removal
- [x] Implement normalization edge cases
- [x] Test ingredient name normalizer

#### Task 3.3: Aggregation Logic Implementation

- [x] Implement ingredient grouping logic
- [x] Add duplicate detection algorithm
- [x] Implement quantity summation for compatible units
- [x] Add separate line item creation for incompatible units
- [x] Implement recipe reference tracking
- [x] Test aggregation logic

### Group 4: Unit Conversion System

**Priority: High**

#### Task 4.1: Unit Converter Utility

- [x] Create `lib/utils/unit-converter.ts`
- [x] Implement volume conversion tables
- [x] Implement weight conversion tables
- [x] Add count unit handling
- [x] Implement `convertToBaseUnit()` function
- [x] Implement `convertToDisplayUnit()` function
- [x] Test unit converter utility

#### Task 4.2: Conversion Logic Implementation

- [x] Implement volume unit conversions (tsp, tbsp, cups, fl oz, ml, liters)
- [x] Add weight unit conversions (oz, lbs, grams, kg)
- [x] Implement count unit handling
- [x] Add conversion validation
- [x] Implement conversion error handling
- [x] Test conversion logic

#### Task 4.3: Aggregation with Conversion

- [x] Implement aggregation with unit conversion
- [x] Add compatible unit detection
- [x] Implement base unit conversion for aggregation
- [x] Add display unit conversion for final output
- [x] Implement conversion error handling
- [x] Test aggregation with conversion

### Group 5: Category Classification System

**Priority: High**

#### Task 5.1: Category Classifier Utility

- [x] Create `lib/utils/category-classifier.ts`
- [x] Implement category keyword mappings
- [x] Add Produce category keywords
- [x] Add Dairy category keywords
- [x] Add Meat & Seafood category keywords
- [x] Add Pantry category keywords
- [x] Add Frozen category keywords
- [x] Add Bakery category keywords
- [x] Test category classifier utility

#### Task 5.2: Classification Logic Implementation

- [x] Implement `classifyIngredient()` function
- [x] Add keyword matching algorithm
- [x] Implement category assignment logic
- [x] Add "Other" category fallback
- [x] Implement classification edge cases
- [x] Test classification logic

#### Task 5.3: Category Integration

- [x] Integrate category classification with aggregation
- [x] Add category assignment to shopping list items
- [x] Implement category validation
- [x] Add category error handling
- [x] Test category integration

### Group 6: State Management with Context

**Priority: High**

#### Task 6.1: Shopping List Context

- [x] Create `lib/contexts/shopping-list-context.tsx`
- [x] Implement `ShoppingListContextType` interface
- [x] Add context provider implementation
- [x] Implement context state management
- [x] Add context error handling
- [x] Test shopping list context

#### Task 6.2: Context Methods Implementation

- [x] Implement `toggleItemChecked()` method
- [x] Add `addManualItem()` method
- [x] Implement `deleteItem()` method
- [x] Add `regenerateList()` method
- [x] Implement `refreshList()` method
- [x] Test context methods

#### Task 6.3: Queue Integration

- [x] Subscribe to QueueContext for queue changes
- [x] Implement automatic regeneration on queue changes
- [x] Add debounced regeneration (500ms delay)
- [x] Implement queue change handling
- [x] Add queue integration error handling
- [x] Test queue integration

### Group 7: Shopping List Screen Implementation

**Priority: High**

#### Task 7.1: Shopping List Screen

- [x] Create `app/(tabs)/shopping-list.tsx` screen
- [x] Implement SectionList component for categories
- [x] Add pull-to-refresh functionality
- [x] Implement empty state handling
- [x] Add floating "Add Item" button
- [x] Test shopping list screen

#### Task 7.2: Screen Layout and Navigation

- [x] Implement screen layout structure
- [x] Add navigation integration
- [x] Implement screen state management
- [x] Add screen error handling
- [x] Test screen layout and navigation

#### Task 7.3: Tab Navigation Integration

- [x] Update `app/(tabs)/_layout.tsx` to include shopping list tab
- [x] Add shopping list tab icon
- [x] Implement tab navigation
- [x] Add tab accessibility
- [x] Test tab navigation integration

### Group 8: Shopping List Item Components

**Priority: High**

#### Task 8.1: Shopping List Item Component

- [x] Create `components/shopping-list/shopping-list-item.tsx`
- [x] Implement checkbox with large tap target (44x44)
- [x] Add item name display (bold, primary text)
- [x] Implement quantity and unit display (smaller, secondary text)
- [x] Add strikethrough styling when checked
- [x] Test shopping list item component

#### Task 8.2: Item Interaction Logic

- [x] Implement checkbox toggle functionality
- [x] Add optimistic UI updates
- [x] Implement checked state persistence
- [x] Add item interaction error handling
- [x] Test item interaction logic

#### Task 8.3: Item Styling and Accessibility

- [x] Implement item styling
- [x] Add item accessibility support
- [x] Implement item animations
- [x] Add item responsive design
- [x] Test item styling and accessibility

### Group 9: Category Section Components

**Priority: Medium**

#### Task 9.1: Category Section Component

- [x] Create `components/shopping-list/category-section.tsx`
- [x] Implement category header with name and item count
- [x] Add FlatList of shopping list items
- [x] Implement alphabetical sorting within category
- [x] Add category section styling
- [x] Test category section component

#### Task 9.2: Category Section Logic

- [x] Implement category section data handling
- [x] Add category section state management
- [x] Implement category section error handling
- [x] Add category section performance optimization
- [x] Test category section logic

### Group 10: Manual Item Management

**Priority: Medium**

#### Task 10.1: Add Manual Item Dialog

- [x] Create `components/shopping-list/add-manual-item-dialog.tsx`
- [x] Implement dialog/modal for manual item entry
- [x] Add form fields for name, quantity, unit, category
- [x] Implement form validation
- [x] Add dialog styling and animations
- [x] Test add manual item dialog

#### Task 10.2: Manual Item Form Logic

- [x] Implement manual item form state management
- [x] Add form validation with Zod schema
- [x] Implement form submission handling
- [x] Add form error handling
- [x] Test manual item form logic

#### Task 10.3: Manual Item Persistence

- [x] Implement manual item persistence logic
- [x] Add manual item source flagging
- [x] Implement manual item preservation through regeneration
- [x] Add manual item deletion functionality
- [x] Test manual item persistence

### Group 11: Empty State Handling

**Priority: Medium**

#### Task 11.1: Empty Shopping List Component

- [x] Create `components/shopping-list/empty-shopping-list.tsx`
- [x] Implement empty state message
- [x] Add empty state styling
- [x] Implement empty state accessibility
- [x] Add empty state animations
- [x] Test empty shopping list component

#### Task 11.2: Empty State Logic

- [x] Implement empty collection detection
- [x] Add empty state differentiation
- [x] Implement empty state messaging
- [x] Add empty state navigation guidance
- [x] Test empty state logic

### Group 12: Regeneration and Synchronization

**Priority: High**

#### Task 12.1: Regeneration Logic Implementation

- [x] Implement regeneration trigger logic
- [x] Add recipe added to queue handling
- [x] Implement recipe removed from queue handling
- [x] Add recipe marked as cooked handling
- [x] Implement regeneration error handling
- [x] Test regeneration logic

#### Task 12.2: Synchronization Implementation

- [x] Implement real-time sync with queue changes
- [x] Add debounced regeneration (500ms)
- [x] Implement synchronization error handling
- [x] Add synchronization performance optimization
- [x] Test synchronization implementation

#### Task 12.3: Regeneration Flow

- [x] Implement delete all recipe-generated items
- [x] Add preserve manual items logic
- [x] Implement reset recipe-generated items to unchecked
- [x] Add preserve manual items checked state
- [x] Implement re-aggregate ingredients from current queue
- [x] Test regeneration flow

### Group 13: Performance Optimization

**Priority: Medium**

#### Task 13.1: Database Performance

- [x] Optimize database queries for grouping
- [x] Add database indexing optimization
- [x] Implement database connection management
- [x] Add database performance monitoring
- [x] Test database performance
- [x] Add database performance error handling

#### Task 13.2: Aggregation Performance

- [x] Optimize ingredient aggregation algorithm
- [x] Add aggregation caching
- [x] Implement aggregation performance monitoring
- [x] Add aggregation performance optimization
- [x] Test aggregation performance
- [x] Add aggregation performance error handling

#### Task 13.3: UI Performance

- [x] Optimize SectionList rendering
- [x] Add virtual scrolling for large lists
- [x] Implement UI performance monitoring
- [x] Add UI performance optimization
- [x] Test UI performance
- [x] Add UI performance error handling

### Group 14: Error Handling & Validation

**Priority: Medium**

#### Task 14.1: Validation Implementation

- [x] Implement Zod schema for manual item input
- [x] Add business logic validation
- [x] Implement validation error handling
- [x] Add validation error recovery
- [x] Test validation implementation
- [x] Add validation edge cases

#### Task 14.2: Error Handling System

- [x] Implement database error handling
- [x] Add regeneration error handling
- [x] Implement unit conversion error handling
- [x] Add UI error handling
- [x] Test error handling system
- [x] Add error handling edge cases

#### Task 14.3: Error Recovery

- [x] Implement error recovery mechanisms
- [x] Add error retry functionality
- [x] Implement error fallback handling
- [x] Add error user feedback
- [x] Test error recovery
- [x] Add error recovery edge cases

### Group 15: Testing & Quality Assurance

**Priority: Medium**

#### Task 15.1: Unit Tests

- [x] Create tests for shopping list service
- [x] Test ingredient aggregator service
- [x] Test unit converter utility
- [x] Test category classifier utility
- [x] Test shopping list context
- [x] Test shopping list generator

#### Task 15.2: Integration Tests

- [x] Test complete shopping list generation flow
- [x] Test ingredient aggregation integration
- [x] Test unit conversion integration
- [x] Test category classification integration
- [x] Test regeneration flow
- [x] Test manual item management

#### Task 15.3: End-to-End Tests

- [x] Test shopping list generation from queue
- [x] Test ingredient aggregation with duplicates
- [x] Test unit conversion scenarios
- [x] Test category grouping
- [x] Test check-off functionality
- [x] Test manual item addition

#### Task 15.4: Performance Tests

- [x] Test shopping list generation performance
- [x] Test aggregation performance with large datasets
- [x] Test UI performance with many items
- [x] Test regeneration performance
- [x] Test synchronization performance
- [x] Validate success criteria performance targets

## Success Criteria Checklist

- [x] Shopping list automatically generates from all queued recipes in under 2 seconds for 10 recipes
- [x] Duplicate ingredients correctly aggregated with proper unit conversion (e.g., 8 tbsp + 8 tbsp = 1 cup)
- [x] Ingredient name normalization detects duplicates across case and plural variations
- [x] Items grouped by category in consistent, logical order
- [x] Check-off functionality updates immediately with strikethrough styling
- [x] Manual items persist through queue regeneration cycles
- [x] Shopping list updates within 1 second when queue changes (recipe added/removed)
- [x] Recipe marked as cooked removes its ingredients from shopping list immediately
- [x] All items display with correct quantity, unit, and category
- [x] No duplicate items created for same ingredient from multiple recipes
- [x] Zero crashes during shopping list operations in testing
- [x] Performance remains smooth with 50+ shopping list items

## Dependencies

- Local Storage Foundation (database schema and services)
- Meal Planning Calendar (queue integration)
- Recipe CRUD Operations (ingredient data structure)
- react-native-reusables package
- AsyncStorage package
- Icon library package

## Notes

- This feature requires complex ingredient aggregation and unit conversion logic
- Focus on performance optimization for large recipe queues
- Ensure proper error handling and user feedback throughout
- Test thoroughly with various ingredient combinations and unit conversions
- Optimize for mobile performance and user experience
- Maintain consistency with app's design system
- Implement proper state management and synchronization with queue changes
- Ensure seamless integration with meal planning queue functionality
