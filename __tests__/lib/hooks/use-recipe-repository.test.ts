/**
 * Task 1.1: Unit Tests for useRecipeRepository Hook - Tag Filter Enhancements
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useRecipeRepository } from '@/lib/hooks/use-recipe-repository';
import { recipeService } from '@/lib/db/services/recipe-service';
import { Recipe } from '@/lib/db/schema/recipe';
import { DishCategory } from '@/constants/enums';

jest.mock('@/lib/db/services/recipe-service', () => ({
  recipeService: {
    getAllRecipes: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

const createMockRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  id: `recipe-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Recipe',
  servings: 4,
  category: DishCategory.DINNER,
  ingredients: [{ name: 'flour', quantity: 2, unit: null }],
  steps: ['Step 1'],
  imageUri: null,
  prepTime: 10,
  cookTime: 15,
  tags: ['italian', 'easy'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
  ...overrides,
});

const mockRecipes: Recipe[] = [
  createMockRecipe({ id: '1', title: 'Pasta', tags: ['italian', 'easy', 'dinner'], prepTime: 5, cookTime: 10 }),
  createMockRecipe({ id: '2', title: 'Pizza', tags: ['italian', 'dinner'], prepTime: 15, cookTime: 20 }),
  createMockRecipe({ id: '3', title: 'Salad', tags: ['healthy', 'easy', 'lunch'], prepTime: 5, cookTime: 0 }),
  createMockRecipe({ id: '4', title: 'Soup', tags: ['healthy', 'dinner', 'comfort'], prepTime: 10, cookTime: 30 }),
  createMockRecipe({ id: '5', title: 'Stir Fry', tags: ['asian', 'easy', 'dinner'], prepTime: 10, cookTime: 10 }),
];

describe('useRecipeRepository - Tag Filter Enhancements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (recipeService.getAllRecipes as jest.Mock).mockResolvedValue(mockRecipes);
  });

  describe('topTags computed property', () => {
    it('should return max 10 tags sorted by frequency', async () => {
      const { result } = renderHook(() => useRecipeRepository({ enablePersistence: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const topTags = result.current.topTags;

      expect(topTags.length).toBeLessThanOrEqual(10);
      expect(topTags[0]).toBe('dinner');
      expect(topTags[1]).toBe('easy');
      expect(topTags[2]).toBe('italian');
    });

    it('should handle recipes with no tags', async () => {
      (recipeService.getAllRecipes as jest.Mock).mockResolvedValue([
        createMockRecipe({ tags: [] }),
      ]);

      const { result } = renderHook(() => useRecipeRepository({ enablePersistence: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.topTags).toEqual([]);
    });
  });

  describe('allUniqueTags computed property', () => {
    it('should extract all unique tags from recipes alphabetically sorted', async () => {
      const { result } = renderHook(() => useRecipeRepository({ enablePersistence: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const allTags = result.current.allUniqueTags;

      expect(allTags).toContain('italian');
      expect(allTags).toContain('asian');
      expect(allTags).toContain('healthy');
      expect(allTags).toEqual([...allTags].sort());
    });

    it('should normalize tags to lowercase', async () => {
      (recipeService.getAllRecipes as jest.Mock).mockResolvedValue([
        createMockRecipe({ tags: ['Italian', 'EASY'] }),
        createMockRecipe({ tags: ['italian', 'easy'] }),
      ]);

      const { result } = renderHook(() => useRecipeRepository({ enablePersistence: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const allTags = result.current.allUniqueTags;
      expect(allTags).toContain('italian');
      expect(allTags).toContain('easy');
      expect(allTags.filter(t => t === 'italian').length).toBe(1);
    });
  });

  describe('presetFilter and Quick filter', () => {
    it('should filter recipes with total time <= 20 minutes when Quick preset is active', async () => {
      const { result } = renderHook(() => useRecipeRepository({ enablePersistence: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.presetFilter).toBe('all');

      act(() => {
        result.current.setPresetFilter('quick');
      });

      expect(result.current.presetFilter).toBe('quick');

      const quickRecipes = result.current.filteredRecipes;
      quickRecipes.forEach(recipe => {
        const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
        expect(totalTime).toBeLessThanOrEqual(20);
      });
    });

    it('should handle recipes with null prep/cook time in Quick filter', async () => {
      (recipeService.getAllRecipes as jest.Mock).mockResolvedValue([
        createMockRecipe({ prepTime: null, cookTime: null }),
        createMockRecipe({ prepTime: 10, cookTime: null }),
        createMockRecipe({ prepTime: null, cookTime: 15 }),
      ]);

      const { result } = renderHook(() => useRecipeRepository({ enablePersistence: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setPresetFilter('quick');
      });

      expect(result.current.filteredRecipes.length).toBe(3);
    });
  });

  describe('AND logic with multiple selected tags', () => {
    it('should filter recipes that have ALL selected tags', async () => {
      const { result } = renderHook(() => useRecipeRepository({ enablePersistence: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.toggleTag('italian');
      });

      let filtered = result.current.filteredRecipes;
      expect(filtered.every(r => r.tags.map(t => t.toLowerCase()).includes('italian'))).toBe(true);

      act(() => {
        result.current.toggleTag('easy');
      });

      filtered = result.current.filteredRecipes;
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('Pasta');
    });
  });

  describe('combined tag and preset filters', () => {
    it('should apply both tag filter and Quick preset together', async () => {
      const { result } = renderHook(() => useRecipeRepository({ enablePersistence: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.toggleTag('easy');
        result.current.setPresetFilter('quick');
      });

      const filtered = result.current.filteredRecipes;

      filtered.forEach(recipe => {
        expect(recipe.tags.map(t => t.toLowerCase())).toContain('easy');
        expect((recipe.prepTime || 0) + (recipe.cookTime || 0)).toBeLessThanOrEqual(20);
      });
    });
  });
});
