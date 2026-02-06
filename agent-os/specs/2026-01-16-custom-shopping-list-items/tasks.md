# Task Breakdown: Custom Shopping List Items

## Overview
Total Tasks: 16

**Note:** This feature is already fully implemented in the codebase. The tasks focus on verification, testing, and documentation to ensure the implementation meets all spec requirements.

## Task List

### Verification Layer

#### Task Group 1: Implementation Verification
**Dependencies:** None

- [x] 1.0 Complete implementation verification
  - [x] 1.1 Verify database schema supports custom items
    - Confirm `source` column exists with 'recipe' | 'manual' values
    - Confirm `quantity` column is nullable
    - Confirm `unit` column is nullable
    - Confirm `category` column defaults appropriately
    - Reference: `lib/db/schema/shopping-list.ts`
  - [x] 1.2 Verify AddManualItemDialog component matches spec
    - Name field is required with max 100 chars validation
    - Quantity field is optional with positive number validation
    - Unit selection includes "None" option
    - Category selection defaults to "Other"
    - Form resets when dialog closes and reopens
    - Reference: `components/shopping-list/add-manual-item-dialog.tsx`
  - [x] 1.3 Verify ShoppingListItem component behavior
    - Delete button appears only for manual items (source === 'manual')
    - Check-off functionality works for both recipe and manual items
    - Reference: `components/shopping-list/shopping-list-item.tsx`
  - [x] 1.4 Verify shopping list screen integration
    - FAB button triggers AddManualItemDialog
    - Delete confirmation alert appears before deletion
    - Empty state shows "Add Item" button
    - Reference: `app/(tabs)/shopping-list.tsx`
  - [x] 1.5 Verify persistence through regeneration
    - `deleteBySource('recipe')` preserves manual items
    - Manual items persist when queue changes trigger regeneration
    - Reference: `lib/contexts/shopping-list-context.tsx`, `lib/services/shopping-list-generator.ts`

**Acceptance Criteria:**
- All implementation details match spec requirements
- No gaps identified between spec and implementation
- Data flow matches documented technical approach

### Testing Layer

#### Task Group 2: Database and Service Layer Tests
**Dependencies:** Task Group 1

- [x] 2.0 Complete database/service layer testing
  - [x] 2.1 Write 4-6 focused tests for manual item database operations
    - Test creating manual item with only name (no quantity, no unit)
    - Test creating manual item with all fields (name, quantity, unit, category)
    - Test `deleteBySource('recipe')` preserves manual items
    - Test `deleteItem()` removes specific manual item
    - Test manual item validation (empty name rejection, max length)
    - Reference files: `lib/db/services/shopping-list-service.ts`, `lib/services/shopping-list-generator.ts`
  - [x] 2.2 Ensure database layer tests pass
    - Run ONLY the tests written in 2.1
    - Verify all CRUD operations for manual items work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 2.1 pass
- Manual item creation with partial fields works correctly
- Source-based deletion preserves manual items
- Validation rules enforced at service layer

#### Task Group 3: UI Component Tests
**Dependencies:** Task Group 1

- [x] 3.0 Complete UI component testing
  - [x] 3.1 Write 4-6 focused tests for AddManualItemDialog
    - Test dialog renders with correct form fields
    - Test form validation prevents empty name submission
    - Test form resets when closed and reopened
    - Test successful submission calls onAdd with correct data
    - Test unit selection "None" option works correctly
    - Reference: `components/shopping-list/add-manual-item-dialog.tsx`
  - [x] 3.2 Write 2-4 focused tests for ShoppingListItem delete behavior
    - Test delete button appears only for manual items
    - Test delete button does NOT appear for recipe items
    - Test delete button triggers onDelete callback
    - Reference: `components/shopping-list/shopping-list-item.tsx`
  - [x] 3.3 Ensure UI component tests pass
    - Run ONLY the tests written in 3.1 and 3.2
    - Verify component behaviors match spec requirements
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 6-10 tests written in 3.1 and 3.2 pass
- Dialog validation works correctly
- Delete button visibility logic correct
- Form state management correct

#### Task Group 4: Integration and E2E Tests
**Dependencies:** Task Groups 2, 3

- [x] 4.0 Complete integration testing
  - [x] 4.1 Write 3-5 focused integration tests for full workflow
    - Test adding manual item and verifying it appears in correct category
    - Test manual item persists after shopping list regeneration
    - Test checking/unchecking manual items works correctly
    - Test deleting manual item with confirmation flow
    - Test adding manual item from empty state
    - Reference: `app/(tabs)/shopping-list.tsx`, `lib/contexts/shopping-list-context.tsx`
  - [x] 4.2 Ensure integration tests pass
    - Run ONLY the tests written in 4.1
    - Verify end-to-end workflows function correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 integration tests written in 4.1 pass
- Full user workflows function correctly
- Data persists correctly through regeneration cycles

### Quality Assurance

#### Task Group 5: Test Review and Final Verification
**Dependencies:** Task Groups 2, 3, 4

- [x] 5.0 Review and run all feature tests
  - [x] 5.1 Review tests from Task Groups 2-4
    - Review the 4-6 tests written by Task Group 2
    - Review the 6-10 tests written by Task Group 3
    - Review the 3-5 tests written by Task Group 4
    - Total tests: approximately 13-21 tests
  - [x] 5.2 Run all feature-specific tests together
    - Execute all tests from groups 2, 3, and 4
    - Verify no regressions between test groups
    - Document any failures for remediation
  - [x] 5.3 Manual QA verification of success criteria
    - Verify custom items can be added with only a name
    - Verify custom items appear in correct category section
    - Verify custom items persist when recipes added/removed from queue
    - Verify custom items can be checked off and unchecked
    - Verify custom items can be deleted with confirmation
    - Verify delete button only appears on manual items
    - Verify form validation prevents empty name submission
    - Verify dialog resets form state when closed and reopened

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 13-21 tests total)
- All success criteria from spec verified manually
- Feature is production-ready

## Execution Order

Recommended implementation sequence:
1. Verification Layer (Task Group 1) - Confirm implementation matches spec
2. Database/Service Tests (Task Group 2) - Test data layer
3. UI Component Tests (Task Group 3) - Test UI components
4. Integration Tests (Task Group 4) - Test full workflows
5. Final Verification (Task Group 5) - Review all tests and QA

## Files Referenced

### Components
- `components/shopping-list/add-manual-item-dialog.tsx` - Manual item entry dialog
- `components/shopping-list/shopping-list-item.tsx` - Individual item display
- `components/shopping-list/empty-shopping-list.tsx` - Empty state with add button
- `components/ui/FAB.tsx` - Floating action button

### Services and Context
- `lib/db/services/shopping-list-service.ts` - Database CRUD operations
- `lib/services/shopping-list-generator.ts` - Item generation and manual item creation
- `lib/contexts/shopping-list-context.tsx` - State management and operations

### Schema
- `lib/db/schema/shopping-list.ts` - Type definitions and utilities

### Screen
- `app/(tabs)/shopping-list.tsx` - Main shopping list screen

### Tests Created
- `lib/db/__tests__/unit/services/manual-item-operations.test.ts` - Database operations tests (8 tests)
- `components/__tests__/add-manual-item-dialog.test.tsx` - Dialog component tests (9 tests)
- `components/__tests__/shopping-list-item.test.tsx` - Item component tests (6 tests)
- `lib/db/__tests__/integration/manual-item-workflow.test.ts` - Integration workflow tests (7 tests)

### Existing Tests (for reference)
- `lib/db/__tests__/unit/services/shopping-list-service.test.ts`
- `lib/db/__tests__/unit/services/shopping-list-generator.test.ts`
- `lib/db/__tests__/unit/services/shopping-list-context.test.ts`
- `lib/db/__tests__/integration/shopping-list-flow.test.ts`
