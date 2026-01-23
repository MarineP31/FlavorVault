import { useState, useEffect, useCallback } from 'react';
import { shoppingListService } from '@/lib/db/services/shopping-list-service';
import { shoppingListGenerator } from '@/lib/services/shopping-list-generator';
import { recipeService } from '@/lib/db/services/recipe-service';
import { mealPlanService } from '@/lib/db/services/meal-plan-service';
import { useShoppingList } from '@/lib/contexts/shopping-list-context';
import { useMealPlan } from '@/lib/contexts/meal-plan-context';
import { useToast } from '@/components/ui/Toast';
import { MealType, DishCategory } from '@/constants/enums';

interface UseRecipeShoppingListResult {
  isInShoppingList: boolean;
  isLoading: boolean;
  toggleShoppingList: () => Promise<void>;
}

function categoryToMealType(category: DishCategory): MealType {
  switch (category) {
    case DishCategory.BREAKFAST:
      return MealType.BREAKFAST;
    case DishCategory.LUNCH:
      return MealType.LUNCH;
    case DishCategory.DINNER:
      return MealType.DINNER;
    case DishCategory.SNACK:
    case DishCategory.DESSERT:
    case DishCategory.APPETIZER:
    case DishCategory.BEVERAGE:
      return MealType.SNACK;
    default:
      return MealType.DINNER;
  }
}

export function useRecipeShoppingList(
  recipeId: string,
  recipeName: string
): UseRecipeShoppingListResult {
  const [isInShoppingList, setIsInShoppingList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshList, flatItems } = useShoppingList();
  const { notifyRecipeAdded, notifyRecipeRemoved } = useMealPlan();
  const { showToast } = useToast();

  const checkRecipeInList = useCallback(async () => {
    try {
      const inList = await shoppingListService.isRecipeInShoppingList(recipeId);
      setIsInShoppingList(inList);
    } catch (error) {
      console.error('Error checking recipe in shopping list:', error);
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    checkRecipeInList();
  }, [checkRecipeInList]);

  useEffect(() => {
    const hasRecipeItems = flatItems.some((item) => item.recipeId === recipeId);
    setIsInShoppingList(hasRecipeItems);
  }, [flatItems, recipeId]);

  const toggleShoppingList = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    const wasInList = isInShoppingList;
    setIsInShoppingList(!wasInList);

    try {
      if (wasInList) {
        await shoppingListService.deleteByRecipeId(recipeId);
        await mealPlanService.deleteMealPlansByRecipe(recipeId);
        notifyRecipeRemoved();
        showToast(`Removed ${recipeName} from meal plan`, 'success');
      } else {
        const recipe = await recipeService.getRecipeById(recipeId);
        if (!recipe) {
          throw new Error('Recipe not found');
        }

        if (recipe.ingredients.length === 0) {
          showToast(`${recipeName} has no ingredients to add`, 'info');
          setIsInShoppingList(wasInList);
          setIsLoading(false);
          return;
        }

        await shoppingListGenerator.addRecipeToShoppingList(recipe);

        const today = new Date().toISOString().split('T')[0];
        const mealType = categoryToMealType(recipe.category);
        await mealPlanService.createMealPlan({
          recipeId: recipe.id,
          date: today,
          mealType,
        });

        notifyRecipeAdded();
        showToast(`Added ${recipeName} to meal plan`, 'success');
      }

      await refreshList();
    } catch (error) {
      console.error('Error toggling shopping list:', error);
      setIsInShoppingList(wasInList);
      showToast('Failed to update meal plan', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isInShoppingList, recipeId, recipeName, refreshList, showToast, notifyRecipeAdded, notifyRecipeRemoved]);

  return {
    isInShoppingList,
    isLoading,
    toggleShoppingList,
  };
}
