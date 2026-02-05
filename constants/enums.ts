/**
 * Enums and constants for FlavorVault
 * Defines data types used across the application
 */

/**
 * Dish categories for recipe classification
 */
export enum DishCategory {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  DESSERT = 'dessert',
  APPETIZER = 'appetizer',
  BEVERAGE = 'beverage',
  OTHER = 'other',
}

/**
 * Measurement units for ingredients
 */
export enum MeasurementUnit {
  // Volume units
  TSP = 'tsp',
  TBSP = 'tbsp',
  CUP = 'cup',
  FL_OZ = 'fl oz',
  ML = 'ml',
  LITER = 'l',

  // Weight units
  OZ = 'oz',
  LB = 'lb',
  GRAM = 'g',
  KG = 'kg',

  // Count units
  UNIT = 'unit',
  PIECE = 'piece',
  SLICE = 'slice',
  CLOVE = 'clove',
  HEAD = 'head',
  BUNCH = 'bunch',
  CAN = 'can',
  BOTTLE = 'bottle',
  PACKAGE = 'package',
  BAG = 'bag',
  BOX = 'box',
}

/**
 * Meal types for meal planning
 */
export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

/**
 * Tag categories for recipe organization
 */
export enum TagCategory {
  CUISINE = 'cuisine',
  DIETARY = 'dietary',
  MEAL_TYPE = 'meal_type',
  COOKING_METHOD = 'cooking_method',
}

/**
 * Predefined cuisine tags
 */
export const CUISINE_TAGS = [
  'Italian',
  'Mexican',
  'Asian',
  'Chinese',
  'Japanese',
  'Thai',
  'Indian',
  'Mediterranean',
  'French',
  'American',
  'Other',
] as const;

/**
 * Predefined dietary tags
 */
export const DIETARY_TAGS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Low-Carb',
  'Keto',
  'Paleo',
  'Other',
] as const;

/**
 * Predefined meal type tags
 */
export const MEAL_TYPE_TAGS = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert',
  'Appetizer',
  'Beverage',
  'Other',
] as const;

/**
 * Predefined cooking method tags
 */
export const COOKING_METHOD_TAGS = [
  'Baking',
  'Grilling',
  'Roasting',
  'Sautéing',
  'Slow Cooker',
  'Instant Pot',
  'Stovetop',
  'No-Cook',
  'Other',
] as const;

/**
 * Database table names
 */
export const DB_TABLES = {
  RECIPES: 'recipes',
  MEAL_PLANS: 'meal_plans',
  SHOPPING_LIST_ITEMS: 'shopping_list_items',
} as const;

/**
 * Validation constraints
 */
export const VALIDATION_CONSTRAINTS = {
  RECIPE_TITLE_MAX_LENGTH: 200,
  RECIPE_SERVINGS_MIN: 1,
  RECIPE_SERVINGS_MAX: 50,
  RECIPE_PREP_TIME_MAX: 1440, // 24 hours in minutes
  RECIPE_COOK_TIME_MAX: 1440, // 24 hours in minutes
  INGREDIENT_NAME_MAX_LENGTH: 100,
  INSTRUCTION_STEP_MAX_LENGTH: 1000,
  TAG_NAME_MAX_LENGTH: 30,
  TAG_CATEGORY_MAX_LENGTH: 30,
  MAX_TAGS_PER_RECIPE: 20,
  MAX_CUSTOM_CATEGORIES: 10,
  MAX_CUSTOM_TAGS_PER_CATEGORY: 20,
  IMAGE_MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

/**
 * Database configuration
 */
export const DB_CONFIG = {
  DATABASE_NAME: 'flavorvault.db',
  CURRENT_SCHEMA_VERSION: 2,
  WAL_MODE: true,
  FOREIGN_KEYS_ENABLED: true,
  SYNCHRONOUS_MODE: 'NORMAL',
} as const;

/**
 * Type definitions for better TypeScript support
 */
export type CuisineTag = (typeof CUISINE_TAGS)[number];
export type DietaryTag = (typeof DIETARY_TAGS)[number];
export type MealTypeTag = (typeof MEAL_TYPE_TAGS)[number];
export type CookingMethodTag = (typeof COOKING_METHOD_TAGS)[number];

export type DatabaseTable =
  (typeof DB_TABLES)[keyof typeof DB_TABLES];

/**
 * Utility functions for enum validation
 */
export const EnumUtils = {
  /**
   * Check if a value is a valid DishCategory
   */
  isValidDishCategory(value: string): value is DishCategory {
    return Object.values(DishCategory).includes(
      value as DishCategory
    );
  },

  /**
   * Check if a value is a valid MeasurementUnit
   */
  isValidMeasurementUnit(value: string): value is MeasurementUnit {
    return Object.values(MeasurementUnit).includes(
      value as MeasurementUnit
    );
  },

  /**
   * Check if a value is a valid MealType
   */
  isValidMealType(value: string): value is MealType {
    return Object.values(MealType).includes(value as MealType);
  },

  /**
   * Get all DishCategory values
   */
  getAllDishCategories(): DishCategory[] {
    return Object.values(DishCategory);
  },

  /**
   * Get all MeasurementUnit values
   */
  getAllMeasurementUnits(): MeasurementUnit[] {
    return Object.values(MeasurementUnit);
  },

  /**
   * Get all MealType values
   */
  getAllMealTypes(): MealType[] {
    return Object.values(MealType);
  },
};
