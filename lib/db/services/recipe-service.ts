import { v4 as uuidv4 } from 'uuid';
import { supabase, getCurrentUserId, SupabaseError } from '@/lib/supabase/client';
import {
  uploadImageIfLocal,
  deleteRecipeImage,
  isSupabaseStorageUrl,
} from '@/lib/supabase/image-storage';
import {
  Recipe,
  RecipeUtils,
  CreateRecipeInput,
  UpdateRecipeInput,
  Ingredient,
} from '../schema/recipe';
import { DishCategory } from '@/constants/enums';

interface SupabaseRecipeRow {
  id: string;
  user_id: string;
  title: string;
  servings: number;
  category: string;
  ingredients: Ingredient[];
  steps: string[];
  image_uri: string | null;
  prep_time: number | null;
  cook_time: number | null;
  tags: string[] | null;
  source: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function fromSupabaseRow(row: SupabaseRecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    servings: row.servings,
    category: row.category as DishCategory,
    ingredients: row.ingredients,
    steps: row.steps,
    imageUri: row.image_uri,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    tags: row.tags || [],
    source: row.source ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export class RecipeService {
  async createRecipe(input: CreateRecipeInput): Promise<Recipe> {
    const recipe = RecipeUtils.create(input);
    recipe.id = uuidv4();

    const errors = RecipeUtils.validate(recipe);
    if (errors.length > 0) {
      throw new SupabaseError(
        'VALIDATION_ERROR',
        `Recipe validation failed: ${errors.join(', ')}`
      );
    }

    try {
      const userId = await getCurrentUserId();

      const imageUrl = await uploadImageIfLocal(recipe.imageUri);

      const { data, error } = await supabase
        .from('recipes')
        .insert({
          id: recipe.id,
          user_id: userId,
          title: recipe.title,
          servings: recipe.servings,
          category: recipe.category,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          image_uri: imageUrl,
          prep_time: recipe.prepTime,
          cook_time: recipe.cookTime,
          tags: recipe.tags,
          source: recipe.source,
          created_at: recipe.createdAt,
          updated_at: recipe.updatedAt,
          deleted_at: recipe.deletedAt,
        })
        .select()
        .single();

      if (error) {
        console.error('Recipe create error:', error);
        if (imageUrl && isSupabaseStorageUrl(imageUrl)) {
          try {
            await deleteRecipeImage(imageUrl);
          } catch {
            // Ignore cleanup errors
          }
        }
        throw new SupabaseError('CREATE_FAILED', 'Failed to create recipe');
      }

      return fromSupabaseRow(data);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'CREATE_FAILED',
        `Failed to create recipe: ${error}`,
        error
      );
    }
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Recipe get error:', error);
        throw new SupabaseError('GET_FAILED', 'Failed to get recipe');
      }

      return data ? fromSupabaseRow(data) : null;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_FAILED',
        `Failed to get recipe by ID: ${error}`,
        error
      );
    }
  }

  async getAllRecipes(options?: {
    limit?: number;
    offset?: number;
    includeDeleted?: boolean;
  }): Promise<Recipe[]> {
    const limit = options?.limit || 100;
    const offset = options?.offset || 0;
    const includeDeleted = options?.includeDeleted || false;

    try {
      const userId = await getCurrentUserId();

      let query = supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Recipes get all error:', error);
        throw new SupabaseError('GET_ALL_FAILED', 'Failed to get recipes');
      }

      return (data || []).map(fromSupabaseRow);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_ALL_FAILED',
        `Failed to get all recipes: ${error}`,
        error
      );
    }
  }

  async updateRecipe(input: UpdateRecipeInput): Promise<Recipe> {
    try {
      const existing = await this.getRecipeById(input.id);
      if (!existing) {
        throw new SupabaseError('NOT_FOUND', `Recipe with ID ${input.id} not found`);
      }

      const updated = RecipeUtils.update(existing, input);

      const errors = RecipeUtils.validate(updated);
      if (errors.length > 0) {
        throw new SupabaseError(
          'VALIDATION_ERROR',
          `Recipe validation failed: ${errors.join(', ')}`
        );
      }

      const userId = await getCurrentUserId();

      const updateData: Record<string, unknown> = { updated_at: updated.updatedAt };

      if (input.title !== undefined) updateData.title = input.title;
      if (input.servings !== undefined) updateData.servings = input.servings;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.ingredients !== undefined) updateData.ingredients = input.ingredients;
      if (input.steps !== undefined) updateData.steps = input.steps;
      if (input.prepTime !== undefined) updateData.prep_time = input.prepTime;
      if (input.cookTime !== undefined) updateData.cook_time = input.cookTime;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.source !== undefined) updateData.source = input.source;

      if (input.imageUri !== undefined) {
        const oldImageUrl = existing.imageUri;
        const newImageUrl = await uploadImageIfLocal(input.imageUri);
        updateData.image_uri = newImageUrl;

        if (
          oldImageUrl &&
          isSupabaseStorageUrl(oldImageUrl) &&
          oldImageUrl !== newImageUrl
        ) {
          try {
            await deleteRecipeImage(oldImageUrl);
          } catch {
            // Ignore cleanup errors for old image
          }
        }
      }

      const { data, error } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('id', input.id)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Recipe update error:', error);
        throw new SupabaseError('UPDATE_FAILED', 'Failed to update recipe');
      }

      return fromSupabaseRow(data);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'UPDATE_FAILED',
        `Failed to update recipe: ${error}`,
        error
      );
    }
  }

  async deleteRecipe(id: string): Promise<void> {
    try {
      const existing = await this.getRecipeById(id);
      if (!existing) {
        throw new SupabaseError('NOT_FOUND', `Recipe with ID ${id} not found`);
      }

      const deleted = RecipeUtils.softDelete(existing);
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('recipes')
        .update({
          deleted_at: deleted.deletedAt,
          updated_at: deleted.updatedAt,
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Recipe delete error:', error);
        throw new SupabaseError('DELETE_FAILED', 'Failed to delete recipe');
      }

      if (existing.imageUri && isSupabaseStorageUrl(existing.imageUri)) {
        try {
          await deleteRecipeImage(existing.imageUri);
        } catch {
          // Log but don't fail the deletion if image cleanup fails
          console.warn('Failed to delete recipe image from storage');
        }
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'DELETE_FAILED',
        `Failed to delete recipe: ${error}`,
        error
      );
    }
  }

  async searchRecipes(searchTerm: string): Promise<Recipe[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }
    if (searchTerm.length > 200) {
      throw new SupabaseError('VALIDATION_ERROR', 'Search term too long (max 200 characters)');
    }

    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .ilike('title', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Recipe search error:', error);
        throw new SupabaseError('SEARCH_FAILED', 'Failed to search recipes');
      }

      return (data || []).map(fromSupabaseRow);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'SEARCH_FAILED',
        `Failed to search recipes: ${error}`,
        error
      );
    }
  }

  async getRecipeCount(includeDeleted = false): Promise<number> {
    try {
      const userId = await getCurrentUserId();

      let query = supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Recipe count error:', error);
        throw new SupabaseError('COUNT_FAILED', 'Failed to get recipe count');
      }

      return count || 0;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'COUNT_FAILED',
        `Failed to get recipe count: ${error}`,
        error
      );
    }
  }

  async getRecipesByCategory(category: string): Promise<Recipe[]> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Recipe get by category error:', error);
        throw new SupabaseError('GET_BY_CATEGORY_FAILED', 'Failed to get recipes by category');
      }

      return (data || []).map(fromSupabaseRow);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_BY_CATEGORY_FAILED',
        `Failed to get recipes by category: ${error}`,
        error
      );
    }
  }

  async getRecipesByTag(tag: string): Promise<Recipe[]> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .contains('tags', [tag])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Recipe get by tag error:', error);
        throw new SupabaseError('GET_BY_TAG_FAILED', 'Failed to get recipes by tag');
      }

      return (data || []).map(fromSupabaseRow);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_BY_TAG_FAILED',
        `Failed to get recipes by tag: ${error}`,
        error
      );
    }
  }

  async executeInTransaction<T>(
    operation: (service: RecipeService) => Promise<T>
  ): Promise<T> {
    return await operation(this);
  }
}

export const recipeService = new RecipeService();
