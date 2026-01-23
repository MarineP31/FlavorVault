import { useCallback, useEffect, useState } from 'react';
import { mealPlanService } from '@/lib/db/services/meal-plan-service';
import { shoppingListService } from '@/lib/db/services/shopping-list-service';
import { useShoppingList } from '@/lib/contexts/shopping-list-context';
import type { MealPlanWithRecipe } from '@/lib/db/schema/meal-plan';

interface UseMealPlanQueueReturn {
  queuedRecipes: MealPlanWithRecipe[];
  isLoading: boolean;
  error: string | null;
  removeRecipe: (recipeId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMealPlanQueue(): UseMealPlanQueueReturn {
  const [queuedRecipes, setQueuedRecipes] = useState<MealPlanWithRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { handleRecipeRemovedFromQueue } = useShoppingList();

  const fetchQueuedRecipes = useCallback(async () => {
    try {
      setError(null);
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const endDate = futureDate.toISOString().split('T')[0];

      const mealPlans = await mealPlanService.getMealPlansWithRecipe(today, endDate);

      const seenRecipeIds = new Set<string>();
      const deduplicated: MealPlanWithRecipe[] = [];

      for (const mealPlan of mealPlans) {
        if (!seenRecipeIds.has(mealPlan.recipeId)) {
          seenRecipeIds.add(mealPlan.recipeId);
          deduplicated.push(mealPlan);
        }
      }

      setQueuedRecipes(deduplicated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch queued recipes';
      setError(errorMessage);
      setQueuedRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeRecipe = useCallback(async (recipeId: string) => {
    try {
      setQueuedRecipes((prev) => prev.filter((r) => r.recipeId !== recipeId));

      await mealPlanService.deleteMealPlansByRecipe(recipeId);
      await shoppingListService.deleteByRecipeId(recipeId);
      handleRecipeRemovedFromQueue(recipeId);

      await fetchQueuedRecipes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove recipe';
      setError(errorMessage);
      await fetchQueuedRecipes();
    }
  }, [fetchQueuedRecipes, handleRecipeRemovedFromQueue]);

  const clearAll = useCallback(async () => {
    try {
      const recipeIds = queuedRecipes.map((r) => r.recipeId);
      const mealPlanIds = queuedRecipes.map((r) => r.id);

      setQueuedRecipes([]);

      await mealPlanService.deleteMealPlansBatch(mealPlanIds);

      for (const recipeId of recipeIds) {
        await shoppingListService.deleteByRecipeId(recipeId);
        handleRecipeRemovedFromQueue(recipeId);
      }

      await fetchQueuedRecipes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear all recipes';
      setError(errorMessage);
      await fetchQueuedRecipes();
    }
  }, [queuedRecipes, fetchQueuedRecipes, handleRecipeRemovedFromQueue]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchQueuedRecipes();
  }, [fetchQueuedRecipes]);

  useEffect(() => {
    fetchQueuedRecipes();
  }, [fetchQueuedRecipes]);

  return {
    queuedRecipes,
    isLoading,
    error,
    removeRecipe,
    clearAll,
    refresh,
  };
}
