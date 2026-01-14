import { shoppingListService } from '@/lib/db/services/shopping-list-service';
import { shoppingListGenerator } from '@/lib/services/shopping-list-generator';
import { MeasurementUnit } from '@/constants/enums';
import type { Recipe } from '@/lib/db/schema/recipe';
import type { ShoppingListItem } from '@/lib/db/schema/shopping-list';

jest.mock('@/lib/db/connection', () => ({
  dbConnection: {
    executeSelect: jest.fn(),
    executeQuery: jest.fn(),
    executeTransaction: jest.fn((fn) => fn()),
  },
  DatabaseError: class extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
}));

const { dbConnection } = require('@/lib/db/connection');

describe('ShoppingListService - Recipe Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isRecipeInShoppingList', () => {
    it('should return true when recipe items exist', async () => {
      (dbConnection.executeSelect as jest.Mock).mockResolvedValue([
        { id: 'item-1', name: 'Eggs', recipeId: 'recipe-123' },
      ]);

      const result = await shoppingListService.isRecipeInShoppingList('recipe-123');

      expect(result).toBe(true);
      expect(dbConnection.executeSelect).toHaveBeenCalled();
    });

    it('should return false when no recipe items exist', async () => {
      (dbConnection.executeSelect as jest.Mock).mockResolvedValue([]);

      const result = await shoppingListService.isRecipeInShoppingList('recipe-456');

      expect(result).toBe(false);
    });
  });
});

describe('ShoppingListGenerator - addRecipeToShoppingList', () => {
  const mockRecipe: Recipe = {
    id: 'recipe-123',
    title: 'Test Recipe',
    servings: 4,
    category: 'dinner' as any,
    ingredients: [
      { name: 'Eggs', quantity: 2, unit: null },
      { name: 'Milk', quantity: 1, unit: MeasurementUnit.CUP },
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
    (dbConnection.executeSelect as jest.Mock).mockResolvedValue([]);
    (dbConnection.executeQuery as jest.Mock).mockResolvedValue({ rowsAffected: 1 });
  });

  it('should create shopping list items from recipe ingredients', async () => {
    await shoppingListGenerator.addRecipeToShoppingList(mockRecipe);

    expect(dbConnection.executeQuery).toHaveBeenCalled();
  });

  it('should aggregate with existing items when same ingredient exists', async () => {
    (dbConnection.executeSelect as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
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
        },
      ]);

    await shoppingListGenerator.addRecipeToShoppingList(mockRecipe);

    expect(dbConnection.executeQuery).toHaveBeenCalled();
  });
});
