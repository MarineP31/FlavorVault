import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { shoppingListService } from '@/lib/db/services/shopping-list-service';
import {
  GroupedShoppingListItems,
  ManualItemInput,
  ShoppingListItem,
  CATEGORY_ORDER,
} from '@/lib/db/schema/shopping-list';
import { shoppingListGenerator } from '@/lib/services/shopping-list-generator';
import { Recipe } from '@/lib/db/schema/recipe';
import { recipeService } from '@/lib/db/services/recipe-service';
import { mealPlanService } from '@/lib/db/services/meal-plan-service';

export interface ShoppingListContextType {
  items: GroupedShoppingListItems;
  flatItems: ShoppingListItem[];
  isLoading: boolean;
  isRegenerating: boolean;
  error: string | null;
  hasQueuedRecipes: boolean;
  toggleItemChecked: (id: string) => Promise<void>;
  addManualItem: (item: ManualItemInput) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  regenerateList: () => Promise<void>;
  refreshList: () => Promise<void>;
  clearError: () => void;
  retryLastOperation: () => Promise<void>;
  handleRecipeAddedToQueue: (recipeId: string) => void;
  handleRecipeRemovedFromQueue: (recipeId: string) => void;
  handleRecipeMarkedAsCooked: (recipeId: string) => Promise<void>;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(
  undefined
);

interface ShoppingListProviderProps {
  children: React.ReactNode;
}

const DEBOUNCE_DELAY = 500;
const MAX_RETRY_ATTEMPTS = 3;

type LastOperation =
  | { type: 'toggle'; id: string }
  | { type: 'add'; input: ManualItemInput }
  | { type: 'delete'; id: string }
  | { type: 'regenerate' }
  | null;

export class ShoppingListError extends Error {
  public readonly code: string;
  public readonly originalError?: any;

  constructor(code: string, message: string, originalError?: any) {
    super(message);
    this.name = 'ShoppingListError';
    this.code = code;
    this.originalError = originalError;
  }
}

export function ShoppingListProvider({ children }: ShoppingListProviderProps) {
  const [items, setItems] = useState<GroupedShoppingListItems>({});
  const [flatItems, setFlatItems] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasQueuedRecipes, setHasQueuedRecipes] = useState(false);

  const regenerateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoadRef = useRef(true);
  const lastOperationRef = useRef<LastOperation>(null);
  const retryCountRef = useRef(0);
  const pendingQueueChangesRef = useRef<string[]>([]);

  const initializeEmptyCategories = useCallback((): GroupedShoppingListItems => {
    const empty: GroupedShoppingListItems = {};
    for (const category of CATEGORY_ORDER) {
      empty[category] = [];
    }
    return empty;
  }, []);

  const fetchQueuedRecipes = useCallback(async (): Promise<Recipe[]> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const endDate = futureDate.toISOString().split('T')[0];

      const mealPlans = await mealPlanService.getMealPlansByDateRange(
        today,
        endDate
      );

      const uniqueRecipeIds = [...new Set(mealPlans.map((mp) => mp.recipeId))];
      setHasQueuedRecipes(uniqueRecipeIds.length > 0);

      const recipes: Recipe[] = [];
      for (const recipeId of uniqueRecipeIds) {
        const recipe = await recipeService.getRecipeById(recipeId);
        if (recipe) {
          recipes.push(recipe);
        }
      }

      return recipes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch queued recipes';
      console.error('Error fetching queued recipes:', err);
      throw new ShoppingListError('FETCH_QUEUE_FAILED', errorMessage, err);
    }
  }, []);

  const refreshList = useCallback(async () => {
    try {
      setError(null);
      const groupedItems = await shoppingListService.getAllByCategory();
      const allItems = await shoppingListService.getAll();

      const mergedItems = { ...initializeEmptyCategories() };
      for (const [category, categoryItems] of Object.entries(groupedItems)) {
        if (mergedItems[category]) {
          mergedItems[category] = categoryItems;
        } else {
          mergedItems[category] = categoryItems;
        }
      }

      setItems(mergedItems);
      setFlatItems(allItems);
      retryCountRef.current = 0;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh shopping list';
      setError(errorMessage);
      console.error('Error refreshing shopping list:', err);
      throw new ShoppingListError('REFRESH_FAILED', errorMessage, err);
    }
  }, [initializeEmptyCategories]);

  const regenerateList = useCallback(async () => {
    try {
      setIsRegenerating(true);
      setError(null);
      lastOperationRef.current = { type: 'regenerate' };

      const queuedRecipes = await fetchQueuedRecipes();

      await shoppingListService.deleteBySource('recipe');

      if (queuedRecipes.length > 0) {
        await shoppingListGenerator.generateFromQueue(queuedRecipes);
      }

      await refreshList();
      retryCountRef.current = 0;
      pendingQueueChangesRef.current = [];
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to regenerate shopping list';
      setError(errorMessage);
      console.error('Error regenerating shopping list:', err);
      throw new ShoppingListError('REGENERATION_FAILED', errorMessage, err);
    } finally {
      setIsRegenerating(false);
      setIsLoading(false);
    }
  }, [fetchQueuedRecipes, refreshList]);

  const debouncedRegenerate = useCallback(() => {
    if (regenerateTimeoutRef.current) {
      clearTimeout(regenerateTimeoutRef.current);
    }

    regenerateTimeoutRef.current = setTimeout(() => {
      regenerateList().catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate shopping list';
        setError(errorMessage);
        console.error('Debounced regeneration failed:', err);
      });
    }, DEBOUNCE_DELAY);
  }, [regenerateList]);

  const handleRecipeAddedToQueue = useCallback(
    (recipeId: string) => {
      pendingQueueChangesRef.current.push(`add:${recipeId}`);
      debouncedRegenerate();
    },
    [debouncedRegenerate]
  );

  const handleRecipeRemovedFromQueue = useCallback(
    (recipeId: string) => {
      pendingQueueChangesRef.current.push(`remove:${recipeId}`);
      debouncedRegenerate();
    },
    [debouncedRegenerate]
  );

  const handleRecipeMarkedAsCooked = useCallback(
    async (recipeId: string) => {
      try {
        setError(null);

        setFlatItems((prev) => prev.filter((item) => item.recipeId !== recipeId));
        setItems((prev) => {
          const updated = { ...prev };
          for (const category of Object.keys(updated)) {
            updated[category] = updated[category].filter(
              (item) => item.recipeId !== recipeId
            );
          }
          return updated;
        });

        await shoppingListService.deleteByRecipeId(recipeId);
        await refreshList();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to remove recipe items from shopping list';
        setError(errorMessage);
        console.error('Error handling recipe marked as cooked:', err);
        await refreshList();
      }
    },
    [refreshList]
  );

  const toggleItemChecked = useCallback(
    async (id: string) => {
      const item = flatItems.find((i) => i.id === id);
      if (!item) {
        console.warn(`Item with ID ${id} not found for toggle`);
        return;
      }

      const newCheckedState = !item.checked;
      lastOperationRef.current = { type: 'toggle', id };

      setFlatItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked: newCheckedState } : i))
      );

      setItems((prev) => {
        const updated = { ...prev };
        for (const category of Object.keys(updated)) {
          updated[category] = updated[category].map((i) =>
            i.id === id ? { ...i, checked: newCheckedState } : i
          );
        }
        return updated;
      });

      try {
        await shoppingListService.updateCheckedState(id, newCheckedState);
        retryCountRef.current = 0;
      } catch (err) {
        setFlatItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, checked: item.checked } : i))
        );

        setItems((prev) => {
          const reverted = { ...prev };
          for (const category of Object.keys(reverted)) {
            reverted[category] = reverted[category].map((i) =>
              i.id === id ? { ...i, checked: item.checked } : i
            );
          }
          return reverted;
        });

        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update item checked state';
        setError(errorMessage);
        console.error('Error toggling item checked state:', err);
        throw new ShoppingListError('TOGGLE_FAILED', errorMessage, err);
      }
    },
    [flatItems]
  );

  const addManualItem = useCallback(
    async (input: ManualItemInput) => {
      try {
        setError(null);
        lastOperationRef.current = { type: 'add', input };

        if (!input.name || input.name.trim().length === 0) {
          throw new ShoppingListError('VALIDATION_ERROR', 'Item name is required');
        }

        await shoppingListGenerator.addManualItem(input);
        await refreshList();
        retryCountRef.current = 0;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to add manual item';
        setError(errorMessage);
        console.error('Error adding manual item:', err);
        throw err;
      }
    },
    [refreshList]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      const item = flatItems.find((i) => i.id === id);
      if (!item) {
        console.warn(`Item with ID ${id} not found for deletion`);
        return;
      }

      lastOperationRef.current = { type: 'delete', id };

      const previousFlatItems = [...flatItems];
      const previousItems = { ...items };

      setFlatItems((prev) => prev.filter((i) => i.id !== id));
      setItems((prev) => {
        const updated = { ...prev };
        for (const category of Object.keys(updated)) {
          updated[category] = updated[category].filter((i) => i.id !== id);
        }
        return updated;
      });

      try {
        await shoppingListService.deleteItem(id);
        retryCountRef.current = 0;
      } catch (err) {
        setFlatItems(previousFlatItems);
        setItems(previousItems);

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete item';
        setError(errorMessage);
        console.error('Error deleting item:', err);
        throw new ShoppingListError('DELETE_FAILED', errorMessage, err);
      }
    },
    [flatItems, items]
  );

  const retryLastOperation = useCallback(async () => {
    if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
      setError('Maximum retry attempts reached. Please try again later.');
      return;
    }

    const lastOp = lastOperationRef.current;
    if (!lastOp) {
      await refreshList();
      return;
    }

    retryCountRef.current += 1;
    setError(null);

    try {
      switch (lastOp.type) {
        case 'toggle':
          await toggleItemChecked(lastOp.id);
          break;
        case 'add':
          await addManualItem(lastOp.input);
          break;
        case 'delete':
          await deleteItem(lastOp.id);
          break;
        case 'regenerate':
          await regenerateList();
          break;
      }
    } catch (err) {
      console.error('Error retrying operation:', err);
    }
  }, [toggleItemChecked, addManualItem, deleteItem, regenerateList, refreshList]);

  const clearError = useCallback(() => {
    setError(null);
    retryCountRef.current = 0;
  }, []);

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        await refreshList();
        await fetchQueuedRecipes();
      } catch (err) {
        console.error('Error initializing shopping list:', err);
      } finally {
        setIsLoading(false);
        isInitialLoadRef.current = false;
      }
    }

    initialize();
  }, [refreshList, fetchQueuedRecipes]);

  useEffect(() => {
    return () => {
      if (regenerateTimeoutRef.current) {
        clearTimeout(regenerateTimeoutRef.current);
      }
    };
  }, []);

  const contextValue = useMemo(
    (): ShoppingListContextType => ({
      items,
      flatItems,
      isLoading,
      isRegenerating,
      error,
      hasQueuedRecipes,
      toggleItemChecked,
      addManualItem,
      deleteItem,
      regenerateList,
      refreshList,
      clearError,
      retryLastOperation,
      handleRecipeAddedToQueue,
      handleRecipeRemovedFromQueue,
      handleRecipeMarkedAsCooked,
    }),
    [
      items,
      flatItems,
      isLoading,
      isRegenerating,
      error,
      hasQueuedRecipes,
      toggleItemChecked,
      addManualItem,
      deleteItem,
      regenerateList,
      refreshList,
      clearError,
      retryLastOperation,
      handleRecipeAddedToQueue,
      handleRecipeRemovedFromQueue,
      handleRecipeMarkedAsCooked,
    ]
  );

  return (
    <ShoppingListContext.Provider value={contextValue}>
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList(): ShoppingListContextType {
  const context = useContext(ShoppingListContext);

  if (context === undefined) {
    throw new Error(
      'useShoppingList must be used within a ShoppingListProvider'
    );
  }

  return context;
}
