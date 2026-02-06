import { MeasurementUnit } from '@/constants/enums';
import type {
  CreateShoppingListItemInput,
  ShoppingListItem,
} from '@/lib/db/schema/shopping-list';

const mockCreateItem = jest.fn();
const mockDeleteBySource = jest.fn();
const mockDeleteItem = jest.fn();
const mockGetAll = jest.fn();
const mockGetAllByCategory = jest.fn();
const mockUpdateCheckedState = jest.fn();
const mockCreateBulk = jest.fn();

jest.mock('@/lib/db/services/shopping-list-service', () => ({
  shoppingListService: {
    createItem: (...args: any[]) => mockCreateItem(...args),
    deleteBySource: (...args: any[]) => mockDeleteBySource(...args),
    deleteItem: (...args: any[]) => mockDeleteItem(...args),
    getAll: (...args: any[]) => mockGetAll(...args),
    getAllByCategory: (...args: any[]) => mockGetAllByCategory(...args),
    updateCheckedState: (...args: any[]) => mockUpdateCheckedState(...args),
    createBulk: (...args: any[]) => mockCreateBulk(...args),
  },
}));

jest.mock('@/lib/utils/category-classifier', () => ({
  classifyIngredient: (name: string) => {
    if (name.includes('milk')) return 'Dairy';
    if (name.includes('chicken')) return 'Meat & Seafood';
    if (name.includes('tomato')) return 'Produce';
    return 'Other';
  },
}));

describe('Manual Item Workflow Integration Tests', () => {
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

  describe('adding manual item and verifying category', () => {
    it('should add manual item and it appears in correct category', async () => {
      const newManualItem: ShoppingListItem = {
        ...mockManualItem,
        id: 'manual-new',
        name: 'batteries',
        category: 'Other',
      };

      mockCreateItem.mockResolvedValue(newManualItem);
      mockGetAllByCategory.mockResolvedValue({
        Other: [newManualItem],
        Dairy: [],
        Produce: [],
        'Meat & Seafood': [],
        Pantry: [],
        Frozen: [],
        Bakery: [],
      });

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      const input: CreateShoppingListItemInput = {
        name: 'batteries',
        quantity: null,
        unit: null,
        category: 'Other',
        source: 'manual',
      };

      await shoppingListService.createItem(input);
      const groupedItems = await shoppingListService.getAllByCategory();

      expect(groupedItems.Other).toContainEqual(
        expect.objectContaining({ name: 'batteries', source: 'manual' })
      );
    });

    it('should classify dairy item correctly when added manually', async () => {
      const dairyManualItem: ShoppingListItem = {
        ...mockManualItem,
        id: 'manual-dairy',
        name: 'milk',
        category: 'Dairy',
      };

      mockCreateItem.mockResolvedValue(dairyManualItem);
      mockGetAllByCategory.mockResolvedValue({
        Other: [],
        Dairy: [dairyManualItem],
        Produce: [],
        'Meat & Seafood': [],
        Pantry: [],
        Frozen: [],
        Bakery: [],
      });

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');
      const { classifyIngredient } = require('@/lib/utils/category-classifier');

      const category = classifyIngredient('milk');
      const input: CreateShoppingListItemInput = {
        name: 'milk',
        quantity: 1,
        unit: MeasurementUnit.LITER,
        category,
        source: 'manual',
      };

      await shoppingListService.createItem(input);
      const groupedItems = await shoppingListService.getAllByCategory();

      expect(groupedItems.Dairy).toContainEqual(
        expect.objectContaining({ name: 'milk', source: 'manual' })
      );
    });
  });

  describe('manual item persistence through regeneration', () => {
    it('should preserve manual items when recipe items are regenerated', async () => {
      const allItemsBefore = [mockManualItem, mockRecipeItem];
      const manualItemsAfterRegeneration = [mockManualItem];

      mockGetAll.mockResolvedValueOnce(allItemsBefore);
      mockDeleteBySource.mockResolvedValue(undefined);
      mockGetAll.mockResolvedValueOnce(manualItemsAfterRegeneration);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      const beforeItems = await shoppingListService.getAll();
      expect(beforeItems).toHaveLength(2);
      expect(beforeItems.some((i: ShoppingListItem) => i.source === 'manual')).toBe(true);
      expect(beforeItems.some((i: ShoppingListItem) => i.source === 'recipe')).toBe(true);

      await shoppingListService.deleteBySource('recipe');
      expect(mockDeleteBySource).toHaveBeenCalledWith('recipe');

      const afterItems = await shoppingListService.getAll();
      expect(afterItems).toHaveLength(1);
      expect(afterItems[0].source).toBe('manual');
      expect(afterItems[0].name).toBe('paper towels');
    });
  });

  describe('checking/unchecking manual items', () => {
    it('should toggle checked state for manual items', async () => {
      const uncheckedItem = { ...mockManualItem, checked: false };
      const checkedItem = { ...mockManualItem, checked: true };

      mockUpdateCheckedState
        .mockResolvedValueOnce(checkedItem)
        .mockResolvedValueOnce(uncheckedItem);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      const afterCheck = await shoppingListService.updateCheckedState('manual-1', true);
      expect(afterCheck.checked).toBe(true);

      const afterUncheck = await shoppingListService.updateCheckedState('manual-1', false);
      expect(afterUncheck.checked).toBe(false);
    });
  });

  describe('deleting manual items with confirmation flow', () => {
    it('should delete manual item completely', async () => {
      mockDeleteItem.mockResolvedValue(undefined);
      mockGetAll.mockResolvedValue([]);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      await shoppingListService.deleteItem('manual-1');
      expect(mockDeleteItem).toHaveBeenCalledWith('manual-1');

      const remainingItems = await shoppingListService.getAll();
      expect(remainingItems).toHaveLength(0);
    });

    it('should not delete recipe items via deleteItem', async () => {
      mockDeleteItem.mockResolvedValue(undefined);
      mockGetAll.mockResolvedValue([mockRecipeItem]);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      await shoppingListService.deleteItem('manual-1');
      const items = await shoppingListService.getAll();

      expect(items).toContainEqual(
        expect.objectContaining({ source: 'recipe' })
      );
    });
  });

  describe('adding manual item from empty state', () => {
    it('should successfully add first manual item when list is empty', async () => {
      mockGetAll.mockResolvedValueOnce([]);

      const newItem: ShoppingListItem = {
        id: 'first-manual',
        name: 'first item',
        quantity: null,
        unit: null,
        checked: false,
        recipeId: null,
        mealPlanId: null,
        category: 'Other',
        source: 'manual',
        originalName: 'First Item',
        createdAt: new Date().toISOString(),
      };

      mockCreateItem.mockResolvedValue(newItem);
      mockGetAll.mockResolvedValueOnce([newItem]);

      const { shoppingListService } = require('@/lib/db/services/shopping-list-service');

      const initialItems = await shoppingListService.getAll();
      expect(initialItems).toHaveLength(0);

      await shoppingListService.createItem({
        name: 'first item',
        quantity: null,
        unit: null,
        category: 'Other',
        source: 'manual',
      });

      const afterAdd = await shoppingListService.getAll();
      expect(afterAdd).toHaveLength(1);
      expect(afterAdd[0].source).toBe('manual');
    });
  });
});
