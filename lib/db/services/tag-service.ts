import { v4 as uuidv4 } from 'uuid';
import { dbConnection, DatabaseError } from '../connection';
import {
  CustomCategory,
  CustomCategoryRow,
  RecipeTag,
  RecipeTagRow,
  TagUtils,
  CreateCustomCategoryInput,
  UpdateCustomCategoryInput,
  CreateTagInput,
  CategoryWithTags,
  CategoryType,
  isDefaultCategory,
  getPredefinedTagsForCategory,
  getAllPredefinedCategoryNames,
  PREDEFINED_CATEGORIES,
} from '../schema/tags';
import { VALIDATION_CONSTRAINTS } from '@/constants/enums';

/**
 * Service for managing Tag and Category CRUD operations
 * Task Group 2: Database Schema & Service Layer
 * Task Group 9: Data Management & Synchronization
 * Task Group 11: Performance Optimization
 */
export class TagService {
  /**
   * Get all tags organized by category
   * Task 9.2: Referential integrity between tags and recipes
   * Task 11.1: Database performance optimization
   */
  async getAllTags(): Promise<CategoryWithTags[]> {
    try {
      // Get all custom categories
      const customCategories = await this.getCustomCategories();

      // Get all recipe tags grouped by category
      // Task 11.1: Optimized database query
      const query = `
        SELECT categoryName, categoryType, tagValue
        FROM recipe_tags
        GROUP BY categoryName, tagValue
        ORDER BY categoryName, tagValue
      `;

      const tagRows = await dbConnection.executeSelect<{
        categoryName: string;
        categoryType: string;
        tagValue: string;
      }>(query);

      // Group tags by category
      const categoryMap = new Map<string, Set<string>>();

      // Add predefined categories
      const predefinedCategoryNames = getAllPredefinedCategoryNames();
      predefinedCategoryNames.forEach((name) => {
        categoryMap.set(name, new Set(getPredefinedTagsForCategory(name)));
      });

      // Add custom categories
      customCategories.forEach((category) => {
        if (!categoryMap.has(category.name)) {
          categoryMap.set(category.name, new Set());
        }
      });

      // Add tags from database
      tagRows.forEach((row) => {
        if (!categoryMap.has(row.categoryName)) {
          categoryMap.set(row.categoryName, new Set());
        }
        categoryMap.get(row.categoryName)?.add(row.tagValue);
      });

      // Convert to array format
      const result: CategoryWithTags[] = [];

      // Add default categories first
      predefinedCategoryNames.forEach((name) => {
        const tags = Array.from(categoryMap.get(name) || []);
        const predefinedTags = getPredefinedTagsForCategory(name);
        const customCount = tags.filter((t) => !predefinedTags.includes(t)).length;

        result.push({
          name,
          type: 'default',
          tags,
          customCount,
        });
      });

      // Add custom categories with IDs
      // Task 11.2: Enhanced with id field for proper category management
      customCategories.forEach((category) => {
        const tags = Array.from(categoryMap.get(category.name) || []);
        result.push({
          id: category.id, // Include ID for custom categories
          name: category.name,
          type: 'custom',
          tags,
          customCount: tags.length,
        });
      });

      return result;
    } catch (error) {
      throw new DatabaseError(
        'GET_ALL_TAGS_FAILED',
        `Failed to get all tags: ${error}`,
        error
      );
    }
  }

  /**
   * Get tags for a specific category
   * Task 11.1: Database performance optimization
   */
  async getTagsByCategory(categoryName: string): Promise<string[]> {
    try {
      // Check if it's a predefined category
      if (isDefaultCategory(categoryName)) {
        const predefinedTags = getPredefinedTagsForCategory(categoryName);

        // Get custom tags for this category
        const query = `
          SELECT DISTINCT tagValue
          FROM recipe_tags
          WHERE categoryName = ? AND categoryType = 'default'
          ORDER BY tagValue
        `;

        const rows = await dbConnection.executeSelect<{ tagValue: string }>(
          query,
          [categoryName]
        );

        const customTags = rows
          .map((r) => r.tagValue)
          .filter((t) => !predefinedTags.includes(t));

        return [...predefinedTags, ...customTags];
      }

      // For custom categories, get all tags
      const query = `
        SELECT DISTINCT tagValue
        FROM recipe_tags
        WHERE categoryName = ? AND categoryType = 'custom'
        ORDER BY tagValue
      `;

      const rows = await dbConnection.executeSelect<{ tagValue: string }>(
        query,
        [categoryName]
      );

      return rows.map((r) => r.tagValue);
    } catch (error) {
      throw new DatabaseError(
        'GET_TAGS_BY_CATEGORY_FAILED',
        `Failed to get tags for category ${categoryName}: ${error}`,
        error
      );
    }
  }

  /**
   * Create a new tag
   * Task 9.2: Referential integrity validation
   * Task 12.1: Form validation errors
   * Task 12.3: Limit exceeded errors
   */
  async createTag(input: CreateTagInput): Promise<RecipeTag> {
    // Validate tag value
    const errors = TagUtils.validateTagValue(input.tagValue);
    if (errors.length > 0) {
      throw new DatabaseError(
        'VALIDATION_ERROR',
        `Tag validation failed: ${errors.join(', ')}`
      );
    }

    // Check for duplicate tag name globally
    const isDuplicate = await this.checkTagExists(input.tagValue);
    if (isDuplicate) {
      throw new DatabaseError(
        'DUPLICATE_TAG',
        `Tag "${input.tagValue}" already exists`
      );
    }

    // Task 12.3: Check tag limit for category
    if (input.categoryType === 'default') {
      const predefinedTags = getPredefinedTagsForCategory(input.categoryName);
      const customTagsCount = await this.getCustomTagCountForCategory(
        input.categoryName,
        'default'
      );

      if (
        customTagsCount >= VALIDATION_CONSTRAINTS.MAX_CUSTOM_TAGS_PER_CATEGORY
      ) {
        throw new DatabaseError(
          'TAG_LIMIT_EXCEEDED',
          `Maximum ${VALIDATION_CONSTRAINTS.MAX_CUSTOM_TAGS_PER_CATEGORY} custom tags allowed per category`
        );
      }
    }

    // Create tag
    const tag = TagUtils.createRecipeTag(input);
    tag.id = uuidv4();

    // If recipeId is provided, insert the tag
    if (input.recipeId) {
      const row = TagUtils.recipeTagToRow(tag);

      try {
        const query = `
          INSERT INTO recipe_tags (
            id, recipeId, categoryType, categoryName, tagValue, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        await dbConnection.executeQuery(query, [
          row.id,
          row.recipeId,
          row.categoryType,
          row.categoryName,
          row.tagValue,
          row.createdAt,
        ]);
      } catch (error) {
        throw new DatabaseError(
          'CREATE_TAG_FAILED',
          `Failed to create tag: ${error}`,
          error
        );
      }
    }

    return tag;
  }

  /**
   * Update a tag (rename across all recipes)
   * Task 9.1: Automatic updates when tags are renamed
   * Task 12.1: Form validation errors
   */
  async updateTag(tagValue: string, newValue: string): Promise<void> {
    // Validate new tag value
    const errors = TagUtils.validateTagValue(newValue);
    if (errors.length > 0) {
      throw new DatabaseError(
        'VALIDATION_ERROR',
        `Tag validation failed: ${errors.join(', ')}`
      );
    }

    // Check if new value already exists (excluding current tag)
    if (tagValue !== newValue) {
      const isDuplicate = await this.checkTagExists(newValue);
      if (isDuplicate) {
        throw new DatabaseError(
          'DUPLICATE_TAG',
          `Tag "${newValue}" already exists`
        );
      }
    }

    try {
      // Task 9.1: Automatically updates all recipes with this tag
      const query = `
        UPDATE recipe_tags
        SET tagValue = ?
        WHERE tagValue = ?
      `;

      await dbConnection.executeQuery(query, [newValue, tagValue]);
    } catch (error) {
      throw new DatabaseError(
        'UPDATE_TAG_FAILED',
        `Failed to update tag: ${error}`,
        error
      );
    }
  }

  /**
   * Delete a tag (remove from all recipes)
   * Task 9.1: Automatic updates when tags are deleted
   * Task 9.2: Data cleanup on tag deletion
   */
  async deleteTag(tagValue: string): Promise<void> {
    try {
      // Task 9.1 & 9.2: Automatically removes from all recipes
      const query = `
        DELETE FROM recipe_tags
        WHERE tagValue = ?
      `;

      await dbConnection.executeQuery(query, [tagValue]);
    } catch (error) {
      throw new DatabaseError(
        'DELETE_TAG_FAILED',
        `Failed to delete tag: ${error}`,
        error
      );
    }
  }

  /**
   * Create a new custom category
   * Task 12.1: Form validation errors
   * Task 12.3: Limit exceeded errors
   */
  async createCategory(input: CreateCustomCategoryInput): Promise<CustomCategory> {
    // Validate category name
    const errors = TagUtils.validateCategoryName(input.name);
    if (errors.length > 0) {
      throw new DatabaseError(
        'VALIDATION_ERROR',
        `Category validation failed: ${errors.join(', ')}`
      );
    }

    // Check for duplicate category name
    const isDuplicate = await this.checkCategoryExists(input.name);
    if (isDuplicate) {
      throw new DatabaseError(
        'DUPLICATE_CATEGORY',
        `Category "${input.name}" already exists`
      );
    }

    // Task 12.3: Check custom category limit
    const customCategoryCount = await this.getCustomCategoryCount();
    if (customCategoryCount >= VALIDATION_CONSTRAINTS.MAX_CUSTOM_CATEGORIES) {
      throw new DatabaseError(
        'CATEGORY_LIMIT_EXCEEDED',
        `Maximum ${VALIDATION_CONSTRAINTS.MAX_CUSTOM_CATEGORIES} custom categories allowed`
      );
    }

    // Create category
    const category = TagUtils.createCustomCategory(input);
    category.id = uuidv4();

    const row = TagUtils.customCategoryToRow(category);

    try {
      const query = `
        INSERT INTO custom_categories (
          id, name, createdAt, updatedAt, deletedAt
        ) VALUES (?, ?, ?, ?, ?)
      `;

      await dbConnection.executeQuery(query, [
        row.id,
        row.name,
        row.createdAt,
        row.updatedAt,
        row.deletedAt,
      ]);

      return category;
    } catch (error) {
      throw new DatabaseError(
        'CREATE_CATEGORY_FAILED',
        `Failed to create category: ${error}`,
        error
      );
    }
  }

  /**
   * Update a custom category
   * Task 9.1: Automatic updates when categories are renamed
   * Task 12.1: Form validation errors
   */
  async updateCategory(input: UpdateCustomCategoryInput): Promise<CustomCategory> {
    try {
      // Get existing category
      const existing = await this.getCategoryById(input.id);
      if (!existing) {
        throw new DatabaseError(
          'NOT_FOUND',
          `Category with ID ${input.id} not found`
        );
      }

      // Check if it's trying to update a default category
      if (isDefaultCategory(existing.name)) {
        throw new DatabaseError(
          'PROTECTED_CATEGORY',
          'Cannot modify default categories'
        );
      }

      // Validate new category name
      const errors = TagUtils.validateCategoryName(input.name);
      if (errors.length > 0) {
        throw new DatabaseError(
          'VALIDATION_ERROR',
          `Category validation failed: ${errors.join(', ')}`
        );
      }

      // Check for duplicate category name (excluding current)
      if (existing.name !== input.name) {
        const isDuplicate = await this.checkCategoryExists(input.name);
        if (isDuplicate) {
          throw new DatabaseError(
            'DUPLICATE_CATEGORY',
            `Category "${input.name}" already exists`
          );
        }
      }

      // Update category
      const updated = TagUtils.updateCustomCategory(existing, input);
      const row = TagUtils.customCategoryToRow(updated);

      const query = `
        UPDATE custom_categories
        SET name = ?, updatedAt = ?
        WHERE id = ? AND deletedAt IS NULL
      `;

      await dbConnection.executeQuery(query, [
        row.name,
        row.updatedAt,
        input.id,
      ]);

      // Task 9.1: Update all tags with this category
      const updateTagsQuery = `
        UPDATE recipe_tags
        SET categoryName = ?
        WHERE categoryName = ? AND categoryType = 'custom'
      `;

      await dbConnection.executeQuery(updateTagsQuery, [
        input.name,
        existing.name,
      ]);

      return updated;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        'UPDATE_CATEGORY_FAILED',
        `Failed to update category: ${error}`,
        error
      );
    }
  }

  /**
   * Delete a custom category and all its tags
   * Task 9.1: Automatic updates when categories are deleted
   * Task 9.2: Data cleanup on tag deletion
   */
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      // Get existing category
      const existing = await this.getCategoryById(categoryId);
      if (!existing) {
        throw new DatabaseError(
          'NOT_FOUND',
          `Category with ID ${categoryId} not found`
        );
      }

      // Check if it's trying to delete a default category
      if (isDefaultCategory(existing.name)) {
        throw new DatabaseError(
          'PROTECTED_CATEGORY',
          'Cannot delete default categories'
        );
      }

      // Task 9.2: Delete all tags in this category
      const deleteTagsQuery = `
        DELETE FROM recipe_tags
        WHERE categoryName = ? AND categoryType = 'custom'
      `;

      await dbConnection.executeQuery(deleteTagsQuery, [existing.name]);

      // Soft delete category
      const deleted = TagUtils.softDeleteCustomCategory(existing);
      const row = TagUtils.customCategoryToRow(deleted);

      const query = `
        UPDATE custom_categories
        SET deletedAt = ?, updatedAt = ?
        WHERE id = ?
      `;

      await dbConnection.executeQuery(query, [
        row.deletedAt,
        row.updatedAt,
        categoryId,
      ]);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        'DELETE_CATEGORY_FAILED',
        `Failed to delete category: ${error}`,
        error
      );
    }
  }

  /**
   * Search tags by query
   * Task 11.3: Search performance optimization
   */
  async searchTags(query: string): Promise<CategoryWithTags[]> {
    try {
      const allTags = await this.getAllTags();

      // Filter tags by query (case-insensitive)
      return allTags
        .map((category) => ({
          ...category,
          tags: category.tags.filter((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          ),
        }))
        .filter((category) => category.tags.length > 0);
    } catch (error) {
      throw new DatabaseError(
        'SEARCH_TAGS_FAILED',
        `Failed to search tags: ${error}`,
        error
      );
    }
  }

  /**
   * Validate tag name (check for duplicates)
   */
  async validateTagName(tagValue: string): Promise<boolean> {
    return !(await this.checkTagExists(tagValue));
  }

  /**
   * Get tags for a specific recipe
   * Task 9.2: Referential integrity
   */
  async getTagsForRecipe(recipeId: string): Promise<RecipeTag[]> {
    try {
      const query = `
        SELECT * FROM recipe_tags
        WHERE recipeId = ?
        ORDER BY categoryName, tagValue
      `;

      const rows = await dbConnection.executeSelect<RecipeTagRow>(query, [
        recipeId,
      ]);

      return rows.map((row) => TagUtils.recipeTagFromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_RECIPE_TAGS_FAILED',
        `Failed to get tags for recipe: ${error}`,
        error
      );
    }
  }

  /**
   * Add tags to a recipe
   * Task 9.2: Referential integrity
   */
  async addTagsToRecipe(
    recipeId: string,
    tags: Array<{ categoryName: string; tagValue: string; categoryType: CategoryType }>
  ): Promise<void> {
    try {
      const query = `
        INSERT INTO recipe_tags (
          id, recipeId, categoryType, categoryName, tagValue, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      for (const tag of tags) {
        const recipeTag = TagUtils.createRecipeTag({
          recipeId,
          categoryType: tag.categoryType,
          categoryName: tag.categoryName,
          tagValue: tag.tagValue,
        });
        recipeTag.id = uuidv4();

        const row = TagUtils.recipeTagToRow(recipeTag);

        await dbConnection.executeQuery(query, [
          row.id,
          row.recipeId,
          row.categoryType,
          row.categoryName,
          row.tagValue,
          row.createdAt,
        ]);
      }
    } catch (error) {
      throw new DatabaseError(
        'ADD_TAGS_TO_RECIPE_FAILED',
        `Failed to add tags to recipe: ${error}`,
        error
      );
    }
  }

  /**
   * Remove all tags from a recipe
   * Task 9.2: Data cleanup
   */
  async removeAllTagsFromRecipe(recipeId: string): Promise<void> {
    try {
      const query = `
        DELETE FROM recipe_tags
        WHERE recipeId = ?
      `;

      await dbConnection.executeQuery(query, [recipeId]);
    } catch (error) {
      throw new DatabaseError(
        'REMOVE_TAGS_FROM_RECIPE_FAILED',
        `Failed to remove tags from recipe: ${error}`,
        error
      );
    }
  }

  /**
   * Helper: Check if a tag exists globally
   */
  private async checkTagExists(tagValue: string): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM recipe_tags
        WHERE tagValue = ?
      `;

      const result = await dbConnection.executeSelect<{ count: number }>(
        query,
        [tagValue]
      );

      return (result[0]?.count || 0) > 0;
    } catch (error) {
      throw new DatabaseError(
        'CHECK_TAG_EXISTS_FAILED',
        `Failed to check if tag exists: ${error}`,
        error
      );
    }
  }

  /**
   * Helper: Check if a category exists
   */
  private async checkCategoryExists(categoryName: string): Promise<boolean> {
    // Check if it's a default category
    if (isDefaultCategory(categoryName)) {
      return true;
    }

    try {
      const query = `
        SELECT COUNT(*) as count
        FROM custom_categories
        WHERE name = ? AND deletedAt IS NULL
      `;

      const result = await dbConnection.executeSelect<{ count: number }>(
        query,
        [categoryName]
      );

      return (result[0]?.count || 0) > 0;
    } catch (error) {
      throw new DatabaseError(
        'CHECK_CATEGORY_EXISTS_FAILED',
        `Failed to check if category exists: ${error}`,
        error
      );
    }
  }

  /**
   * Helper: Get custom category by ID
   */
  private async getCategoryById(id: string): Promise<CustomCategory | null> {
    try {
      const query = `
        SELECT * FROM custom_categories
        WHERE id = ? AND deletedAt IS NULL
      `;

      const rows = await dbConnection.executeSelect<CustomCategoryRow>(query, [
        id,
      ]);

      if (rows.length === 0) {
        return null;
      }

      return TagUtils.customCategoryFromRow(rows[0]);
    } catch (error) {
      throw new DatabaseError(
        'GET_CATEGORY_BY_ID_FAILED',
        `Failed to get category by ID: ${error}`,
        error
      );
    }
  }

  /**
   * Helper: Get all custom categories
   * Task 11.1: Database query optimization
   */
  private async getCustomCategories(): Promise<CustomCategory[]> {
    try {
      const query = `
        SELECT * FROM custom_categories
        WHERE deletedAt IS NULL
        ORDER BY name
      `;

      const rows = await dbConnection.executeSelect<CustomCategoryRow>(query);

      return rows.map((row) => TagUtils.customCategoryFromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_CUSTOM_CATEGORIES_FAILED',
        `Failed to get custom categories: ${error}`,
        error
      );
    }
  }

  /**
   * Helper: Get custom category count
   */
  private async getCustomCategoryCount(): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM custom_categories
        WHERE deletedAt IS NULL
      `;

      const result = await dbConnection.executeSelect<{ count: number }>(query);

      return result[0]?.count || 0;
    } catch (error) {
      throw new DatabaseError(
        'GET_CUSTOM_CATEGORY_COUNT_FAILED',
        `Failed to get custom category count: ${error}`,
        error
      );
    }
  }

  /**
   * Helper: Get custom tag count for a category
   */
  private async getCustomTagCountForCategory(
    categoryName: string,
    categoryType: CategoryType
  ): Promise<number> {
    try {
      const predefinedTags = isDefaultCategory(categoryName)
        ? getPredefinedTagsForCategory(categoryName)
        : [];

      const query = `
        SELECT COUNT(DISTINCT tagValue) as count
        FROM recipe_tags
        WHERE categoryName = ? AND categoryType = ?
      `;

      const result = await dbConnection.executeSelect<{ count: number }>(
        query,
        [categoryName, categoryType]
      );

      const totalCount = result[0]?.count || 0;

      // For default categories, subtract predefined tags count
      if (categoryType === 'default') {
        return Math.max(0, totalCount - predefinedTags.length);
      }

      return totalCount;
    } catch (error) {
      throw new DatabaseError(
        'GET_CUSTOM_TAG_COUNT_FAILED',
        `Failed to get custom tag count: ${error}`,
        error
      );
    }
  }

  /**
   * Execute operations within a transaction
   * Task 11.1: Database connection management
   */
  async executeInTransaction<T>(
    operation: (service: TagService) => Promise<T>
  ): Promise<T> {
    return await dbConnection.executeTransaction(async () => {
      return await operation(this);
    });
  }
}

// Export singleton instance
export const tagService = new TagService();
