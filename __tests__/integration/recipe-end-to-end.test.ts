/**
 * Task 12.3: End-to-End Tests for Recipe CRUD Operations
 * Tests complete user workflows including edge cases
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DishCategory, MeasurementUnit } from '@/constants/enums';
import {
  RecipeFormSchema,
  validateRecipeForm,
} from '@/lib/validations/recipe-form-schema';

const mockDbConnection = {
  executeSelect: jest.fn(),
  executeQuery: jest.fn(),
  executeTransaction: jest.fn((fn) => fn()),
};

jest.mock('@/lib/db/connection', () => ({
  dbConnection: mockDbConnection,
  DatabaseError: class extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
}));

jest.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).substring(7),
}));

import { recipeService } from '@/lib/db/services/recipe-service';
import type { CreateRecipeInput, UpdateRecipeInput } from '@/lib/db/schema/recipe';

describe('Recipe End-to-End Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnection.executeSelect.mockResolvedValue([]);
    mockDbConnection.executeQuery.mockResolvedValue({ rowsAffected: 1 });
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

      expect(mockDbConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        expect.any(Array)
      );
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
      const mockRecipeRow = {
        id: 'recipe-123',
        title: 'Chocolate Cake',
        servings: 8,
        category: DishCategory.DESSERT,
        ingredients: JSON.stringify([{ name: 'Chocolate', quantity: 200, unit: MeasurementUnit.GRAM }]),
        steps: JSON.stringify(['Bake the cake']),
        imageUri: 'file:///mock/image/cake1.jpg',
        prepTime: 30,
        cookTime: 45,
        tags: JSON.stringify(['Dessert']),
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockDbConnection.executeSelect.mockResolvedValueOnce([mockRecipeRow]);

      const updateData: UpdateRecipeInput = {
        id: 'recipe-123',
        imageUri: 'file:///mock/image/cake2.jpg',
      };

      const updated = await recipeService.updateRecipe(updateData);

      expect(updated.imageUri).toBe('file:///mock/image/cake2.jpg');
      expect(mockDbConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.any(Array)
      );
    });

    it('should update recipe and remove image', async () => {
      const mockRecipeRow = {
        id: 'recipe-456',
        title: 'Salad',
        servings: 2,
        category: DishCategory.LUNCH,
        ingredients: JSON.stringify([{ name: 'Lettuce', quantity: null, unit: null }]),
        steps: JSON.stringify(['Toss salad']),
        imageUri: 'file:///mock/image/salad.jpg',
        prepTime: 5,
        cookTime: null,
        tags: JSON.stringify([]),
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockDbConnection.executeSelect.mockResolvedValueOnce([mockRecipeRow]);

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
        title: 'Deletable Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: JSON.stringify([{ name: 'Test', quantity: null, unit: null }]),
        steps: JSON.stringify(['Step']),
        imageUri: null,
        prepTime: null,
        cookTime: null,
        tags: JSON.stringify([]),
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockDbConnection.executeSelect.mockResolvedValueOnce([mockRecipeRow]);

      await recipeService.deleteRecipe('recipe-123');

      expect(mockDbConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.arrayContaining(['recipe-123'])
      );
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

      const recipe = await recipeService.createRecipe(data);

      expect(recipe.tags).toHaveLength(5);
      expect(recipe.tags).toContain('Italian');
      expect(recipe.tags).toContain('Vegetarian');
      expect(recipe.tags).toContain('Gluten-Free');
    });
  });
});
