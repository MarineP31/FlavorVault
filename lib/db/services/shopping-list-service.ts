import { v4 as uuidv4 } from 'uuid';
import { supabase, getCurrentUserId, SupabaseError } from '@/lib/supabase/client';
import {
  ShoppingListItem,
  ShoppingListItemUtils,
  CreateShoppingListItemInput,
  UpdateShoppingListItemInput,
  ShoppingListItemWithRecipe,
  GroupedShoppingListItems,
  ShoppingListItemSource,
  ShoppingListCategory,
} from '../schema/shopping-list';
import { MeasurementUnit } from '@/constants/enums';

interface SupabaseShoppingListItemRow {
  id: string;
  user_id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  checked: boolean;
  recipe_id: string | null;
  meal_plan_id: string | null;
  category: string;
  source: string;
  original_name: string | null;
  created_at: string;
}

function fromSupabaseRow(row: SupabaseShoppingListItemRow): ShoppingListItem {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    unit: row.unit as MeasurementUnit | null,
    checked: row.checked,
    recipeId: row.recipe_id,
    mealPlanId: row.meal_plan_id,
    category: (row.category || 'Other') as ShoppingListCategory,
    source: (row.source || 'recipe') as ShoppingListItemSource,
    originalName: row.original_name,
    createdAt: row.created_at,
  };
}

export class ShoppingListService {
  async createItem(input: CreateShoppingListItemInput): Promise<ShoppingListItem> {
    const item = ShoppingListItemUtils.create(input);
    item.id = uuidv4();

    const errors = ShoppingListItemUtils.validate(item);
    if (errors.length > 0) {
      throw new SupabaseError(
        'VALIDATION_ERROR',
        `Shopping list item validation failed: ${errors.join(', ')}`
      );
    }

    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert({
          id: item.id,
          user_id: userId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          checked: item.checked,
          recipe_id: item.recipeId,
          meal_plan_id: item.mealPlanId,
          category: item.category,
          source: item.source,
          original_name: item.originalName,
          created_at: item.createdAt,
        })
        .select()
        .single();

      if (error) {
        console.error('Shopping list create error:', error);
        throw new SupabaseError('CREATE_FAILED', 'Failed to create shopping list item');
      }

      return fromSupabaseRow(data);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'CREATE_FAILED',
        `Failed to create shopping list item: ${error}`,
        error
      );
    }
  }

  async createBulk(inputs: CreateShoppingListItemInput[]): Promise<ShoppingListItem[]> {
    const items: ShoppingListItem[] = [];

    for (const input of inputs) {
      const item = await this.createItem(input);
      items.push(item);
    }

    return items;
  }

  async getAll(): Promise<ShoppingListItem[]> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('user_id', userId)
        .order('category')
        .order('name');

      if (error) {
        console.error('Shopping list get all error:', error);
        throw new SupabaseError('GET_ALL_FAILED', 'Failed to get all shopping list items');
      }

      return (data || []).map(fromSupabaseRow);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_ALL_FAILED',
        `Failed to get all shopping list items: ${error}`,
        error
      );
    }
  }

  async getAllByCategory(): Promise<GroupedShoppingListItems> {
    try {
      const items = await this.getAll();
      return ShoppingListItemUtils.groupByCategory(items);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_BY_CATEGORY_FAILED',
        `Failed to get shopping list items by category: ${error}`,
        error
      );
    }
  }

  async getShoppingListItemById(id: string): Promise<ShoppingListItem | null> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Shopping list get item error:', error);
        throw new SupabaseError('GET_FAILED', 'Failed to get shopping list item');
      }

      return data ? fromSupabaseRow(data) : null;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_FAILED',
        `Failed to get shopping list item by ID: ${error}`,
        error
      );
    }
  }

  async getAllShoppingItems(options?: {
    checkedOnly?: boolean;
    uncheckedOnly?: boolean;
    recipeOnly?: boolean;
    manualOnly?: boolean;
  }): Promise<ShoppingListItem[]> {
    try {
      const userId = await getCurrentUserId();

      let query = supabase
        .from('shopping_list_items')
        .select('*')
        .eq('user_id', userId);

      if (options?.checkedOnly) {
        query = query.eq('checked', true);
      }

      if (options?.uncheckedOnly) {
        query = query.eq('checked', false);
      }

      if (options?.recipeOnly) {
        query = query.eq('source', 'recipe');
      }

      if (options?.manualOnly) {
        query = query.eq('source', 'manual');
      }

      query = query.order('checked').order('category').order('name');

      const { data, error } = await query;

      if (error) {
        console.error('Shopping list get items error:', error);
        throw new SupabaseError('GET_ALL_FAILED', 'Failed to get shopping list items');
      }

      return (data || []).map(fromSupabaseRow);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_ALL_FAILED',
        `Failed to get all shopping list items: ${error}`,
        error
      );
    }
  }

  async getShoppingItemsWithRecipe(): Promise<ShoppingListItemWithRecipe[]> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('shopping_list_items')
        .select(`
          *,
          recipes (
            title,
            image_uri
          )
        `)
        .eq('user_id', userId)
        .order('category')
        .order('name');

      if (error) {
        console.error('Shopping list get with recipe error:', error);
        throw new SupabaseError('GET_WITH_RECIPE_FAILED', 'Failed to get shopping items with recipe');
      }

      return (data || []).map((row: any) => ({
        ...fromSupabaseRow(row),
        recipeTitle: row.recipes?.title || null,
        recipeImageUri: row.recipes?.image_uri || null,
      }));
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_WITH_RECIPE_FAILED',
        `Failed to get shopping items with recipe: ${error}`,
        error
      );
    }
  }

  async getShoppingItemsByRecipe(recipeId: string): Promise<ShoppingListItem[]> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .order('category')
        .order('name');

      if (error) {
        console.error('Shopping list get by recipe error:', error);
        throw new SupabaseError('GET_BY_RECIPE_FAILED', 'Failed to get shopping items by recipe');
      }

      return (data || []).map(fromSupabaseRow);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_BY_RECIPE_FAILED',
        `Failed to get shopping items by recipe: ${error}`,
        error
      );
    }
  }

  async isRecipeInShoppingList(recipeId: string): Promise<boolean> {
    try {
      const items = await this.getShoppingItemsByRecipe(recipeId);
      return items.length > 0;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'CHECK_RECIPE_FAILED',
        `Failed to check if recipe is in shopping list: ${error}`,
        error
      );
    }
  }

  async getShoppingItemsByMealPlan(mealPlanId: string): Promise<ShoppingListItem[]> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('user_id', userId)
        .eq('meal_plan_id', mealPlanId)
        .order('category')
        .order('name');

      if (error) {
        console.error('Shopping list get by meal plan error:', error);
        throw new SupabaseError('GET_BY_MEAL_PLAN_FAILED', 'Failed to get shopping items by meal plan');
      }

      return (data || []).map(fromSupabaseRow);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_BY_MEAL_PLAN_FAILED',
        `Failed to get shopping items by meal plan: ${error}`,
        error
      );
    }
  }

  async updateCheckedState(id: string, checked: boolean): Promise<ShoppingListItem> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('shopping_list_items')
        .update({ checked })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Shopping list update checked error:', error);
        throw new SupabaseError('UPDATE_CHECKED_FAILED', 'Failed to update checked state');
      }

      return fromSupabaseRow(data);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'UPDATE_CHECKED_FAILED',
        `Failed to update checked state: ${error}`,
        error
      );
    }
  }

  async updateShoppingItem(input: UpdateShoppingListItemInput): Promise<ShoppingListItem> {
    try {
      const existing = await this.getShoppingListItemById(input.id);
      if (!existing) {
        throw new SupabaseError('NOT_FOUND', `Shopping list item with ID ${input.id} not found`);
      }

      const updated = ShoppingListItemUtils.update(existing, input);

      const errors = ShoppingListItemUtils.validate(updated);
      if (errors.length > 0) {
        throw new SupabaseError(
          'VALIDATION_ERROR',
          `Shopping list item validation failed: ${errors.join(', ')}`
        );
      }

      const userId = await getCurrentUserId();

      const updateData: Record<string, unknown> = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.quantity !== undefined) updateData.quantity = input.quantity;
      if (input.unit !== undefined) updateData.unit = input.unit;
      if (input.checked !== undefined) updateData.checked = input.checked;
      if (input.category !== undefined) updateData.category = input.category;

      if (Object.keys(updateData).length === 0) {
        return existing;
      }

      const { data, error } = await supabase
        .from('shopping_list_items')
        .update(updateData)
        .eq('id', input.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Shopping list update error:', error);
        throw new SupabaseError('UPDATE_FAILED', 'Failed to update shopping list item');
      }

      return fromSupabaseRow(data);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'UPDATE_FAILED',
        `Failed to update shopping list item: ${error}`,
        error
      );
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Shopping list delete error:', error);
        throw new SupabaseError('DELETE_FAILED', 'Failed to delete shopping list item');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'DELETE_FAILED',
        `Failed to delete shopping list item: ${error}`,
        error
      );
    }
  }

  async deleteBySource(source: ShoppingListItemSource): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('user_id', userId)
        .eq('source', source);

      if (error) {
        console.error('Shopping list delete by source error:', error);
        throw new SupabaseError('DELETE_BY_SOURCE_FAILED', 'Failed to delete shopping items by source');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'DELETE_BY_SOURCE_FAILED',
        `Failed to delete shopping items by source: ${error}`,
        error
      );
    }
  }

  async deleteByRecipeId(recipeId: string): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) {
        console.error('Shopping list delete by recipe error:', error);
        throw new SupabaseError('DELETE_BY_RECIPE_FAILED', 'Failed to delete shopping items by recipe');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'DELETE_BY_RECIPE_FAILED',
        `Failed to delete shopping items by recipe: ${error}`,
        error
      );
    }
  }

  async clearAll(): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Shopping list clear all error:', error);
        throw new SupabaseError('CLEAR_ALL_FAILED', 'Failed to clear all shopping list items');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'CLEAR_ALL_FAILED',
        `Failed to clear all shopping list items: ${error}`,
        error
      );
    }
  }

  async deleteAllCheckedItems(): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('user_id', userId)
        .eq('checked', true);

      if (error) {
        console.error('Shopping list delete checked error:', error);
        throw new SupabaseError('DELETE_CHECKED_FAILED', 'Failed to delete checked items');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'DELETE_CHECKED_FAILED',
        `Failed to delete checked items: ${error}`,
        error
      );
    }
  }

  async deleteShoppingItemsByRecipe(recipeId: string): Promise<void> {
    return this.deleteByRecipeId(recipeId);
  }

  async deleteShoppingItemsByMealPlan(mealPlanId: string): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('user_id', userId)
        .eq('meal_plan_id', mealPlanId);

      if (error) {
        console.error('Shopping list delete by meal plan error:', error);
        throw new SupabaseError('DELETE_BY_MEAL_PLAN_FAILED', 'Failed to delete shopping items by meal plan');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'DELETE_BY_MEAL_PLAN_FAILED',
        `Failed to delete shopping items by meal plan: ${error}`,
        error
      );
    }
  }

  async createShoppingItemsBatch(inputs: CreateShoppingListItemInput[]): Promise<ShoppingListItem[]> {
    return this.createBulk(inputs);
  }

  async deleteShoppingItemsBatch(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.deleteItem(id);
    }
  }

  async checkAllItems(): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('shopping_list_items')
        .update({ checked: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Shopping list check all error:', error);
        throw new SupabaseError('CHECK_ALL_FAILED', 'Failed to check all items');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'CHECK_ALL_FAILED',
        `Failed to check all items: ${error}`,
        error
      );
    }
  }

  async uncheckAllItems(): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('shopping_list_items')
        .update({ checked: false })
        .eq('user_id', userId);

      if (error) {
        console.error('Shopping list uncheck all error:', error);
        throw new SupabaseError('UNCHECK_ALL_FAILED', 'Failed to uncheck all items');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'UNCHECK_ALL_FAILED',
        `Failed to uncheck all items: ${error}`,
        error
      );
    }
  }

  async uncheckRecipeItems(): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('shopping_list_items')
        .update({ checked: false })
        .eq('user_id', userId)
        .eq('source', 'recipe');

      if (error) {
        console.error('Shopping list uncheck recipe items error:', error);
        throw new SupabaseError('UNCHECK_RECIPE_ITEMS_FAILED', 'Failed to uncheck recipe items');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'UNCHECK_RECIPE_ITEMS_FAILED',
        `Failed to uncheck recipe items: ${error}`,
        error
      );
    }
  }

  async getShoppingItemCount(options?: {
    checkedOnly?: boolean;
    uncheckedOnly?: boolean;
    source?: ShoppingListItemSource;
  }): Promise<number> {
    try {
      const userId = await getCurrentUserId();

      let query = supabase
        .from('shopping_list_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (options?.checkedOnly) {
        query = query.eq('checked', true);
      }

      if (options?.uncheckedOnly) {
        query = query.eq('checked', false);
      }

      if (options?.source) {
        query = query.eq('source', options.source);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Shopping list count error:', error);
        throw new SupabaseError('COUNT_FAILED', 'Failed to get shopping item count');
      }

      return count || 0;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'COUNT_FAILED',
        `Failed to get shopping item count: ${error}`,
        error
      );
    }
  }

  async executeInTransaction<T>(
    operation: (service: ShoppingListService) => Promise<T>
  ): Promise<T> {
    return await operation(this);
  }

  async createShoppingListItem(input: CreateShoppingListItemInput): Promise<ShoppingListItem> {
    return this.createItem(input);
  }

  async deleteShoppingItem(id: string): Promise<void> {
    return this.deleteItem(id);
  }
}

export const shoppingListService = new ShoppingListService();
