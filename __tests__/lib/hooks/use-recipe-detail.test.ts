/**
 * Task 14.1: Unit Tests - Recipe Data Fetching Hook
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useRecipeDetail } from '@/lib/hooks/use-recipe-detail';
import { recipeService } from '@/lib/db/services/recipe-service';
import { Recipe } from '@/lib/db/schema/recipe';
import { DishCategory } from '@/constants/enums';

// Mock the recipe service
jest.mock('@/lib/db/services/recipe-service', () => ({
  recipeService: {
    getRecipeById: jest.fn(),
  },
}));

const mockRecipe: Recipe = {
  id: 'test-recipe-id',
  title: 'Test Recipe',
  servings: 4,
  category: DishCategory.MAIN_COURSE,
  ingredients: [
    { name: 'flour', quantity: 2, unit: 'cup' },
    { name: 'eggs', quantity: 3, unit: null },
  ],
  steps: ['Mix ingredients', 'Bake at 350F'],
  imageUri: 'file:///test-image.jpg',
  prepTime: 15,
  cookTime: 30,
  tags: ['easy', 'quick'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
};

describe('useRecipeDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch recipe successfully', async () => {
    (recipeService.getRecipeById as jest.Mock).mockResolvedValue(mockRecipe);

    const { result } = renderHook(() => useRecipeDetail('test-recipe-id'));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.recipe).toBe(null);
    expect(result.current.error).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recipe).toEqual(mockRecipe);
    expect(result.current.error).toBe(null);
    expect(recipeService.getRecipeById).toHaveBeenCalledWith('test-recipe-id');
  });

  it('should handle recipe not found', async () => {
    (recipeService.getRecipeById as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useRecipeDetail('non-existent-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recipe).toBe(null);
    expect(result.current.error).toBe('Recipe not found');
  });

  it('should handle missing recipe ID', async () => {
    const { result } = renderHook(() => useRecipeDetail(undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recipe).toBe(null);
    expect(result.current.error).toBe('Recipe ID is required');
    expect(recipeService.getRecipeById).not.toHaveBeenCalled();
  });

  it('should handle database error', async () => {
    const error = new Error('Database error');
    (recipeService.getRecipeById as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useRecipeDetail('test-recipe-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recipe).toBe(null);
    expect(result.current.error).toBe('Failed to load recipe. Please try again.');
  });

  it('should validate recipe data', async () => {
    const invalidRecipe = {
      ...mockRecipe,
      title: '',
      ingredients: [],
      steps: [],
    };
    (recipeService.getRecipeById as jest.Mock).mockResolvedValue(invalidRecipe);

    const { result } = renderHook(() => useRecipeDetail('test-recipe-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recipe).toBe(null);
    expect(result.current.error).toBe('Invalid recipe data');
  });

  it('should refetch recipe data', async () => {
    (recipeService.getRecipeById as jest.Mock).mockResolvedValue(mockRecipe);

    const { result } = renderHook(() => useRecipeDetail('test-recipe-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mock and change return value
    jest.clearAllMocks();
    const updatedRecipe = { ...mockRecipe, title: 'Updated Recipe' };
    (recipeService.getRecipeById as jest.Mock).mockResolvedValue(updatedRecipe);

    // Trigger refetch
    result.current.refetch();

    await waitFor(() => {
      expect(result.current.recipe?.title).toBe('Updated Recipe');
    });

    expect(recipeService.getRecipeById).toHaveBeenCalledTimes(1);
  });

  it('should update when recipe ID changes', async () => {
    (recipeService.getRecipeById as jest.Mock).mockResolvedValue(mockRecipe);

    const { result, rerender } = renderHook(
      ({ id }) => useRecipeDetail(id),
      { initialProps: { id: 'recipe-1' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(recipeService.getRecipeById).toHaveBeenCalledWith('recipe-1');

    // Change recipe ID
    const newRecipe = { ...mockRecipe, id: 'recipe-2', title: 'New Recipe' };
    (recipeService.getRecipeById as jest.Mock).mockResolvedValue(newRecipe);

    rerender({ id: 'recipe-2' });

    await waitFor(() => {
      expect(result.current.recipe?.id).toBe('recipe-2');
    });

    expect(recipeService.getRecipeById).toHaveBeenCalledWith('recipe-2');
  });
});
