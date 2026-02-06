/**
 * Task 12.3: End-to-End Tests for Recipe CRUD Operations
 * Tests complete user workflows including edge cases
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { DishCategory, MeasurementUnit } from '@/constants/enums';
import {
  validateRecipeForm,
} from '@/lib/validations/recipe-form-schema';

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
import type { CreateRecipeInput, UpdateRecipeInput } from '@/lib/db/schema/recipe';

describe('Recipe End-to-End Tests', () => {
  let recipeService: RecipeService;
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    recipeService = new RecipeService();
    mockGetCurrentUserId.mockResolvedValue(mockUserId);
  });

  describe('Task 12.3: Recipe Creation with All Fields', () => {
    it('should validate and create recipe with all fields populated', async () => {
      const formData = {
        title: 'Italian Pasta Carbonara',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [
          { name: 'Spaghetti', quantity: 400, unit: MeasurementUnit.GRAM },
          { name: 'Eggs', quantity: 4, unit: null },
          { name: 'Parmesan cheese', quantity: 100, unit: MeasurementUnit.GRAM },
          { name: 'Pancetta', quantity: 150, unit: MeasurementUnit.GRAM },
          { name: 'Black pepper', quantity: null, unit: null },
        ],
        steps: [
          'Bring a large pot of salted water to boil',
          'Cook spaghetti according to package directions',
          'Beat eggs in a bowl and add grated parmesan',
          'Cook pancetta until crispy',
          'Drain pasta and combine with egg mixture',
          'Add pancetta and season with black pepper',
        ],
        imageUri: 'file:///mock/image/carbonara.jpg',
        prepTime: 15,
        cookTime: 20,
        tags: ['Italian', 'Dinner'],
        source: null,
      };

      const validation = validateRecipeForm(formData);
      expect(validation.success).toBe(true);

      const mockRecipeRow = {
        id: 'recipe-123',
        user_id: mockUserId,
        title: formData.title,
        servings: formData.servings,
        category: 'dinner',
        ingredients: formData.ingredients,
        steps: formData.steps,
        image_uri: formData.imageUri,
        prep_time: formData.prepTime,
        cook_time: formData.cookTime,
        tags: formData.tags,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const recipe = await recipeService.createRecipe(formData as CreateRecipeInput);

      expect(recipe.title).toBe('Italian Pasta Carbonara');
      expect(recipe.servings).toBe(4);
      expect(recipe.category).toBe(DishCategory.DINNER);
      expect(recipe.ingredients).toHaveLength(5);
      expect(recipe.steps).toHaveLength(6);
      expect(recipe.imageUri).toBeTruthy();
      expect(recipe.prepTime).toBe(15);
      expect(recipe.cookTime).toBe(20);
      expect(recipe.tags).toContain('Italian');

      expect(supabase.from).toHaveBeenCalledWith('recipes');
    });
  });

  describe('Task 12.3: Recipe Creation with Minimal Fields', () => {
    it('should validate and create recipe with only required fields', async () => {
      const minimalData = {
        title: 'Simple Scrambled Eggs',
        servings: 1,
        category: DishCategory.BREAKFAST,
        ingredients: [
          { name: 'Eggs', quantity: null, unit: null },
        ],
        steps: [
          'Beat eggs and cook in a pan',
        ],
        imageUri: null,
        prepTime: null,
        cookTime: null,
        tags: [],
        source: null,
      };

      const validation = validateRecipeForm(minimalData);
      expect(validation.success).toBe(true);

      const mockRecipeRow = {
        id: 'recipe-456',
        user_id: mockUserId,
        title: minimalData.title,
        servings: minimalData.servings,
        category: 'breakfast',
        ingredients: minimalData.ingredients,
        steps: minimalData.steps,
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

      const recipe = await recipeService.createRecipe(minimalData as CreateRecipeInput);

      expect(recipe.title).toBe('Simple Scrambled Eggs');
      expect(recipe.ingredients).toHaveLength(1);
      expect(recipe.steps).toHaveLength(1);
      expect(recipe.imageUri).toBeNull();
      expect(recipe.prepTime).toBeNull();
      expect(recipe.cookTime).toBeNull();
      expect(recipe.tags).toHaveLength(0);
    });
  });

  describe('Task 12.3: Recipe Editing with Image Changes', () => {
    it('should update recipe and change image', async () => {
      const originalRecipeRow = {
        id: 'recipe-123',
        user_id: mockUserId,
        title: 'Chocolate Cake',
        servings: 8,
        category: 'dessert',
        ingredients: [{ name: 'Chocolate', quantity: 200, unit: MeasurementUnit.GRAM }],
        steps: ['Bake the cake'],
        image_uri: 'file:///mock/image/cake1.jpg',
        prep_time: 30,
        cook_time: 45,
        tags: ['Dessert'],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const updatedRecipeRow = {
        ...originalRecipeRow,
        image_uri: 'file:///mock/image/cake2.jpg',
      };

      const chainMock = createChainableMock();
      chainMock.single
        .mockResolvedValueOnce({ data: originalRecipeRow, error: null })
        .mockResolvedValueOnce({ data: updatedRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const updateData: UpdateRecipeInput = {
        id: 'recipe-123',
        imageUri: 'file:///mock/image/cake2.jpg',
      };

      const updated = await recipeService.updateRecipe(updateData);

      expect(updated.imageUri).toBe('file:///mock/image/cake2.jpg');
      expect(chainMock.update).toHaveBeenCalled();
    });

    it('should update recipe and remove image', async () => {
      const originalRecipeRow = {
        id: 'recipe-456',
        user_id: mockUserId,
        title: 'Salad',
        servings: 2,
        category: 'lunch',
        ingredients: [{ name: 'Lettuce', quantity: null, unit: null }],
        steps: ['Toss salad'],
        image_uri: 'file:///mock/image/salad.jpg',
        prep_time: 5,
        cook_time: null,
        tags: [],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const updatedRecipeRow = {
        ...originalRecipeRow,
        image_uri: null,
      };

      const chainMock = createChainableMock();
      chainMock.single
        .mockResolvedValueOnce({ data: originalRecipeRow, error: null })
        .mockResolvedValueOnce({ data: updatedRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const updateData: UpdateRecipeInput = {
        id: 'recipe-456',
        imageUri: null,
      };

      const updated = await recipeService.updateRecipe(updateData);

      expect(updated.imageUri).toBeNull();
    });
  });

  describe('Task 12.3: Recipe Deletion with Confirmation', () => {
    it('should delete recipe', async () => {
      const mockRecipeRow = {
        id: 'recipe-123',
        user_id: mockUserId,
        title: 'Deletable Recipe',
        servings: 4,
        category: 'dinner',
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
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

      await recipeService.deleteRecipe('recipe-123');

      expect(chainMock.update).toHaveBeenCalled();
      expect(chainMock.eq).toHaveBeenCalledWith('id', 'recipe-123');
    });
  });

  describe('Task 12.3: Form Validation Edge Cases', () => {
    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.title).toBeDefined();
    });

    it('should reject title exceeding maximum length', () => {
      const longTitle = 'a'.repeat(201);
      const invalidData = {
        title: longTitle,
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.title).toBeDefined();
    });

    it('should reject recipe without ingredients', () => {
      const invalidData = {
        title: 'Test',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [],
        steps: ['Step'],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.ingredients).toBeDefined();
    });

    it('should reject recipe without steps', () => {
      const invalidData = {
        title: 'Test',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: [],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.steps).toBeDefined();
    });

    it('should reject ingredient with empty name', () => {
      const invalidData = {
        title: 'Test',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: '', quantity: 1, unit: MeasurementUnit.CUP }],
        steps: ['Step'],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty step', () => {
      const invalidData = {
        title: 'Test',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: [''],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid servings (zero)', () => {
      const invalidData = {
        title: 'Test',
        servings: 0,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.servings).toBeDefined();
    });

    it('should reject negative prep time', () => {
      const invalidData = {
        title: 'Test',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
        prepTime: -5,
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.prepTime).toBeDefined();
    });

    it('should reject negative cook time', () => {
      const invalidData = {
        title: 'Test',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
        cookTime: -10,
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.cookTime).toBeDefined();
    });
  });

  describe('Task 12.3: Image Handling Edge Cases', () => {
    it('should handle recipe with valid image URI', async () => {
      const data: CreateRecipeInput = {
        title: 'Recipe with Image',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
        imageUri: 'file:///valid/path/image.jpg',
        prepTime: null,
        cookTime: null,
        tags: [],
      };

      const mockRecipeRow = {
        id: 'recipe-img',
        user_id: mockUserId,
        title: data.title,
        servings: data.servings,
        category: 'dinner',
        ingredients: data.ingredients,
        steps: data.steps,
        image_uri: 'file:///valid/path/image.jpg',
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

      const recipe = await recipeService.createRecipe(data);

      expect(recipe.imageUri).toBe('file:///valid/path/image.jpg');
    });

    it('should handle recipe without image', async () => {
      const data: CreateRecipeInput = {
        title: 'Recipe without Image',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
        imageUri: null,
        prepTime: null,
        cookTime: null,
        tags: [],
      };

      const mockRecipeRow = {
        id: 'recipe-no-img',
        user_id: mockUserId,
        title: data.title,
        servings: data.servings,
        category: 'dinner',
        ingredients: data.ingredients,
        steps: data.steps,
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

      const recipe = await recipeService.createRecipe(data);

      expect(recipe.imageUri).toBeNull();
    });
  });

  describe('Task 12.3: Complex Recipe Scenarios', () => {
    it('should handle recipe with special characters in title', async () => {
      const data: CreateRecipeInput = {
        title: 'Mom\'s "Famous" Cookies & Brownies!',
        servings: 12,
        category: DishCategory.DESSERT,
        ingredients: [{ name: 'Chocolate chips', quantity: 2, unit: MeasurementUnit.CUP }],
        steps: ['Mix and bake'],
        imageUri: null,
        prepTime: 15,
        cookTime: 25,
        tags: ['Dessert'],
      };

      const mockRecipeRow = {
        id: 'recipe-special',
        user_id: mockUserId,
        title: data.title,
        servings: data.servings,
        category: 'dessert',
        ingredients: data.ingredients,
        steps: data.steps,
        image_uri: null,
        prep_time: 15,
        cook_time: 25,
        tags: ['Dessert'],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const recipe = await recipeService.createRecipe(data);

      expect(recipe.title).toBe('Mom\'s "Famous" Cookies & Brownies!');
    });

    it('should handle recipe with fractional quantities', async () => {
      const data: CreateRecipeInput = {
        title: 'Precision Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [
          { name: 'Flour', quantity: 2.5, unit: MeasurementUnit.CUP },
          { name: 'Sugar', quantity: 0.75, unit: MeasurementUnit.CUP },
        ],
        steps: ['Combine ingredients'],
        imageUri: null,
        prepTime: null,
        cookTime: null,
        tags: [],
      };

      const mockRecipeRow = {
        id: 'recipe-fractions',
        user_id: mockUserId,
        title: data.title,
        servings: data.servings,
        category: 'dinner',
        ingredients: data.ingredients,
        steps: data.steps,
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

      const recipe = await recipeService.createRecipe(data);

      expect(recipe.ingredients[0].quantity).toBe(2.5);
      expect(recipe.ingredients[1].quantity).toBe(0.75);
    });

    it('should handle recipe with many tags from different categories', async () => {
      const data: CreateRecipeInput = {
        title: 'Multi-Category Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
        imageUri: null,
        prepTime: null,
        cookTime: null,
        tags: ['Italian', 'Vegetarian', 'Dinner', 'Baking', 'Gluten-Free'],
      };

      const mockRecipeRow = {
        id: 'recipe-multi-tag',
        user_id: mockUserId,
        title: data.title,
        servings: data.servings,
        category: 'dinner',
        ingredients: data.ingredients,
        steps: data.steps,
        image_uri: null,
        prep_time: null,
        cook_time: null,
        tags: ['Italian', 'Vegetarian', 'Dinner', 'Baking', 'Gluten-Free'],
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        deleted_at: null,
      };

      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockRecipeRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const recipe = await recipeService.createRecipe(data);

      expect(recipe.tags).toHaveLength(5);
      expect(recipe.tags).toContain('Italian');
      expect(recipe.tags).toContain('Vegetarian');
      expect(recipe.tags).toContain('Gluten-Free');
    });
  });
});
