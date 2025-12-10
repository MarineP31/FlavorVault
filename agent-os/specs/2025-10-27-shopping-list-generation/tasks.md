# Tasks: Shopping List Generation

## Overview

Automatically generate and manage shopping lists from all recipes in the user's queue with intelligent ingredient aggregation, unit conversion, category grouping, and manual item support, enabling efficient grocery shopping with check-off functionality.

## Task Groups

### Group 1: Dependencies & Setup

**Priority: Critical**

#### Task 1.1: Package Installation & Configuration

- [ ] Install `react-native-reusables` UI component library
- [ ] Install `@react-native-async-storage/async-storage` for preferences
- [ ] Install icon library (react-native-vector-icons or similar)
- [ ] Update package.json with new dependencies
- [ ] Configure TypeScript types for new packages
- [ ] Set up icon font loading
- [ ] Configure UI component library

#### Task 1.2: Project Structure Setup

- [ ] Create `components/shopping-list/` directory structure
- [ ] Create `lib/services/` directory structure
- [ ] Create `lib/utils/` directory structure
- [ ] Create `lib/contexts/` directory structure
- [ ] Create `lib/hooks/` directory structure
- [ ] Set up shopping list component structure
- [ ] Configure file structure for shopping list components
- [ ] Add shopping list-specific assets and configurations

#### Task 1.3: Database Schema Migration

- [ ] Create migration file `lib/db/migrations/003_add_shopping_list_fields.ts`
- [ ] Add `category` column to shopping_list_items table
- [ ] Add `source` column to shopping_list_items table
- [ ] Add `originalName` column to shopping_list_items table
- [ ] Create index on category for fast grouping queries
- [ ] Create index on source for filtering recipe vs manual items
- [ ] Backfill existing data with default values
- [ ] Test database migration

### Group 2: Core Service Layer Implementation

**Priority: Critical**

#### Task 2.1: Shopping List Service

- [ ] Create `lib/db/services/shopping-list-service.ts`
- [ ] Implement `createItem()` method
- [ ] Implement `createBulk()` method
- [ ] Implement `getAll()` method
- [ ] Implement `getAllByCategory()` method
- [ ] Implement `updateCheckedState()` method
- [ ] Implement `deleteItem()` method
- [ ] Implement `deleteBySource()` method
- [ ] Implement `deleteByRecipeId()` method
- [ ] Implement `clearAll()` method
- [ ] Test shopping list service

#### Task 2.2: Shopping List Generator Service

- [ ] Create `lib/services/shopping-list-generator.ts`
- [ ] Implement `generateFromQueue()` method
- [ ] Implement `regenerateList()` method
- [ ] Implement `addManualItem()` method
- [ ] Add generator error handling
- [ ] Test shopping list generator service

#### Task 2.3: TypeScript Interfaces

- [ ] Define `ShoppingListItem` interface
- [ ] Define `GroupedShoppingListItems` interface
- [ ] Define `CreateShoppingListItemInput` interface
- [ ] Define `ManualItemInput` interface
- [ ] Add interface validation
- [ ] Test TypeScript interfaces

### Group 3: Ingredient Aggregation System

**Priority: High**

#### Task 3.1: Ingredient Aggregator Service

- [ ] Create `lib/services/ingredient-aggregator.ts`
- [ ] Implement core aggregation flow
- [ ] Add ingredient extraction from queued recipes
- [ ] Implement ingredient grouping by normalized name
- [ ] Add aggregation algorithm for compatible units
- [ ] Implement aggregation algorithm for incompatible units
- [ ] Test ingredient aggregator service

#### Task 3.2: Ingredient Name Normalizer

- [ ] Create `lib/utils/ingredient-normalizer.ts`
- [ ] Implement `normalizeIngredientName()` function
- [ ] Add lowercase conversion and trimming
- [ ] Implement plural/singular handling
- [ ] Add common descriptor removal
- [ ] Implement normalization edge cases
- [ ] Test ingredient name normalizer

#### Task 3.3: Aggregation Logic Implementation

- [ ] Implement ingredient grouping logic
- [ ] Add duplicate detection algorithm
- [ ] Implement quantity summation for compatible units
- [ ] Add separate line item creation for incompatible units
- [ ] Implement recipe reference tracking
- [ ] Test aggregation logic

### Group 4: Unit Conversion System

**Priority: High**

#### Task 4.1: Unit Converter Utility

- [ ] Create `lib/utils/unit-converter.ts`
- [ ] Implement volume conversion tables
- [ ] Implement weight conversion tables
- [ ] Add count unit handling
- [ ] Implement `convertToBaseUnit()` function
- [ ] Implement `convertToDisplayUnit()` function
- [ ] Test unit converter utility

#### Task 4.2: Conversion Logic Implementation

- [ ] Implement volume unit conversions (tsp, tbsp, cups, fl oz, ml, liters)
- [ ] Add weight unit conversions (oz, lbs, grams, kg)
- [ ] Implement count unit handling
- [ ] Add conversion validation
- [ ] Implement conversion error handling
- [ ] Test conversion logic

#### Task 4.3: Aggregation with Conversion

- [ ] Implement aggregation with unit conversion
- [ ] Add compatible unit detection
- [ ] Implement base unit conversion for aggregation
- [ ] Add display unit conversion for final output
- [ ] Implement conversion error handling
- [ ] Test aggregation with conversion

### Group 5: Category Classification System

**Priority: High**

#### Task 5.1: Category Classifier Utility

- [ ] Create `lib/utils/category-classifier.ts`
- [ ] Implement category keyword mappings
- [ ] Add Produce category keywords
- [ ] Add Dairy category keywords
- [ ] Add Meat & Seafood category keywords
- [ ] Add Pantry category keywords
- [ ] Add Frozen category keywords
- [ ] Add Bakery category keywords
- [ ] Test category classifier utility

#### Task 5.2: Classification Logic Implementation

- [ ] Implement `classifyIngredient()` function
- [ ] Add keyword matching algorithm
- [ ] Implement category assignment logic
- [ ] Add "Other" category fallback
- [ ] Implement classification edge cases
- [ ] Test classification logic

#### Task 5.3: Category Integration

- [ ] Integrate category classification with aggregation
- [ ] Add category assignment to shopping list items
- [ ] Implement category validation
- [ ] Add category error handling
- [ ] Test category integration

### Group 6: State Management with Context

**Priority: High**

#### Task 6.1: Shopping List Context

- [ ] Create `lib/contexts/shopping-list-context.tsx`
- [ ] Implement `ShoppingListContextType` interface
- [ ] Add context provider implementation
- [ ] Implement context state management
- [ ] Add context error handling
- [ ] Test shopping list context

#### Task 6.2: Context Methods Implementation

- [ ] Implement `toggleItemChecked()` method
- [ ] Add `addManualItem()` method
- [ ] Implement `deleteItem()` method
- [ ] Add `regenerateList()` method
- [ ] Implement `refreshList()` method
- [ ] Test context methods

#### Task 6.3: Queue Integration

- [ ] Subscribe to QueueContext for queue changes
- [ ] Implement automatic regeneration on queue changes
- [ ] Add debounced regeneration (500ms delay)
- [ ] Implement queue change handling
- [ ] Add queue integration error handling
- [ ] Test queue integration

### Group 7: Shopping List Screen Implementation

**Priority: High**

#### Task 7.1: Shopping List Screen

- [ ] Create `app/(tabs)/shopping-list.tsx` screen
- [ ] Implement SectionList component for categories
- [ ] Add pull-to-refresh functionality
- [ ] Implement empty state handling
- [ ] Add floating "Add Item" button
- [ ] Test shopping list screen

#### Task 7.2: Screen Layout and Navigation

- [ ] Implement screen layout structure
- [ ] Add navigation integration
- [ ] Implement screen state management
- [ ] Add screen error handling
- [ ] Test screen layout and navigation

#### Task 7.3: Tab Navigation Integration

- [ ] Update `app/(tabs)/_layout.tsx` to include shopping list tab
- [ ] Add shopping list tab icon
- [ ] Implement tab navigation
- [ ] Add tab accessibility
- [ ] Test tab navigation integration

### Group 8: Shopping List Item Components

**Priority: High**

#### Task 8.1: Shopping List Item Component

- [ ] Create `components/shopping-list/shopping-list-item.tsx`
- [ ] Implement checkbox with large tap target (44x44)
- [ ] Add item name display (bold, primary text)
- [ ] Implement quantity and unit display (smaller, secondary text)
- [ ] Add strikethrough styling when checked
- [ ] Test shopping list item component

#### Task 8.2: Item Interaction Logic

- [ ] Implement checkbox toggle functionality
- [ ] Add optimistic UI updates
- [ ] Implement checked state persistence
- [ ] Add item interaction error handling
- [ ] Test item interaction logic

#### Task 8.3: Item Styling and Accessibility

- [ ] Implement item styling
- [ ] Add item accessibility support
- [ ] Implement item animations
- [ ] Add item responsive design
- [ ] Test item styling and accessibility

### Group 9: Category Section Components

**Priority: Medium**

#### Task 9.1: Category Section Component

- [ ] Create `components/shopping-list/category-section.tsx`
- [ ] Implement category header with name and item count
- [ ] Add FlatList of shopping list items
- [ ] Implement alphabetical sorting within category
- [ ] Add category section styling
- [ ] Test category section component

#### Task 9.2: Category Section Logic

- [ ] Implement category section data handling
- [ ] Add category section state management
- [ ] Implement category section error handling
- [ ] Add category section performance optimization
- [ ] Test category section logic

### Group 10: Manual Item Management

**Priority: Medium**

#### Task 10.1: Add Manual Item Dialog

- [ ] Create `components/shopping-list/add-manual-item-dialog.tsx`
- [ ] Implement dialog/modal for manual item entry
- [ ] Add form fields for name, quantity, unit, category
- [ ] Implement form validation
- [ ] Add dialog styling and animations
- [ ] Test add manual item dialog

#### Task 10.2: Manual Item Form Logic

- [ ] Implement manual item form state management
- [ ] Add form validation with Zod schema
- [ ] Implement form submission handling
- [ ] Add form error handling
- [ ] Test manual item form logic

#### Task 10.3: Manual Item Persistence

- [ ] Implement manual item persistence logic
- [ ] Add manual item source flagging
- [ ] Implement manual item preservation through regeneration
- [ ] Add manual item deletion functionality
- [ ] Test manual item persistence

### Group 11: Empty State Handling

**Priority: Medium**

#### Task 11.1: Empty Shopping List Component

- [ ] Create `components/shopping-list/empty-shopping-list.tsx`
- [ ] Implement empty state message
- [ ] Add empty state styling
- [ ] Implement empty state accessibility
- [ ] Add empty state animations
- [ ] Test empty shopping list component

#### Task 11.2: Empty State Logic

- [ ] Implement empty collection detection
- [ ] Add empty state differentiation
- [ ] Implement empty state messaging
- [ ] Add empty state navigation guidance
- [ ] Test empty state logic

### Group 12: Regeneration and Synchronization

**Priority: High**

#### Task 12.1: Regeneration Logic Implementation

- [ ] Implement regeneration trigger logic
- [ ] Add recipe added to queue handling
- [ ] Implement recipe removed from queue handling
- [ ] Add recipe marked as cooked handling
- [ ] Implement regeneration error handling
- [ ] Test regeneration logic

#### Task 12.2: Synchronization Implementation

- [ ] Implement real-time sync with queue changes
- [ ] Add debounced regeneration (500ms)
- [ ] Implement synchronization error handling
- [ ] Add synchronization performance optimization
- [ ] Test synchronization implementation

#### Task 12.3: Regeneration Flow

- [ ] Implement delete all recipe-generated items
- [ ] Add preserve manual items logic
- [ ] Implement reset recipe-generated items to unchecked
- [ ] Add preserve manual items checked state
- [ ] Implement re-aggregate ingredients from current queue
- [ ] Test regeneration flow

### Group 13: Performance Optimization

**Priority: Medium**

#### Task 13.1: Database Performance

- [ ] Optimize database queries for grouping
- [ ] Add database indexing optimization
- [ ] Implement database connection management
- [ ] Add database performance monitoring
- [ ] Test database performance
- [ ] Add database performance error handling

#### Task 13.2: Aggregation Performance

- [ ] Optimize ingredient aggregation algorithm
- [ ] Add aggregation caching
- [ ] Implement aggregation performance monitoring
- [ ] Add aggregation performance optimization
- [ ] Test aggregation performance
- [ ] Add aggregation performance error handling

#### Task 13.3: UI Performance

- [ ] Optimize SectionList rendering
- [ ] Add virtual scrolling for large lists
- [ ] Implement UI performance monitoring
- [ ] Add UI performance optimization
- [ ] Test UI performance
- [ ] Add UI performance error handling

### Group 14: Error Handling & Validation

**Priority: Medium**

#### Task 14.1: Validation Implementation

- [ ] Implement Zod schema for manual item input
- [ ] Add business logic validation
- [ ] Implement validation error handling
- [ ] Add validation error recovery
- [ ] Test validation implementation
- [ ] Add validation edge cases

#### Task 14.2: Error Handling System

- [ ] Implement database error handling
- [ ] Add regeneration error handling
- [ ] Implement unit conversion error handling
- [ ] Add UI error handling
- [ ] Test error handling system
- [ ] Add error handling edge cases

#### Task 14.3: Error Recovery

- [ ] Implement error recovery mechanisms
- [ ] Add error retry functionality
- [ ] Implement error fallback handling
- [ ] Add error user feedback
- [ ] Test error recovery
- [ ] Add error recovery edge cases

### Group 15: Testing & Quality Assurance

**Priority: Medium**

#### Task 15.1: Unit Tests

- [ ] Create tests for shopping list service
- [ ] Test ingredient aggregator service
- [ ] Test unit converter utility
- [ ] Test category classifier utility
- [ ] Test shopping list context
- [ ] Test shopping list generator

#### Task 15.2: Integration Tests

- [ ] Test complete shopping list generation flow
- [ ] Test ingredient aggregation integration
- [ ] Test unit conversion integration
- [ ] Test category classification integration
- [ ] Test regeneration flow
- [ ] Test manual item management

#### Task 15.3: End-to-End Tests

- [ ] Test shopping list generation from queue
- [ ] Test ingredient aggregation with duplicates
- [ ] Test unit conversion scenarios
- [ ] Test category grouping
- [ ] Test check-off functionality
- [ ] Test manual item addition

#### Task 15.4: Performance Tests

- [ ] Test shopping list generation performance
- [ ] Test aggregation performance with large datasets
- [ ] Test UI performance with many items
- [ ] Test regeneration performance
- [ ] Test synchronization performance
- [ ] Validate success criteria performance targets

## Success Criteria Checklist

- [ ] Shopping list automatically generates from all queued recipes in under 2 seconds for 10 recipes
- [ ] Duplicate ingredients correctly aggregated with proper unit conversion (e.g., 8 tbsp + 8 tbsp = 1 cup)
- [ ] Ingredient name normalization detects duplicates across case and plural variations
- [ ] Items grouped by category in consistent, logical order
- [ ] Check-off functionality updates immediately with strikethrough styling
- [ ] Manual items persist through queue regeneration cycles
- [ ] Shopping list updates within 1 second when queue changes (recipe added/removed)
- [ ] Recipe marked as cooked removes its ingredients from shopping list immediately
- [ ] All items display with correct quantity, unit, and category
- [ ] No duplicate items created for same ingredient from multiple recipes
- [ ] Zero crashes during shopping list operations in testing
- [ ] Performance remains smooth with 50+ shopping list items

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
