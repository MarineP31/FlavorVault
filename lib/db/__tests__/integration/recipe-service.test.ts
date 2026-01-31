import { DishCategory, MeasurementUnit } from '@/constants/enums';
import type { Recipe, CreateRecipeInput, UpdateRecipeInput, Ingredient } from '@/lib/db/schema/recipe';

const mockGetCurrentUserId = jest.fn();
const mockSupabaseFrom = jest.fn();
const mockSupabaseSelect = jest.fn();
const mockSupabaseInsert = jest.fn();
const mockSupabaseUpdate = jest.fn();
const mockSupabaseDelete = jest.fn();
const mockSupabaseEq = jest.fn();
const mockSupabaseIs = jest.fn();
const mockSupabaseIlike = jest.fn();
const mockSupabaseContains = jest.fn();
const mockSupabaseOrder = jest.fn();
const mockSupabaseRange = jest.fn();
const mockSupabaseSingle = jest.fn();

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

import { RecipeService } from '@/lib/db/services/recipe-service';
import { supabase, SupabaseError } from '@/lib/supabase/client';

describe('RecipeService Integration Tests', () => {
  let recipeService: RecipeService;

  const mockUserId = 'user-123';

  const mockIngredients: Ingredient[] = [
    { name: 'flour', quantity: 2, unit: MeasurementUnit.CUP },
    { name: 'sugar', quantity: 1, unit: MeasurementUnit.CUP },
  ];

  const mockRecipeInput: CreateRecipeInput = {
    title: 'Test Recipe',
    servings: 4,
    category: DishCategory.DINNER,
    ingredients: mockIngredients,
    steps: ['Step 1', 'Step 2'],
    prepTime: 15,
    cookTime: 30,
    tags: ['Italian'],
  };

  const mockRecipeRow = {
    id: 'recipe-123',
    user_id: mockUserId,
    title: 'Test Recipe',
    servings: 4,
    category: 'dinner',
    ingredients: mockIngredients,
    steps: ['Step 1', 'Step 2'],
    image_uri: null,
    prep_time: 15,
    cook_time: 30,
    tags: ['Italian'],
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    deleted_at: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    recipeService = new RecipeService();
    mockGetCurrentUserId.mockResolvedValue(mockUserId);
  });

  describe('createRecipe', () => {
    it('should create a recipe successfully', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await recipeService.createRecipe(mockRecipeInput);

      expect(result.title).toBe('Test Recipe');
      expect(result.servings).toBe(4);
      expect(result.category).toBe(DishCategory.DINNER);
      expect(supabase.from).toHaveBeenCalledWith('recipes');
    });

    it('should throw validation error for missing title', async () => {
      const invalidInput: CreateRecipeInput = {
        ...mockRecipeInput,
        title: '',
      };

      await expect(recipeService.createRecipe(invalidInput)).rejects.toThrow(
        'Recipe validation failed'
      );
    });

    it('should throw validation error for invalid servings', async () => {
      const invalidInput: CreateRecipeInput = {
        ...mockRecipeInput,
        servings: 0,
      };

      await expect(recipeService.createRecipe(invalidInput)).rejects.toThrow(
        'Recipe validation failed'
      );
    });

    it('should throw validation error for empty ingredients', async () => {
      const invalidInput: CreateRecipeInput = {
        ...mockRecipeInput,
        ingredients: [],
      };

      await expect(recipeService.createRecipe(invalidInput)).rejects.toThrow(
        'Recipe validation failed'
      );
    });

    it('should throw validation error for empty steps', async () => {
      const invalidInput: CreateRecipeInput = {
        ...mockRecipeInput,
        steps: [],
      };

      await expect(recipeService.createRecipe(invalidInput)).rejects.toThrow(
        'Recipe validation failed'
      );
    });

    it('should handle database errors', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(recipeService.createRecipe(mockRecipeInput)).rejects.toThrow(
        'Failed to create recipe'
      );
    });
  });

  describe('getRecipeById', () => {
    it('should return recipe when found', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await recipeService.getRecipeById('recipe-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('recipe-123');
      expect(result?.title).toBe('Test Recipe');
    });

    it('should return null when recipe not found', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await recipeService.getRecipeById('non-existent');

      expect(result).toBeNull();
    });

    it('should only return recipes for current user', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await recipeService.getRecipeById('recipe-123');

      expect(chainMock.eq).toHaveBeenCalledWith('user_id', mockUserId);
    });
  });

  describe('getAllRecipes', () => {
    it('should return all recipes for user', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [mockRecipeRow], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await recipeService.getAllRecipes();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Recipe');
    });

    it('should support pagination with limit and offset', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [mockRecipeRow], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await recipeService.getAllRecipes({ limit: 10, offset: 5 });

      expect(chainMock.range).toHaveBeenCalledWith(5, 14);
    });

    it('should exclude deleted recipes by default', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await recipeService.getAllRecipes();

      expect(chainMock.is).toHaveBeenCalledWith('deleted_at', null);
    });

    it('should include deleted recipes when requested', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await recipeService.getAllRecipes({ includeDeleted: true });

      expect(chainMock.is).not.toHaveBeenCalled();
    });

    it('should return empty array when no recipes exist', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await recipeService.getAllRecipes();

      expect(result).toEqual([]);
    });
  });

  describe('updateRecipe', () => {
    it('should update recipe successfully', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValueOnce({ data: mockRecipeRow, error: null });
      chainMock.single.mockResolvedValueOnce({
        data: { ...mockRecipeRow, title: 'Updated Recipe' },
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const updateInput: UpdateRecipeInput = {
        id: 'recipe-123',
        title: 'Updated Recipe',
      };

      const result = await recipeService.updateRecipe(updateInput);

      expect(result.title).toBe('Updated Recipe');
    });

    it('should throw NOT_FOUND when recipe does not exist', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const updateInput: UpdateRecipeInput = {
        id: 'non-existent',
        title: 'Updated Recipe',
      };

      await expect(recipeService.updateRecipe(updateInput)).rejects.toThrow(
        'not found'
      );
    });

    it('should throw validation error for invalid update data', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const updateInput: UpdateRecipeInput = {
        id: 'recipe-123',
        title: '',
      };

      await expect(recipeService.updateRecipe(updateInput)).rejects.toThrow(
        'Recipe validation failed'
      );
    });
  });

  describe('deleteRecipe', () => {
    it('should soft delete recipe successfully', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
            (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await recipeService.deleteRecipe('recipe-123');

      expect(chainMock.update).toHaveBeenCalled();
      expect(chainMock.eq).toHaveBeenCalledWith('id', 'recipe-123');
    });

    it('should throw NOT_FOUND when recipe does not exist', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(recipeService.deleteRecipe('non-existent')).rejects.toThrow(
        'not found'
      );
    });
  });

  describe('searchRecipes', () => {
    it('should return matching recipes', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [mockRecipeRow], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await recipeService.searchRecipes('Test');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Recipe');
    });

    it('should return empty array for empty search term', async () => {
      const result = await recipeService.searchRecipes('');

      expect(result).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should return empty array for whitespace-only search term', async () => {
      const result = await recipeService.searchRecipes('   ');

      expect(result).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should throw validation error for search term over 200 characters', async () => {
      const longSearchTerm = 'a'.repeat(201);

      await expect(recipeService.searchRecipes(longSearchTerm)).rejects.toThrow(
        'Search term too long'
      );
    });

    it('should return empty array when no recipes match', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await recipeService.searchRecipes('NonExistent');

      expect(result).toEqual([]);
    });

    it('should search case-insensitively using ilike', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await recipeService.searchRecipes('test');

      expect(chainMock.ilike).toHaveBeenCalledWith('title', '%test%');
    });
  });

  describe('getRecipeCount', () => {
    it('should return recipe count', async () => {
      const chainMock = createChainableMock();
      chainMock.is.mockResolvedValue({ count: 5, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await recipeService.getRecipeCount();

      expect(result).toBe(5);
    });

    it('should return 0 when no recipes exist', async () => {
      const chainMock = createChainableMock();
      chainMock.is.mockResolvedValue({ count: 0, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await recipeService.getRecipeCount();

      expect(result).toBe(0);
    });
  });

  describe('getRecipesByCategory', () => {
    it('should return recipes filtered by category', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [mockRecipeRow], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await recipeService.getRecipesByCategory('dinner');

      expect(result).toHaveLength(1);
      expect(chainMock.eq).toHaveBeenCalledWith('category', 'dinner');
    });
  });

  describe('getRecipesByTag', () => {
    it('should return recipes filtered by tag', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [mockRecipeRow], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await recipeService.getRecipesByTag('Italian');

      expect(result).toHaveLength(1);
      expect(chainMock.contains).toHaveBeenCalledWith('tags', ['Italian']);
    });
  });
});
