import { z } from 'zod';
import { VALIDATION_CONSTRAINTS } from '@/constants/enums';

/**
 * Tag value validation schema
 */
export const tagValueSchema = z
  .string()
  .trim()
  .min(1, 'Tag name is required')
  .max(
    VALIDATION_CONSTRAINTS.TAG_NAME_MAX_LENGTH,
    `Tag name must be ${VALIDATION_CONSTRAINTS.TAG_NAME_MAX_LENGTH} characters or less`
  );

/**
 * Category name validation schema
 */
export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, 'Category name is required')
  .max(
    VALIDATION_CONSTRAINTS.TAG_CATEGORY_MAX_LENGTH,
    `Category name must be ${VALIDATION_CONSTRAINTS.TAG_CATEGORY_MAX_LENGTH} characters or less`
  );

/**
 * Category type validation schema
 */
export const categoryTypeSchema = z.enum(['default', 'custom']);

/**
 * Create tag input schema
 */
export const createTagInputSchema = z.object({
  recipeId: z.string().optional(),
  categoryType: categoryTypeSchema,
  categoryName: categoryNameSchema,
  tagValue: tagValueSchema,
});

/**
 * Update tag input schema
 */
export const updateTagInputSchema = z.object({
  oldValue: tagValueSchema,
  newValue: tagValueSchema,
});

/**
 * Create custom category input schema
 */
export const createCustomCategoryInputSchema = z.object({
  name: categoryNameSchema,
});

/**
 * Update custom category input schema
 */
export const updateCustomCategoryInputSchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
  name: categoryNameSchema,
});

/**
 * Delete category input schema
 */
export const deleteCategoryInputSchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
});

/**
 * Search query schema
 */
export const searchQuerySchema = z.string().min(1, 'Search query is required');

/**
 * Tag limit validation
 */
export const validateTagLimit = (currentCount: number): boolean => {
  return currentCount < VALIDATION_CONSTRAINTS.MAX_CUSTOM_TAGS_PER_CATEGORY;
};

/**
 * Category limit validation
 */
export const validateCategoryLimit = (currentCount: number): boolean => {
  return currentCount < VALIDATION_CONSTRAINTS.MAX_CUSTOM_CATEGORIES;
};

/**
 * Tag name uniqueness validation
 */
export const validateTagUniqueness = (
  tagValue: string,
  existingTags: string[]
): boolean => {
  return !existingTags.some(
    (tag) => tag.toLowerCase() === tagValue.toLowerCase()
  );
};

/**
 * Category name uniqueness validation
 */
export const validateCategoryUniqueness = (
  categoryName: string,
  existingCategories: string[]
): boolean => {
  return !existingCategories.some(
    (cat) => cat.toLowerCase() === categoryName.toLowerCase()
  );
};

/**
 * Default category protection validation
 */
export const validateNotDefaultCategory = (
  categoryName: string,
  defaultCategories: string[]
): boolean => {
  return !defaultCategories.includes(categoryName);
};

/**
 * Validation error messages
 */
export const ValidationMessages = {
  TAG_REQUIRED: 'Tag name is required',
  TAG_TOO_LONG: `Tag name must be ${VALIDATION_CONSTRAINTS.TAG_NAME_MAX_LENGTH} characters or less`,
  TAG_DUPLICATE: 'A tag with this name already exists',
  TAG_LIMIT_EXCEEDED: `Maximum ${VALIDATION_CONSTRAINTS.MAX_CUSTOM_TAGS_PER_CATEGORY} custom tags allowed per category`,
  CATEGORY_REQUIRED: 'Category name is required',
  CATEGORY_TOO_LONG: `Category name must be ${VALIDATION_CONSTRAINTS.TAG_CATEGORY_MAX_LENGTH} characters or less`,
  CATEGORY_DUPLICATE: 'A category with this name already exists',
  CATEGORY_LIMIT_EXCEEDED: `Maximum ${VALIDATION_CONSTRAINTS.MAX_CUSTOM_CATEGORIES} custom categories allowed`,
  CATEGORY_PROTECTED: 'Cannot modify or delete default categories',
  CATEGORY_NOT_FOUND: 'Category not found',
  TAG_NOT_FOUND: 'Tag not found',
  INVALID_INPUT: 'Invalid input provided',
};

/**
 * Validate and parse tag input
 */
export const validateTagInput = (input: unknown) => {
  return createTagInputSchema.parse(input);
};

/**
 * Validate and parse category input
 */
export const validateCategoryInput = (input: unknown) => {
  return createCustomCategoryInputSchema.parse(input);
};

/**
 * Validate tag with business rules
 */
export const validateTagWithRules = (
  tagValue: string,
  existingTags: string[],
  currentCount: number
): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validate format
  try {
    tagValueSchema.parse(tagValue);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map((e) => e.message));
    }
  }

  // Validate uniqueness
  if (!validateTagUniqueness(tagValue, existingTags)) {
    errors.push(ValidationMessages.TAG_DUPLICATE);
  }

  // Validate limit
  if (!validateTagLimit(currentCount)) {
    errors.push(ValidationMessages.TAG_LIMIT_EXCEEDED);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate category with business rules
 */
export const validateCategoryWithRules = (
  categoryName: string,
  existingCategories: string[],
  currentCount: number,
  defaultCategories: string[]
): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validate format
  try {
    categoryNameSchema.parse(categoryName);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map((e) => e.message));
    }
  }

  // Validate not a default category
  if (!validateNotDefaultCategory(categoryName, defaultCategories)) {
    errors.push(ValidationMessages.CATEGORY_PROTECTED);
  }

  // Validate uniqueness
  if (!validateCategoryUniqueness(categoryName, existingCategories)) {
    errors.push(ValidationMessages.CATEGORY_DUPLICATE);
  }

  // Validate limit
  if (!validateCategoryLimit(currentCount)) {
    errors.push(ValidationMessages.CATEGORY_LIMIT_EXCEEDED);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Type exports for better TypeScript support
 */
export type CreateTagInput = z.infer<typeof createTagInputSchema>;
export type UpdateTagInput = z.infer<typeof updateTagInputSchema>;
export type CreateCustomCategoryInput = z.infer<
  typeof createCustomCategoryInputSchema
>;
export type UpdateCustomCategoryInput = z.infer<
  typeof updateCustomCategoryInputSchema
>;
export type DeleteCategoryInput = z.infer<typeof deleteCategoryInputSchema>;
