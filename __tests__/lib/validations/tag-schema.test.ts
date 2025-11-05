/**
 * Tag Schema Validation Tests
 * Task 14.1: Unit Tests - Test tag validation schema
 */

import {
  tagValueSchema,
  categoryNameSchema,
  createTagInputSchema,
  validateTagLimit,
  validateCategoryLimit,
  validateTagUniqueness,
  validateCategoryUniqueness,
  validateNotDefaultCategory,
  validateTagWithRules,
  validateCategoryWithRules,
  ValidationMessages,
} from '@/lib/validations/tag-schema';
import { VALIDATION_CONSTRAINTS } from '@/constants/enums';

describe('Tag Validation Schema', () => {
  describe('tagValueSchema', () => {
    it('should validate correct tag values', () => {
      expect(() => tagValueSchema.parse('Italian')).not.toThrow();
      expect(() => tagValueSchema.parse('Vegan')).not.toThrow();
      expect(() => tagValueSchema.parse('Low-Carb')).not.toThrow();
    });

    it('should reject empty tag values', () => {
      expect(() => tagValueSchema.parse('')).toThrow();
      expect(() => tagValueSchema.parse('   ')).toThrow();
    });

    it('should reject tag values exceeding 30 characters', () => {
      const longTag = 'a'.repeat(31);
      expect(() => tagValueSchema.parse(longTag)).toThrow();
    });

    it('should trim whitespace from tag values', () => {
      const result = tagValueSchema.parse('  Italian  ');
      expect(result).toBe('Italian');
    });
  });

  describe('categoryNameSchema', () => {
    it('should validate correct category names', () => {
      expect(() => categoryNameSchema.parse('Cuisine')).not.toThrow();
      expect(() => categoryNameSchema.parse('Dietary')).not.toThrow();
      expect(() => categoryNameSchema.parse('Custom Category')).not.toThrow();
    });

    it('should reject empty category names', () => {
      expect(() => categoryNameSchema.parse('')).toThrow();
      expect(() => categoryNameSchema.parse('   ')).toThrow();
    });

    it('should reject category names exceeding 30 characters', () => {
      const longCategory = 'a'.repeat(31);
      expect(() => categoryNameSchema.parse(longCategory)).toThrow();
    });
  });

  describe('createTagInputSchema', () => {
    it('should validate correct tag input', () => {
      const input = {
        categoryType: 'default' as const,
        categoryName: 'Cuisine',
        tagValue: 'Italian',
      };
      expect(() => createTagInputSchema.parse(input)).not.toThrow();
    });

    it('should validate tag input with optional recipeId', () => {
      const input = {
        recipeId: '123',
        categoryType: 'custom' as const,
        categoryName: 'My Category',
        tagValue: 'My Tag',
      };
      expect(() => createTagInputSchema.parse(input)).not.toThrow();
    });

    it('should reject invalid category type', () => {
      const input = {
        categoryType: 'invalid',
        categoryName: 'Cuisine',
        tagValue: 'Italian',
      };
      expect(() => createTagInputSchema.parse(input)).toThrow();
    });
  });

  describe('validateTagLimit', () => {
    it('should allow adding tags below the limit', () => {
      expect(validateTagLimit(0)).toBe(true);
      expect(validateTagLimit(10)).toBe(true);
      expect(validateTagLimit(19)).toBe(true);
    });

    it('should reject adding tags at or above the limit', () => {
      expect(validateTagLimit(20)).toBe(false);
      expect(validateTagLimit(21)).toBe(false);
    });
  });

  describe('validateCategoryLimit', () => {
    it('should allow adding categories below the limit', () => {
      expect(validateCategoryLimit(0)).toBe(true);
      expect(validateCategoryLimit(5)).toBe(true);
      expect(validateCategoryLimit(9)).toBe(true);
    });

    it('should reject adding categories at or above the limit', () => {
      expect(validateCategoryLimit(10)).toBe(false);
      expect(validateCategoryLimit(11)).toBe(false);
    });
  });

  describe('validateTagUniqueness', () => {
    const existingTags = ['Italian', 'Mexican', 'Asian'];

    it('should allow unique tag names', () => {
      expect(validateTagUniqueness('French', existingTags)).toBe(true);
      expect(validateTagUniqueness('Indian', existingTags)).toBe(true);
    });

    it('should reject duplicate tag names (case-insensitive)', () => {
      expect(validateTagUniqueness('Italian', existingTags)).toBe(false);
      expect(validateTagUniqueness('italian', existingTags)).toBe(false);
      expect(validateTagUniqueness('ITALIAN', existingTags)).toBe(false);
    });
  });

  describe('validateCategoryUniqueness', () => {
    const existingCategories = ['Cuisine', 'Dietary', 'Meal Type'];

    it('should allow unique category names', () => {
      expect(validateCategoryUniqueness('Spice Level', existingCategories)).toBe(true);
      expect(validateCategoryUniqueness('Occasion', existingCategories)).toBe(true);
    });

    it('should reject duplicate category names (case-insensitive)', () => {
      expect(validateCategoryUniqueness('Cuisine', existingCategories)).toBe(false);
      expect(validateCategoryUniqueness('cuisine', existingCategories)).toBe(false);
      expect(validateCategoryUniqueness('CUISINE', existingCategories)).toBe(false);
    });
  });

  describe('validateNotDefaultCategory', () => {
    const defaultCategories = ['Cuisine', 'Dietary', 'Meal Type', 'Cooking Method'];

    it('should allow non-default category names', () => {
      expect(validateNotDefaultCategory('Spice Level', defaultCategories)).toBe(true);
      expect(validateNotDefaultCategory('Occasion', defaultCategories)).toBe(true);
    });

    it('should reject default category names', () => {
      expect(validateNotDefaultCategory('Cuisine', defaultCategories)).toBe(false);
      expect(validateNotDefaultCategory('Dietary', defaultCategories)).toBe(false);
    });
  });

  describe('validateTagWithRules', () => {
    const existingTags = ['Italian', 'Mexican'];

    it('should validate a valid unique tag', () => {
      const result = validateTagWithRules('French', existingTags, 10);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for duplicate tags', () => {
      const result = validateTagWithRules('Italian', existingTags, 10);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(ValidationMessages.TAG_DUPLICATE);
    });

    it('should return errors for tags exceeding limit', () => {
      const result = validateTagWithRules('French', existingTags, 20);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(ValidationMessages.TAG_LIMIT_EXCEEDED);
    });

    it('should return errors for invalid tag format', () => {
      const result = validateTagWithRules('', existingTags, 10);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return multiple errors when multiple rules fail', () => {
      const result = validateTagWithRules('Italian', existingTags, 20);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateCategoryWithRules', () => {
    const existingCategories = ['Cuisine', 'Custom Category'];
    const defaultCategories = ['Cuisine', 'Dietary', 'Meal Type'];

    it('should validate a valid unique category', () => {
      const result = validateCategoryWithRules('Spice Level', existingCategories, 5, defaultCategories);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for duplicate categories', () => {
      const result = validateCategoryWithRules('Custom Category', existingCategories, 5, defaultCategories);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(ValidationMessages.CATEGORY_DUPLICATE);
    });

    it('should return errors for default category names', () => {
      const result = validateCategoryWithRules('Cuisine', existingCategories, 5, defaultCategories);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(ValidationMessages.CATEGORY_PROTECTED);
    });

    it('should return errors for categories exceeding limit', () => {
      const result = validateCategoryWithRules('New Category', existingCategories, 10, defaultCategories);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(ValidationMessages.CATEGORY_LIMIT_EXCEEDED);
    });

    it('should return errors for invalid category format', () => {
      const result = validateCategoryWithRules('', existingCategories, 5, defaultCategories);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle tags with special characters', () => {
      expect(() => tagValueSchema.parse('Low-Carb')).not.toThrow();
      expect(() => tagValueSchema.parse("Chef's Special")).not.toThrow();
    });

    it('should handle categories with special characters', () => {
      expect(() => categoryNameSchema.parse('Meal-Type')).not.toThrow();
      expect(() => categoryNameSchema.parse('Occasion & Event')).not.toThrow();
    });

    it('should handle boundary cases for tag length', () => {
      const tag30Chars = 'a'.repeat(30);
      expect(() => tagValueSchema.parse(tag30Chars)).not.toThrow();

      const tag31Chars = 'a'.repeat(31);
      expect(() => tagValueSchema.parse(tag31Chars)).toThrow();
    });

    it('should handle boundary cases for limit validation', () => {
      expect(validateTagLimit(VALIDATION_CONSTRAINTS.MAX_CUSTOM_TAGS_PER_CATEGORY - 1)).toBe(true);
      expect(validateTagLimit(VALIDATION_CONSTRAINTS.MAX_CUSTOM_TAGS_PER_CATEGORY)).toBe(false);

      expect(validateCategoryLimit(VALIDATION_CONSTRAINTS.MAX_CUSTOM_CATEGORIES - 1)).toBe(true);
      expect(validateCategoryLimit(VALIDATION_CONSTRAINTS.MAX_CUSTOM_CATEGORIES)).toBe(false);
    });
  });
});
