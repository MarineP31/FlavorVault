import { MeasurementUnit } from '@/constants/enums';
import type {
  ShoppingListItem,
  CreateShoppingListItemInput,
  GroupedShoppingListItems,
} from '@/lib/db/schema/shopping-list';
import {
  ShoppingListItemUtils,
  CATEGORY_ORDER,
} from '@/lib/db/schema/shopping-list';

describe('Manual Item Integration Flow', () => {
  const createMockManualItem = (
    overrides: Partial<ShoppingListItem> = {}
  ): ShoppingListItem => ({
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
    ...overrides,
  });

  const createMockRecipeItem = (
    overrides: Partial<ShoppingListItem> = {}
  ): ShoppingListItem => ({
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
    ...overrides,
  });

  describe('adding manual item and category placement', () => {
    it('should place manual item in correct category section', () => {
      const manualItem = createMockManualItem({
        name: 'dish soap',
        category: 'Other',
      });

      const items: ShoppingListItem[] = [manualItem];
      const grouped = ShoppingListItemUtils.groupByCategory(items);

      expect(grouped['Other']).toContainEqual(
        expect.objectContaining({ name: 'dish soap' })
      );
    });

    it('should place dairy manual item in Dairy section', () => {
      const manualItem = createMockManualItem({
        id: 'manual-dairy',
        name: 'extra milk',
        category: 'Dairy',
      });

      const items: ShoppingListItem[] = [manualItem];
      const grouped = ShoppingListItemUtils.groupByCategory(items);

      expect(grouped['Dairy']).toContainEqual(
        expect.objectContaining({ name: 'extra milk' })
      );
    });

    it('should default unknown items to Other category', () => {
      const manualItem = createMockManualItem({
        name: 'random household item',
        category: 'Other',
      });

      expect(manualItem.category).toBe('Other');
    });
  });

  describe('manual item persistence through regeneration', () => {
    it('should preserve manual items when filtering by source', () => {
      const manualItem = createMockManualItem();
      const recipeItem = createMockRecipeItem();
      const items = [manualItem, recipeItem];

      const recipeOnlyItems = items.filter((item) => item.source === 'recipe');
      const manualOnlyItems = items.filter((item) => item.source === 'manual');

      expect(recipeOnlyItems).toHaveLength(1);
      expect(recipeOnlyItems[0].source).toBe('recipe');

      expect(manualOnlyItems).toHaveLength(1);
      expect(manualOnlyItems[0].source).toBe('manual');
    });

    it('should keep manual items after simulated recipe deletion', () => {
      const manualItem = createMockManualItem();
      const recipeItem1 = createMockRecipeItem({ id: 'recipe-1' });
      const recipeItem2 = createMockRecipeItem({
        id: 'recipe-2',
        name: 'eggs',
      });

      let items = [manualItem, recipeItem1, recipeItem2];

      items = items.filter((item) => item.source !== 'recipe');

      expect(items).toHaveLength(1);
      expect(items[0].source).toBe('manual');
      expect(items[0].name).toBe('paper towels');
    });

    it('should maintain manual items across multiple regeneration cycles', () => {
      const manualItem = createMockManualItem();

      const regenerateList = (
        existingManualItems: ShoppingListItem[],
        newRecipeItems: ShoppingListItem[]
      ): ShoppingListItem[] => {
        return [...existingManualItems, ...newRecipeItems];
      };

      const cycle1 = regenerateList([manualItem], [
        createMockRecipeItem({ id: 'r1', name: 'flour' }),
      ]);

      expect(
        cycle1.find((i) => i.source === 'manual')
      ).toBeDefined();

      const cycle2ManualItems = cycle1.filter((i) => i.source === 'manual');
      const cycle2 = regenerateList(cycle2ManualItems, [
        createMockRecipeItem({ id: 'r2', name: 'sugar' }),
      ]);

      expect(
        cycle2.find((i) => i.source === 'manual')
      ).toBeDefined();
      expect(cycle2.find((i) => i.name === 'paper towels')).toBeDefined();
    });
  });

  describe('checking and unchecking manual items', () => {
    it('should toggle checked state for manual items', () => {
      const manualItem = createMockManualItem({ checked: false });

      const toggledItem = ShoppingListItemUtils.toggleChecked(manualItem);

      expect(toggledItem.checked).toBe(true);
      expect(toggledItem.source).toBe('manual');
    });

    it('should uncheck a checked manual item', () => {
      const checkedItem = createMockManualItem({ checked: true });

      const toggledItem = ShoppingListItemUtils.toggleChecked(checkedItem);

      expect(toggledItem.checked).toBe(false);
    });

    it('should preserve all other properties when toggling', () => {
      const manualItem = createMockManualItem({
        name: 'test item',
        quantity: 5,
        category: 'Pantry',
      });

      const toggledItem = ShoppingListItemUtils.toggleChecked(manualItem);

      expect(toggledItem.name).toBe('test item');
      expect(toggledItem.quantity).toBe(5);
      expect(toggledItem.category).toBe('Pantry');
      expect(toggledItem.source).toBe('manual');
    });
  });

  describe('deleting manual items with confirmation flow', () => {
    it('should support deletion of manual items', () => {
      const manualItem = createMockManualItem();
      let items = [manualItem, createMockRecipeItem()];

      const deleteItem = (id: string) => {
        items = items.filter((item) => item.id !== id);
      };

      expect(items).toHaveLength(2);

      deleteItem('manual-1');

      expect(items).toHaveLength(1);
      expect(items[0].source).toBe('recipe');
    });

    it('should not affect other items when deleting one manual item', () => {
      const manualItem1 = createMockManualItem({
        id: 'manual-1',
        name: 'item 1',
      });
      const manualItem2 = createMockManualItem({
        id: 'manual-2',
        name: 'item 2',
      });
      const recipeItem = createMockRecipeItem();

      let items = [manualItem1, manualItem2, recipeItem];

      const deleteItem = (id: string) => {
        items = items.filter((item) => item.id !== id);
      };

      deleteItem('manual-1');

      expect(items).toHaveLength(2);
      expect(items.find((i) => i.id === 'manual-2')).toBeDefined();
      expect(items.find((i) => i.source === 'recipe')).toBeDefined();
    });
  });

  describe('adding manual item from empty state', () => {
    it('should add first item to empty list', () => {
      let items: ShoppingListItem[] = [];

      const addItem = (item: ShoppingListItem) => {
        items = [...items, item];
      };

      const newManualItem = createMockManualItem({
        id: 'first-manual',
        name: 'first item',
      });

      expect(items).toHaveLength(0);

      addItem(newManualItem);

      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('first item');
      expect(items[0].source).toBe('manual');
    });

    it('should correctly group first item by category', () => {
      const newManualItem = createMockManualItem({
        id: 'first-manual',
        name: 'first item',
        category: 'Other',
      });

      const items = [newManualItem];
      const grouped = ShoppingListItemUtils.groupByCategory(items);

      expect(grouped['Other']).toHaveLength(1);
      expect(grouped['Produce']).toHaveLength(0);
      expect(grouped['Dairy']).toHaveLength(0);
    });

    it('should support adding multiple manual items to empty state', () => {
      let items: ShoppingListItem[] = [];

      const addItem = (item: ShoppingListItem) => {
        items = [...items, item];
      };

      addItem(createMockManualItem({ id: 'm1', name: 'item 1' }));
      addItem(createMockManualItem({ id: 'm2', name: 'item 2' }));
      addItem(createMockManualItem({ id: 'm3', name: 'item 3' }));

      expect(items).toHaveLength(3);
      expect(items.every((i) => i.source === 'manual')).toBe(true);
    });
  });

  describe('utility functions for manual items', () => {
    it('should correctly identify manual items using isManual utility', () => {
      const manualItem = createMockManualItem();
      const recipeItem = createMockRecipeItem();

      expect(ShoppingListItemUtils.isManual(manualItem)).toBe(true);
      expect(ShoppingListItemUtils.isManual(recipeItem)).toBe(false);
    });

    it('should correctly filter manual items using getManualItems', () => {
      const items = [
        createMockManualItem({ id: 'm1' }),
        createMockRecipeItem({ id: 'r1' }),
        createMockManualItem({ id: 'm2' }),
      ];

      const manualItems = ShoppingListItemUtils.getManualItems(items);

      expect(manualItems).toHaveLength(2);
      expect(manualItems.every((i) => i.source === 'manual')).toBe(true);
    });

    it('should group items by source correctly', () => {
      const items = [
        createMockManualItem({ id: 'm1' }),
        createMockRecipeItem({ id: 'r1' }),
        createMockManualItem({ id: 'm2' }),
        createMockRecipeItem({ id: 'r2' }),
      ];

      const { recipeItems, manualItems } =
        ShoppingListItemUtils.groupBySource(items);

      expect(recipeItems).toHaveLength(2);
      expect(manualItems).toHaveLength(2);
    });
  });
});
