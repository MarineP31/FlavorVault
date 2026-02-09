import { MeasurementUnit } from '@/constants/enums';
import type { Recipe } from '@/lib/db/schema/recipe';

const mockGetCurrentUserId = jest.fn();

interface ChainableMock {
  setResolveValue: (value: unknown) => void;
  [key: string]: jest.Mock | ((value: unknown) => void);
}

const createChainableMock = (): ChainableMock => {
  let resolveValue: unknown = { data: [], error: null };

  const mock: ChainableMock = {} as ChainableMock;

  mock.setResolveValue = (value: unknown) => {
    resolveValue = value;
  };

  const createChainMethod = (): jest.Mock => jest.fn(() => mock);

  mock.select = createChainMethod();
  mock.insert = createChainMethod();
  mock.update = createChainMethod();
  mock.delete = createChainMethod();
  mock.eq = createChainMethod();
  mock.neq = createChainMethod();
  mock.is = createChainMethod();
  mock.ilike = createChainMethod();
  mock.contains = createChainMethod();
  mock.order = createChainMethod();
  mock.range = createChainMethod();
  mock.gte = createChainMethod();
  mock.lte = createChainMethod();
  mock.limit = createChainMethod();
  mock.single = jest.fn(() => Promise.resolve(resolveValue));
  mock.maybeSingle = jest.fn(() => Promise.resolve(resolveValue));
  mock.then = jest.fn((resolve: (value: unknown) => unknown) => Promise.resolve(resolve(resolveValue)));

  return mock;
};

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => createChainableMock()),
  },
  getCurrentUserId: () => mockGetCurrentUserId(),
  SupabaseError: class SupabaseError extends Error {
    public readonly code: string;
    public readonly originalError?: unknown;
    constructor(code: string, message: string, originalError?: unknown) {
      super(message);
      this.name = 'SupabaseError';
      this.code = code;
      this.originalError = originalError;
    }
  },
}));

jest.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).substring(7),
}));

import { shoppingListService } from '@/lib/db/services/shopping-list-service';
import { shoppingListGenerator } from '@/lib/services/shopping-list-generator';
import { supabase } from '@/lib/supabase/client';

describe('Add Recipe to Shopping List - Integration Tests', () => {
  const mockUserId = 'user-123';

  const mockRecipe: Recipe = {
    id: 'recipe-123',
    title: 'Test Recipe',
    servings: 4,
    category: 'dinner' as Recipe['category'],
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
    source: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUserId.mockResolvedValue(mockUserId);
  });

  describe('End-to-end: Add recipe workflow', () => {
    it('should add all recipe ingredients to shopping list', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await shoppingListGenerator.addRecipeToShoppingList(mockRecipe);

      expect(supabase.from).toHaveBeenCalledWith('shopping_list_items');
    });
  });

  describe('End-to-end: Remove recipe workflow', () => {
    it('should remove all recipe items from shopping list', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await shoppingListService.deleteByRecipeId('recipe-123');

      expect(supabase.from).toHaveBeenCalledWith('shopping_list_items');
      expect(chainMock.delete).toHaveBeenCalled();
      expect(chainMock.eq).toHaveBeenCalledWith('recipe_id', 'recipe-123');
    });
  });

  describe('Edge case: Recipe with no ingredients', () => {
    it('should return empty array for recipe with no ingredients', async () => {
      const emptyRecipe: Recipe = {
        ...mockRecipe,
        ingredients: [],
      };

      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await shoppingListGenerator.addRecipeToShoppingList(emptyRecipe);

      expect(result).toEqual([]);
    });
  });

  describe('Edge case: isRecipeInShoppingList check', () => {
    it('should return true when items exist for recipe', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({
        data: [{ id: 'item-1', recipe_id: 'recipe-123' }],
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await shoppingListService.isRecipeInShoppingList('recipe-123');

      expect(result).toBe(true);
    });

    it('should return false when no items exist for recipe', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await shoppingListService.isRecipeInShoppingList('recipe-456');

      expect(result).toBe(false);
    });
  });

  describe('Edge case: Concurrent operations', () => {
    it('should handle concurrent add operations gracefully', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const addPromise1 = shoppingListGenerator.addRecipeToShoppingList(mockRecipe);
      const addPromise2 = shoppingListGenerator.addRecipeToShoppingList(mockRecipe);

      await Promise.all([addPromise1, addPromise2]);

      expect(supabase.from).toHaveBeenCalled();
    });
  });
});
