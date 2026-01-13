/**
 * Database module exports
 * Central entry point for all database-related functionality
 */

// Connection
export { DatabaseError, dbConnection } from './connection';

// Initialization
export {
  getDatabaseStatus,
  healthCheck,
  initializeDatabase,
  isDatabaseReady,
  registerMigrations,
} from './init';

// Services
export { mealPlanService, MealPlanService } from './services/meal-plan-service';
export { recipeService, RecipeService } from './services/recipe-service';
export {
  shoppingListService,
  ShoppingListService,
} from './services/shopping-list-service';

// Seed data
export {
  clearDatabase,
  needsSeeding,
  resetDatabase,
  seedDatabase,
} from './seed';

// Schema types
export type {
  CreateMealPlanInput,
  MealPlan,
  MealPlanRow,
  MealPlanWithRecipe,
  UpdateMealPlanInput,
} from './schema/meal-plan';
export type {
  CreateRecipeInput,
  Ingredient,
  Recipe,
  RecipeRow,
  UpdateRecipeInput,
} from './schema/recipe';
export type {
  AggregatedShoppingListItem,
  CreateShoppingListItemInput,
  GroupedShoppingListItems,
  ManualItemInput,
  ShoppingListCategory,
  ShoppingListItem,
  ShoppingListItemRow,
  ShoppingListItemSource,
  ShoppingListItemWithRecipe,
  UpdateShoppingListItemInput,
} from './schema/shopping-list';

// Schema utilities and constants
export { MealPlanUtils } from './schema/meal-plan';
export { RecipeUtils } from './schema/recipe';
export { CATEGORY_ORDER, ShoppingListItemUtils } from './schema/shopping-list';

// Validation schemas
export { MealPlanValidation } from './schema/meal-plan-validation';
export { RecipeValidation } from './schema/recipe-validation';
export { ShoppingListItemValidation } from './schema/shopping-list-validation';

// Migration system
export { MigrationRunner, migrationRunner } from './migrations/index';
export type { Migration } from './migrations/index';

// Re-export enums for convenience
export {
  DB_CONFIG,
  DishCategory,
  MealType,
  MeasurementUnit,
  TagCategory,
  VALIDATION_CONSTRAINTS,
} from '@/constants/enums';
