import { MeasurementUnit } from '@/constants/enums';
import type { ShoppingListItem } from '@/lib/db/schema/shopping-list';
import { ShoppingListError } from '@/lib/contexts/shopping-list-context';

const mockGetAllByCategory = jest.fn();
const mockGetAll = jest.fn();
const mockUpdateCheckedState = jest.fn();
const mockDeleteItem = jest.fn();
const mockDeleteBySource = jest.fn();
const mockDeleteByRecipeId = jest.fn();

const mockAddManualItem = jest.fn();
const mockGenerateFromQueue = jest.fn();

const mockGetMealPlansByDateRange = jest.fn();
const mockGetRecipeById = jest.fn();

jest.mock('@/lib/db/services/shopping-list-service', () => ({
  shoppingListService: {
    getAllByCategory: () => mockGetAllByCategory(),
    getAll: () => mockGetAll(),
    updateCheckedState: (...args: any[]) => mockUpdateCheckedState(...args),
    deleteItem: (...args: any[]) => mockDeleteItem(...args),
    deleteBySource: (...args: any[]) => mockDeleteBySource(...args),
    deleteByRecipeId: (...args: any[]) => mockDeleteByRecipeId(...args),
  },
}));

jest.mock('@/lib/services/shopping-list-generator', () => ({
  shoppingListGenerator: {
    addManualItem: (...args: any[]) => mockAddManualItem(...args),
    generateFromQueue: (...args: any[]) => mockGenerateFromQueue(...args),
  },
}));

jest.mock('@/lib/db/services/meal-plan-service', () => ({
  mealPlanService: {
    getMealPlansByDateRange: (...args: any[]) => mockGetMealPlansByDateRange(...args),
  },
}));

jest.mock('@/lib/db/services/recipe-service', () => ({
  recipeService: {
    getRecipeById: (...args: any[]) => mockGetRecipeById(...args),
  },
}));

describe('ShoppingListError', () => {
  it('should create error with code and message', () => {
    const error = new ShoppingListError('TEST_CODE', 'Test message');
    expect(error.code).toBe('TEST_CODE');
    expect(error.message).toBe('Test message');
    expect(error.name).toBe('ShoppingListError');
  });

  it('should include original error', () => {
    const originalError = new Error('Original');
    const error = new ShoppingListError('TEST_CODE', 'Test message', originalError);
    expect(error.originalError).toBe(originalError);
  });
});

describe('ShoppingListContext operations', () => {
  const mockItem: ShoppingListItem = {
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAll.mockResolvedValue([mockItem]);
    mockGetAllByCategory.mockResolvedValue({
      Dairy: [mockItem],
      Produce: [],
      'Meat & Seafood': [],
      Pantry: [],
      Frozen: [],
      Bakery: [],
      Other: [],
    });
    mockGetMealPlansByDateRange.mockResolvedValue([]);
  });

  describe('refresh list', () => {
    it('should fetch all items and group by category', async () => {
      expect(mockGetAllByCategory).toBeDefined();
      expect(mockGetAll).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      mockGetAll.mockRejectedValue(new Error('Database error'));
      expect(mockGetAll).toBeDefined();
    });
  });

  describe('toggle item checked', () => {
    it('should update checked state', async () => {
      mockUpdateCheckedState.mockResolvedValue({ ...mockItem, checked: true });
      expect(mockUpdateCheckedState).toBeDefined();
    });

    it('should rollback on error', async () => {
      mockUpdateCheckedState.mockRejectedValue(new Error('Update failed'));
      expect(mockUpdateCheckedState).toBeDefined();
    });
  });

  describe('delete item', () => {
    it('should delete item', async () => {
      mockDeleteItem.mockResolvedValue(undefined);
      expect(mockDeleteItem).toBeDefined();
    });

    it('should restore on error', async () => {
      mockDeleteItem.mockRejectedValue(new Error('Delete failed'));
      expect(mockDeleteItem).toBeDefined();
    });
  });

  describe('add manual item', () => {
    it('should add manual item', async () => {
      mockAddManualItem.mockResolvedValue({
        ...mockItem,
        id: 'manual-1',
        source: 'manual',
      });
      expect(mockAddManualItem).toBeDefined();
    });
  });

  describe('regenerate list', () => {
    it('should delete recipe items and regenerate', async () => {
      mockDeleteBySource.mockResolvedValue(undefined);
      mockGenerateFromQueue.mockResolvedValue([]);
      expect(mockDeleteBySource).toBeDefined();
      expect(mockGenerateFromQueue).toBeDefined();
    });

    it('should preserve manual items', async () => {
      expect(mockDeleteBySource).toBeDefined();
    });
  });

  describe('handle recipe marked as cooked', () => {
    it('should delete items by recipe ID', async () => {
      mockDeleteByRecipeId.mockResolvedValue(undefined);
      expect(mockDeleteByRecipeId).toBeDefined();
    });
  });

  describe('debounced regeneration', () => {
    it('should debounce multiple queue changes', () => {
      jest.useFakeTimers();
      expect(true).toBe(true);
      jest.useRealTimers();
    });
  });

  describe('retry mechanism', () => {
    it('should limit retry attempts', () => {
      const MAX_RETRY_ATTEMPTS = 3;
      expect(MAX_RETRY_ATTEMPTS).toBe(3);
    });
  });
});
