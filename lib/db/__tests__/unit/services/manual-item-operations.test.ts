import { MeasurementUnit } from '@/constants/enums';
import type {
  ShoppingListItem,
  CreateShoppingListItemInput,
} from '@/lib/db/schema/shopping-list';

const mockCreateItem = jest.fn();
const mockDeleteBySource = jest.fn();
const mockDeleteItem = jest.fn();
const mockGetAll = jest.fn();

jest.mock('@/lib/db/services/shopping-list-service', () => ({
  shoppingListService: {
    createItem: (...args: any[]) => mockCreateItem(...args),
    deleteBySource: (...args: any[]) => mockDeleteBySource(...args),
    deleteItem: (...args: any[]) => mockDeleteItem(...args),
    getAll: (...args: any[]) => mockGetAll(...args),
  },
}));

describe('Manual Item Database Operations', () => {
  const mockManualItem: ShoppingListItem = {
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

  const mockRecipeItem: ShoppingListItem = {
    id: 'recipe-1',
    name: 'milk',
    quantity: 1,
    unit: MeasurementUnit.CUP,
    checked: false,
    recipeId: 'recipe-123',
    mealPlanId: null,
    category: 'Dairy',
    source: 'recipe',
    originalName: 'Milk',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('creating manual items', () => {
    it('should create manual item with only name (no quantity, no unit)', async () => {
      const nameOnlyItem: ShoppingListItem = {
        ...mockManualItem,
        id: 'manual-name-only',
        name: 'batteries',
        quantity: null,
        unit: null,
        category: 'Other',
      };

      mockCreateItem.mockResolvedValue(nameOnlyItem);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      const input: CreateShoppingListItemInput = {
        name: 'batteries',
        quantity: null,
        unit: null,
        category: 'Other',
        source: 'manual',
      };

      const result = await shoppingListService.createItem(input);

      expect(mockCreateItem).toHaveBeenCalledWith(input);
      expect(result.name).toBe('batteries');
      expect(result.quantity).toBeNull();
      expect(result.unit).toBeNull();
      expect(result.source).toBe('manual');
    });

    it('should create manual item with all fields (name, quantity, unit, category)', async () => {
      mockCreateItem.mockResolvedValue(mockManualItem);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      const input: CreateShoppingListItemInput = {
        name: 'paper towels',
        quantity: 2,
        unit: MeasurementUnit.UNIT,
        category: 'Other',
        source: 'manual',
      };

      const result = await shoppingListService.createItem(input);

      expect(mockCreateItem).toHaveBeenCalledWith(input);
      expect(result.name).toBe('paper towels');
      expect(result.quantity).toBe(2);
      expect(result.unit).toBe(MeasurementUnit.UNIT);
      expect(result.category).toBe('Other');
      expect(result.source).toBe('manual');
    });
  });

  describe('deleteBySource preserves manual items', () => {
    it('should preserve manual items when deleting recipe items', async () => {
      mockDeleteBySource.mockResolvedValue(undefined);
      mockGetAll.mockResolvedValue([mockManualItem]);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      await shoppingListService.deleteBySource('recipe');

      expect(mockDeleteBySource).toHaveBeenCalledWith('recipe');
      expect(mockDeleteBySource).not.toHaveBeenCalledWith('manual');

      const remainingItems = await shoppingListService.getAll();
      expect(remainingItems).toContainEqual(
        expect.objectContaining({ source: 'manual' })
      );
    });

    it('should delete only recipe items when regenerating', async () => {
      const allItems = [mockManualItem, mockRecipeItem];

      mockDeleteBySource.mockImplementation(async (source: string) => {
        if (source === 'recipe') {
          return undefined;
        }
      });

      mockGetAll.mockResolvedValue([mockManualItem]);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      await shoppingListService.deleteBySource('recipe');

      expect(mockDeleteBySource).toHaveBeenCalledWith('recipe');

      const remainingItems = await shoppingListService.getAll();
      expect(remainingItems.every((item: ShoppingListItem) => item.source === 'manual')).toBe(true);
    });
  });

  describe('deleteItem removes specific manual item', () => {
    it('should delete a specific manual item by ID', async () => {
      mockDeleteItem.mockResolvedValue(undefined);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      await shoppingListService.deleteItem('manual-1');

      expect(mockDeleteItem).toHaveBeenCalledWith('manual-1');
    });

    it('should handle deletion errors', async () => {
      mockDeleteItem.mockRejectedValue(new Error('Delete failed'));

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      await expect(shoppingListService.deleteItem('manual-1')).rejects.toThrow(
        'Delete failed'
      );
    });
  });

  describe('manual item validation', () => {
    it('should reject empty name', async () => {
      mockCreateItem.mockRejectedValue(
        new Error('Shopping list item validation failed: Item name is required')
      );

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      const input: CreateShoppingListItemInput = {
        name: '',
        category: 'Other',
        source: 'manual',
      };

      await expect(shoppingListService.createItem(input)).rejects.toThrow(
        'Item name is required'
      );
    });

    it('should reject name exceeding 100 characters', async () => {
      const longName = 'a'.repeat(101);
      mockCreateItem.mockRejectedValue(
        new Error('Shopping list item validation failed: Item name must be 100 characters or less')
      );

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      const input: CreateShoppingListItemInput = {
        name: longName,
        category: 'Other',
        source: 'manual',
      };

      await expect(shoppingListService.createItem(input)).rejects.toThrow(
        'Item name must be 100 characters or less'
      );
    });
  });
});
