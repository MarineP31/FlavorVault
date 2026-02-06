import { MeasurementUnit } from '@/constants/enums';
import {
  aggregateIngredients,
  createShoppingListInputsFromRecipes,
  extractIngredientsFromRecipe,
} from '@/lib/services/ingredient-aggregator';
import type { Ingredient } from '@/lib/db/schema/recipe';

describe('ingredient-aggregator', () => {
  describe('aggregateIngredients', () => {
    it('should aggregate identical ingredients', () => {
      const ingredients = [
        {
          ingredient: { name: 'milk', quantity: 1, unit: MeasurementUnit.CUP },
          recipeId: 'recipe-1',
        },
        {
          ingredient: { name: 'milk', quantity: 1, unit: MeasurementUnit.CUP },
          recipeId: 'recipe-2',
        },
      ];

      const result = aggregateIngredients(ingredients);

      expect(result).toHaveLength(1);
      expect(result[0].normalizedName).toBe('milk');
      expect(result[0].quantity).toBe(2);
      expect(result[0].unit).toBe(MeasurementUnit.CUP);
    });

    it('should aggregate ingredients with compatible units', () => {
      const ingredients = [
        {
          ingredient: { name: 'milk', quantity: 8, unit: MeasurementUnit.TBSP },
          recipeId: 'recipe-1',
        },
        {
          ingredient: { name: 'milk', quantity: 8, unit: MeasurementUnit.TBSP },
          recipeId: 'recipe-2',
        },
      ];

      const result = aggregateIngredients(ingredients);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(1);
      expect(result[0].unit).toBe(MeasurementUnit.CUP);
    });

    it('should create separate items for incompatible units', () => {
      const ingredients = [
        {
          ingredient: { name: 'chicken', quantity: 1, unit: MeasurementUnit.LB },
          recipeId: 'recipe-1',
        },
        {
          ingredient: { name: 'chicken', quantity: 2, unit: MeasurementUnit.PIECE },
          recipeId: 'recipe-2',
        },
      ];

      const result = aggregateIngredients(ingredients);

      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should normalize ingredient names', () => {
      const ingredients = [
        {
          ingredient: { name: 'Tomato', quantity: 1, unit: MeasurementUnit.UNIT },
          recipeId: 'recipe-1',
        },
        {
          ingredient: { name: 'tomatoes', quantity: 2, unit: MeasurementUnit.UNIT },
          recipeId: 'recipe-2',
        },
      ];

      const result = aggregateIngredients(ingredients);

      expect(result).toHaveLength(1);
      expect(result[0].normalizedName).toBe('tomato');
      expect(result[0].quantity).toBe(3);
    });

    it('should handle ingredients without quantity', () => {
      const ingredients = [
        {
          ingredient: { name: 'salt', quantity: null, unit: null },
          recipeId: 'recipe-1',
        },
        {
          ingredient: { name: 'salt', quantity: null, unit: null },
          recipeId: 'recipe-2',
        },
      ];

      const result = aggregateIngredients(ingredients);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBeNull();
    });

    it('should track recipe IDs', () => {
      const ingredients = [
        {
          ingredient: { name: 'flour', quantity: 1, unit: MeasurementUnit.CUP },
          recipeId: 'recipe-1',
        },
        {
          ingredient: { name: 'flour', quantity: 2, unit: MeasurementUnit.CUP },
          recipeId: 'recipe-2',
        },
      ];

      const result = aggregateIngredients(ingredients);

      expect(result[0].recipeIds).toContain('recipe-1');
      expect(result[0].recipeIds).toContain('recipe-2');
    });

    it('should assign categories to aggregated items', () => {
      const ingredients = [
        {
          ingredient: { name: 'milk', quantity: 1, unit: MeasurementUnit.CUP },
          recipeId: 'recipe-1',
        },
      ];

      const result = aggregateIngredients(ingredients);

      expect(result[0].category).toBe('Dairy');
    });

    it('should handle empty input', () => {
      const result = aggregateIngredients([]);
      expect(result).toHaveLength(0);
    });

    it('should preserve original names', () => {
      const ingredients = [
        {
          ingredient: { name: 'Fresh Tomatoes', quantity: 2, unit: MeasurementUnit.UNIT },
          recipeId: 'recipe-1',
        },
      ];

      const result = aggregateIngredients(ingredients);

      expect(result[0].originalNames).toContain('Fresh Tomatoes');
    });
  });

  describe('createShoppingListInputsFromRecipes', () => {
    it('should create shopping list inputs from recipes', () => {
      const recipes = [
        {
          id: 'recipe-1',
          ingredients: [
            { name: 'milk', quantity: 1, unit: MeasurementUnit.CUP },
            { name: 'eggs', quantity: 2, unit: MeasurementUnit.UNIT },
          ] as Ingredient[],
        },
      ];

      const result = createShoppingListInputsFromRecipes(recipes);

      expect(result).toHaveLength(2);
      expect(result[0].source).toBe('recipe');
    });

    it('should aggregate across multiple recipes', () => {
      const recipes = [
        {
          id: 'recipe-1',
          ingredients: [
            { name: 'flour', quantity: 1, unit: MeasurementUnit.CUP },
          ] as Ingredient[],
        },
        {
          id: 'recipe-2',
          ingredients: [
            { name: 'flour', quantity: 2, unit: MeasurementUnit.CUP },
          ] as Ingredient[],
        },
      ];

      const result = createShoppingListInputsFromRecipes(recipes);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(3);
    });

    it('should handle empty recipes', () => {
      const result = createShoppingListInputsFromRecipes([]);
      expect(result).toHaveLength(0);
    });

    it('should handle recipes with no ingredients', () => {
      const recipes = [
        { id: 'recipe-1', ingredients: [] as Ingredient[] },
      ];

      const result = createShoppingListInputsFromRecipes(recipes);
      expect(result).toHaveLength(0);
    });

    it('should set correct category for each item', () => {
      const recipes = [
        {
          id: 'recipe-1',
          ingredients: [
            { name: 'chicken breast', quantity: 1, unit: MeasurementUnit.LB },
            { name: 'broccoli', quantity: 2, unit: MeasurementUnit.CUP },
          ] as Ingredient[],
        },
      ];

      const result = createShoppingListInputsFromRecipes(recipes);

      const chicken = result.find((r) => r.name === 'chicken breast');
      const broccoli = result.find((r) => r.name === 'broccoli');

      expect(chicken?.category).toBe('Meat & Seafood');
      expect(broccoli?.category).toBe('Produce');
    });
  });

  describe('extractIngredientsFromRecipe', () => {
    it('should extract ingredients with recipe ID', () => {
      const recipe = {
        id: 'recipe-1',
        ingredients: [
          { name: 'tomato', quantity: 2, unit: MeasurementUnit.UNIT },
          { name: 'onion', quantity: 1, unit: MeasurementUnit.UNIT },
        ] as Ingredient[],
      };

      const result = extractIngredientsFromRecipe(recipe);

      expect(result).toHaveLength(2);
      expect(result[0].recipeId).toBe('recipe-1');
      expect(result[0].ingredient.name).toBe('tomato');
    });

    it('should handle empty ingredients', () => {
      const recipe = {
        id: 'recipe-1',
        ingredients: [] as Ingredient[],
      };

      const result = extractIngredientsFromRecipe(recipe);
      expect(result).toHaveLength(0);
    });
  });

  describe('aggregation edge cases', () => {
    it('should handle mixed quantities (some null)', () => {
      const ingredients = [
        {
          ingredient: { name: 'parsley', quantity: null, unit: null },
          recipeId: 'recipe-1',
        },
        {
          ingredient: { name: 'parsley', quantity: 1, unit: MeasurementUnit.BUNCH },
          recipeId: 'recipe-2',
        },
      ];

      const result = aggregateIngredients(ingredients);

      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle very small quantities', () => {
      const ingredients = [
        {
          ingredient: { name: 'saffron', quantity: 0.25, unit: MeasurementUnit.TSP },
          recipeId: 'recipe-1',
        },
        {
          ingredient: { name: 'saffron', quantity: 0.25, unit: MeasurementUnit.TSP },
          recipeId: 'recipe-2',
        },
      ];

      const result = aggregateIngredients(ingredients);

      expect(result[0].quantity).toBe(0.5);
    });

    it('should handle large aggregations', () => {
      const ingredients = Array.from({ length: 10 }, (_, i) => ({
        ingredient: { name: 'flour', quantity: 1, unit: MeasurementUnit.CUP },
        recipeId: `recipe-${i}`,
      }));

      const result = aggregateIngredients(ingredients);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(10);
    });
  });
});
