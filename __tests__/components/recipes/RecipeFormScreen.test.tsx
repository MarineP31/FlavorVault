/**
 * Tests for Recipe Form Screen Component
 * Task Group 5.1: Test validation logic and form data processing
 */

import { DishCategory, MeasurementUnit } from '@/constants/enums';
import { RecipeFormSchema, validateRecipeForm } from '@/lib/validations/recipe-form-schema';

describe('RecipeFormScreen Validation', () => {
  it('should validate a complete recipe form', () => {
    const formData = {
      title: 'Test Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [{ name: 'Flour', quantity: 2, unit: MeasurementUnit.CUP }],
      steps: ['Step 1', 'Step 2'],
      prepTime: 15,
      cookTime: 30,
      tags: [],
      imageUri: null,
    };

    const result = validateRecipeForm(formData);
    expect(result.success).toBe(true);
  });

  it('should fail validation with empty title', () => {
    const formData = {
      title: '',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [{ name: 'Flour', quantity: 2, unit: MeasurementUnit.CUP }],
      steps: ['Step 1'],
    };

    const result = validateRecipeForm(formData);
    expect(result.success).toBe(false);
    expect(result.errors?.title).toBeDefined();
  });

  it('should fail validation with no ingredients', () => {
    const formData = {
      title: 'Test Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [],
      steps: ['Step 1'],
    };

    const result = validateRecipeForm(formData);
    expect(result.success).toBe(false);
    expect(result.errors?.ingredients).toBeDefined();
  });

  it('should fail validation with no steps', () => {
    const formData = {
      title: 'Test Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [{ name: 'Flour', quantity: 2, unit: null }],
      steps: [],
    };

    const result = validateRecipeForm(formData);
    expect(result.success).toBe(false);
    expect(result.errors?.steps).toBeDefined();
  });

  it('should fail validation with invalid servings', () => {
    const formData = {
      title: 'Test Recipe',
      servings: 0,
      category: DishCategory.DINNER,
      ingredients: [{ name: 'Flour', quantity: 2, unit: null }],
      steps: ['Step 1'],
    };

    const result = validateRecipeForm(formData);
    expect(result.success).toBe(false);
    expect(result.errors?.servings).toBeDefined();
  });

  it('should allow null values for optional fields', () => {
    const formData = {
      title: 'Test Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [{ name: 'Flour', quantity: null, unit: null }],
      steps: ['Step 1'],
      prepTime: null,
      cookTime: null,
      tags: [],
      imageUri: null,
    };

    const result = validateRecipeForm(formData);
    expect(result.success).toBe(true);
  });

  it('should validate ingredient with only name', () => {
    const formData = {
      title: 'Test Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [{ name: 'Salt', quantity: null, unit: null }],
      steps: ['Step 1'],
    };

    const result = validateRecipeForm(formData);
    expect(result.success).toBe(true);
  });

  it('should fail validation with empty ingredient name', () => {
    const formData = {
      title: 'Test Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [{ name: '', quantity: 2, unit: MeasurementUnit.CUP }],
      steps: ['Step 1'],
    };

    const result = validateRecipeForm(formData);
    expect(result.success).toBe(false);
  });
});
