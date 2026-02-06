/**
 * Database module exports
 * Central entry point for all database-related functionality
 */

// Supabase client and error
export { supabase, getCurrentUserId, SupabaseError } from '@/lib/supabase/client';

// Services
export { mealPlanService, MealPlanService } from './services/meal-plan-service';
export { recipeService, RecipeService } from './services/recipe-service';
export {
  shoppingListService,
  ShoppingListService,
} from './services/shopping-list-service';
export { tagService, TagService } from './services/tag-service';

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
export type {
  CategoryType,
  CategoryWithTags,
  CreateCustomCategoryInput,
  CreateTagInput,
  CustomCategory,
  RecipeTag,
  UpdateCustomCategoryInput,
} from './schema/tags';

// Schema utilities and constants
export { MealPlanUtils } from './schema/meal-plan';
export { RecipeUtils } from './schema/recipe';
export { CATEGORY_ORDER, ShoppingListItemUtils } from './schema/shopping-list';
export {
  TagUtils,
  isDefaultCategory,
  getPredefinedTagsForCategory,
  getAllPredefinedCategoryNames,
  PREDEFINED_CATEGORIES,
  DefaultCategory,
} from './schema/tags';

// Validation schemas
export { MealPlanValidation } from './schema/meal-plan-validation';
export { RecipeValidation } from './schema/recipe-validation';
export { ShoppingListItemValidation } from './schema/shopping-list-validation';

// Re-export enums for convenience
export {
  DB_CONFIG,
  DishCategory,
  MealType,
  MeasurementUnit,
  TagCategory,
  VALIDATION_CONSTRAINTS,
} from '@/constants/enums';
