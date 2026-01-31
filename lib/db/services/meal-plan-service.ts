import { v4 as uuidv4 } from 'uuid';
import { supabase, getCurrentUserId, SupabaseError } from '@/lib/supabase/client';
import {
  MealPlan,
  MealPlanUtils,
  CreateMealPlanInput,
  UpdateMealPlanInput,
  MealPlanWithRecipe,
} from '../schema/meal-plan';
import { MealType } from '@/constants/enums';

interface SupabaseMealPlanRow {
  id: string;
  user_id: string;
  recipe_id: string;
  date: string;
  meal_type: string;
  created_at: string;
}

function fromSupabaseRow(row: SupabaseMealPlanRow): MealPlan {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    date: row.date,
    mealType: row.meal_type as MealType,
    createdAt: row.created_at,
  };
}

export class MealPlanService {
  async createMealPlan(input: CreateMealPlanInput): Promise<MealPlan> {
    const mealPlan = MealPlanUtils.create(input);
    mealPlan.id = uuidv4();

    const errors = MealPlanUtils.validate(mealPlan);
    if (errors.length > 0) {
      throw new SupabaseError(
        'VALIDATION_ERROR',
        `Meal plan validation failed: ${errors.join(', ')}`
      );
    }

    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          id: mealPlan.id,
          user_id: userId,
          recipe_id: mealPlan.recipeId,
          date: mealPlan.date,
          meal_type: mealPlan.mealType,
          created_at: mealPlan.createdAt,
        })
        .select()
        .single();

      if (error) {
        console.error('Meal plan create error:', error);
        throw new SupabaseError('CREATE_FAILED', 'Failed to create meal plan');
      }

      return fromSupabaseRow(data);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'CREATE_FAILED',
        `Failed to create meal plan: ${error}`,
        error
      );
    }
  }

  async getMealPlanById(id: string): Promise<MealPlan | null> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Meal plan get error:', error);
        throw new SupabaseError('GET_FAILED', 'Failed to get meal plan');
      }

      return data ? fromSupabaseRow(data) : null;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_FAILED',
        `Failed to get meal plan by ID: ${error}`,
        error
      );
    }
  }

  async getMealPlansByDate(date: string): Promise<MealPlan[]> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('meal_type');

      if (error) {
        console.error('Meal plan get by date error:', error);
        throw new SupabaseError('GET_BY_DATE_FAILED', 'Failed to get meal plans by date');
      }

      return (data || []).map(fromSupabaseRow);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_BY_DATE_FAILED',
        `Failed to get meal plans by date: ${error}`,
        error
      );
    }
  }

  async getMealPlansByDateRange(startDate: string, endDate: string): Promise<MealPlan[]> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date')
        .order('meal_type');

      if (error) {
        console.error('Meal plan get by date range error:', error);
        throw new SupabaseError('GET_BY_DATE_RANGE_FAILED', 'Failed to get meal plans by date range');
      }

      return (data || []).map(fromSupabaseRow);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_BY_DATE_RANGE_FAILED',
        `Failed to get meal plans by date range: ${error}`,
        error
      );
    }
  }

  async getMealPlansByRecipe(recipeId: string): Promise<MealPlan[]> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Meal plan get by recipe error:', error);
        throw new SupabaseError('GET_BY_RECIPE_FAILED', 'Failed to get meal plans by recipe');
      }

      return (data || []).map(fromSupabaseRow);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_BY_RECIPE_FAILED',
        `Failed to get meal plans by recipe: ${error}`,
        error
      );
    }
  }

  async getMealPlansWithRecipe(
    startDate?: string,
    endDate?: string
  ): Promise<MealPlanWithRecipe[]> {
    try {
      const userId = await getCurrentUserId();

      let query = supabase
        .from('meal_plans')
        .select(`
          *,
          recipes (
            title,
            image_uri,
            servings,
            prep_time,
            cook_time
          )
        `)
        .eq('user_id', userId);

      if (startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate);
      }

      query = query.order('date').order('meal_type');

      const { data, error } = await query;

      if (error) {
        console.error('Meal plan get with recipe error:', error);
        throw new SupabaseError('GET_WITH_RECIPE_FAILED', 'Failed to get meal plans with recipe');
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        recipeId: row.recipe_id,
        date: row.date,
        mealType: row.meal_type as MealType,
        createdAt: row.created_at,
        recipeTitle: row.recipes?.title || '',
        recipeImageUri: row.recipes?.image_uri || null,
        recipeServings: row.recipes?.servings || 0,
        recipePrepTime: row.recipes?.prep_time || null,
        recipeCookTime: row.recipes?.cook_time || null,
      }));
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'GET_WITH_RECIPE_FAILED',
        `Failed to get meal plans with recipe: ${error}`,
        error
      );
    }
  }

  async updateMealPlan(input: UpdateMealPlanInput): Promise<MealPlan> {
    try {
      const existing = await this.getMealPlanById(input.id);
      if (!existing) {
        throw new SupabaseError('NOT_FOUND', `Meal plan with ID ${input.id} not found`);
      }

      const updated = MealPlanUtils.update(existing, input);

      const errors = MealPlanUtils.validate(updated);
      if (errors.length > 0) {
        throw new SupabaseError(
          'VALIDATION_ERROR',
          `Meal plan validation failed: ${errors.join(', ')}`
        );
      }

      const userId = await getCurrentUserId();

      const updateData: Record<string, unknown> = {};

      if (input.recipeId !== undefined) updateData.recipe_id = input.recipeId;
      if (input.date !== undefined) updateData.date = input.date;
      if (input.mealType !== undefined) updateData.meal_type = input.mealType;

      if (Object.keys(updateData).length === 0) {
        return existing;
      }

      const { data, error } = await supabase
        .from('meal_plans')
        .update(updateData)
        .eq('id', input.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Meal plan update error:', error);
        throw new SupabaseError('UPDATE_FAILED', 'Failed to update meal plan');
      }

      return fromSupabaseRow(data);
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'UPDATE_FAILED',
        `Failed to update meal plan: ${error}`,
        error
      );
    }
  }

  async deleteMealPlan(id: string): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Meal plan delete error:', error);
        throw new SupabaseError('DELETE_FAILED', 'Failed to delete meal plan');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'DELETE_FAILED',
        `Failed to delete meal plan: ${error}`,
        error
      );
    }
  }

  async deleteMealPlansByDate(date: string): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);

      if (error) {
        console.error('Meal plan delete by date error:', error);
        throw new SupabaseError('DELETE_BY_DATE_FAILED', 'Failed to delete meal plans by date');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'DELETE_BY_DATE_FAILED',
        `Failed to delete meal plans by date: ${error}`,
        error
      );
    }
  }

  async deleteMealPlansByRecipe(recipeId: string): Promise<void> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) {
        console.error('Meal plan delete by recipe error:', error);
        throw new SupabaseError('DELETE_BY_RECIPE_FAILED', 'Failed to delete meal plans by recipe');
      }
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'DELETE_BY_RECIPE_FAILED',
        `Failed to delete meal plans by recipe: ${error}`,
        error
      );
    }
  }

  async createMealPlansBatch(inputs: CreateMealPlanInput[]): Promise<MealPlan[]> {
    const mealPlans: MealPlan[] = [];

    for (const input of inputs) {
      const mealPlan = await this.createMealPlan(input);
      mealPlans.push(mealPlan);
    }

    return mealPlans;
  }

  async deleteMealPlansBatch(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.deleteMealPlan(id);
    }
  }

  async getMealPlanCount(): Promise<number> {
    try {
      const userId = await getCurrentUserId();

      const { count, error } = await supabase
        .from('meal_plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Meal plan count error:', error);
        throw new SupabaseError('COUNT_FAILED', 'Failed to get meal plan count');
      }

      return count || 0;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'COUNT_FAILED',
        `Failed to get meal plan count: ${error}`,
        error
      );
    }
  }

  async isMealSlotAvailable(date: string, mealType: MealType): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();

      const { count, error } = await supabase
        .from('meal_plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date', date)
        .eq('meal_type', mealType);

      if (error) {
        console.error('Meal slot check error:', error);
        throw new SupabaseError('SLOT_CHECK_FAILED', 'Failed to check meal slot availability');
      }

      return (count || 0) === 0;
    } catch (error) {
      if (error instanceof SupabaseError) throw error;
      throw new SupabaseError(
        'SLOT_CHECK_FAILED',
        `Failed to check meal slot availability: ${error}`,
        error
      );
    }
  }

  async executeInTransaction<T>(
    operation: (service: MealPlanService) => Promise<T>
  ): Promise<T> {
    return await operation(this);
  }
}

export const mealPlanService = new MealPlanService();
