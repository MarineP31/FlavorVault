import { useState, useEffect, useCallback } from 'react';
import { shoppingListService } from '@/lib/db/services/shopping-list-service';
import { shoppingListGenerator } from '@/lib/services/shopping-list-generator';
import { recipeService } from '@/lib/db/services/recipe-service';
import { useShoppingList } from '@/lib/contexts/shopping-list-context';
import { useToast } from '@/components/ui/Toast';

interface UseRecipeShoppingListResult {
  isInShoppingList: boolean;
  isLoading: boolean;
  toggleShoppingList: () => Promise<void>;
}

export function useRecipeShoppingList(
  recipeId: string,
  recipeName: string
): UseRecipeShoppingListResult {
  const [isInShoppingList, setIsInShoppingList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshList, flatItems } = useShoppingList();
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
        showToast(`Removed ${recipeName} from shopping list`, 'success');
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
        showToast(`Added ${recipeName} to shopping list`, 'success');
      }

      await refreshList();
    } catch (error) {
      console.error('Error toggling shopping list:', error);
      setIsInShoppingList(wasInList);
      showToast('Failed to update shopping list', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isInShoppingList, recipeId, recipeName, refreshList, showToast]);

  return {
    isInShoppingList,
    isLoading,
    toggleShoppingList,
  };
}
