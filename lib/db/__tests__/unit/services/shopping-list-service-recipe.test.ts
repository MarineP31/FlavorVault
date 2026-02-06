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

import { shoppingListService } from '@/lib/db/services/shopping-list-service';
import { shoppingListGenerator } from '@/lib/services/shopping-list-generator';
import { supabase } from '@/lib/supabase/client';

describe('ShoppingListService - Recipe Methods', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUserId.mockResolvedValue(mockUserId);
  });

  describe('isRecipeInShoppingList', () => {
    it('should return true when recipe items exist', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({
        data: [{ id: 'item-1', name: 'Eggs', recipe_id: 'recipe-123' }],
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await shoppingListService.isRecipeInShoppingList('recipe-123');

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('shopping_list_items');
    });

    it('should return false when no recipe items exist', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await shoppingListService.isRecipeInShoppingList('recipe-456');

      expect(result).toBe(false);
    });
  });
});

describe('ShoppingListGenerator - addRecipeToShoppingList', () => {
  const mockUserId = 'user-123';

  const mockRecipe: Recipe = {
    id: 'recipe-123',
    title: 'Test Recipe',
    servings: 4,
    category: 'dinner' as Recipe['category'],
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
    mockGetCurrentUserId.mockResolvedValue(mockUserId);
  });

  it('should create shopping list items from recipe ingredients', async () => {
    const chainMock = createChainableMock();
    chainMock.setResolveValue({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(chainMock);

    await shoppingListGenerator.addRecipeToShoppingList(mockRecipe);

    expect(supabase.from).toHaveBeenCalledWith('shopping_list_items');
  });

  it('should handle recipes with no ingredients gracefully', async () => {
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
