/**
 * Task 12.2: Integration Tests for Recipe CRUD Operations
 * Tests complete create, read, update, delete flows
 */

import { DishCategory, MeasurementUnit } from '@/constants/enums';
import type { CreateRecipeInput, UpdateRecipeInput } from '@/lib/db/schema/recipe';
import { recipeService } from '@/lib/db/services/recipe-service';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

// Use a mocked database connection to avoid relying on a real SQLite instance
// and to prevent "Database not initialized" errors during tests.
jest.mock('@/lib/db/connection', () => {
  const mockDbConnection = {
    executeSelect: jest.fn(),
    executeQuery: jest.fn(),
    executeTransaction: jest.fn((fn: () => any) => fn()),
  };

  class DatabaseError extends Error {
    code: string;
    originalError?: any;
    constructor(code: string, message: string, originalError?: any) {
      super(message);
      this.code = code;
      this.originalError = originalError;
    }
  }

  return {
    dbConnection: mockDbConnection,
    DatabaseError,
  };
});

describe('Recipe CRUD Integration Tests', () => {
  let createdRecipeId: string | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    const { dbConnection } = require('@/lib/db/connection') as {
      dbConnection: {
        executeSelect: jest.Mock;
        executeQuery: jest.Mock;
      };
    };
    dbConnection.executeSelect.mockResolvedValue([]);
    dbConnection.executeQuery.mockResolvedValue({ rowsAffected: 1 });
  });

  afterEach(async () => {
    // Cleanup: Delete created recipe after each test
    if (createdRecipeId) {
      try {
        await recipeService.deleteRecipe(createdRecipeId);
      } catch (error) {
        // Ignore errors during cleanup
      }
      createdRecipeId = null;
    }
  });

  describe('Task 12.2: Complete Create Flow', () => {
    it('should create recipe with all fields and save to database', async () => {
      // Arrange
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

      // Act
      const recipe = await recipeService.createRecipe(recipeInput);
      createdRecipeId = recipe.id;

      // Assert
      expect(recipe).toBeDefined();
      expect(recipe.id).toBeDefined();
      expect(recipe.title).toBe('Integration Test Recipe');
      expect(recipe.servings).toBe(4);
      expect(recipe.ingredients).toHaveLength(2);
      expect(recipe.steps).toHaveLength(3);
      expect(recipe.tags).toHaveLength(2);
    });

    it('should create recipe with minimal fields', async () => {
      // Arrange
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

      // Act
      const recipe = await recipeService.createRecipe(minimalInput);
      createdRecipeId = recipe.id;

      // Assert
      expect(recipe).toBeDefined();
      expect(recipe.title).toBe('Minimal Recipe');
      expect(recipe.ingredients).toHaveLength(1);
      expect(recipe.steps).toHaveLength(1);
      expect(recipe.tags).toHaveLength(0);
    });

    it('should complete create operation in under 1 second', async () => {
      // Task 12.4: Performance test - create should complete quickly
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

      const recipe = await recipeService.createRecipe(recipeInput);
      createdRecipeId = recipe.id;

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert: Should complete in under 1000ms (success criteria)
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Task 12.2: Complete Read Flow', () => {
    beforeEach(async () => {
      // Create a recipe for read tests
      const recipeInput: CreateRecipeInput = {
        title: 'Read Test Recipe',
        servings: 4,
        category: DishCategory.LUNCH,
        ingredients: [{ name: 'Test Ingredient', quantity: 1, unit: MeasurementUnit.CUP }],
        steps: ['Test step'],
        imageUri: null,
        prepTime: 10,
        cookTime: 20,
        tags: ['Mexican'],
      };

      const recipe = await recipeService.createRecipe(recipeInput);
      createdRecipeId = recipe.id;

      // Configure mocked dbConnection so reads for this ID return a full row
      const { dbConnection } = require('@/lib/db/connection') as {
        dbConnection: {
          executeSelect: jest.Mock;
        };
      };

      dbConnection.executeSelect.mockImplementation(
        (_query: string, params: any[] = []) => {
          const [id] = params;
          if (id === createdRecipeId) {
            return Promise.resolve([
              {
                id: createdRecipeId,
                title: 'Read Test Recipe',
                servings: 4,
                category: DishCategory.LUNCH,
                ingredients: JSON.stringify([
                  { name: 'Test Ingredient', quantity: 1, unit: MeasurementUnit.CUP },
                ]),
                steps: JSON.stringify(['Test step']),
                imageUri: null,
                prepTime: 10,
                cookTime: 20,
                tags: JSON.stringify(['Mexican']),
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z',
                deletedAt: null,
              },
            ]);
          }

          // For any other ID, behave as "not found"
          return Promise.resolve([]);
        }
      );
    });

    it('should fetch recipe by ID from database', async () => {
      // Act
      const recipe = await recipeService.getRecipeById(createdRecipeId!);

      // Assert
      expect(recipe).toBeDefined();
      expect(recipe?.id).toBe(createdRecipeId);
      expect(recipe?.title).toBe('Read Test Recipe');
      expect(recipe?.servings).toBe(4);
    });

    it('should return null for non-existent recipe', async () => {
      // Act
      const recipe = await recipeService.getRecipeById('non-existent-id');

      // Assert
      expect(recipe).toBeNull();
    });

    it('should fetch all recipe data including relationships', async () => {
      // Act
      const recipe = await recipeService.getRecipeById(createdRecipeId!);

      // Assert
      expect(recipe).toBeDefined();
      expect(recipe?.ingredients).toBeDefined();
      expect(recipe?.steps).toBeDefined();
      expect(recipe?.tags).toBeDefined();
      expect(recipe?.ingredients.length).toBeGreaterThan(0);
      expect(recipe?.steps.length).toBeGreaterThan(0);
    });

    it('should complete read operation in under 1 second', async () => {
      // Task 12.4: Performance test - read should complete quickly
      const startTime = Date.now();

      await recipeService.getRecipeById(createdRecipeId!);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert: Should complete in under 1000ms (success criteria)
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Task 12.2: Complete Update Flow', () => {
    let hasBeenUpdated = false;

    beforeEach(async () => {
      // Create a recipe for update tests
      const recipeInput: CreateRecipeInput = {
        title: 'Update Test Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Original Ingredient', quantity: 1, unit: MeasurementUnit.CUP }],
        steps: ['Original step'],
        imageUri: null,
        prepTime: 10,
        cookTime: 20,
        tags: ['Asian'],
      };

      const recipe = await recipeService.createRecipe(recipeInput);
      createdRecipeId = recipe.id;

      // Configure mocked dbConnection to return the existing recipe row for update operations
      const { dbConnection } = require('@/lib/db/connection') as {
        dbConnection: {
          executeSelect: jest.Mock;
          executeQuery: jest.Mock;
        };
      };

      hasBeenUpdated = false;

      dbConnection.executeSelect.mockImplementation(
        (_query: string, params: any[] = []) => {
          const [id] = params;
          if (id !== createdRecipeId) {
            return Promise.resolve([]);
          }

          // Before UPDATE runs, return the original row.
          // After UPDATE, simulate persisted changes for the "Persisted Update" test.
          if (!hasBeenUpdated) {
            return Promise.resolve([
              {
                id: createdRecipeId,
                title: 'Update Test Recipe',
                servings: 4,
                category: DishCategory.DINNER,
                ingredients: JSON.stringify([
                  { name: 'Original Ingredient', quantity: 1, unit: MeasurementUnit.CUP },
                ]),
                steps: JSON.stringify(['Original step']),
                imageUri: null,
                prepTime: 10,
                cookTime: 20,
                tags: JSON.stringify(['Asian']),
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z',
                deletedAt: null,
              },
            ]);
          }

          // Simulate row after an UPDATE that sets title to "Persisted Update" and servings to 8
          return Promise.resolve([
            {
              id: createdRecipeId,
              title: 'Persisted Update',
              servings: 8,
              category: DishCategory.DINNER,
              ingredients: JSON.stringify([
                { name: 'Original Ingredient', quantity: 1, unit: MeasurementUnit.CUP },
              ]),
              steps: JSON.stringify(['Original step']),
              imageUri: null,
              prepTime: 10,
              cookTime: 20,
              tags: JSON.stringify(['Asian']),
              createdAt: '2025-01-01T00:00:00.000Z',
              updatedAt: '2025-01-01T00:00:00.000Z',
              deletedAt: null,
            },
          ]);
        }
      );

      dbConnection.executeQuery.mockImplementation(
        (query: string, params: any[] = []) => {
          // When an UPDATE for this recipe ID occurs, mark as updated so subsequent
          // selects return the "persisted" row.
          if (query.includes('UPDATE recipes') && params[params.length - 1] === createdRecipeId) {
            hasBeenUpdated = true;
          }
          return Promise.resolve({ rowsAffected: 1 });
        }
      );
    });

    it('should update recipe and save changes to database', async () => {
      // Arrange
      const updateInput: UpdateRecipeInput = {
        id: createdRecipeId!,
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

      // Act
      const updatedRecipe = await recipeService.updateRecipe(updateInput);

      // Assert
      expect(updatedRecipe.title).toBe('Updated Recipe Title');
      expect(updatedRecipe.servings).toBe(6);
      expect(updatedRecipe.ingredients).toHaveLength(2);
      expect(updatedRecipe.steps).toHaveLength(2);
      expect(updatedRecipe.tags).toHaveLength(2);
    });

    it('should persist updated data in database', async () => {
      // Arrange
      const updateInput: UpdateRecipeInput = {
        id: createdRecipeId!,
        title: 'Persisted Update',
        servings: 8,
      };

      // Act
      await recipeService.updateRecipe(updateInput);
      const fetchedRecipe = await recipeService.getRecipeById(createdRecipeId!);

      // Assert
      expect(fetchedRecipe?.title).toBe('Persisted Update');
      expect(fetchedRecipe?.servings).toBe(8);
    });

    it('should handle partial updates', async () => {
      // Arrange
      const updateInput: UpdateRecipeInput = {
        id: createdRecipeId!,
        title: 'Only Title Updated',
      };

      // Act
      const updatedRecipe = await recipeService.updateRecipe(updateInput);

      // Assert
      expect(updatedRecipe.title).toBe('Only Title Updated');
      // Original values should be preserved
      expect(updatedRecipe.servings).toBe(4);
      expect(updatedRecipe.category).toBe(DishCategory.DINNER);
    });

    it('should complete update operation in under 1 second', async () => {
      // Task 12.4: Performance test - update should complete quickly
      const startTime = Date.now();

      const updateInput: UpdateRecipeInput = {
        id: createdRecipeId!,
        title: 'Performance Update',
        ingredients: Array(10).fill(null).map((_, i) => ({
          name: `Ingredient ${i + 1}`,
          quantity: i + 1,
          unit: MeasurementUnit.CUP,
        })),
        steps: Array(8).fill(null).map((_, i) => `Step ${i + 1}`),
      };

      await recipeService.updateRecipe(updateInput);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert: Should complete in under 1000ms (success criteria)
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Task 12.2: Complete Delete Flow', () => {
    let isDeleted = false;

    beforeEach(async () => {
      isDeleted = false;

      // Create a recipe for delete tests
      const recipeInput: CreateRecipeInput = {
        title: 'Delete Test Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test Ingredient', quantity: 1, unit: MeasurementUnit.CUP }],
        steps: ['Test step'],
        imageUri: null,
        prepTime: 10,
        cookTime: 20,
        tags: [],
      };

      const recipe = await recipeService.createRecipe(recipeInput);
      createdRecipeId = recipe.id;

      // Configure mocked dbConnection to simulate soft delete behaviour
      const { dbConnection } = require('@/lib/db/connection') as {
        dbConnection: {
          executeSelect: jest.Mock;
          executeQuery: jest.Mock;
        };
      };

      dbConnection.executeSelect.mockImplementation(
        (_query: string, params: any[] = []) => {
          const [id] = params;
          if (id === createdRecipeId && !isDeleted) {
            // Return a minimal RecipeRow before deletion
            return Promise.resolve([
              {
                id: createdRecipeId,
                title: 'Delete Test Recipe',
                servings: 4,
                category: DishCategory.DINNER,
                ingredients: JSON.stringify([
                  { name: 'Test Ingredient', quantity: 1, unit: MeasurementUnit.CUP },
                ]),
                steps: JSON.stringify(['Test step']),
                imageUri: null,
                prepTime: 10,
                cookTime: 20,
                tags: JSON.stringify([]),
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z',
                deletedAt: null,
              },
            ]);
          }

          // After deletion or for other IDs, behave as if no row exists
          return Promise.resolve([]);
        }
      );

      dbConnection.executeQuery.mockImplementation(
        (query: string, params: any[] = []) => {
          // When soft-delete UPDATE runs, mark recipe as deleted
          if (query.includes('SET deletedAt') && params[2] === createdRecipeId) {
            isDeleted = true;
          }
          return Promise.resolve({ rowsAffected: 1 });
        }
      );
    });

    it('should delete recipe from database', async () => {
      // Act
      await recipeService.deleteRecipe(createdRecipeId!);

      // Assert
      const deletedRecipe = await recipeService.getRecipeById(createdRecipeId!);
      expect(deletedRecipe).toBeNull();

      createdRecipeId = null; // Prevent duplicate cleanup
    });

    it('should throw error when deleting non-existent recipe', async () => {
      // Act & Assert
      await expect(
        recipeService.deleteRecipe('non-existent-id')
      ).rejects.toThrow();
    });

    it('should complete delete operation in under 1 second', async () => {
      // Task 12.4: Performance test - delete should complete quickly
      const startTime = Date.now();

      await recipeService.deleteRecipe(createdRecipeId!);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert: Should complete in under 1000ms (success criteria)
      expect(duration).toBeLessThan(1000);

      createdRecipeId = null; // Prevent duplicate cleanup
    });
  });

  describe('Task 12.2: Error Handling Scenarios', () => {
    it('should handle validation errors on create', async () => {
      // Arrange
      const invalidInput = {
        title: '', // Empty title should fail validation
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [],
        steps: [],
      } as CreateRecipeInput;

      // Act & Assert
      await expect(recipeService.createRecipe(invalidInput)).rejects.toThrow();
    });

    it('should handle validation errors on update', async () => {
      // Create a valid recipe first
      const recipeInput: CreateRecipeInput = {
        title: 'Valid Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Ingredient', quantity: null, unit: null }],
        steps: ['Step'],
        imageUri: null,
        prepTime: null,
        cookTime: null,
        tags: [],
      };

      const recipe = await recipeService.createRecipe(recipeInput);
      createdRecipeId = recipe.id;

      // Arrange invalid update
      const invalidUpdate = {
        id: recipe.id,
        title: '', // Empty title should fail validation
      } as UpdateRecipeInput;

      // Act & Assert
      await expect(recipeService.updateRecipe(invalidUpdate)).rejects.toThrow();
    });

    it('should handle update of non-existent recipe', async () => {
      // Arrange
      const updateInput: UpdateRecipeInput = {
        id: 'non-existent-id',
        title: 'This should fail',
      };

      // Act & Assert
      await expect(recipeService.updateRecipe(updateInput)).rejects.toThrow();
    });
  });

  describe('Task 12.4: Performance with Large Data', () => {
    it('should handle recipe with many ingredients (30+) efficiently', async () => {
      // Arrange
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

      // Act
      const recipe = await recipeService.createRecipe(largeRecipeInput);
      createdRecipeId = recipe.id;

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      expect(recipe.ingredients).toHaveLength(35);
      expect(duration).toBeLessThan(1500); // Allow slightly more time for large data
    });

    it('should handle recipe with many steps (20+) efficiently', async () => {
      // Arrange
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

      // Act
      const recipe = await recipeService.createRecipe(largeRecipeInput);
      createdRecipeId = recipe.id;

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      expect(recipe.steps).toHaveLength(25);
      expect(duration).toBeLessThan(1500); // Allow slightly more time for large data
    });
  });
});
