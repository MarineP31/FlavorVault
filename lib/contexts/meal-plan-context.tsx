import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { mealPlanService } from '@/lib/db/services/meal-plan-service';
import { shoppingListService } from '@/lib/db/services/shopping-list-service';
import { useShoppingList } from '@/lib/contexts/shopping-list-context';
import type { MealPlanWithRecipe } from '@/lib/db/schema/meal-plan';

export interface MealPlanContextType {
  queuedRecipes: MealPlanWithRecipe[];
  isLoading: boolean;
  error: string | null;
  removeRecipe: (recipeId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
  notifyRecipeAdded: () => void;
  notifyRecipeRemoved: () => void;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

interface MealPlanProviderProps {
  children: React.ReactNode;
}

export function MealPlanProvider({ children }: MealPlanProviderProps) {
  const [queuedRecipes, setQueuedRecipes] = useState<MealPlanWithRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshList: refreshShoppingList } = useShoppingList();

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

      await refreshShoppingList();
      await fetchQueuedRecipes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove recipe';
      setError(errorMessage);
      await fetchQueuedRecipes();
    }
  }, [fetchQueuedRecipes, refreshShoppingList]);

  const clearAll = useCallback(async () => {
    try {
      const recipeIds = queuedRecipes.map((r) => r.recipeId);
      const mealPlanIds = queuedRecipes.map((r) => r.id);

      setQueuedRecipes([]);

      await mealPlanService.deleteMealPlansBatch(mealPlanIds);

      for (const recipeId of recipeIds) {
        await shoppingListService.deleteByRecipeId(recipeId);
      }

      await refreshShoppingList();
      await fetchQueuedRecipes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear all recipes';
      setError(errorMessage);
      await fetchQueuedRecipes();
    }
  }, [queuedRecipes, fetchQueuedRecipes, refreshShoppingList]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchQueuedRecipes();
  }, [fetchQueuedRecipes]);

  const notifyRecipeAdded = useCallback(() => {
    fetchQueuedRecipes();
  }, [fetchQueuedRecipes]);

  const notifyRecipeRemoved = useCallback(() => {
    fetchQueuedRecipes();
  }, [fetchQueuedRecipes]);

  useEffect(() => {
    fetchQueuedRecipes();
  }, [fetchQueuedRecipes]);

  const contextValue = useMemo(
    (): MealPlanContextType => ({
      queuedRecipes,
      isLoading,
      error,
      removeRecipe,
      clearAll,
      refresh,
      notifyRecipeAdded,
      notifyRecipeRemoved,
    }),
    [
      queuedRecipes,
      isLoading,
      error,
      removeRecipe,
      clearAll,
      refresh,
      notifyRecipeAdded,
      notifyRecipeRemoved,
    ]
  );

  return (
    <MealPlanContext.Provider value={contextValue}>
      {children}
    </MealPlanContext.Provider>
  );
}

export function useMealPlan(): MealPlanContextType {
  const context = useContext(MealPlanContext);

  if (context === undefined) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }

  return context;
}
