# Tasks: Local Storage Foundation

## Overview

Implement local SQLite database persistence for recipes, meal plans, and shopping lists with automatic migrations, type-safe operations, and seed data to enable all subsequent MVP features in an offline-first, privacy-focused architecture.

## Task Groups

### Group 1: Foundation Setup & Configuration

**Priority: Critical**

#### Task 1.1: Project Dependencies Setup

- [x] Install expo-sqlite package
- [x] Install zod package for validation
- [x] Install uuid package for ID generation
- [x] Update package.json with new dependencies
- [x] Verify TypeScript configuration supports strict mode

#### Task 1.2: Database Connection Module

- [x] Create `lib/db/connection.ts` with SQLite connection management
- [x] Implement database file initialization
- [x] Add connection error handling with retry logic
- [x] Create database connection singleton pattern
- [x] Add connection health check methods

#### Task 1.3: Constants and Enums

- [x] Create `constants/enums.ts` with DishCategory enum
- [x] Add MeasurementUnit enum to constants
- [x] Define meal type constants (breakfast, lunch, dinner, snack)
- [x] Export all enums for use across the app
- [x] Add TypeScript type definitions for enums

### Group 2: Database Schema & Types

**Priority: Critical**

#### Task 2.1: TypeScript Interface Definitions

- [x] Create `lib/db/schema/recipe.ts` with Recipe interface
- [x] Define Ingredient interface in recipe.ts
- [x] Create `lib/db/schema/meal-plan.ts` with MealPlan interface
- [x] Create `lib/db/schema/shopping-list.ts` with ShoppingListItem interface
- [x] Add proper TypeScript generics and utility types

#### Task 2.2: Zod Validation Schemas

- [x] Create Zod schema for Recipe validation
- [x] Add Zod schema for Ingredient validation
- [x] Create Zod schema for MealPlan validation
- [x] Create Zod schema for ShoppingListItem validation
- [x] Add custom validation rules (servings 1-50, positive times)
- [x] Export validation schemas for runtime use

#### Task 2.3: Database Schema Creation

- [x] Create `lib/db/migrations/001_initial_schema.ts`
- [x] Define recipes table schema with all columns
- [x] Define meal_plans table schema with foreign keys
- [x] Define shopping_list_items table schema
- [x] Add proper constraints and data types
- [x] Include soft delete support for recipes

### Group 3: Migration System

**Priority: High**

#### Task 3.1: Migration Runner

- [x] Create `lib/db/migrations/index.ts` migration runner
- [x] Implement SQLite user_version tracking
- [x] Add migration execution logic with transactions
- [x] Implement rollback capability for failed migrations
- [x] Add migration logging and error handling

#### Task 3.2: Performance Indexes

- [x] Create `lib/db/migrations/002_add_indexes.ts`
- [x] Add indexes for meal_plans (date, mealType)
- [x] Add indexes for meal_plans (recipeId)
- [x] Add indexes for shopping_list_items (checked)
- [x] Add indexes for shopping_list_items (recipeId)
- [x] Add indexes for recipes (deletedAt) for soft delete queries

#### Task 3.3: Migration Testing

- [x] Test migration execution on clean database
- [x] Test migration rollback scenarios
- [x] Verify user_version tracking works correctly
- [x] Test migration error handling and recovery
- [x] Validate schema creation matches TypeScript interfaces

### Group 4: Service Layer Implementation

**Priority: High**

#### Task 4.1: Recipe Service

- [ ] Create `lib/db/services/recipe-service.ts`
- [ ] Implement createRecipe() with validation
- [ ] Implement getRecipeById() with error handling
- [ ] Implement getAllRecipes() with pagination support
- [ ] Implement updateRecipe() with timestamp updates
- [ ] Implement deleteRecipe() with soft delete
- [ ] Add searchRecipes() method for title search
- [ ] Add transaction support for complex operations

#### Task 4.2: Meal Plan Service

- [ ] Create `lib/db/services/meal-plan-service.ts`
- [ ] Implement createMealPlan() with validation
- [ ] Implement getMealPlansByDate() for calendar queries
- [ ] Implement getMealPlansByRecipe() for recipe lookups
- [ ] Implement updateMealPlan() with validation
- [ ] Implement deleteMealPlan() with hard delete
- [ ] Add batch operations for multiple meal plans

#### Task 4.3: Shopping List Service

- [ ] Create `lib/db/services/shopping-list-service.ts`
- [ ] Implement createShoppingListItem() with validation
- [ ] Implement getAllShoppingItems() with filtering
- [ ] Implement updateCheckedState() for check-off functionality
- [ ] Implement deleteShoppingItem() with hard delete
- [ ] Add bulk operations for meal plan aggregation
- [ ] Add methods for manual vs auto-generated items

### Group 5: Seed Data Implementation

**Priority: Medium**

#### Task 5.1: Sample Recipe Data

- [ ] Create `lib/db/seed/recipes.ts` with 8 sample recipes
- [ ] Include 2 breakfast recipes (pancakes, oatmeal)
- [ ] Include 2 lunch recipes (sandwich, salad)
- [ ] Include 3 dinner recipes (pasta, chicken, stir-fry)
- [ ] Include 1 dessert recipe (chocolate cake)
- [ ] Ensure variety in prep/cook times and complexity
- [ ] Add representative tags and categories

#### Task 5.2: Seed Data Orchestration

- [ ] Create `lib/db/seed/index.ts` seed orchestrator
- [ ] Implement check for empty recipes table
- [ ] Add seed data insertion logic
- [ ] Include error handling for seed failures
- [ ] Add logging for seed data operations
- [ ] Ensure idempotent seed operations

### Group 6: Database Initialization & Integration

**Priority: High**

#### Task 6.1: Database Initialization Flow

- [ ] Create `lib/db/index.ts` main database module
- [ ] Implement database initialization on app startup
- [ ] Add migration execution during initialization
- [ ] Include seed data population logic
- [ ] Add initialization error handling and recovery
- [ ] Create database health check methods

#### Task 6.2: Error Handling & Logging

- [ ] Create DatabaseError class with specific error codes
- [ ] Add comprehensive error handling for all operations
- [ ] Implement logging for database operations
- [ ] Add performance monitoring for slow queries
- [ ] Create error recovery mechanisms
- [ ] Add debugging utilities for development

### Group 7: Testing & Validation

**Priority: Medium**

#### Task 7.1: Unit Tests

- [ ] Create tests for Zod schema validation
- [ ] Test Recipe interface validation (valid/invalid inputs)
- [ ] Test MealPlan interface validation
- [ ] Test ShoppingListItem interface validation
- [ ] Test enum validation and constraints
- [ ] Add edge case testing for boundary values

#### Task 7.2: Integration Tests

- [ ] Create tests for Recipe CRUD operations
- [ ] Test MealPlan CRUD operations
- [ ] Test ShoppingList CRUD operations
- [ ] Test migration execution and rollback
- [ ] Test seed data insertion
- [ ] Test transaction handling and rollback

#### Task 7.3: Performance Tests

- [ ] Test query performance with indexes
- [ ] Test bulk operations timing
- [ ] Test database initialization speed
- [ ] Test memory usage with large datasets
- [ ] Validate success criteria performance targets
- [ ] Test concurrent access scenarios

### Group 8: Documentation & Cleanup

**Priority: Low**

#### Task 8.1: Code Documentation

- [ ] Add JSDoc comments to all public methods
- [ ] Document database schema decisions
- [ ] Add migration documentation
- [ ] Create service layer usage examples
- [ ] Document error handling patterns
- [ ] Add troubleshooting guide

#### Task 8.2: Code Review & Cleanup

- [ ] Review all code for consistency with standards
- [ ] Ensure proper TypeScript strict mode compliance
- [ ] Verify naming conventions are followed
- [ ] Check for unused imports and dead code
- [ ] Optimize database queries for performance
- [ ] Final integration testing

## Success Criteria Checklist

- [ ] Database initializes successfully on first app launch within 2 seconds
- [ ] All CRUD operations complete in <100ms for single records
- [ ] Recipe list queries return in <200ms for 100+ recipes
- [ ] Migrations execute successfully with zero data loss
- [ ] Seed data populates 8 sample recipes on clean install
- [ ] Type errors caught at compile time for all database operations
- [ ] Zero crashes related to database operations during MVP testing
- [ ] Database file size remains under 10MB with 200 recipes

## Dependencies

- expo-sqlite package installation
- zod package for validation
- uuid package for ID generation
- TypeScript strict mode configuration

## Notes

- This is a foundational feature that enables all subsequent MVP features
- Focus on type safety and error handling throughout implementation
- Ensure all operations are optimized for mobile performance
- Test thoroughly with various data scenarios and edge cases
- Follow established coding standards and patterns from the project
