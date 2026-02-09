import { RecipeUtils } from '@/lib/db/schema/recipe';
import { DishCategory, MeasurementUnit } from '@/constants/enums';
import type { Recipe } from '@/lib/db/schema/recipe';

describe('RecipeUtils', () => {
  const mockRecipe: Recipe = {
    id: 'test-id',
    title: 'Test Recipe',
    servings: 4,
    category: DishCategory.DINNER,
    ingredients: [
      { name: 'Flour', quantity: 2, unit: MeasurementUnit.CUP },
    ],
    steps: ['Step 1', 'Step 2'],
    imageUri: null,
    prepTime: 15,
    cookTime: 30,
    tags: ['quick'],
    source: null,
    createdAt: '2025-10-27T12:00:00.000Z',
    updatedAt: '2025-10-27T12:00:00.000Z',
    deletedAt: null,
  };

  describe('validate', () => {
    it('should return no errors for valid recipe', () => {
      const errors = RecipeUtils.validate(mockRecipe);
      expect(errors).toHaveLength(0);
    });

    it('should detect empty title', () => {
      const invalid = { ...mockRecipe, title: '' };
      const errors = RecipeUtils.validate(invalid);
      expect(errors).toContain('Title is required');
    });

    it('should detect title too long', () => {
      const invalid = { ...mockRecipe, title: 'A'.repeat(201) };
      const errors = RecipeUtils.validate(invalid);
      expect(errors.some((e) => e.includes('200 characters'))).toBe(true);
    });

    it('should detect invalid servings', () => {
      const invalid = { ...mockRecipe, servings: 0 };
      const errors = RecipeUtils.validate(invalid);
      expect(errors.some((e) => e.includes('between 1 and 50'))).toBe(true);
    });

    it('should detect empty ingredients', () => {
      const invalid = { ...mockRecipe, ingredients: [] };
      const errors = RecipeUtils.validate(invalid);
      expect(errors).toContain('At least one ingredient is required');
    });

    it('should detect empty steps', () => {
      const invalid = { ...mockRecipe, steps: [] };
      const errors = RecipeUtils.validate(invalid);
      expect(errors).toContain('At least one step is required');
    });
  });

  describe('getTotalTime', () => {
    it('should calculate total time', () => {
      const total = RecipeUtils.getTotalTime(mockRecipe);
      expect(total).toBe(45);
    });

    it('should handle null times', () => {
      const recipe = { ...mockRecipe, prepTime: null, cookTime: null };
      const total = RecipeUtils.getTotalTime(recipe);
      expect(total).toBeNull();
    });
  });

  describe('isDeleted', () => {
    it('should return false for active recipe', () => {
      expect(RecipeUtils.isDeleted(mockRecipe)).toBe(false);
    });

    it('should return true for deleted recipe', () => {
      const deleted = { ...mockRecipe, deletedAt: new Date().toISOString() };
      expect(RecipeUtils.isDeleted(deleted)).toBe(true);
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt timestamp', () => {
      const deleted = RecipeUtils.softDelete(mockRecipe);
      expect(deleted.deletedAt).not.toBeNull();
      expect(new Date(deleted.deletedAt!).getTime()).toBeCloseTo(
        Date.now(),
        -3
      );
    });
  });

  describe('toRow and fromRow', () => {
    it('should convert Recipe to RecipeRow and back', () => {
      const row = RecipeUtils.toRow(mockRecipe);
      expect(row.ingredients).toBe(JSON.stringify(mockRecipe.ingredients));
      expect(row.steps).toBe(JSON.stringify(mockRecipe.steps));
      expect(row.tags).toBe(JSON.stringify(mockRecipe.tags));

      const recipe = RecipeUtils.fromRow(row);
      expect(recipe).toEqual(mockRecipe);
    });
  });
});
