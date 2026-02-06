import { MeasurementUnit, DishCategory } from '@/constants/enums';
import type { Recipe } from '@/lib/db/schema/recipe';
import type { ShoppingListItem } from '@/lib/db/schema/shopping-list';

const mockCreateBulk = jest.fn();
const mockDeleteBySource = jest.fn();
const mockGetAll = jest.fn();
const mockCreateItem = jest.fn();
const mockDeleteByRecipeId = jest.fn();

jest.mock('@/lib/db/services/shopping-list-service', () => ({
  shoppingListService: {
    createBulk: (...args: any[]) => mockCreateBulk(...args),
    deleteBySource: (...args: any[]) => mockDeleteBySource(...args),
    getAll: (...args: any[]) => mockGetAll(...args),
    createItem: (...args: any[]) => mockCreateItem(...args),
    deleteByRecipeId: (...args: any[]) => mockDeleteByRecipeId(...args),
    clearAll: jest.fn(),
  },
}));

jest.mock('@/lib/services/ingredient-aggregator', () => ({
  createShoppingListInputsFromRecipes: jest.fn(() => []),
}));

const createMockRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  id: 'recipe-1',
  title: 'Test Recipe',
  servings: 4,
  category: DishCategory.DINNER,
  ingredients: [
    { name: 'milk', quantity: 1, unit: MeasurementUnit.CUP },
  ],
  steps: ['Step 1'],
  imageUri: null,
  prepTime: 10,
  cookTime: 20,
  tags: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  deletedAt: null,
  ...overrides,
});

describe('ShoppingListGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateFromQueue', () => {
    it('should generate shopping list from queued recipes', async () => {
      const mockRecipes: Recipe[] = [
        createMockRecipe({
          ingredients: [
            { name: 'milk', quantity: 1, unit: MeasurementUnit.CUP },
            { name: 'eggs', quantity: 2, unit: MeasurementUnit.UNIT },
          ],
        }),
      ];

      const mockItems: ShoppingListItem[] = [
        {
          id: 'item-1',
          name: 'milk',
          quantity: 1,
          unit: MeasurementUnit.CUP,
          checked: false,
          recipeId: 'recipe-1',
          mealPlanId: null,
          category: 'Dairy',
          source: 'recipe',
          originalName: 'Milk',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockCreateBulk.mockResolvedValue(mockItems);

      const { createShoppingListInputsFromRecipes } = require('@/lib/services/ingredient-aggregator');
      createShoppingListInputsFromRecipes.mockReturnValue([
        {
          name: 'milk',
          quantity: 1,
          unit: MeasurementUnit.CUP,
          category: 'Dairy',
          source: 'recipe',
        },
      ]);

      const { ShoppingListGenerator } = await import('@/lib/services/shopping-list-generator');
      const generator = new ShoppingListGenerator();
      const result = await generator.generateFromQueue(mockRecipes);

      expect(createShoppingListInputsFromRecipes).toHaveBeenCalled();
      expect(mockCreateBulk).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return empty array for empty queue', async () => {
      const { ShoppingListGenerator } = await import('@/lib/services/shopping-list-generator');
      const generator = new ShoppingListGenerator();
      const result = await generator.generateFromQueue([]);

      expect(result).toHaveLength(0);
      expect(mockCreateBulk).not.toHaveBeenCalled();
    });

    it('should handle recipes with no ingredients', async () => {
      const mockRecipes: Recipe[] = [
        createMockRecipe({ ingredients: [] }),
      ];

      const { createShoppingListInputsFromRecipes } = require('@/lib/services/ingredient-aggregator');
      createShoppingListInputsFromRecipes.mockReturnValue([]);

      const { ShoppingListGenerator } = await import('@/lib/services/shopping-list-generator');
      const generator = new ShoppingListGenerator();
      const result = await generator.generateFromQueue(mockRecipes);

      expect(result).toHaveLength(0);
    });
  });

  describe('regenerateList', () => {
    it('should delete recipe items and regenerate', async () => {
      const mockRecipes: Recipe[] = [
        createMockRecipe({
          ingredients: [
            { name: 'flour', quantity: 2, unit: MeasurementUnit.CUP },
          ],
        }),
      ];

      mockDeleteBySource.mockResolvedValue(undefined);
      mockCreateBulk.mockResolvedValue([]);
      mockGetAll.mockResolvedValue([]);

      const { createShoppingListInputsFromRecipes } = require('@/lib/services/ingredient-aggregator');
      createShoppingListInputsFromRecipes.mockReturnValue([]);

      const { ShoppingListGenerator } = await import('@/lib/services/shopping-list-generator');
      const generator = new ShoppingListGenerator();
      await generator.regenerateList(mockRecipes);

      expect(mockDeleteBySource).toHaveBeenCalledWith('recipe');
    });

    it('should preserve manual items during regeneration', async () => {
      mockDeleteBySource.mockResolvedValue(undefined);
      mockCreateBulk.mockResolvedValue([]);

      const manualItem: ShoppingListItem = {
        id: 'manual-1',
        name: 'paper towels',
        quantity: 2,
        unit: MeasurementUnit.UNIT,
        checked: false,
        recipeId: null,
        mealPlanId: null,
        category: 'Other',
        source: 'manual',
        originalName: 'Paper Towels',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockGetAll.mockResolvedValue([manualItem]);

      const { createShoppingListInputsFromRecipes } = require('@/lib/services/ingredient-aggregator');
      createShoppingListInputsFromRecipes.mockReturnValue([]);

      const { ShoppingListGenerator } = await import('@/lib/services/shopping-list-generator');
      const generator = new ShoppingListGenerator();
      const result = await generator.regenerateList([]);

      expect(mockDeleteBySource).toHaveBeenCalledWith('recipe');
      expect(mockDeleteBySource).not.toHaveBeenCalledWith('manual');
      expect(result).toContainEqual(expect.objectContaining({ source: 'manual' }));
    });
  });

  describe('addManualItem', () => {
    it('should add a manual item', async () => {
      const mockItem: ShoppingListItem = {
        id: 'manual-1',
        name: 'dish soap',
        quantity: 1,
        unit: MeasurementUnit.UNIT,
        checked: false,
        recipeId: null,
        mealPlanId: null,
        category: 'Other',
        source: 'manual',
        originalName: 'Dish Soap',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockCreateItem.mockResolvedValue(mockItem);

      const { ShoppingListGenerator } = await import('@/lib/services/shopping-list-generator');
      const generator = new ShoppingListGenerator();
      const result = await generator.addManualItem({
        name: 'dish soap',
        quantity: 1,
        unit: MeasurementUnit.UNIT,
      });

      expect(mockCreateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'dish soap',
          source: 'manual',
        })
      );
      expect(result.source).toBe('manual');
    });

    it('should assign Other category by default', async () => {
      const mockItem: ShoppingListItem = {
        id: 'manual-1',
        name: 'random item',
        quantity: 1,
        unit: null,
        checked: false,
        recipeId: null,
        mealPlanId: null,
        category: 'Other',
        source: 'manual',
        originalName: 'Random Item',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockCreateItem.mockResolvedValue(mockItem);

      const { ShoppingListGenerator } = await import('@/lib/services/shopping-list-generator');
      const generator = new ShoppingListGenerator();
      const result = await generator.addManualItem({
        name: 'random item',
      });

      expect(result.category).toBe('Other');
    });

    it('should classify known ingredients', async () => {
      const mockItem: ShoppingListItem = {
        id: 'manual-1',
        name: 'milk',
        quantity: 1,
        unit: MeasurementUnit.LITER,
        checked: false,
        recipeId: null,
        mealPlanId: null,
        category: 'Dairy',
        source: 'manual',
        originalName: 'Milk',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockCreateItem.mockResolvedValue(mockItem);

      const { ShoppingListGenerator } = await import('@/lib/services/shopping-list-generator');
      const generator = new ShoppingListGenerator();
      const result = await generator.addManualItem({
        name: 'milk',
        quantity: 1,
        unit: MeasurementUnit.LITER,
      });

      expect(result.category).toBe('Dairy');
    });

    it('should use provided category over classification', async () => {
      const mockItem: ShoppingListItem = {
        id: 'manual-1',
        name: 'milk',
        quantity: 1,
        unit: MeasurementUnit.LITER,
        checked: false,
        recipeId: null,
        mealPlanId: null,
        category: 'Frozen',
        source: 'manual',
        originalName: 'Milk',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockCreateItem.mockResolvedValue(mockItem);

      const { ShoppingListGenerator } = await import('@/lib/services/shopping-list-generator');
      const generator = new ShoppingListGenerator();
      await generator.addManualItem({
        name: 'milk',
        quantity: 1,
        unit: MeasurementUnit.LITER,
        category: 'Frozen',
      });

      expect(mockCreateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Frozen',
        })
      );
    });
  });

  describe('removeRecipeIngredients', () => {
    it('should remove ingredients for a specific recipe', async () => {
      mockDeleteByRecipeId.mockResolvedValue(undefined);

      const { ShoppingListGenerator } = await import('@/lib/services/shopping-list-generator');
      const generator = new ShoppingListGenerator();
      await generator.removeRecipeIngredients('recipe-1');

      expect(mockDeleteByRecipeId).toHaveBeenCalledWith('recipe-1');
    });
  });

  describe('clearRecipeItems', () => {
    it('should clear all recipe-sourced items', async () => {
      mockDeleteBySource.mockResolvedValue(undefined);

      const { ShoppingListGenerator } = await import('@/lib/services/shopping-list-generator');
      const generator = new ShoppingListGenerator();
      await generator.clearRecipeItems();

      expect(mockDeleteBySource).toHaveBeenCalledWith('recipe');
    });
  });
});
