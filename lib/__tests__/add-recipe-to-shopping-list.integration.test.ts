import { MeasurementUnit } from '@/constants/enums';
import type { Recipe } from '@/lib/db/schema/recipe';

const mockDbConnection = {
  executeSelect: jest.fn(),
  executeQuery: jest.fn(),
  executeTransaction: jest.fn((fn) => fn()),
};

jest.mock('@/lib/db/connection', () => ({
  dbConnection: mockDbConnection,
  DatabaseError: class extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
}));

jest.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).substring(7),
}));

import { shoppingListService } from '@/lib/db/services/shopping-list-service';
import { shoppingListGenerator } from '@/lib/services/shopping-list-generator';

describe('Add Recipe to Shopping List - Integration Tests', () => {
  const mockRecipe: Recipe = {
    id: 'recipe-123',
    title: 'Test Recipe',
    servings: 4,
    category: 'dinner' as any,
    ingredients: [
      { name: 'Eggs', quantity: 2, unit: null },
      { name: 'Milk', quantity: 1, unit: MeasurementUnit.CUP },
      { name: 'Salt', quantity: null, unit: null },
    ],
    steps: ['Step 1', 'Step 2'],
    imageUri: null,
    prepTime: 10,
    cookTime: 20,
    tags: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnection.executeSelect.mockResolvedValue([]);
    mockDbConnection.executeQuery.mockResolvedValue({ rowsAffected: 1 });
  });

  describe('End-to-end: Add recipe workflow', () => {
    it('should add all recipe ingredients to shopping list', async () => {
      await shoppingListGenerator.addRecipeToShoppingList(mockRecipe);

      expect(mockDbConnection.executeQuery).toHaveBeenCalled();
      const insertCalls = mockDbConnection.executeQuery.mock.calls.filter(
        (call) => call[0].includes('INSERT')
      );
      expect(insertCalls.length).toBe(3);
    });
  });

  describe('End-to-end: Remove recipe workflow', () => {
    it('should remove all recipe items from shopping list', async () => {
      await shoppingListService.deleteByRecipeId('recipe-123');

      expect(mockDbConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE'),
        ['recipe-123']
      );
    });
  });

  describe('Integration: Multiple recipes aggregation', () => {
    it('should aggregate same ingredients from multiple recipes', async () => {
      const existingItem = {
        id: 'existing-item',
        name: 'eggs',
        quantity: 3,
        unit: null,
        checked: 0,
        recipeId: 'other-recipe',
        mealPlanId: null,
        category: 'Dairy',
        source: 'recipe',
        originalName: 'Eggs',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockDbConnection.executeSelect
        .mockResolvedValueOnce([existingItem])
        .mockResolvedValueOnce([existingItem]);

      await shoppingListGenerator.addRecipeToShoppingList(mockRecipe);

      const updateCalls = mockDbConnection.executeQuery.mock.calls.filter(
        (call) => call[0].includes('UPDATE')
      );
      expect(updateCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge case: Recipe with no ingredients', () => {
    it('should return empty array for recipe with no ingredients', async () => {
      const emptyRecipe: Recipe = {
        ...mockRecipe,
        ingredients: [],
      };

      const result = await shoppingListGenerator.addRecipeToShoppingList(emptyRecipe);

      expect(result).toEqual([]);
      expect(mockDbConnection.executeQuery).not.toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        expect.anything()
      );
    });
  });

  describe('Edge case: isRecipeInShoppingList check', () => {
    it('should return true when items exist for recipe', async () => {
      mockDbConnection.executeSelect.mockResolvedValue([
        { id: 'item-1', recipeId: 'recipe-123' },
      ]);

      const result = await shoppingListService.isRecipeInShoppingList('recipe-123');

      expect(result).toBe(true);
    });

    it('should return false when no items exist for recipe', async () => {
      mockDbConnection.executeSelect.mockResolvedValue([]);

      const result = await shoppingListService.isRecipeInShoppingList('recipe-456');

      expect(result).toBe(false);
    });
  });

  describe('Edge case: Toggle loading state prevents rapid calls', () => {
    it('should handle concurrent add operations gracefully', async () => {
      const addPromise1 = shoppingListGenerator.addRecipeToShoppingList(mockRecipe);
      const addPromise2 = shoppingListGenerator.addRecipeToShoppingList(mockRecipe);

      await Promise.all([addPromise1, addPromise2]);

      expect(mockDbConnection.executeQuery).toHaveBeenCalled();
    });
  });
});
