import { MeasurementUnit } from '@/constants/enums';

export type ShoppingListItemSource = 'recipe' | 'manual';

/**
 * Shopping list category type for grouping items
 */
export type ShoppingListCategory =
  | 'Produce'
  | 'Dairy'
  | 'Meat & Seafood'
  | 'Pantry'
  | 'Frozen'
  | 'Bakery'
  | 'Other';

/**
 * ShoppingListItem interface representing a shopping list item
 */
export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: MeasurementUnit | null;
  checked: boolean;
  recipeId: string | null;
  mealPlanId: string | null;
  category: ShoppingListCategory;
  source: ShoppingListItemSource;
  originalName: string | null;
  createdAt: string;
}

/**
 * Grouped shopping list items by category
 */
export interface GroupedShoppingListItems {
  [category: string]: ShoppingListItem[];
}

/**
 * Input interface for creating a new shopping list item
 */
export interface CreateShoppingListItemInput {
  name: string;
  quantity?: number | null;
  unit?: MeasurementUnit | null;
  checked?: boolean;
  recipeId?: string | null;
  mealPlanId?: string | null;
  category: ShoppingListCategory;
  source: ShoppingListItemSource;
  originalName?: string | null;
}

/**
 * Input interface for adding manual items
 */
export interface ManualItemInput {
  name: string;
  quantity?: number | null;
  unit?: MeasurementUnit | null;
  category?: ShoppingListCategory;
}

/**
 * Input interface for updating an existing shopping list item
 */
export interface UpdateShoppingListItemInput {
  id: string;
  name?: string;
  quantity?: number | null;
  unit?: MeasurementUnit | null;
  checked?: boolean;
  category?: ShoppingListCategory;
}

/**
 * Database row interface for shopping_list_items table
 */
export interface ShoppingListItemRow {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  checked: number;
  recipeId: string | null;
  mealPlanId: string | null;
  category: string;
  source: string;
  originalName: string | null;
  createdAt: string;
}

/**
 * Shopping list item with recipe details (for display purposes)
 */
export interface ShoppingListItemWithRecipe extends ShoppingListItem {
  recipeTitle: string | null;
  recipeImageUri: string | null;
}

/**
 * Aggregated shopping list item (for ingredient aggregation)
 */
export interface AggregatedShoppingListItem extends ShoppingListItem {
  aggregatedQuantity: number;
  aggregatedUnit: MeasurementUnit | null;
  sourceRecipes: string[];
}

/**
 * Category order for consistent display
 */
export const CATEGORY_ORDER: ShoppingListCategory[] = [
  'Produce',
  'Dairy',
  'Meat & Seafood',
  'Pantry',
  'Frozen',
  'Bakery',
  'Other',
];

/**
 * Utility functions for ShoppingListItem operations
 */
export const ShoppingListItemUtils = {
  toRow(item: ShoppingListItem): ShoppingListItemRow {
    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      checked: item.checked ? 1 : 0,
      recipeId: item.recipeId,
      mealPlanId: item.mealPlanId,
      category: item.category,
      source: item.source,
      originalName: item.originalName,
      createdAt: item.createdAt,
    };
  },

  fromRow(row: ShoppingListItemRow): ShoppingListItem {
    return {
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      unit: row.unit as MeasurementUnit | null,
      checked: row.checked === 1,
      recipeId: row.recipeId,
      mealPlanId: row.mealPlanId,
      category: (row.category || 'Other') as ShoppingListCategory,
      source: (row.source || 'recipe') as ShoppingListItemSource,
      originalName: row.originalName,
      createdAt: row.createdAt,
    };
  },

  create(input: CreateShoppingListItemInput): ShoppingListItem {
    const now = new Date().toISOString();
    return {
      id: '',
      name: input.name,
      quantity: input.quantity ?? null,
      unit: input.unit ?? null,
      checked: input.checked ?? false,
      recipeId: input.recipeId ?? null,
      mealPlanId: input.mealPlanId ?? null,
      category: input.category,
      source: input.source,
      originalName: input.originalName ?? null,
      createdAt: now,
    };
  },

  update(
    item: ShoppingListItem,
    input: UpdateShoppingListItemInput
  ): ShoppingListItem {
    return {
      ...item,
      ...input,
    };
  },

  toggleChecked(item: ShoppingListItem): ShoppingListItem {
    return {
      ...item,
      checked: !item.checked,
    };
  },

  isFromRecipe(item: ShoppingListItem): boolean {
    return item.source === 'recipe';
  },

  isManual(item: ShoppingListItem): boolean {
    return item.source === 'manual';
  },

  validate(item: ShoppingListItem): string[] {
    const errors: string[] = [];

    if (!item.name || item.name.trim().length === 0) {
      errors.push('Item name is required');
    }

    if (item.name && item.name.length > 100) {
      errors.push('Item name must be 100 characters or less');
    }

    if (
      item.quantity !== null &&
      (item.quantity < 0 || item.quantity > 1000)
    ) {
      errors.push('Quantity must be between 0 and 1000');
    }

    if (!CATEGORY_ORDER.includes(item.category)) {
      errors.push('Invalid category');
    }

    if (item.source !== 'recipe' && item.source !== 'manual') {
      errors.push('Invalid source');
    }

    return errors;
  },

  formatQuantity(item: ShoppingListItem): string {
    if (item.quantity === null && item.unit === null) {
      return item.name;
    }

    if (item.quantity === null) {
      return `${item.name} (${item.unit})`;
    }

    if (item.unit === null) {
      return `${item.quantity} ${item.name}`;
    }

    const formattedQty = Number.isInteger(item.quantity)
      ? item.quantity
      : item.quantity.toFixed(2);
    return `${formattedQty} ${item.unit} ${item.name}`;
  },

  groupByCategory(items: ShoppingListItem[]): GroupedShoppingListItems {
    const grouped: GroupedShoppingListItems = {};

    for (const category of CATEGORY_ORDER) {
      grouped[category] = [];
    }

    for (const item of items) {
      const category = item.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    }

    for (const category of Object.keys(grouped)) {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    }

    return grouped;
  },

  groupByCheckedStatus(items: ShoppingListItem[]): {
    checked: ShoppingListItem[];
    unchecked: ShoppingListItem[];
  } {
    return items.reduce(
      (groups, item) => {
        if (item.checked) {
          groups.checked.push(item);
        } else {
          groups.unchecked.push(item);
        }
        return groups;
      },
      {
        checked: [] as ShoppingListItem[],
        unchecked: [] as ShoppingListItem[],
      }
    );
  },

  groupBySource(items: ShoppingListItem[]): {
    recipeItems: ShoppingListItem[];
    manualItems: ShoppingListItem[];
  } {
    return items.reduce(
      (groups, item) => {
        if (item.source === 'recipe') {
          groups.recipeItems.push(item);
        } else {
          groups.manualItems.push(item);
        }
        return groups;
      },
      {
        recipeItems: [] as ShoppingListItem[],
        manualItems: [] as ShoppingListItem[],
      }
    );
  },

  getItemsForRecipe(
    items: ShoppingListItem[],
    recipeId: string
  ): ShoppingListItem[] {
    return items.filter((item) => item.recipeId === recipeId);
  },

  getManualItems(items: ShoppingListItem[]): ShoppingListItem[] {
    return items.filter((item) => item.source === 'manual');
  },

  getRecipeItems(items: ShoppingListItem[]): ShoppingListItem[] {
    return items.filter((item) => item.source === 'recipe');
  },

  areAllChecked(items: ShoppingListItem[]): boolean {
    return items.length > 0 && items.every((item) => item.checked);
  },

  getCheckedCount(items: ShoppingListItem[]): number {
    return items.filter((item) => item.checked).length;
  },

  getUncheckedCount(items: ShoppingListItem[]): number {
    return items.filter((item) => !item.checked).length;
  },
};
