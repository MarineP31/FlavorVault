/**
 * Zod Validation Schema for Recipe Form
 * Comprehensive validation for recipe CRUD operations
 */

import { z } from 'zod';
import {
  DishCategory,
  MeasurementUnit,
  VALIDATION_CONSTRAINTS,
  CUISINE_TAGS,
  DIETARY_TAGS,
  MEAL_TYPE_TAGS,
  COOKING_METHOD_TAGS,
} from '@/constants/enums';

/**
 * Tag categories enum
 */
export const TagCategory = {
  CUISINE: 'cuisine',
  DIETARY: 'dietary',
  MEAL_TYPE: 'meal_type',
  COOKING_METHOD: 'cooking_method',
} as const;

/**
 * All valid tag values
 */
const ALL_VALID_TAGS = [
  ...CUISINE_TAGS,
  ...DIETARY_TAGS,
  ...MEAL_TYPE_TAGS,
  ...COOKING_METHOD_TAGS,
];

/**
 * Ingredient schema with required name and optional quantity/unit
 * Task 2.2: Ingredient Schema
 */
export const IngredientSchema = z.object({
  name: z
    .string()
    .min(1, 'Ingredient name is required')
    .max(
      VALIDATION_CONSTRAINTS.INGREDIENT_NAME_MAX_LENGTH,
      `Ingredient name must be ${VALIDATION_CONSTRAINTS.INGREDIENT_NAME_MAX_LENGTH} characters or less`
    ),
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .nullable()
    .optional(),
  unit: z.nativeEnum(MeasurementUnit).nullable().optional(),
});

/**
 * Instruction step schema
 * Task 2.3: Instruction Schema
 */
export const StepSchema = z
  .string()
  .min(1, 'Step instruction is required')
  .max(
    VALIDATION_CONSTRAINTS.INSTRUCTION_STEP_MAX_LENGTH,
    `Step instruction must be ${VALIDATION_CONSTRAINTS.INSTRUCTION_STEP_MAX_LENGTH} characters or less`
  );

/**
 * Tag validation schema
 * Task 2.4: Tag Schema
 */
export const TagSchema = z
  .string()
  .refine(
    (tag) => ALL_VALID_TAGS.includes(tag as any),
    'Tag must be from predefined options'
  );

/**
 * Recipe form validation schema
 * Task 2.1: Recipe Form Schema
 */
export const RecipeFormSchema = z.object({
  // Required fields
  title: z
    .string()
    .min(1, 'Title is required')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_TITLE_MAX_LENGTH,
      `Title must be ${VALIDATION_CONSTRAINTS.RECIPE_TITLE_MAX_LENGTH} characters or less`
    ),

  ingredients: z
    .array(IngredientSchema)
    .min(1, 'At least one ingredient is required'),

  steps: z
    .array(StepSchema)
    .min(1, 'At least one step is required'),

  servings: z
    .number()
    .int('Servings must be a whole number')
    .min(
      VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MIN,
      `Servings must be at least ${VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MIN}`
    )
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MAX,
      `Servings must be ${VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MAX} or less`
    ),

  category: z.nativeEnum(DishCategory, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),

  // Optional fields
  prepTime: z
    .number()
    .int('Prep time must be a whole number')
    .min(0, 'Prep time cannot be negative')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_PREP_TIME_MAX,
      `Prep time must be ${VALIDATION_CONSTRAINTS.RECIPE_PREP_TIME_MAX} minutes or less`
    )
    .nullable()
    .optional(),

  cookTime: z
    .number()
    .int('Cook time must be a whole number')
    .min(0, 'Cook time cannot be negative')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_COOK_TIME_MAX,
      `Cook time must be ${VALIDATION_CONSTRAINTS.RECIPE_COOK_TIME_MAX} minutes or less`
    )
    .nullable()
    .optional(),

  imageUri: z.string().nullable().optional(),

  source: z
    .string()
    .max(200, 'Source must be 200 characters or less')
    .nullable()
    .optional(),

  tags: z
    .array(TagSchema)
    .max(
      VALIDATION_CONSTRAINTS.MAX_TAGS_PER_RECIPE,
      `Maximum ${VALIDATION_CONSTRAINTS.MAX_TAGS_PER_RECIPE} tags allowed`
    )
    .optional()
    .default([]),
});

/**
 * Type inference from schema
 */
export type RecipeFormData = z.infer<typeof RecipeFormSchema>;
export type IngredientData = z.infer<typeof IngredientSchema>;
export type StepData = z.infer<typeof StepSchema>;

/**
 * Type for form validation errors
 */
export type RecipeFormErrors = {
  [K in keyof RecipeFormData]?: string[];
};

/**
 * Helper function to validate recipe form data
 */
export function validateRecipeForm(data: unknown): {
  success: boolean;
  data?: RecipeFormData;
  errors?: RecipeFormErrors;
} {
  const result = RecipeFormSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: result.error.flatten().fieldErrors as RecipeFormErrors,
  };
}

/**
 * Helper to get user-friendly error message for a field
 */
export function getFieldError(
  errors: RecipeFormErrors | undefined,
  field: keyof RecipeFormData
): string | undefined {
  if (!errors || !errors[field]) return undefined;
  const fieldErrors = errors[field];
  return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : undefined;
}

/**
 * Validate individual ingredient
 */
export function validateIngredient(data: unknown): {
  success: boolean;
  data?: IngredientData;
  error?: string;
} {
  const result = IngredientSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    error: result.error.errors[0]?.message || 'Invalid ingredient',
  };
}

/**
 * Validate individual step
 */
export function validateStep(data: unknown): {
  success: boolean;
  data?: string;
  error?: string;
} {
  const result = StepSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    error: result.error.errors[0]?.message || 'Invalid step',
  };
}

/**
 * Validate tag
 */
export function validateTag(data: unknown): {
  success: boolean;
  data?: string;
  error?: string;
} {
  const result = TagSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    error: result.error.errors[0]?.message || 'Invalid tag',
  };
}

/**
 * Get tags by category
 */
export function getTagsByCategory(category: keyof typeof TagCategory): readonly string[] {
  switch (category) {
    case 'CUISINE':
      return CUISINE_TAGS;
    case 'DIETARY':
      return DIETARY_TAGS;
    case 'MEAL_TYPE':
      return MEAL_TYPE_TAGS;
    case 'COOKING_METHOD':
      return COOKING_METHOD_TAGS;
    default:
      return [];
  }
}

/**
 * Check if a tag belongs to a specific category
 */
export function isTagInCategory(
  tag: string,
  category: keyof typeof TagCategory
): boolean {
  const categoryTags = getTagsByCategory(category);
  return categoryTags.includes(tag as any);
}
