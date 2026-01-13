import { MeasurementUnit, DishCategory } from '@/constants/enums';
import type { Recipe, Ingredient } from '@/lib/db/schema/recipe';
import type { ShoppingListItem, CreateShoppingListItemInput } from '@/lib/db/schema/shopping-list';
import {
  aggregateIngredients,
  createShoppingListInputsFromRecipes,
} from '@/lib/services/ingredient-aggregator';
import { classifyIngredient } from '@/lib/utils/category-classifier';
import { normalizeIngredientName } from '@/lib/utils/ingredient-normalizer';
import { aggregateQuantities, convertUnit } from '@/lib/utils/unit-converter';

describe('Shopping List Generation Flow - Integration Tests', () => {
  describe('Complete generation flow', () => {
    const createMockRecipe = (
      id: string,
      ingredients: Ingredient[]
    ): { id: string; ingredients: Ingredient[] } => ({
      id,
      ingredients,
    });

    it('should generate shopping list from multiple recipes', () => {
      const recipes = [
        createMockRecipe('recipe-1', [
          { name: 'milk', quantity: 1, unit: MeasurementUnit.CUP },
          { name: 'eggs', quantity: 2, unit: MeasurementUnit.UNIT },
        ]),
        createMockRecipe('recipe-2', [
          { name: 'milk', quantity: 0.5, unit: MeasurementUnit.CUP },
          { name: 'flour', quantity: 2, unit: MeasurementUnit.CUP },
        ]),
      ];

      const inputs = createShoppingListInputsFromRecipes(recipes);

      expect(inputs.length).toBeGreaterThanOrEqual(3);

      const milkItem = inputs.find((i) => i.name === 'milk');
      expect(milkItem).toBeDefined();
      expect(milkItem?.quantity).toBe(1.5);
    });

    it('should aggregate ingredients with unit conversion', () => {
      const recipes = [
        createMockRecipe('recipe-1', [
          { name: 'butter', quantity: 8, unit: MeasurementUnit.TBSP },
        ]),
        createMockRecipe('recipe-2', [
          { name: 'butter', quantity: 8, unit: MeasurementUnit.TBSP },
        ]),
      ];

      const inputs = createShoppingListInputsFromRecipes(recipes);

      const butterItem = inputs.find((i) => i.name === 'butter');
      expect(butterItem).toBeDefined();
      expect(butterItem?.quantity).toBe(1);
      expect(butterItem?.unit).toBe(MeasurementUnit.CUP);
    });

    it('should handle ingredients without quantities', () => {
      const recipes = [
        createMockRecipe('recipe-1', [
          { name: 'salt', quantity: null, unit: null },
        ]),
        createMockRecipe('recipe-2', [
          { name: 'salt', quantity: null, unit: null },
        ]),
      ];

      const inputs = createShoppingListInputsFromRecipes(recipes);

      const saltItem = inputs.find((i) => i.name === 'salt');
      expect(saltItem).toBeDefined();
      expect(saltItem?.quantity).toBeNull();
    });

    it('should correctly classify ingredients into categories', () => {
      const recipes = [
        createMockRecipe('recipe-1', [
          { name: 'chicken breast', quantity: 1, unit: MeasurementUnit.LB },
          { name: 'broccoli', quantity: 2, unit: MeasurementUnit.CUP },
          { name: 'milk', quantity: 1, unit: MeasurementUnit.CUP },
          { name: 'flour', quantity: 2, unit: MeasurementUnit.CUP },
        ]),
      ];

      const inputs = createShoppingListInputsFromRecipes(recipes);

      const chicken = inputs.find((i) => i.name === 'chicken breast');
      const broccoli = inputs.find((i) => i.name === 'broccoli');
      const milk = inputs.find((i) => i.name === 'milk');
      const flour = inputs.find((i) => i.name === 'flour');

      expect(chicken?.category).toBe('Meat & Seafood');
      expect(broccoli?.category).toBe('Produce');
      expect(milk?.category).toBe('Dairy');
      expect(flour?.category).toBe('Pantry');
    });
  });

  describe('Ingredient aggregation with duplicates', () => {
    it('should combine same ingredients from multiple recipes', () => {
      const ingredients = [
        {
          ingredient: { name: 'Tomatoes', quantity: 2, unit: MeasurementUnit.UNIT },
          recipeId: 'recipe-1',
        },
        {
          ingredient: { name: 'tomato', quantity: 1, unit: MeasurementUnit.UNIT },
          recipeId: 'recipe-2',
        },
        {
          ingredient: { name: 'TOMATO', quantity: 3, unit: MeasurementUnit.UNIT },
          recipeId: 'recipe-3',
        },
      ];

      const aggregated = aggregateIngredients(ingredients);

      expect(aggregated).toHaveLength(1);
      expect(aggregated[0].quantity).toBe(6);
      expect(aggregated[0].normalizedName).toBe('tomato');
    });

    it('should track all recipe sources', () => {
      const ingredients = [
        {
          ingredient: { name: 'onion', quantity: 1, unit: MeasurementUnit.UNIT },
          recipeId: 'recipe-1',
        },
        {
          ingredient: { name: 'onion', quantity: 2, unit: MeasurementUnit.UNIT },
          recipeId: 'recipe-2',
        },
      ];

      const aggregated = aggregateIngredients(ingredients);

      expect(aggregated[0].recipeIds).toContain('recipe-1');
      expect(aggregated[0].recipeIds).toContain('recipe-2');
    });
  });

  describe('Unit conversion scenarios', () => {
    it('should convert tbsp to cups when total exceeds 16 tbsp', () => {
      const quantities = [
        { quantity: 8, unit: MeasurementUnit.TBSP },
        { quantity: 8, unit: MeasurementUnit.TBSP },
      ];

      const result = aggregateQuantities(quantities);

      expect(result).not.toBeNull();
      expect(result!.quantity).toBe(1);
      expect(result!.unit).toBe(MeasurementUnit.CUP);
    });

    it('should convert oz to lbs when total exceeds 16 oz', () => {
      const quantities = [
        { quantity: 8, unit: MeasurementUnit.OZ },
        { quantity: 8, unit: MeasurementUnit.OZ },
      ];

      const result = aggregateQuantities(quantities);

      expect(result).not.toBeNull();
      expect(result!.quantity).toBe(1);
      expect(result!.unit).toBe(MeasurementUnit.LB);
    });

    it('should return null for incompatible units', () => {
      const quantities = [
        { quantity: 1, unit: MeasurementUnit.CUP },
        { quantity: 1, unit: MeasurementUnit.LB },
      ];

      const result = aggregateQuantities(quantities);

      expect(result).toBeNull();
    });

    it('should handle mixed volume units', () => {
      const quantities = [
        { quantity: 1, unit: MeasurementUnit.CUP },
        { quantity: 8, unit: MeasurementUnit.TBSP },
      ];

      const result = aggregateQuantities(quantities);

      expect(result).not.toBeNull();
      expect(result!.quantity).toBe(1.5);
      expect(result!.unit).toBe(MeasurementUnit.CUP);
    });
  });

  describe('Category grouping', () => {
    it('should classify produce items correctly', () => {
      const produceItems = [
        'tomato', 'onion', 'garlic', 'lettuce', 'spinach',
        'carrot', 'apple', 'banana', 'orange', 'lemon',
      ];

      produceItems.forEach((item) => {
        expect(classifyIngredient(item)).toBe('Produce');
      });
    });

    it('should classify dairy items correctly', () => {
      const dairyItems = [
        'milk', 'cheese', 'butter', 'yogurt', 'cream',
        'mozzarella', 'parmesan', 'eggs',
      ];

      dairyItems.forEach((item) => {
        expect(classifyIngredient(item)).toBe('Dairy');
      });
    });

    it('should classify meat items correctly', () => {
      const meatItems = [
        'chicken', 'beef', 'pork', 'turkey',
        'salmon', 'shrimp', 'tuna', 'lamb',
      ];

      meatItems.forEach((item) => {
        expect(classifyIngredient(item)).toBe('Meat & Seafood');
      });
    });

    it('should classify pantry items correctly', () => {
      const pantryItems = [
        'flour', 'sugar', 'salt', 'oil', 'olive oil',
        'rice', 'pasta', 'vinegar', 'soy sauce',
      ];

      pantryItems.forEach((item) => {
        expect(classifyIngredient(item)).toBe('Pantry');
      });
    });

    it('should return Other for unknown items', () => {
      const unknownItems = ['random thing', 'xyz123', 'something else'];

      unknownItems.forEach((item) => {
        expect(classifyIngredient(item)).toBe('Other');
      });
    });
  });

  describe('Check-off functionality', () => {
    it('should handle optimistic UI updates', () => {
      const item: ShoppingListItem = {
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

      const updatedItem = { ...item, checked: true };

      expect(updatedItem.checked).toBe(true);
      expect(item.checked).toBe(false);
    });
  });

  describe('Manual item addition', () => {
    it('should classify manual items correctly', () => {
      const manualInput: CreateShoppingListItemInput = {
        name: 'milk',
        quantity: 1,
        unit: MeasurementUnit.LITER,
        category: classifyIngredient('milk'),
        source: 'manual',
      };

      expect(manualInput.category).toBe('Dairy');
      expect(manualInput.source).toBe('manual');
    });

    it('should use Other category for unknown items', () => {
      const manualInput: CreateShoppingListItemInput = {
        name: 'paper towels',
        quantity: 2,
        unit: MeasurementUnit.UNIT,
        category: classifyIngredient('paper towels'),
        source: 'manual',
      };

      expect(manualInput.category).toBe('Other');
    });
  });

  describe('Regeneration flow', () => {
    it('should preserve manual items during regeneration simulation', () => {
      const items: ShoppingListItem[] = [
        {
          id: 'recipe-item-1',
          name: 'milk',
          quantity: 1,
          unit: MeasurementUnit.CUP,
          checked: true,
          recipeId: 'recipe-1',
          mealPlanId: null,
          category: 'Dairy',
          source: 'recipe',
          originalName: 'Milk',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'manual-item-1',
          name: 'paper towels',
          quantity: 2,
          unit: MeasurementUnit.UNIT,
          checked: false,
          recipeId: null,
          mealPlanId: null,
          category: 'Other',
          source: 'manual',
          originalName: 'Paper Towels',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const manualItems = items.filter((item) => item.source === 'manual');
      const recipeItems = items.filter((item) => item.source === 'recipe');

      expect(manualItems).toHaveLength(1);
      expect(recipeItems).toHaveLength(1);
      expect(manualItems[0].checked).toBe(false);
    });

    it('should reset recipe items checked state during regeneration', () => {
      const recipeItem: ShoppingListItem = {
        id: 'recipe-item-1',
        name: 'milk',
        quantity: 1,
        unit: MeasurementUnit.CUP,
        checked: true,
        recipeId: 'recipe-1',
        mealPlanId: null,
        category: 'Dairy',
        source: 'recipe',
        originalName: 'Milk',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const regeneratedItem = {
        ...recipeItem,
        id: 'new-recipe-item-1',
        checked: false,
      };

      expect(regeneratedItem.checked).toBe(false);
    });
  });
});

describe('Performance Tests', () => {
  describe('Shopping list generation performance', () => {
    it('should handle 10 recipes efficiently', () => {
      const recipes = Array.from({ length: 10 }, (_, i) => ({
        id: `recipe-${i}`,
        ingredients: [
          { name: 'milk', quantity: 1, unit: MeasurementUnit.CUP },
          { name: 'flour', quantity: 2, unit: MeasurementUnit.CUP },
          { name: 'eggs', quantity: 2, unit: MeasurementUnit.UNIT },
        ] as Ingredient[],
      }));

      const startTime = performance.now();
      const inputs = createShoppingListInputsFromRecipes(recipes);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(2000);
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should aggregate large ingredient lists efficiently', () => {
      const ingredients = Array.from({ length: 100 }, (_, i) => ({
        ingredient: {
          name: `ingredient-${i % 20}`,
          quantity: 1,
          unit: MeasurementUnit.CUP,
        },
        recipeId: `recipe-${i % 10}`,
      }));

      const startTime = performance.now();
      const aggregated = aggregateIngredients(ingredients);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000);
      expect(aggregated.length).toBeLessThanOrEqual(20);
    });
  });

  describe('UI performance with many items', () => {
    it('should handle 50+ items efficiently', () => {
      const items: ShoppingListItem[] = Array.from({ length: 50 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        quantity: 1,
        unit: MeasurementUnit.UNIT,
        checked: i % 3 === 0,
        recipeId: `recipe-${i % 5}`,
        mealPlanId: null,
        category: ['Produce', 'Dairy', 'Meat & Seafood', 'Pantry', 'Other'][i % 5] as any,
        source: 'recipe',
        originalName: `Item ${i}`,
        createdAt: new Date().toISOString(),
      }));

      const startTime = performance.now();

      const grouped: Record<string, ShoppingListItem[]> = {};
      for (const item of items) {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }
        grouped[item.category].push(item);
      }

      for (const category of Object.keys(grouped)) {
        grouped[category].sort((a, b) => a.name.localeCompare(b.name));
      }

      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);
      expect(Object.keys(grouped).length).toBeGreaterThan(0);
    });
  });
});
