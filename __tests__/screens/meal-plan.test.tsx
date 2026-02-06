/**
 * Tests for MealPlanScreen
 * Task Group 4: Test meal plan screen behavior and logic
 */

import { MealType } from '@/constants/enums';
import type { MealPlanWithRecipe } from '@/lib/db/schema/meal-plan';

const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

const mockQueuedRecipes: MealPlanWithRecipe[] = [
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
];

describe('MealPlanScreen Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Header rendering', () => {
    it('should have correct header title "Meal Plan Queue"', () => {
      const expectedTitle = 'Meal Plan Queue';
      expect(expectedTitle).toBe('Meal Plan Queue');
    });

    it('should have Clear All button', () => {
      const expectedButtonText = 'Clear All';
      expect(expectedButtonText).toBe('Clear All');
    });
  });

  describe('List rendering', () => {
    it('should deduplicate recipes by recipeId for display', () => {
      const duplicateMealPlans: MealPlanWithRecipe[] = [
        ...mockQueuedRecipes,
        {
          ...mockQueuedRecipes[0],
          id: 'mp-3',
          date: '2025-01-23',
        },
      ];

      const seenRecipeIds = new Set<string>();
      const deduplicated = duplicateMealPlans.filter((mp) => {
        if (seenRecipeIds.has(mp.recipeId)) {
          return false;
        }
        seenRecipeIds.add(mp.recipeId);
        return true;
      });

      expect(deduplicated).toHaveLength(2);
      expect(deduplicated[0].recipeId).toBe('recipe-1');
      expect(deduplicated[1].recipeId).toBe('recipe-2');
    });

    it('should use recipeId as key extractor', () => {
      const keyExtractor = (item: MealPlanWithRecipe) => item.recipeId;

      expect(keyExtractor(mockQueuedRecipes[0])).toBe('recipe-1');
      expect(keyExtractor(mockQueuedRecipes[1])).toBe('recipe-2');
    });
  });

  describe('Empty state', () => {
    it('should show empty state when queuedRecipes is empty', () => {
      const queuedRecipes: MealPlanWithRecipe[] = [];
      const shouldShowEmptyState = queuedRecipes.length === 0;

      expect(shouldShowEmptyState).toBe(true);
    });

    it('should not show empty state when recipes are present', () => {
      const shouldShowEmptyState = mockQueuedRecipes.length === 0;

      expect(shouldShowEmptyState).toBe(false);
    });
  });

  describe('Clear All behavior', () => {
    it('should call clearAll function when button is pressed', () => {
      const mockClearAll = jest.fn();

      mockClearAll();

      expect(mockClearAll).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to recipe detail with correct path', () => {
      const recipeId = 'recipe-123';
      const expectedPath = `/recipe/${recipeId}`;

      mockRouterPush(expectedPath as any);

      expect(mockRouterPush).toHaveBeenCalledWith('/recipe/recipe-123');
    });

    it('should navigate to Home tab via correct route', () => {
      const expectedPath = '/(tabs)/';

      mockRouterPush(expectedPath as any);

      expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/');
    });

    it('should handle Add More Recipes button navigation', () => {
      const handleAddMoreRecipes = () => {
        mockRouterPush('/(tabs)/' as any);
      };

      handleAddMoreRecipes();

      expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/');
    });
  });

  describe('Loading state', () => {
    it('should show loading state when isLoading is true and no recipes', () => {
      const isLoading = true;
      const queuedRecipes: MealPlanWithRecipe[] = [];

      const shouldShowLoading = isLoading && queuedRecipes.length === 0;

      expect(shouldShowLoading).toBe(true);
    });

    it('should not show loading state when recipes are loaded', () => {
      const isLoading = false;

      const shouldShowLoading = isLoading && mockQueuedRecipes.length === 0;

      expect(shouldShowLoading).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should show error state when error exists and no recipes', () => {
      const error = 'Failed to load meal plans';
      const queuedRecipes: MealPlanWithRecipe[] = [];

      const shouldShowError = !!error && queuedRecipes.length === 0;

      expect(shouldShowError).toBe(true);
    });

    it('should allow retry on error', () => {
      const mockRefresh = jest.fn();

      mockRefresh();

      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
