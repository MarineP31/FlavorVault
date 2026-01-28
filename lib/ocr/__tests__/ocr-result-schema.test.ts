import { DishCategory, MeasurementUnit } from '@/constants/enums';
import {
  safeParseParsedRecipe,
  safeParseOCRData,
  hasMinimumRecipeData,
  ParsedRecipeSchema,
  OCRDataSchema,
} from '../schemas/ocr-result-schema';

describe('OCR Result Schema', () => {
  describe('safeParseParsedRecipe', () => {
    const validParsedRecipe = {
      title: 'Chocolate Cake',
      titleConfidence: 0.95,
      ingredients: [
        {
          name: 'flour',
          quantity: 2,
          unit: MeasurementUnit.CUP,
          originalText: '2 cups flour',
          confidence: 0.9,
        },
      ],
      ingredientsConfidence: 0.85,
      instructions: [
        {
          step: 'Mix dry ingredients',
          stepNumber: 1,
          confidence: 0.88,
        },
      ],
      instructionsConfidence: 0.88,
      metadata: {
        prepTime: 15,
        cookTime: 30,
        servings: 8,
        category: DishCategory.DESSERT,
      },
      metadataConfidence: 0.7,
      overallConfidence: 0.85,
      rawText: 'Chocolate Cake\n2 cups flour\nMix dry ingredients',
    };

    it('should parse valid JSON successfully', () => {
      const result = safeParseParsedRecipe(JSON.stringify(validParsedRecipe));
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe('Chocolate Cake');
    });

    it('should return error for undefined input', () => {
      const result = safeParseParsedRecipe(undefined);
      expect(result.success).toBe(false);
      expect(result.error).toBe('No OCR data provided');
    });

    it('should return error for invalid JSON', () => {
      const result = safeParseParsedRecipe('not valid json');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse JSON');
    });

    it('should return error for missing required fields', () => {
      const invalid = { title: 'Test' };
      const result = safeParseParsedRecipe(JSON.stringify(invalid));
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid OCR data');
    });

    it('should accept null values for optional fields', () => {
      const withNulls = {
        ...validParsedRecipe,
        metadata: {
          ...validParsedRecipe.metadata,
          prepTime: null,
          cookTime: null,
          servings: null,
        },
      };
      const result = safeParseParsedRecipe(JSON.stringify(withNulls));
      expect(result.success).toBe(true);
      expect(result.data?.metadata.prepTime).toBeNull();
    });
  });

  describe('safeParseOCRData', () => {
    const validOCRData = {
      title: 'Test Recipe',
      ingredients: [
        { name: 'flour', quantity: 2, unit: 'cup' },
        { name: 'sugar', quantity: 1, unit: 'tbsp' },
      ],
      steps: ['Step 1', 'Step 2'],
      servings: 4,
      category: DishCategory.DINNER,
      prepTime: 10,
      cookTime: 20,
      imageUri: 'file://test.jpg',
    };

    it('should parse valid OCR data successfully', () => {
      const result = safeParseOCRData(JSON.stringify(validOCRData));
      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Test Recipe');
      expect(result.data?.ingredients).toHaveLength(2);
    });

    it('should transform valid unit strings to MeasurementUnit', () => {
      const result = safeParseOCRData(JSON.stringify(validOCRData));
      expect(result.success).toBe(true);
      expect(result.data?.ingredients[0].unit).toBe(MeasurementUnit.CUP);
      expect(result.data?.ingredients[1].unit).toBe(MeasurementUnit.TBSP);
    });

    it('should transform invalid unit strings to null', () => {
      const withInvalidUnit = {
        ...validOCRData,
        ingredients: [{ name: 'flour', quantity: 2, unit: 'invalid_unit' }],
      };
      const result = safeParseOCRData(JSON.stringify(withInvalidUnit));
      expect(result.success).toBe(true);
      expect(result.data?.ingredients[0].unit).toBeNull();
    });

    it('should use defaults for missing optional fields', () => {
      const minimal = {
        title: 'Minimal Recipe',
      };
      const result = safeParseOCRData(JSON.stringify(minimal));
      expect(result.success).toBe(true);
      expect(result.data?.servings).toBe(4);
      expect(result.data?.category).toBe(DishCategory.DINNER);
      expect(result.data?.ingredients).toEqual([]);
      expect(result.data?.steps).toEqual([]);
    });

    it('should return error for undefined input', () => {
      const result = safeParseOCRData(undefined);
      expect(result.success).toBe(false);
      expect(result.error).toBe('No OCR data provided');
    });

    it('should return error for invalid JSON', () => {
      const result = safeParseOCRData('{invalid');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse JSON');
    });
  });

  describe('hasMinimumRecipeData', () => {
    const baseRecipe = {
      title: 'Untitled Recipe',
      titleConfidence: 0.3,
      ingredients: [],
      ingredientsConfidence: 0.3,
      instructions: [],
      instructionsConfidence: 0.3,
      metadata: {
        prepTime: null,
        cookTime: null,
        servings: null,
        category: DishCategory.DINNER,
      },
      metadataConfidence: 0.5,
      overallConfidence: 0.3,
      rawText: '',
    };

    it('should return false for empty recipe with default title', () => {
      const result = hasMinimumRecipeData(baseRecipe);
      expect(result).toBe(false);
    });

    it('should return true if recipe has a real title', () => {
      const withTitle = { ...baseRecipe, title: 'Chocolate Cake' };
      const result = hasMinimumRecipeData(withTitle);
      expect(result).toBe(true);
    });

    it('should return true if recipe has ingredients', () => {
      const withIngredients = {
        ...baseRecipe,
        ingredients: [
          {
            name: 'flour',
            quantity: 1,
            unit: MeasurementUnit.CUP,
            originalText: '1 cup flour',
            confidence: 0.9,
          },
        ],
      };
      const result = hasMinimumRecipeData(withIngredients);
      expect(result).toBe(true);
    });

    it('should return true if recipe has instructions', () => {
      const withInstructions = {
        ...baseRecipe,
        instructions: [
          {
            step: 'Mix ingredients',
            stepNumber: 1,
            confidence: 0.8,
          },
        ],
      };
      const result = hasMinimumRecipeData(withInstructions);
      expect(result).toBe(true);
    });

    it('should return false for empty string title', () => {
      const emptyTitle = { ...baseRecipe, title: '' };
      const result = hasMinimumRecipeData(emptyTitle);
      expect(result).toBe(false);
    });
  });

  describe('ParsedRecipeSchema', () => {
    it('should validate confidence values between 0 and 1', () => {
      const invalidConfidence = {
        title: 'Test',
        titleConfidence: 1.5, // Invalid: > 1
        ingredients: [],
        ingredientsConfidence: 0.5,
        instructions: [],
        instructionsConfidence: 0.5,
        metadata: {
          prepTime: null,
          cookTime: null,
          servings: null,
          category: DishCategory.DINNER,
        },
        metadataConfidence: 0.5,
        overallConfidence: 0.5,
        rawText: '',
      };

      const result = ParsedRecipeSchema.safeParse(invalidConfidence);
      expect(result.success).toBe(false);
    });

    it('should reject negative confidence values', () => {
      const negativeConfidence = {
        title: 'Test',
        titleConfidence: -0.1,
        ingredients: [],
        ingredientsConfidence: 0.5,
        instructions: [],
        instructionsConfidence: 0.5,
        metadata: {
          prepTime: null,
          cookTime: null,
          servings: null,
          category: DishCategory.DINNER,
        },
        metadataConfidence: 0.5,
        overallConfidence: 0.5,
        rawText: '',
      };

      const result = ParsedRecipeSchema.safeParse(negativeConfidence);
      expect(result.success).toBe(false);
    });
  });

  describe('OCRDataSchema', () => {
    it('should accept empty object with defaults', () => {
      const result = OCRDataSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        title: '',
        ingredients: [],
        steps: [],
        servings: 4,
        category: DishCategory.DINNER,
        prepTime: null,
        cookTime: null,
        imageUri: null,
      });
    });

    it('should validate DishCategory enum', () => {
      const withValidCategory = {
        category: DishCategory.BREAKFAST,
      };
      const result = OCRDataSchema.safeParse(withValidCategory);
      expect(result.success).toBe(true);
      expect(result.data?.category).toBe(DishCategory.BREAKFAST);
    });

    it('should reject invalid category', () => {
      const withInvalidCategory = {
        category: 'invalid_category',
      };
      const result = OCRDataSchema.safeParse(withInvalidCategory);
      expect(result.success).toBe(false);
    });
  });
});
