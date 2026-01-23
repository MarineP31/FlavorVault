/**
 * Tests for useMealPlanQueue Hook
 * Task Group 1: Test meal plan queue data fetching and operations
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockGetMealPlansWithRecipe = jest.fn();
const mockDeleteMealPlansByRecipe = jest.fn();
const mockDeleteMealPlansBatch = jest.fn();
const mockDeleteByRecipeId = jest.fn();
const mockHandleRecipeRemovedFromQueue = jest.fn();

jest.mock('@/lib/db/services/meal-plan-service', () => ({
  mealPlanService: {
    getMealPlansWithRecipe: mockGetMealPlansWithRecipe,
    deleteMealPlansByRecipe: mockDeleteMealPlansByRecipe,
    deleteMealPlansBatch: mockDeleteMealPlansBatch,
  },
}));

jest.mock('@/lib/db/services/shopping-list-service', () => ({
  shoppingListService: {
    deleteByRecipeId: mockDeleteByRecipeId,
  },
}));

jest.mock('@/lib/contexts/shopping-list-context', () => ({
  useShoppingList: () => ({
    handleRecipeRemovedFromQueue: mockHandleRecipeRemovedFromQueue,
  }),
}));

import { useMealPlanQueue } from '@/lib/hooks/use-meal-plan-queue';
import { MealType } from '@/constants/enums';
import type { MealPlanWithRecipe } from '@/lib/db/schema/meal-plan';

const mockMealPlans: MealPlanWithRecipe[] = [
  {
    id: 'mp-1',
    recipeId: 'recipe-1',
    date: '2025-01-22',
    mealType: MealType.DINNER,
    createdAt: '2025-01-01T00:00:00.000Z',
    recipeTitle: 'Honey Garlic Chicken',
    recipeImageUri: 'https://example.com/chicken.jpg',
    recipeServings: 4,
    recipePrepTime: 10,
    recipeCookTime: 15,
  },
  {
    id: 'mp-2',
    recipeId: 'recipe-2',
    date: '2025-01-22',
    mealType: MealType.LUNCH,
    createdAt: '2025-01-01T00:00:00.000Z',
    recipeTitle: 'Quinoa Salad',
    recipeImageUri: 'https://example.com/salad.jpg',
    recipeServings: 2,
    recipePrepTime: 15,
    recipeCookTime: null,
  },
  {
    id: 'mp-3',
    recipeId: 'recipe-1',
    date: '2025-01-23',
    mealType: MealType.DINNER,
    createdAt: '2025-01-01T00:00:00.000Z',
    recipeTitle: 'Honey Garlic Chicken',
    recipeImageUri: 'https://example.com/chicken.jpg',
    recipeServings: 4,
    recipePrepTime: 10,
    recipeCookTime: 15,
  },
];

describe('useMealPlanQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMealPlansWithRecipe.mockResolvedValue(mockMealPlans);
    mockDeleteMealPlansByRecipe.mockResolvedValue(undefined);
    mockDeleteMealPlansBatch.mockResolvedValue(undefined);
    mockDeleteByRecipeId.mockResolvedValue(undefined);
  });

  it('should fetch queued recipes and return deduplicated data structure', async () => {
    const { result } = renderHook(() => useMealPlanQueue());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetMealPlansWithRecipe).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );

    expect(result.current.queuedRecipes).toHaveLength(2);
    expect(result.current.queuedRecipes[0].recipeId).toBe('recipe-1');
    expect(result.current.queuedRecipes[1].recipeId).toBe('recipe-2');
    expect(result.current.error).toBeNull();
  });

  it('should call correct services when removeRecipe is called', async () => {
    const { result } = renderHook(() => useMealPlanQueue());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.removeRecipe('recipe-1');
    });

    expect(mockDeleteMealPlansByRecipe).toHaveBeenCalledWith('recipe-1');
    expect(mockDeleteByRecipeId).toHaveBeenCalledWith('recipe-1');
    expect(mockHandleRecipeRemovedFromQueue).toHaveBeenCalledWith('recipe-1');
  });

  it('should clear all recipes and sync shopping list when clearAll is called', async () => {
    const { result } = renderHook(() => useMealPlanQueue());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const recipeIds = result.current.queuedRecipes.map((r) => r.recipeId);

    await act(async () => {
      await result.current.clearAll();
    });

    expect(mockDeleteMealPlansBatch).toHaveBeenCalled();
    for (const recipeId of recipeIds) {
      expect(mockDeleteByRecipeId).toHaveBeenCalledWith(recipeId);
      expect(mockHandleRecipeRemovedFromQueue).toHaveBeenCalledWith(recipeId);
    }
  });

  it('should handle loading and error states correctly', async () => {
    const errorMessage = 'Failed to fetch meal plans';
    mockGetMealPlansWithRecipe.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useMealPlanQueue());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.queuedRecipes).toHaveLength(0);
  });

  it('should refresh data when refresh is called', async () => {
    const { result } = renderHook(() => useMealPlanQueue());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockGetMealPlansWithRecipe.mockClear();

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockGetMealPlansWithRecipe).toHaveBeenCalled();
  });
});
