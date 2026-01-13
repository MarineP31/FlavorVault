import { MeasurementUnit } from '@/constants/enums';
import type { ShoppingListItem, ShoppingListCategory } from '@/lib/db/schema/shopping-list';
import {
  getCategorySectionData,
  getCategorySectionItemCount,
  getCategorySectionCheckedCount,
  sortCategorySectionItems,
  getCategorySectionStats,
} from '@/components/shopping-list/category-section';

describe('CategorySection utility functions', () => {
  const createMockItem = (
    overrides: Partial<ShoppingListItem> = {}
  ): ShoppingListItem => ({
    id: 'test-id',
    name: 'Test Item',
    quantity: 1,
    unit: MeasurementUnit.UNIT,
    checked: false,
    recipeId: 'recipe-1',
    mealPlanId: null,
    category: 'Produce',
    source: 'recipe',
    originalName: 'Test Item',
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  });

  describe('getCategorySectionData', () => {
    it('should filter items by category', () => {
      const items: ShoppingListItem[] = [
        createMockItem({ id: '1', name: 'Tomato', category: 'Produce' }),
        createMockItem({ id: '2', name: 'Milk', category: 'Dairy' }),
        createMockItem({ id: '3', name: 'Onion', category: 'Produce' }),
        createMockItem({ id: '4', name: 'Chicken', category: 'Meat & Seafood' }),
      ];

      const produceItems = getCategorySectionData(items, 'Produce');
      expect(produceItems).toHaveLength(2);
      expect(produceItems.every((item) => item.category === 'Produce')).toBe(true);
    });

    it('should return empty array for category with no items', () => {
      const items: ShoppingListItem[] = [
        createMockItem({ id: '1', name: 'Tomato', category: 'Produce' }),
      ];

      const frozenItems = getCategorySectionData(items, 'Frozen');
      expect(frozenItems).toHaveLength(0);
    });

    it('should handle empty items array', () => {
      const result = getCategorySectionData([], 'Produce');
      expect(result).toHaveLength(0);
    });
  });

  describe('getCategorySectionItemCount', () => {
    it('should count items in category', () => {
      const items: ShoppingListItem[] = [
        createMockItem({ id: '1', category: 'Produce' }),
        createMockItem({ id: '2', category: 'Produce' }),
        createMockItem({ id: '3', category: 'Dairy' }),
      ];

      expect(getCategorySectionItemCount(items, 'Produce')).toBe(2);
      expect(getCategorySectionItemCount(items, 'Dairy')).toBe(1);
      expect(getCategorySectionItemCount(items, 'Frozen')).toBe(0);
    });
  });

  describe('getCategorySectionCheckedCount', () => {
    it('should count checked items in category', () => {
      const items: ShoppingListItem[] = [
        createMockItem({ id: '1', category: 'Produce', checked: true }),
        createMockItem({ id: '2', category: 'Produce', checked: false }),
        createMockItem({ id: '3', category: 'Produce', checked: true }),
        createMockItem({ id: '4', category: 'Dairy', checked: true }),
      ];

      expect(getCategorySectionCheckedCount(items, 'Produce')).toBe(2);
      expect(getCategorySectionCheckedCount(items, 'Dairy')).toBe(1);
      expect(getCategorySectionCheckedCount(items, 'Frozen')).toBe(0);
    });
  });

  describe('sortCategorySectionItems', () => {
    it('should sort items alphabetically by name', () => {
      const items: ShoppingListItem[] = [
        createMockItem({ id: '1', name: 'Zucchini' }),
        createMockItem({ id: '2', name: 'Apple' }),
        createMockItem({ id: '3', name: 'Banana' }),
      ];

      const sorted = sortCategorySectionItems(items);

      expect(sorted[0].name).toBe('Apple');
      expect(sorted[1].name).toBe('Banana');
      expect(sorted[2].name).toBe('Zucchini');
    });

    it('should handle empty array', () => {
      const result = sortCategorySectionItems([]);
      expect(result).toHaveLength(0);
    });

    it('should not mutate original array', () => {
      const items: ShoppingListItem[] = [
        createMockItem({ id: '1', name: 'Zucchini' }),
        createMockItem({ id: '2', name: 'Apple' }),
      ];

      const sorted = sortCategorySectionItems(items);

      expect(items[0].name).toBe('Zucchini');
      expect(sorted[0].name).toBe('Apple');
    });

    it('should handle case-insensitive sorting', () => {
      const items: ShoppingListItem[] = [
        createMockItem({ id: '1', name: 'banana' }),
        createMockItem({ id: '2', name: 'Apple' }),
        createMockItem({ id: '3', name: 'CHERRY' }),
      ];

      const sorted = sortCategorySectionItems(items);

      expect(sorted[0].name).toBe('Apple');
      expect(sorted[1].name).toBe('banana');
      expect(sorted[2].name).toBe('CHERRY');
    });
  });

  describe('getCategorySectionStats', () => {
    it('should return correct stats for category', () => {
      const items: ShoppingListItem[] = [
        createMockItem({ id: '1', category: 'Produce', checked: true }),
        createMockItem({ id: '2', category: 'Produce', checked: false }),
        createMockItem({ id: '3', category: 'Produce', checked: true }),
        createMockItem({ id: '4', category: 'Dairy', checked: false }),
      ];

      const stats = getCategorySectionStats(items, 'Produce');

      expect(stats.total).toBe(3);
      expect(stats.checked).toBe(2);
      expect(stats.unchecked).toBe(1);
    });

    it('should return zeros for empty category', () => {
      const items: ShoppingListItem[] = [
        createMockItem({ id: '1', category: 'Produce' }),
      ];

      const stats = getCategorySectionStats(items, 'Frozen');

      expect(stats.total).toBe(0);
      expect(stats.checked).toBe(0);
      expect(stats.unchecked).toBe(0);
    });
  });
});
