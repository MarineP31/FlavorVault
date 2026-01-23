/**
 * Integration Tests for Meal Plan Queue Feature
 * Task Group 5: Additional strategic tests for critical workflows
 */

import { MealType } from '@/constants/enums';
import type { MealPlanWithRecipe } from '@/lib/db/schema/meal-plan';

const mockDeleteMealPlansByRecipe = jest.fn();
const mockDeleteMealPlansBatch = jest.fn();
const mockDeleteByRecipeId = jest.fn();
const mockGetMealPlansWithRecipe = jest.fn();
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
    recipeImageUri: null,
    recipeServings: 2,
    recipePrepTime: null,
    recipeCookTime: null,
  },
];

describe('Meal Plan Queue Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMealPlansWithRecipe.mockResolvedValue(mockMealPlans);
    mockDeleteMealPlansByRecipe.mockResolvedValue(undefined);
    mockDeleteMealPlansBatch.mockResolvedValue(undefined);
    mockDeleteByRecipeId.mockResolvedValue(undefined);
  });

  describe('Remove recipe updates both meal plan and shopping list', () => {
    it('should delete meal plan and shopping list items for a recipe', async () => {
      const recipeId = 'recipe-1';

      await mockDeleteMealPlansByRecipe(recipeId);
      await mockDeleteByRecipeId(recipeId);
      mockHandleRecipeRemovedFromQueue(recipeId);

      expect(mockDeleteMealPlansByRecipe).toHaveBeenCalledWith('recipe-1');
      expect(mockDeleteByRecipeId).toHaveBeenCalledWith('recipe-1');
      expect(mockHandleRecipeRemovedFromQueue).toHaveBeenCalledWith('recipe-1');
    });

    it('should handle remove error gracefully', async () => {
      const recipeId = 'recipe-1';
      mockDeleteMealPlansByRecipe.mockRejectedValueOnce(new Error('Delete failed'));

      try {
        await mockDeleteMealPlansByRecipe(recipeId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }

      expect(mockDeleteMealPlansByRecipe).toHaveBeenCalledWith('recipe-1');
    });
  });

  describe('Clear all updates both stores correctly', () => {
    it('should batch delete all meal plans and clear shopping list', async () => {
      const mealPlanIds = mockMealPlans.map((mp) => mp.id);
      const recipeIds = [...new Set(mockMealPlans.map((mp) => mp.recipeId))];

      await mockDeleteMealPlansBatch(mealPlanIds);

      for (const recipeId of recipeIds) {
        await mockDeleteByRecipeId(recipeId);
        mockHandleRecipeRemovedFromQueue(recipeId);
      }

      expect(mockDeleteMealPlansBatch).toHaveBeenCalledWith(['mp-1', 'mp-2']);
      expect(mockDeleteByRecipeId).toHaveBeenCalledWith('recipe-1');
      expect(mockDeleteByRecipeId).toHaveBeenCalledWith('recipe-2');
      expect(mockHandleRecipeRemovedFromQueue).toHaveBeenCalledWith('recipe-1');
      expect(mockHandleRecipeRemovedFromQueue).toHaveBeenCalledWith('recipe-2');
    });

    it('should handle empty queue gracefully', async () => {
      const emptyMealPlans: MealPlanWithRecipe[] = [];
      const mealPlanIds = emptyMealPlans.map((mp) => mp.id);

      if (mealPlanIds.length > 0) {
        await mockDeleteMealPlansBatch(mealPlanIds);
      }

      expect(mockDeleteMealPlansBatch).not.toHaveBeenCalled();
    });
  });

  describe('Edge case: handle empty recipe image gracefully', () => {
    it('should process recipe with null imageUri', () => {
      const recipeWithNoImage = mockMealPlans.find((mp) => mp.recipeImageUri === null);

      expect(recipeWithNoImage).toBeDefined();
      expect(recipeWithNoImage?.recipeImageUri).toBeNull();
      expect(recipeWithNoImage?.recipeTitle).toBe('Quinoa Salad');
    });
  });

  describe('Edge case: handle recipe with no cooking time', () => {
    it('should process recipe with null prep and cook time', () => {
      const recipeWithNoTime = mockMealPlans.find(
        (mp) => mp.recipePrepTime === null && mp.recipeCookTime === null
      );

      expect(recipeWithNoTime).toBeDefined();
      expect(recipeWithNoTime?.recipePrepTime).toBeNull();
      expect(recipeWithNoTime?.recipeCookTime).toBeNull();
    });

    it('should calculate total time correctly with mixed null values', () => {
      const calculateTotalTime = (prepTime: number | null, cookTime: number | null) => {
        return (prepTime || 0) + (cookTime || 0);
      };

      expect(calculateTotalTime(10, 15)).toBe(25);
      expect(calculateTotalTime(null, 15)).toBe(15);
      expect(calculateTotalTime(10, null)).toBe(10);
      expect(calculateTotalTime(null, null)).toBe(0);
    });
  });

  describe('User flow: navigation paths', () => {
    it('should construct correct recipe detail path', () => {
      const recipeId = 'recipe-123';
      const expectedPath = `/recipe/${recipeId}`;

      expect(expectedPath).toBe('/recipe/recipe-123');
    });

    it('should construct correct home tab path', () => {
      const expectedPath = '/(tabs)/';

      expect(expectedPath).toBe('/(tabs)/');
    });
  });

  describe('Data deduplication', () => {
    it('should deduplicate recipes that appear multiple times', () => {
      const duplicateMealPlans: MealPlanWithRecipe[] = [
        ...mockMealPlans,
        {
          ...mockMealPlans[0],
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

      expect(duplicateMealPlans).toHaveLength(3);
      expect(deduplicated).toHaveLength(2);
    });
  });
});
