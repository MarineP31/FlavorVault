/**
 * Task 12.2: Integration Tests for Recipe CRUD Operations
 * Tests complete create, read, update, delete flows
 */

import { DishCategory, MeasurementUnit } from '@/constants/enums';
import type { CreateRecipeInput, UpdateRecipeInput } from '@/lib/db/schema/recipe';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

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

jest.mock('@/lib/supabase/image-storage', () => ({
  uploadRecipeImage: jest.fn().mockResolvedValue('https://mock-storage.com/image.jpg'),
  uploadImageIfLocal: jest.fn().mockImplementation((uri: string | null) =>
    uri ? Promise.resolve(uri) : Promise.resolve(null)
  ),
  deleteRecipeImage: jest.fn().mockResolvedValue(undefined),
  isSupabaseStorageUrl: jest.fn().mockReturnValue(false),
}));

import { RecipeService } from '@/lib/db/services/recipe-service';
import { supabase } from '@/lib/supabase/client';

describe('Recipe CRUD Integration Tests', () => {
  let recipeService: RecipeService;
  let createdRecipeId: string | null = null;
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    recipeService = new RecipeService();
    mockGetCurrentUserId.mockResolvedValue(mockUserId);
  });

  afterEach(async () => {
    createdRecipeId = null;
  });

  describe('Task 12.2: Complete Create Flow', () => {
    it('should create recipe with all fields and save to database', async () => {
      const recipeInput: CreateRecipeInput = {
        title: 'Integration Test Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [
          { name: 'Flour', quantity: 2, unit: MeasurementUnit.CUP },
          { name: 'Sugar', quantity: 1, unit: MeasurementUnit.CUP },
        ],
        steps: [
          'Mix dry ingredients',
          'Add wet ingredients',
          'Bake at 350°F for 30 minutes',
        ],
        imageUri: null,
        prepTime: 15,
        cookTime: 30,
        tags: ['Italian', 'Vegetarian'],
      };

      const mockRecipeRow = {
        id: 'recipe-123',
        user_id: mockUserId,
        title: 'Integration Test Recipe',
        servings: 4,
        category: 'dinner',
        ingredients: recipeInput.ingredients,
        steps: recipeInput.steps,
        image_uri: null,
        prep_time: 15,
        cook_time: 30,
        tags: ['Italian', 'Vegetarian'],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const recipe = await recipeService.createRecipe(recipeInput);
      createdRecipeId = recipe.id;

      expect(recipe).toBeDefined();
      expect(recipe.id).toBeDefined();
      expect(recipe.title).toBe('Integration Test Recipe');
      expect(recipe.servings).toBe(4);
      expect(recipe.ingredients).toHaveLength(2);
      expect(recipe.steps).toHaveLength(3);
      expect(recipe.tags).toHaveLength(2);
    });

    it('should create recipe with minimal fields', async () => {
      const minimalInput: CreateRecipeInput = {
        title: 'Minimal Recipe',
        servings: 2,
        category: DishCategory.BREAKFAST,
        ingredients: [{ name: 'Egg', quantity: null, unit: null }],
        steps: ['Cook the egg'],
        imageUri: null,
        prepTime: null,
        cookTime: null,
        tags: [],
      };

      const mockRecipeRow = {
        id: 'recipe-456',
        user_id: mockUserId,
        title: 'Minimal Recipe',
        servings: 2,
        category: 'breakfast',
        ingredients: minimalInput.ingredients,
        steps: minimalInput.steps,
        image_uri: null,
        prep_time: null,
        cook_time: null,
        tags: [],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const recipe = await recipeService.createRecipe(minimalInput);
      createdRecipeId = recipe.id;

      expect(recipe).toBeDefined();
      expect(recipe.title).toBe('Minimal Recipe');
      expect(recipe.ingredients).toHaveLength(1);
      expect(recipe.steps).toHaveLength(1);
      expect(recipe.tags).toHaveLength(0);
    });

    it('should complete create operation in under 1 second', async () => {
      const startTime = Date.now();

      const recipeInput: CreateRecipeInput = {
        title: 'Performance Test Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: Array(10).fill(null).map((_, i) => ({
          name: `Ingredient ${i + 1}`,
          quantity: i + 1,
          unit: MeasurementUnit.CUP,
        })),
        steps: Array(8).fill(null).map((_, i) => `Step ${i + 1}`),
        imageUri: null,
        prepTime: 15,
        cookTime: 30,
        tags: ['Italian'],
      };

      const mockRecipeRow = {
        id: 'recipe-789',
        user_id: mockUserId,
        title: recipeInput.title,
        servings: recipeInput.servings,
        category: 'dinner',
        ingredients: recipeInput.ingredients,
        steps: recipeInput.steps,
        image_uri: null,
        prep_time: 15,
        cook_time: 30,
        tags: ['Italian'],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const recipe = await recipeService.createRecipe(recipeInput);
      createdRecipeId = recipe.id;

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Task 12.2: Complete Read Flow', () => {
    it('should fetch recipe by ID from database', async () => {
      const mockRecipeRow = {
        id: 'recipe-123',
        user_id: mockUserId,
        title: 'Read Test Recipe',
        servings: 4,
        category: 'lunch',
        ingredients: [{ name: 'Test Ingredient', quantity: 1, unit: MeasurementUnit.CUP }],
        steps: ['Test step'],
        image_uri: null,
        prep_time: 10,
        cook_time: 20,
        tags: ['Mexican'],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const recipe = await recipeService.getRecipeById('recipe-123');

      expect(recipe).toBeDefined();
      expect(recipe?.id).toBe('recipe-123');
      expect(recipe?.title).toBe('Read Test Recipe');
      expect(recipe?.servings).toBe(4);
    });

    it('should return null for non-existent recipe', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const recipe = await recipeService.getRecipeById('non-existent-id');

      expect(recipe).toBeNull();
    });

    it('should fetch all recipe data including relationships', async () => {
      const mockRecipeRow = {
        id: 'recipe-123',
        user_id: mockUserId,
        title: 'Full Recipe',
        servings: 4,
        category: 'lunch',
        ingredients: [{ name: 'Test Ingredient', quantity: 1, unit: MeasurementUnit.CUP }],
        steps: ['Test step'],
        image_uri: null,
        prep_time: 10,
        cook_time: 20,
        tags: ['Mexican'],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const recipe = await recipeService.getRecipeById('recipe-123');

      expect(recipe).toBeDefined();
      expect(recipe?.ingredients).toBeDefined();
      expect(recipe?.steps).toBeDefined();
      expect(recipe?.tags).toBeDefined();
      expect(recipe?.ingredients.length).toBeGreaterThan(0);
      expect(recipe?.steps.length).toBeGreaterThan(0);
    });

    it('should complete read operation in under 1 second', async () => {
      const mockRecipeRow = {
        id: 'recipe-123',
        user_id: mockUserId,
        title: 'Performance Read Recipe',
        servings: 4,
        category: 'dinner',
        ingredients: [],
        steps: [],
        image_uri: null,
        prep_time: null,
        cook_time: null,
        tags: [],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const startTime = Date.now();
      await recipeService.getRecipeById('recipe-123');
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Task 12.2: Complete Update Flow', () => {
    it('should update recipe and save changes to database', async () => {
      const originalRecipeRow = {
        id: 'recipe-123',
        user_id: mockUserId,
        title: 'Update Test Recipe',
        servings: 4,
        category: 'dinner',
        ingredients: [{ name: 'Original Ingredient', quantity: 1, unit: MeasurementUnit.CUP }],
        steps: ['Original step'],
        image_uri: null,
        prep_time: 10,
        cook_time: 20,
        tags: ['Asian'],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const updatedRecipeRow = {
        ...originalRecipeRow,
        title: 'Updated Recipe Title',
        servings: 6,
        category: 'lunch',
        ingredients: [
          { name: 'Updated Ingredient 1', quantity: 2, unit: MeasurementUnit.TSP },
          { name: 'Updated Ingredient 2', quantity: 3, unit: MeasurementUnit.CUP },
        ],
        steps: ['Updated step 1', 'Updated step 2'],
        prep_time: 15,
        cook_time: 25,
        tags: ['Italian', 'Vegetarian'],
      };

      const chainMock = createChainableMock();
      chainMock.single
        .mockResolvedValueOnce({ data: originalRecipeRow, error: null })
        .mockResolvedValueOnce({ data: updatedRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const updateInput: UpdateRecipeInput = {
        id: 'recipe-123',
        title: 'Updated Recipe Title',
        servings: 6,
        category: DishCategory.LUNCH,
        ingredients: [
          { name: 'Updated Ingredient 1', quantity: 2, unit: MeasurementUnit.TSP },
          { name: 'Updated Ingredient 2', quantity: 3, unit: MeasurementUnit.CUP },
        ],
        steps: ['Updated step 1', 'Updated step 2'],
        prepTime: 15,
        cookTime: 25,
        tags: ['Italian', 'Vegetarian'],
      };

      const updatedRecipe = await recipeService.updateRecipe(updateInput);

      expect(updatedRecipe.title).toBe('Updated Recipe Title');
      expect(updatedRecipe.servings).toBe(6);
      expect(updatedRecipe.ingredients).toHaveLength(2);
      expect(updatedRecipe.steps).toHaveLength(2);
      expect(updatedRecipe.tags).toHaveLength(2);
    });

    it('should handle partial updates', async () => {
      const originalRecipeRow = {
        id: 'recipe-123',
        user_id: mockUserId,
        title: 'Original Title',
        servings: 4,
        category: 'dinner',
        ingredients: [{ name: 'Ingredient', quantity: 1, unit: MeasurementUnit.CUP }],
        steps: ['Step'],
        image_uri: null,
        prep_time: 10,
        cook_time: 20,
        tags: ['Asian'],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const updatedRecipeRow = {
        ...originalRecipeRow,
        title: 'Only Title Updated',
      };

      const chainMock = createChainableMock();
      chainMock.single
        .mockResolvedValueOnce({ data: originalRecipeRow, error: null })
        .mockResolvedValueOnce({ data: updatedRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const updateInput: UpdateRecipeInput = {
        id: 'recipe-123',
        title: 'Only Title Updated',
      };

      const updatedRecipe = await recipeService.updateRecipe(updateInput);

      expect(updatedRecipe.title).toBe('Only Title Updated');
      expect(updatedRecipe.servings).toBe(4);
      expect(updatedRecipe.category).toBe(DishCategory.DINNER);
    });
  });

  describe('Task 12.2: Complete Delete Flow', () => {
    it('should delete recipe from database', async () => {
      const mockRecipeRow = {
        id: 'recipe-123',
        user_id: mockUserId,
        title: 'Delete Test Recipe',
        servings: 4,
        category: 'dinner',
        ingredients: [{ name: 'Test Ingredient', quantity: 1, unit: MeasurementUnit.CUP }],
        steps: ['Test step'],
        image_uri: null,
        prep_time: 10,
        cook_time: 20,
        tags: [],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await recipeService.deleteRecipe('recipe-123');

      expect(chainMock.update).toHaveBeenCalled();
      expect(chainMock.eq).toHaveBeenCalledWith('id', 'recipe-123');
    });

    it('should throw error when deleting non-existent recipe', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(recipeService.deleteRecipe('non-existent-id')).rejects.toThrow();
    });
  });

  describe('Task 12.2: Error Handling Scenarios', () => {
    it('should handle validation errors on create', async () => {
      const invalidInput = {
        title: '',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [],
        steps: [],
      } as CreateRecipeInput;

      await expect(recipeService.createRecipe(invalidInput)).rejects.toThrow();
    });

    it('should handle validation errors on update', async () => {
      const mockRecipeRow = {
        id: 'recipe-123',
        user_id: mockUserId,
        title: 'Valid Recipe',
        servings: 4,
        category: 'dinner',
        ingredients: [{ name: 'Ingredient', quantity: null, unit: null }],
        steps: ['Step'],
        image_uri: null,
        prep_time: null,
        cook_time: null,
        tags: [],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const invalidUpdate = {
        id: 'recipe-123',
        title: '',
      } as UpdateRecipeInput;

      await expect(recipeService.updateRecipe(invalidUpdate)).rejects.toThrow();
    });

    it('should handle update of non-existent recipe', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const updateInput: UpdateRecipeInput = {
        id: 'non-existent-id',
        title: 'This should fail',
      };

      await expect(recipeService.updateRecipe(updateInput)).rejects.toThrow();
    });
  });

  describe('Task 12.4: Performance with Large Data', () => {
    it('should handle recipe with many ingredients (30+) efficiently', async () => {
      const startTime = Date.now();

      const largeRecipeInput: CreateRecipeInput = {
        title: 'Large Recipe with Many Ingredients',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: Array(35).fill(null).map((_, i) => ({
          name: `Ingredient ${i + 1}`,
          quantity: i + 1,
          unit: MeasurementUnit.CUP,
        })),
        steps: ['Step 1'],
        imageUri: null,
        prepTime: 30,
        cookTime: 60,
        tags: ['Complex'],
      };

      const mockRecipeRow = {
        id: 'recipe-large',
        user_id: mockUserId,
        title: largeRecipeInput.title,
        servings: largeRecipeInput.servings,
        category: 'dinner',
        ingredients: largeRecipeInput.ingredients,
        steps: largeRecipeInput.steps,
        image_uri: null,
        prep_time: 30,
        cook_time: 60,
        tags: ['Complex'],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const recipe = await recipeService.createRecipe(largeRecipeInput);
      createdRecipeId = recipe.id;

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(recipe.ingredients).toHaveLength(35);
      expect(duration).toBeLessThan(1500);
    });

    it('should handle recipe with many steps (20+) efficiently', async () => {
      const startTime = Date.now();

      const largeRecipeInput: CreateRecipeInput = {
        title: 'Large Recipe with Many Steps',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Ingredient 1', quantity: 1, unit: MeasurementUnit.CUP }],
        steps: Array(25).fill(null).map((_, i) => `Step ${i + 1}: Detailed instruction`),
        imageUri: null,
        prepTime: 30,
        cookTime: 60,
        tags: ['Complex'],
      };

      const mockRecipeRow = {
        id: 'recipe-steps',
        user_id: mockUserId,
        title: largeRecipeInput.title,
        servings: largeRecipeInput.servings,
        category: 'dinner',
        ingredients: largeRecipeInput.ingredients,
        steps: largeRecipeInput.steps,
        image_uri: null,
        prep_time: 30,
        cook_time: 60,
        tags: ['Complex'],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const recipe = await recipeService.createRecipe(largeRecipeInput);
      createdRecipeId = recipe.id;

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(recipe.steps).toHaveLength(25);
      expect(duration).toBeLessThan(1500);
    });
  });
});
