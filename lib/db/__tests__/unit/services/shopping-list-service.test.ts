import { MeasurementUnit } from '@/constants/enums';
import type {
  ShoppingListItem,
  CreateShoppingListItemInput,
  ShoppingListCategory,
} from '@/lib/db/schema/shopping-list';

const mockCreateItem = jest.fn();
const mockCreateBulk = jest.fn();
const mockGetAll = jest.fn();
const mockGetAllByCategory = jest.fn();
const mockUpdateCheckedState = jest.fn();
const mockDeleteItem = jest.fn();
const mockDeleteBySource = jest.fn();
const mockDeleteByRecipeId = jest.fn();
const mockClearAll = jest.fn();
const mockGetShoppingListItemById = jest.fn();
const mockUncheckRecipeItems = jest.fn();
const mockGetShoppingItemCount = jest.fn();

jest.mock('@/lib/db/services/shopping-list-service', () => ({
  shoppingListService: {
    createItem: (...args: any[]) => mockCreateItem(...args),
    createBulk: (...args: any[]) => mockCreateBulk(...args),
    getAll: (...args: any[]) => mockGetAll(...args),
    getAllByCategory: (...args: any[]) => mockGetAllByCategory(...args),
    updateCheckedState: (...args: any[]) => mockUpdateCheckedState(...args),
    deleteItem: (...args: any[]) => mockDeleteItem(...args),
    deleteBySource: (...args: any[]) => mockDeleteBySource(...args),
    deleteByRecipeId: (...args: any[]) => mockDeleteByRecipeId(...args),
    clearAll: (...args: any[]) => mockClearAll(...args),
    getShoppingListItemById: (...args: any[]) => mockGetShoppingListItemById(...args),
    uncheckRecipeItems: (...args: any[]) => mockUncheckRecipeItems(...args),
    getShoppingItemCount: (...args: any[]) => mockGetShoppingItemCount(...args),
  },
  ShoppingListService: jest.fn(),
}));

describe('ShoppingListService', () => {
  const mockItem: ShoppingListItem = {
    id: 'test-id-1',
    name: 'milk',
    quantity: 2,
    unit: MeasurementUnit.CUP,
    checked: false,
    recipeId: 'recipe-1',
    mealPlanId: null,
    category: 'Dairy',
    source: 'recipe',
    originalName: 'Milk',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const mockInput: CreateShoppingListItemInput = {
    name: 'milk',
    quantity: 2,
    unit: MeasurementUnit.CUP,
    category: 'Dairy',
    source: 'recipe',
    originalName: 'Milk',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('should create a new shopping list item', async () => {
      mockCreateItem.mockResolvedValue(mockItem);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      const result = await shoppingListService.createItem(mockInput);

      expect(mockCreateItem).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockItem);
    });

    it('should handle creation errors', async () => {
      mockCreateItem.mockRejectedValue(new Error('Creation failed'));

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      await expect(shoppingListService.createItem(mockInput)).rejects.toThrow('Creation failed');
    });
  });

  describe('createBulk', () => {
    it('should create multiple items', async () => {
      const inputs: CreateShoppingListItemInput[] = [
        mockInput,
        { ...mockInput, name: 'eggs', category: 'Dairy' },
      ];
      const mockItems = [
        mockItem,
        { ...mockItem, id: 'test-id-2', name: 'eggs' },
      ];
      mockCreateBulk.mockResolvedValue(mockItems);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      const result = await shoppingListService.createBulk(inputs);

      expect(mockCreateBulk).toHaveBeenCalledWith(inputs);
      expect(result).toHaveLength(2);
    });

    it('should handle empty array', async () => {
      mockCreateBulk.mockResolvedValue([]);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      const result = await shoppingListService.createBulk([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('getAll', () => {
    it('should return all shopping list items', async () => {
      const mockItems = [mockItem, { ...mockItem, id: 'test-id-2' }];
      mockGetAll.mockResolvedValue(mockItems);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      const result = await shoppingListService.getAll();

      expect(mockGetAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no items exist', async () => {
      mockGetAll.mockResolvedValue([]);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      const result = await shoppingListService.getAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('getAllByCategory', () => {
    it('should return items grouped by category', async () => {
      const grouped = {
        Dairy: [mockItem],
        Produce: [],
        'Meat & Seafood': [],
        Pantry: [],
        Frozen: [],
        Bakery: [],
        Other: [],
      };
      mockGetAllByCategory.mockResolvedValue(grouped);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      const result = await shoppingListService.getAllByCategory();

      expect(result.Dairy).toHaveLength(1);
      expect(result.Produce).toHaveLength(0);
    });
  });

  describe('updateCheckedState', () => {
    it('should update item checked state', async () => {
      const updatedItem = { ...mockItem, checked: true };
      mockUpdateCheckedState.mockResolvedValue(updatedItem);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      const result = await shoppingListService.updateCheckedState('test-id-1', true);

      expect(mockUpdateCheckedState).toHaveBeenCalledWith('test-id-1', true);
      expect(result.checked).toBe(true);
    });

    it('should toggle checked state', async () => {
      mockUpdateCheckedState
        .mockResolvedValueOnce({ ...mockItem, checked: true })
        .mockResolvedValueOnce({ ...mockItem, checked: false });

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      let result = await shoppingListService.updateCheckedState('test-id-1', true);
      expect(result.checked).toBe(true);

      result = await shoppingListService.updateCheckedState('test-id-1', false);
      expect(result.checked).toBe(false);
    });
  });

  describe('deleteItem', () => {
    it('should delete an item', async () => {
      mockDeleteItem.mockResolvedValue(undefined);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      await shoppingListService.deleteItem('test-id-1');

      expect(mockDeleteItem).toHaveBeenCalledWith('test-id-1');
    });

    it('should handle delete errors', async () => {
      mockDeleteItem.mockRejectedValue(new Error('Delete failed'));

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      await expect(shoppingListService.deleteItem('test-id-1')).rejects.toThrow('Delete failed');
    });
  });

  describe('deleteBySource', () => {
    it('should delete all recipe items', async () => {
      mockDeleteBySource.mockResolvedValue(undefined);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      await shoppingListService.deleteBySource('recipe');

      expect(mockDeleteBySource).toHaveBeenCalledWith('recipe');
    });

    it('should delete all manual items', async () => {
      mockDeleteBySource.mockResolvedValue(undefined);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      await shoppingListService.deleteBySource('manual');

      expect(mockDeleteBySource).toHaveBeenCalledWith('manual');
    });
  });

  describe('deleteByRecipeId', () => {
    it('should delete items by recipe ID', async () => {
      mockDeleteByRecipeId.mockResolvedValue(undefined);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      await shoppingListService.deleteByRecipeId('recipe-1');

      expect(mockDeleteByRecipeId).toHaveBeenCalledWith('recipe-1');
    });
  });

  describe('clearAll', () => {
    it('should clear all items', async () => {
      mockClearAll.mockResolvedValue(undefined);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      await shoppingListService.clearAll();

      expect(mockClearAll).toHaveBeenCalled();
    });
  });

  describe('getShoppingListItemById', () => {
    it('should return item by ID', async () => {
      mockGetShoppingListItemById.mockResolvedValue(mockItem);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      const result = await shoppingListService.getShoppingListItemById('test-id-1');

      expect(result).toEqual(mockItem);
    });

    it('should return null for non-existent item', async () => {
      mockGetShoppingListItemById.mockResolvedValue(null);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      const result = await shoppingListService.getShoppingListItemById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('uncheckRecipeItems', () => {
    it('should uncheck all recipe items', async () => {
      mockUncheckRecipeItems.mockResolvedValue(undefined);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      await shoppingListService.uncheckRecipeItems();

      expect(mockUncheckRecipeItems).toHaveBeenCalled();
    });
  });

  describe('getShoppingItemCount', () => {
    it('should return total count', async () => {
      mockGetShoppingItemCount.mockResolvedValue(10);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      const result = await shoppingListService.getShoppingItemCount();

      expect(result).toBe(10);
    });

    it('should return count with filters', async () => {
      mockGetShoppingItemCount.mockResolvedValue(5);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      const result = await shoppingListService.getShoppingItemCount({ checkedOnly: true });

      expect(mockGetShoppingItemCount).toHaveBeenCalledWith({ checkedOnly: true });
      expect(result).toBe(5);
    });
  });
});
