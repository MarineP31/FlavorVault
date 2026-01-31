import { v4 as uuidv4 } from 'uuid';
import { supabase, getCurrentUserId, SupabaseError } from '@/lib/supabase/client';
import {
  CustomCategory,
  RecipeTag,
  TagUtils,
  CreateCustomCategoryInput,
  UpdateCustomCategoryInput,
  CreateTagInput,
  CategoryWithTags,
  CategoryType,
  isDefaultCategory,
  getPredefinedTagsForCategory,
  getAllPredefinedCategoryNames,
} from '../schema/tags';
import { VALIDATION_CONSTRAINTS } from '@/constants/enums';

interface SupabaseCustomCategoryRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface SupabaseRecipeTagRow {
  id: string;
  user_id: string;
  recipe_id: string;
  category_type: string;
  category_name: string;
  tag_value: string;
  created_at: string;
}

function customCategoryFromSupabaseRow(row: SupabaseCustomCategoryRow): CustomCategory {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function recipeTagFromSupabaseRow(row: SupabaseRecipeTagRow): RecipeTag {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    categoryType: row.category_type as CategoryType,
    categoryName: row.category_name,
    tagValue: row.tag_value,
    createdAt: row.created_at,
  };
}

export class TagService {
  async getAllTags(): Promise<CategoryWithTags[]> {
    try {
      const userId = await getCurrentUserId();
      const customCategories = await this.getCustomCategories();

      const { data: tagRows, error } = await supabase
        .from('recipe_tags')
        .select('category_name, category_type, tag_value')
        .eq('user_id', userId);

      if (error) {
        console.error('Get all tags error:', error);
        throw new SupabaseError('GET_ALL_TAGS_FAILED', 'Failed to get all tags');
      }

      const categoryMap = new Map<string, Set<string>>();

      const predefinedCategoryNames = getAllPredefinedCategoryNames();
      predefinedCategoryNames.forEach((name) => {
        categoryMap.set(name, new Set(getPredefinedTagsForCategory(name)));
      });

      customCategories.forEach((category) => {
        if (!categoryMap.has(category.name)) {
          categoryMap.set(category.name, new Set());
        }
      });

      (tagRows || []).forEach((row: any) => {
        if (!categoryMap.has(row.category_name)) {
          categoryMap.set(row.category_name, new Set());
        }
        categoryMap.get(row.category_name)?.add(row.tag_value);
      });

      const result: CategoryWithTags[] = [];

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

      customCategories.forEach((category) => {
        const tags = Array.from(categoryMap.get(category.name) || []);
        result.push({
          id: category.id,
          name: category.name,
          type: 'custom',
          tags,
          customCount: tags.length,
        });
      });

      return result;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_ALL_TAGS_FAILED',
        `Failed to get all tags: ${error}`,
        error
      );
    }
  }

  async getTagsByCategory(categoryName: string): Promise<string[]> {
    try {
      const userId = await getCurrentUserId();

      if (isDefaultCategory(categoryName)) {
        const predefinedTags = getPredefinedTagsForCategory(categoryName);

        const { data: rows, error } = await supabase
          .from('recipe_tags')
          .select('tag_value')
          .eq('user_id', userId)
          .eq('category_name', categoryName)
          .eq('category_type', 'default');

        if (error) {
          console.error('Get tags by category error:', error);
          throw new SupabaseError('GET_TAGS_BY_CATEGORY_FAILED', 'Failed to get tags for category');
        }

        const customTags = (rows || [])
          .map((r: any) => r.tag_value)
          .filter((t: string) => !predefinedTags.includes(t));

        return [...predefinedTags, ...customTags];
      }

      const { data: rows, error } = await supabase
        .from('recipe_tags')
        .select('tag_value')
        .eq('user_id', userId)
        .eq('category_name', categoryName)
        .eq('category_type', 'custom');

      if (error) {
        throw new SupabaseError(
          'GET_TAGS_BY_CATEGORY_FAILED',
          `Failed to get tags for category: ${error.message}`
        );
      }

      return [...new Set((rows || []).map((r: any) => r.tag_value))];
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_TAGS_BY_CATEGORY_FAILED',
        `Failed to get tags for category ${categoryName}: ${error}`,
        error
      );
    }
  }

  async createTag(input: CreateTagInput): Promise<RecipeTag> {
    const errors = TagUtils.validateTagValue(input.tagValue);
    if (errors.length > 0) {
      throw new SupabaseError(
        'VALIDATION_ERROR',
        `Tag validation failed: ${errors.join(', ')}`
      );
    }

    const isDuplicate = await this.checkTagExists(input.tagValue);
    if (isDuplicate) {
      throw new SupabaseError('DUPLICATE_TAG', `Tag "${input.tagValue}" already exists`);
    }

    if (input.categoryType === 'default') {
      const customTagsCount = await this.getCustomTagCountForCategory(
        input.categoryName,
        'default'
      );

      if (customTagsCount >= VALIDATION_CONSTRAINTS.MAX_CUSTOM_TAGS_PER_CATEGORY) {
        throw new SupabaseError(
          'TAG_LIMIT_EXCEEDED',
          `Maximum ${VALIDATION_CONSTRAINTS.MAX_CUSTOM_TAGS_PER_CATEGORY} custom tags allowed per category`
        );
      }
    }

    const tag = TagUtils.createRecipeTag(input);
    tag.id = uuidv4();

    if (input.recipeId) {
      try {
        const userId = await getCurrentUserId();

        const { error } = await supabase.from('recipe_tags').insert({
          id: tag.id,
          user_id: userId,
          recipe_id: tag.recipeId,
          category_type: tag.categoryType,
          category_name: tag.categoryName,
          tag_value: tag.tagValue,
          created_at: tag.createdAt,
        });

        if (error) {
          console.error('Create tag error:', error);
          throw new SupabaseError('CREATE_TAG_FAILED', 'Failed to create tag');
        }
      } catch (error) {
        if (error instanceof SupabaseError) throw error;
        throw new SupabaseError('CREATE_TAG_FAILED', `Failed to create tag: ${error}`, error);
      }
    }

    return tag;
  }

  async updateTag(tagValue: string, newValue: string): Promise<void> {
    const errors = TagUtils.validateTagValue(newValue);
    if (errors.length > 0) {
      throw new SupabaseError(
        'VALIDATION_ERROR',
        `Tag validation failed: ${errors.join(', ')}`
      );
    }

    if (tagValue !== newValue) {
      const isDuplicate = await this.checkTagExists(newValue);
      if (isDuplicate) {
        throw new SupabaseError('DUPLICATE_TAG', `Tag "${newValue}" already exists`);
      }
    }

    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('recipe_tags')
        .update({ tag_value: newValue })
        .eq('user_id', userId)
        .eq('tag_value', tagValue);

      if (error) {
        console.error('Update tag error:', error);
        throw new SupabaseError('UPDATE_TAG_FAILED', 'Failed to update tag');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError('UPDATE_TAG_FAILED', `Failed to update tag: ${error}`, error);
    }
  }

  async deleteTag(tagValue: string): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('recipe_tags')
        .delete()
        .eq('user_id', userId)
        .eq('tag_value', tagValue);

      if (error) {
        console.error('Delete tag error:', error);
        throw new SupabaseError('DELETE_TAG_FAILED', 'Failed to delete tag');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError('DELETE_TAG_FAILED', `Failed to delete tag: ${error}`, error);
    }
  }

  async createCategory(input: CreateCustomCategoryInput): Promise<CustomCategory> {
    const errors = TagUtils.validateCategoryName(input.name);
    if (errors.length > 0) {
      throw new SupabaseError(
        'VALIDATION_ERROR',
        `Category validation failed: ${errors.join(', ')}`
      );
    }

    const isDuplicate = await this.checkCategoryExists(input.name);
    if (isDuplicate) {
      throw new SupabaseError('DUPLICATE_CATEGORY', `Category "${input.name}" already exists`);
    }

    const customCategoryCount = await this.getCustomCategoryCount();
    if (customCategoryCount >= VALIDATION_CONSTRAINTS.MAX_CUSTOM_CATEGORIES) {
      throw new SupabaseError(
        'CATEGORY_LIMIT_EXCEEDED',
        `Maximum ${VALIDATION_CONSTRAINTS.MAX_CUSTOM_CATEGORIES} custom categories allowed`
      );
    }

    const category = TagUtils.createCustomCategory(input);
    category.id = uuidv4();

    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase.from('custom_categories').insert({
        id: category.id,
        user_id: userId,
        name: category.name,
        created_at: category.createdAt,
        updated_at: category.updatedAt,
        deleted_at: category.deletedAt,
      });

      if (error) {
        console.error('Create category error:', error);
        throw new SupabaseError('CREATE_CATEGORY_FAILED', 'Failed to create category');
      }

      return category;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'CREATE_CATEGORY_FAILED',
        `Failed to create category: ${error}`,
        error
      );
    }
  }

  async updateCategory(input: UpdateCustomCategoryInput): Promise<CustomCategory> {
    try {
      const existing = await this.getCategoryById(input.id);
      if (!existing) {
        throw new SupabaseError('NOT_FOUND', `Category with ID ${input.id} not found`);
      }

      if (isDefaultCategory(existing.name)) {
        throw new SupabaseError('PROTECTED_CATEGORY', 'Cannot modify default categories');
      }

      const errors = TagUtils.validateCategoryName(input.name);
      if (errors.length > 0) {
        throw new SupabaseError(
          'VALIDATION_ERROR',
          `Category validation failed: ${errors.join(', ')}`
        );
      }

      if (existing.name !== input.name) {
        const isDuplicate = await this.checkCategoryExists(input.name);
        if (isDuplicate) {
          throw new SupabaseError('DUPLICATE_CATEGORY', `Category "${input.name}" already exists`);
        }
      }

      const updated = TagUtils.updateCustomCategory(existing, input);
      const userId = await getCurrentUserId();

      const { error: categoryError } = await supabase
        .from('custom_categories')
        .update({
          name: updated.name,
          updated_at: updated.updatedAt,
        })
        .eq('id', input.id)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (categoryError) {
        throw new SupabaseError(
          'UPDATE_CATEGORY_FAILED',
          `Failed to update category: ${categoryError.message}`
        );
      }

      const { error: tagsError } = await supabase
        .from('recipe_tags')
        .update({ category_name: input.name })
        .eq('user_id', userId)
        .eq('category_name', existing.name)
        .eq('category_type', 'custom');

      if (tagsError) {
        throw new SupabaseError(
          'UPDATE_CATEGORY_FAILED',
          `Failed to update tags for category: ${tagsError.message}`
        );
      }

      return updated;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'UPDATE_CATEGORY_FAILED',
        `Failed to update category: ${error}`,
        error
      );
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const existing = await this.getCategoryById(categoryId);
      if (!existing) {
        throw new SupabaseError('NOT_FOUND', `Category with ID ${categoryId} not found`);
      }

      if (isDefaultCategory(existing.name)) {
        throw new SupabaseError('PROTECTED_CATEGORY', 'Cannot delete default categories');
      }

      const userId = await getCurrentUserId();

      const { error: tagsError } = await supabase
        .from('recipe_tags')
        .delete()
        .eq('user_id', userId)
        .eq('category_name', existing.name)
        .eq('category_type', 'custom');

      if (tagsError) {
        throw new SupabaseError(
          'DELETE_CATEGORY_FAILED',
          `Failed to delete category tags: ${tagsError.message}`
        );
      }

      const deleted = TagUtils.softDeleteCustomCategory(existing);

      const { error: categoryError } = await supabase
        .from('custom_categories')
        .update({
          deleted_at: deleted.deletedAt,
          updated_at: deleted.updatedAt,
        })
        .eq('id', categoryId)
        .eq('user_id', userId);

      if (categoryError) {
        throw new SupabaseError(
          'DELETE_CATEGORY_FAILED',
          `Failed to delete category: ${categoryError.message}`
        );
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'DELETE_CATEGORY_FAILED',
        `Failed to delete category: ${error}`,
        error
      );
    }
  }

  async searchTags(query: string): Promise<CategoryWithTags[]> {
    try {
      const allTags = await this.getAllTags();

      return allTags
        .map((category) => ({
          ...category,
          tags: category.tags.filter((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          ),
        }))
        .filter((category) => category.tags.length > 0);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError('SEARCH_TAGS_FAILED', `Failed to search tags: ${error}`, error);
    }
  }

  async validateTagName(tagValue: string): Promise<boolean> {
    return !(await this.checkTagExists(tagValue));
  }

  async getTagsForRecipe(recipeId: string): Promise<RecipeTag[]> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('recipe_tags')
        .select('*')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .order('category_name')
        .order('tag_value');

      if (error) {
        console.error('Get recipe tags error:', error);
        throw new SupabaseError('GET_RECIPE_TAGS_FAILED', 'Failed to get tags for recipe');
      }

      return (data || []).map(recipeTagFromSupabaseRow);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_RECIPE_TAGS_FAILED',
        `Failed to get tags for recipe: ${error}`,
        error
      );
    }
  }

  async addTagsToRecipe(
    recipeId: string,
    tags: Array<{ categoryName: string; tagValue: string; categoryType: CategoryType }>
  ): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      for (const tag of tags) {
        const recipeTag = TagUtils.createRecipeTag({
          recipeId,
          categoryType: tag.categoryType,
          categoryName: tag.categoryName,
          tagValue: tag.tagValue,
        });
        recipeTag.id = uuidv4();

        const { error } = await supabase.from('recipe_tags').insert({
          id: recipeTag.id,
          user_id: userId,
          recipe_id: recipeTag.recipeId,
          category_type: recipeTag.categoryType,
          category_name: recipeTag.categoryName,
          tag_value: recipeTag.tagValue,
          created_at: recipeTag.createdAt,
        });

        if (error) {
          console.error('Add tag to recipe error:', error);
          throw new SupabaseError('ADD_TAGS_TO_RECIPE_FAILED', 'Failed to add tag to recipe');
        }
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'ADD_TAGS_TO_RECIPE_FAILED',
        `Failed to add tags to recipe: ${error}`,
        error
      );
    }
  }

  async removeAllTagsFromRecipe(recipeId: string): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('recipe_tags')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) {
        console.error('Remove tags from recipe error:', error);
        throw new SupabaseError('REMOVE_TAGS_FROM_RECIPE_FAILED', 'Failed to remove tags from recipe');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'REMOVE_TAGS_FROM_RECIPE_FAILED',
        `Failed to remove tags from recipe: ${error}`,
        error
      );
    }
  }

  private async checkTagExists(tagValue: string): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();

      const { count, error } = await supabase
        .from('recipe_tags')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('tag_value', tagValue);

      if (error) {
        console.error('Check tag exists error:', error);
        throw new SupabaseError('CHECK_TAG_EXISTS_FAILED', 'Failed to check if tag exists');
      }

      return (count || 0) > 0;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'CHECK_TAG_EXISTS_FAILED',
        `Failed to check if tag exists: ${error}`,
        error
      );
    }
  }

  private async checkCategoryExists(categoryName: string): Promise<boolean> {
    if (isDefaultCategory(categoryName)) {
      return true;
    }

    try {
      const userId = await getCurrentUserId();

      const { count, error } = await supabase
        .from('custom_categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('name', categoryName)
        .is('deleted_at', null);

      if (error) {
        console.error('Check category exists error:', error);
        throw new SupabaseError('CHECK_CATEGORY_EXISTS_FAILED', 'Failed to check if category exists');
      }

      return (count || 0) > 0;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'CHECK_CATEGORY_EXISTS_FAILED',
        `Failed to check if category exists: ${error}`,
        error
      );
    }
  }

  private async getCategoryById(id: string): Promise<CustomCategory | null> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Get category by ID error:', error);
        throw new SupabaseError('GET_CATEGORY_BY_ID_FAILED', 'Failed to get category by ID');
      }

      return data ? customCategoryFromSupabaseRow(data) : null;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_CATEGORY_BY_ID_FAILED',
        `Failed to get category by ID: ${error}`,
        error
      );
    }
  }

  private async getCustomCategories(): Promise<CustomCategory[]> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('name');

      if (error) {
        console.error('Get custom categories error:', error);
        throw new SupabaseError('GET_CUSTOM_CATEGORIES_FAILED', 'Failed to get custom categories');
      }

      return (data || []).map(customCategoryFromSupabaseRow);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_CUSTOM_CATEGORIES_FAILED',
        `Failed to get custom categories: ${error}`,
        error
      );
    }
  }

  private async getCustomCategoryCount(): Promise<number> {
    try {
      const userId = await getCurrentUserId();

      const { count, error } = await supabase
        .from('custom_categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Get custom category count error:', error);
        throw new SupabaseError('GET_CUSTOM_CATEGORY_COUNT_FAILED', 'Failed to get custom category count');
      }

      return count || 0;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_CUSTOM_CATEGORY_COUNT_FAILED',
        `Failed to get custom category count: ${error}`,
        error
      );
    }
  }

  private async getCustomTagCountForCategory(
    categoryName: string,
    categoryType: CategoryType
  ): Promise<number> {
    try {
      const userId = await getCurrentUserId();
      const predefinedTags = isDefaultCategory(categoryName)
        ? getPredefinedTagsForCategory(categoryName)
        : [];

      const { data, error } = await supabase
        .from('recipe_tags')
        .select('tag_value')
        .eq('user_id', userId)
        .eq('category_name', categoryName)
        .eq('category_type', categoryType);

      if (error) {
        console.error('Get custom tag count error:', error);
        throw new SupabaseError('GET_CUSTOM_TAG_COUNT_FAILED', 'Failed to get custom tag count');
      }

      const uniqueTags = [...new Set((data || []).map((r: any) => r.tag_value))];

      if (categoryType === 'default') {
        return uniqueTags.filter((t) => !predefinedTags.includes(t)).length;
      }

      return uniqueTags.length;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_CUSTOM_TAG_COUNT_FAILED',
        `Failed to get custom tag count: ${error}`,
        error
      );
    }
  }

  async executeInTransaction<T>(
    operation: (service: TagService) => Promise<T>
  ): Promise<T> {
    return await operation(this);
  }
}

export const tagService = new TagService();
