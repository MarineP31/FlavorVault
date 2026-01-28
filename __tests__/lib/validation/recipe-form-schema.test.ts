/**
 * Tests for Recipe Form Validation Schema
 * Task Group 5.1: Test form validation (Zod schema)
 */

import { DishCategory, MeasurementUnit } from '@/constants/enums';
import { RecipeFormSchema, type RecipeFormData } from '@/lib/validations/recipe-form-schema';

describe('RecipeFormSchema', () => {
  // Test 1: Valid form data passes validation
  it('should validate a complete valid recipe form', () => {
    const validData: RecipeFormData = {
      title: 'Chocolate Chip Cookies',
      servings: 12,
      category: DishCategory.DESSERT,
      prepTime: 15,
      cookTime: 12,
      tags: ['Dessert', 'Baking'],
      imageUri: null,
      ingredients: [
        { name: 'Flour', quantity: 2, unit: MeasurementUnit.CUP },
        { name: 'Sugar', quantity: 1, unit: MeasurementUnit.CUP },
        { name: 'Butter', quantity: 1, unit: MeasurementUnit.CUP },
      ],
      steps: [
        'Preheat oven to 350°F',
        'Mix dry ingredients',
        'Add wet ingredients',
        'Bake for 12 minutes',
      ],
    };

    const result = RecipeFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  // Test 2: Required fields enforcement
  it('should fail validation when required fields are missing', () => {
    const invalidData = {
      // Missing title, servings, category, ingredients, steps
      prepTime: 15,
      cookTime: 30,
    };

    const result = RecipeFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.title).toBeDefined();
      expect(errors.servings).toBeDefined();
      expect(errors.category).toBeDefined();
      expect(errors.ingredients).toBeDefined();
      expect(errors.steps).toBeDefined();
    }
  });

  // Test 3: Servings range validation
  it('should validate servings range (1-50)', () => {
    const tooLow = {
      title: 'Test Recipe',
      servings: 0,
      category: DishCategory.DINNER,
      ingredients: [{ name: 'Test', quantity: null, unit: null }],
      steps: ['Test step'],
    };

    const tooHigh = {
      ...tooLow,
      servings: 51,
    };

    expect(RecipeFormSchema.safeParse(tooLow).success).toBe(false);
    expect(RecipeFormSchema.safeParse(tooHigh).success).toBe(false);

    const validMin = { ...tooLow, servings: 1 };
    const validMax = { ...tooLow, servings: 50 };

    expect(RecipeFormSchema.safeParse(validMin).success).toBe(true);
    expect(RecipeFormSchema.safeParse(validMax).success).toBe(true);
  });

  // Test 4: Ingredient validation (name required, quantity/unit optional)
  it('should validate ingredients with required name and optional quantity/unit', () => {
    const dataWithInvalidIngredient = {
      title: 'Test Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [
        { name: '', quantity: 2, unit: MeasurementUnit.CUP }, // Invalid: empty name
      ],
      steps: ['Test step'],
    };

    const result = RecipeFormSchema.safeParse(dataWithInvalidIngredient);
    expect(result.success).toBe(false);

    const dataWithValidIngredients = {
      title: 'Test Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [
        { name: 'Flour', quantity: 2, unit: MeasurementUnit.CUP },
        { name: 'Salt', quantity: null, unit: null }, // Valid: no quantity/unit
        { name: 'Water', quantity: 1, unit: null }, // Valid: quantity without unit
      ],
      steps: ['Test step'],
    };

    expect(RecipeFormSchema.safeParse(dataWithValidIngredients).success).toBe(true);
  });

  // Test 5: Steps array validation
  it('should validate steps array with required instruction', () => {
    const dataWithEmptyStep = {
      title: 'Test Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [{ name: 'Test', quantity: null, unit: null }],
      steps: ['Valid step', ''], // Invalid: empty step
    };

    const result = RecipeFormSchema.safeParse(dataWithEmptyStep);
    expect(result.success).toBe(false);

    const dataWithValidSteps = {
      ...dataWithEmptyStep,
      steps: ['Step 1', 'Step 2', 'Step 3'],
    };

    expect(RecipeFormSchema.safeParse(dataWithValidSteps).success).toBe(true);
  });

  // Test 6: Optional fields can be null or undefined
  it('should accept null/undefined for optional fields', () => {
    const minimalData = {
      title: 'Minimal Recipe',
      servings: 2,
      category: DishCategory.SNACK,
      ingredients: [{ name: 'Ingredient 1', quantity: null, unit: null }],
      steps: ['Step 1'],
      prepTime: null,
      cookTime: null,
      tags: [],
      imageUri: null,
    };

    const result = RecipeFormSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
  });

  // Test 7: Category enum validation
  it('should validate category against DishCategory enum', () => {
    const dataWithInvalidCategory = {
      title: 'Test Recipe',
      servings: 4,
      category: 'invalid-category',
      ingredients: [{ name: 'Test', quantity: null, unit: null }],
      steps: ['Test step'],
    };

    const result = RecipeFormSchema.safeParse(dataWithInvalidCategory);
    expect(result.success).toBe(false);

    const dataWithValidCategory = {
      ...dataWithInvalidCategory,
      category: DishCategory.BREAKFAST,
    };

    expect(RecipeFormSchema.safeParse(dataWithValidCategory).success).toBe(true);
  });

  // Test 8: Minimum ingredients and steps requirement
  it('should require at least one ingredient and one step', () => {
    const dataWithEmptyIngredients = {
      title: 'Test Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [],
      steps: ['Test step'],
    };

    const dataWithEmptySteps = {
      title: 'Test Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [{ name: 'Test', quantity: null, unit: null }],
      steps: [],
    };

    expect(RecipeFormSchema.safeParse(dataWithEmptyIngredients).success).toBe(false);
    expect(RecipeFormSchema.safeParse(dataWithEmptySteps).success).toBe(false);
  });
});
