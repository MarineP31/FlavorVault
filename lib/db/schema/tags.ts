import {
  CUISINE_TAGS,
  DIETARY_TAGS,
  MEAL_TYPE_TAGS,
  COOKING_METHOD_TAGS,
} from '@/constants/enums';

/**
 * Category type enum
 */
export type CategoryType = 'default' | 'custom';

/**
 * Predefined category names
 */
export enum DefaultCategory {
  CUISINE = 'Cuisine',
  DIETARY = 'Dietary',
  MEAL_TYPE = 'Meal Type',
  COOKING_METHOD = 'Cooking Method',
}

/**
 * Custom category interface
 */
export interface CustomCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Recipe tag interface
 */
export interface RecipeTag {
  id: string;
  recipeId: string;
  categoryType: CategoryType;
  categoryName: string;
  tagValue: string;
  createdAt: string;
}

/**
 * Tag with category information
 */
export interface TagWithCategory {
  value: string;
  categoryName: string;
  categoryType: CategoryType;
}

/**
 * Category with tags
 * Task 11.2: Enhanced with id field for custom categories
 */
export interface CategoryWithTags {
  id?: string; // Optional ID for custom categories
  name: string;
  type: CategoryType;
  tags: string[];
  customCount: number;
}

/**
 * Database row interface for custom_categories table
 */
export interface CustomCategoryRow {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Database row interface for recipe_tags table
 */
export interface RecipeTagRow {
  id: string;
  recipeId: string;
  categoryType: string;
  categoryName: string;
  tagValue: string;
  createdAt: string;
}

/**
 * Input for creating a custom category
 */
export interface CreateCustomCategoryInput {
  name: string;
}

/**
 * Input for updating a custom category
 */
export interface UpdateCustomCategoryInput {
  id: string;
  name: string;
}

/**
 * Input for creating a tag
 */
export interface CreateTagInput {
  recipeId?: string;
  categoryType: CategoryType;
  categoryName: string;
  tagValue: string;
}

/**
 * Predefined categories configuration
 */
export const PREDEFINED_CATEGORIES = {
  [DefaultCategory.CUISINE]: {
    name: DefaultCategory.CUISINE,
    type: 'default' as CategoryType,
    tags: [...CUISINE_TAGS],
  },
  [DefaultCategory.DIETARY]: {
    name: DefaultCategory.DIETARY,
    type: 'default' as CategoryType,
    tags: [...DIETARY_TAGS],
  },
  [DefaultCategory.MEAL_TYPE]: {
    name: DefaultCategory.MEAL_TYPE,
    type: 'default' as CategoryType,
    tags: [...MEAL_TYPE_TAGS],
  },
  [DefaultCategory.COOKING_METHOD]: {
    name: DefaultCategory.COOKING_METHOD,
    type: 'default' as CategoryType,
    tags: [...COOKING_METHOD_TAGS],
  },
} as const;

/**
 * Get all predefined category names
 */
export const getAllPredefinedCategoryNames = (): string[] => {
  return Object.values(DefaultCategory);
};

/**
 * Check if a category is a default category
 */
export const isDefaultCategory = (categoryName: string): boolean => {
  return getAllPredefinedCategoryNames().includes(categoryName);
};

/**
 * Get predefined tags for a category
 */
export const getPredefinedTagsForCategory = (categoryName: string): string[] => {
  const category = PREDEFINED_CATEGORIES[categoryName as DefaultCategory];
  return category ? [...category.tags] : [];
};

/**
 * Tag utility functions
 */
export class TagUtils {
  /**
   * Create a new recipe tag
   */
  static createRecipeTag(input: CreateTagInput): RecipeTag {
    return {
      id: '',
      recipeId: input.recipeId || '',
      categoryType: input.categoryType,
      categoryName: input.categoryName,
      tagValue: input.tagValue,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Convert recipe tag to database row
   */
  static recipeTagToRow(tag: RecipeTag): RecipeTagRow {
    return {
      id: tag.id,
      recipeId: tag.recipeId,
      categoryType: tag.categoryType,
      categoryName: tag.categoryName,
      tagValue: tag.tagValue,
      createdAt: tag.createdAt,
    };
  }

  /**
   * Convert database row to recipe tag
   */
  static recipeTagFromRow(row: RecipeTagRow): RecipeTag {
    return {
      id: row.id,
      recipeId: row.recipeId,
      categoryType: row.categoryType as CategoryType,
      categoryName: row.categoryName,
      tagValue: row.tagValue,
      createdAt: row.createdAt,
    };
  }

  /**
   * Create a new custom category
   */
  static createCustomCategory(input: CreateCustomCategoryInput): CustomCategory {
    return {
      id: '',
      name: input.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
  }

  /**
   * Update a custom category
   */
  static updateCustomCategory(
    existing: CustomCategory,
    input: UpdateCustomCategoryInput
  ): CustomCategory {
    return {
      ...existing,
      name: input.name,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Soft delete a custom category
   */
  static softDeleteCustomCategory(existing: CustomCategory): CustomCategory {
    return {
      ...existing,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Convert custom category to database row
   */
  static customCategoryToRow(category: CustomCategory): CustomCategoryRow {
    return {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      deletedAt: category.deletedAt,
    };
  }

  /**
   * Convert database row to custom category
   */
  static customCategoryFromRow(row: CustomCategoryRow): CustomCategory {
    return {
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }

  /**
   * Validate tag value
   */
  static validateTagValue(value: string): string[] {
    const errors: string[] = [];

    if (!value || value.trim().length === 0) {
      errors.push('Tag name is required');
    }

    if (value.length > 30) {
      errors.push('Tag name must be 30 characters or less');
    }

    return errors;
  }

  /**
   * Validate category name
   */
  static validateCategoryName(name: string): string[] {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Category name is required');
    }

    if (name.length > 30) {
      errors.push('Category name must be 30 characters or less');
    }

    if (isDefaultCategory(name)) {
      errors.push('Cannot use a default category name');
    }

    return errors;
  }
}
