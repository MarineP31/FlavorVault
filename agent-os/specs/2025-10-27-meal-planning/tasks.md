# Tasks: Meal Planning (Recipe Queue)

## Overview

Enable users to plan meals using a simplified chronological recipe queue where they can add multiple recipes, view them in order, mark them as cooked, and automatically generate shopping lists from queued recipes.

## Task Groups

### Group 1: Database Schema & Service Layer

**Priority: Critical**

#### Task 1.1: Database Schema Implementation

- [ ] Create migration file `lib/db/migrations/003_create_recipe_queue.ts`
- [ ] Define `recipe_queue` table schema with id, recipeId, createdAt
- [ ] Add UNIQUE constraint on recipeId to prevent duplicates
- [ ] Create indexes on recipeId and createdAt for performance
- [ ] Add foreign key constraint with CASCADE delete
- [ ] Test migration execution and rollback

#### Task 1.2: Queue Service Implementation

- [ ] Create `lib/db/services/queue-service.ts`
- [ ] Implement `addToQueue(recipeId: string)` method
- [ ] Implement `addMultipleToQueue(recipeIds: string[])` with transactions
- [ ] Implement `removeFromQueue(queueItemId: string)` method
- [ ] Implement `removeRecipeFromQueue(recipeId: string)` method
- [ ] Implement `getQueuedRecipes()` with recipe joins
- [ ] Implement `isRecipeInQueue(recipeId: string)` method
- [ ] Implement `clearQueue()` method
- [ ] Add proper error handling and validation

#### Task 1.3: TypeScript Interfaces

- [ ] Create `QueueItem` interface in `lib/db/schema/queue.ts`
- [ ] Create `QueuedRecipe` interface extending Recipe
- [ ] Add Zod validation schema for QueueItem
- [ ] Export interfaces for use across the app
- [ ] Add type guards for queue operations

### Group 2: Queue Context & State Management

**Priority: High**

#### Task 2.1: Queue Context Provider

- [ ] Create `lib/contexts/queue-context.tsx`
- [ ] Define `QueueContextType` interface
- [ ] Implement queue state management with Set<string> for IDs
- [ ] Add async operations: addToQueue, addMultipleToQueue, removeFromQueue
- [ ] Implement optimistic updates for better UX
- [ ] Add loading states and error handling
- [ ] Implement automatic refresh after mutations

#### Task 2.2: Queue Hooks

- [ ] Create `lib/hooks/use-queue.ts` hook
- [ ] Implement queue operations with error handling
- [ ] Add queue membership checking functionality
- [ ] Implement queue refresh logic
- [ ] Add loading and error states
- [ ] Export hook for use in components

#### Task 2.3: Multi-Select Hook

- [ ] Create `lib/hooks/use-multi-select.ts` hook
- [ ] Implement multi-select state management
- [ ] Add selection/deselection logic
- [ ] Implement batch operations
- [ ] Add visual feedback states
- [ ] Handle selection persistence during operations

### Group 3: Queue Screen Implementation

**Priority: High**

#### Task 3.1: Queue Tab Screen

- [ ] Create `app/(tabs)/queue.tsx` screen
- [ ] Implement FlatList for recipe display
- [ ] Add pull-to-refresh functionality
- [ ] Implement empty state component
- [ ] Add navigation to recipe detail view
- [ ] Integrate with queue context

#### Task 3.2: Queue Recipe Card Component

- [ ] Create `components/queue/queue-recipe-card.tsx`
- [ ] Design card layout with recipe thumbnail
- [ ] Display recipe title, prep time, cook time, servings
- [ ] Add "Mark as Cooked" button with checkmark icon
- [ ] Add "Remove" button with trash icon
- [ ] Implement card tap navigation to recipe detail
- [ ] Add confirmation dialog for remove action

#### Task 3.3: Queue Empty State

- [ ] Create `components/queue/queue-empty-state.tsx`
- [ ] Design empty state message and illustration
- [ ] Add "Add recipes to get started!" message
- [ ] Include navigation hint to recipe list
- [ ] Style consistently with app design system

### Group 4: Multi-Select Mode Implementation

**Priority: High**

#### Task 4.1: Recipe List Multi-Select Enhancement

- [ ] Extend existing recipe list view with multi-select mode
- [ ] Add multi-select toggle button in header
- [ ] Implement long-press activation for multi-select
- [ ] Add checkbox display on recipe cards
- [ ] Hide queue badges during multi-select mode
- [ ] Implement selection state management

#### Task 4.2: Multi-Select UI Components

- [ ] Create floating action bar for multi-select operations
- [ ] Add "Add to Queue" button with selected count
- [ ] Implement cancel button to exit multi-select mode
- [ ] Add visual feedback for selected recipes
- [ ] Style checkboxes and selection states
- [ ] Handle already-queued recipe indicators

#### Task 4.3: Batch Operations

- [ ] Implement batch add to queue functionality
- [ ] Add progress feedback for batch operations
- [ ] Handle duplicate prevention during batch add
- [ ] Clear selections after successful operations
- [ ] Add error handling for partial batch failures
- [ ] Implement optimistic UI updates

### Group 5: Queue Integration Components

**Priority: High**

#### Task 5.1: Queue Badge Component

- [ ] Create `components/queue/queue-badge.tsx`
- [ ] Design "In Queue" indicator badge
- [ ] Add visibility logic based on queue membership
- [ ] Style consistently with app design system
- [ ] Add animation for badge appearance/disappearance
- [ ] Export component for use in recipe cards

#### Task 5.2: Recipe Card Queue Integration

- [ ] Extend existing recipe card component with queue badge
- [ ] Add queue membership detection
- [ ] Implement badge visibility logic
- [ ] Update recipe cards in list view
- [ ] Update recipe cards in detail view
- [ ] Test badge display accuracy

#### Task 5.3: Recipe Detail View Integration

- [ ] Add queue status indicator to recipe detail view
- [ ] Implement "Add to Queue" button when not queued
- [ ] Implement "Remove from Queue" button when queued
- [ ] Add immediate button state updates
- [ ] Handle navigation from queue screen
- [ ] Add toast notifications for queue actions

### Group 6: Tab Navigation Integration

**Priority: Medium**

#### Task 6.1: Tab Layout Updates

- [ ] Update `app/(tabs)/_layout.tsx` to include queue tab
- [ ] Add queue tab icon (list.bullet)
- [ ] Implement tab badge showing queue count
- [ ] Position queue tab between Recipes and Shopping List
- [ ] Add tab navigation styling
- [ ] Test tab switching functionality

#### Task 6.2: Tab Badge Implementation

- [ ] Connect tab badge to queue context
- [ ] Implement real-time badge count updates
- [ ] Add badge visibility logic (hide when count is 0)
- [ ] Style badge consistently with platform guidelines
- [ ] Test badge updates across app navigation
- [ ] Handle badge updates during queue operations

### Group 7: Shopping List Integration

**Priority: High**

#### Task 7.1: Shopping List Generator Service

- [ ] Create `lib/services/shopping-list-generator.ts`
- [ ] Implement `generateShoppingListFromQueue()` method
- [ ] Add ingredient aggregation algorithm
- [ ] Implement unit normalization logic
- [ ] Add quantity combination for duplicate ingredients
- [ ] Handle edge cases (no quantity, incompatible units)

#### Task 7.2: Ingredient Aggregation Logic

- [ ] Implement ingredient grouping by normalized name
- [ ] Add quantity summation for matching units
- [ ] Handle unit conversions where possible
- [ ] Create separate line items for incompatible units
- [ ] Add recipe source tracking for ingredients
- [ ] Implement aggregation validation

#### Task 7.3: Automatic Shopping List Updates

- [ ] Implement automatic regeneration on queue changes
- [ ] Add debouncing to prevent rapid updates
- [ ] Preserve checked state during regeneration
- [ ] Clear items linked to removed recipes
- [ ] Add error handling for aggregation failures
- [ ] Test shopping list accuracy with various recipes

### Group 8: User Experience & Polish

**Priority: Medium**

#### Task 8.1: Toast Notifications

- [ ] Add success toast for "Mark as Cooked" action
- [ ] Add success toast for "Remove from Queue" action
- [ ] Add success toast for batch add operations
- [ ] Add error toast for failed operations
- [ ] Implement toast with recipe name context
- [ ] Style toasts consistently with app design

#### Task 8.2: Confirmation Dialogs

- [ ] Create confirmation dialog for remove actions
- [ ] Add "Remove [Recipe Title] from queue?" message
- [ ] Implement dialog with cancel/confirm buttons
- [ ] Style dialog consistently with app design
- [ ] Add accessibility support for dialogs
- [ ] Test dialog behavior across different scenarios

#### Task 8.3: Loading States & Animations

- [ ] Add loading states for queue operations
- [ ] Implement smooth animations for recipe removal
- [ ] Add loading indicators for batch operations
- [ ] Implement pull-to-refresh animation
- [ ] Add skeleton loading for queue screen
- [ ] Test loading states across different network conditions

### Group 9: Error Handling & Validation

**Priority: Medium**

#### Task 9.1: Error Handling Implementation

- [ ] Add error handling for duplicate recipe prevention
- [ ] Implement error recovery for failed operations
- [ ] Add retry mechanisms for network failures
- [ ] Handle database constraint violations
- [ ] Implement graceful degradation for errors
- [ ] Add error logging for debugging

#### Task 9.2: Input Validation

- [ ] Validate recipeId exists before adding to queue
- [ ] Validate recipe not soft-deleted before adding
- [ ] Validate queueItemId exists before removal
- [ ] Add Zod schema validation for queue operations
- [ ] Implement validation error messages
- [ ] Test validation with edge cases

#### Task 9.3: Edge Case Handling

- [ ] Handle empty queue scenarios
- [ ] Handle recipe deletion cascade
- [ ] Handle concurrent queue modifications
- [ ] Handle invalid recipe references
- [ ] Handle database connection failures
- [ ] Test edge cases thoroughly

### Group 10: Testing & Quality Assurance

**Priority: Medium**

#### Task 10.1: Unit Tests

- [ ] Create tests for queue service operations
- [ ] Test queue context state management
- [ ] Test multi-select hook functionality
- [ ] Test shopping list generation logic
- [ ] Test ingredient aggregation algorithm
- [ ] Test error handling scenarios

#### Task 10.2: Integration Tests

- [ ] Test queue screen functionality
- [ ] Test multi-select mode operations
- [ ] Test recipe detail view integration
- [ ] Test tab navigation and badge updates
- [ ] Test shopping list integration
- [ ] Test end-to-end queue workflows

#### Task 10.3: Performance Testing

- [ ] Test queue performance with large datasets
- [ ] Test multi-select performance with many recipes
- [ ] Test shopping list generation speed
- [ ] Test database query performance
- [ ] Test memory usage during operations
- [ ] Validate success criteria performance targets

## Success Criteria Checklist

- [ ] User can add multiple recipes to queue in under 10 seconds using multi-select mode
- [ ] Queue displays recipes in correct chronological order (FIFO)
- [ ] "Mark as Cooked" immediately removes recipe from queue with confirmation toast
- [ ] Queue membership indicator displays accurately on recipe list and detail views
- [ ] Shopping list automatically generates from all queued recipes with ingredient aggregation
- [ ] All queue operations complete in under 500ms for typical usage (10 recipes in queue)
- [ ] No duplicate recipes allowed in queue (enforced by database constraint)
- [ ] Tab badge shows accurate count of recipes in queue
- [ ] Multi-select mode activates smoothly with visual feedback
- [ ] Queue state persists across app restarts (database persistence)
- [ ] Removing recipe from app also removes from queue (cascade delete)

## Dependencies

- Local Storage Foundation (database schema and services)
- Recipe CRUD Operations (recipe data and cards)
- Recipe Repository UI (recipe list view for multi-select)
- Recipe Detail View (queue integration)
- Shopping List Generation (ingredient aggregation)

## Notes

- This is a simplified MVP version focused on chronological queue rather than calendar-based planning
- Multi-select mode is key differentiator for efficient recipe addition
- Shopping list integration provides immediate value to users
- Focus on performance and user experience for smooth queue operations
- Ensure proper error handling and edge case coverage
- Test thoroughly with various recipe combinations and queue sizes

