/**
 * OCR Result Validation Schemas
 * Zod schemas for validating parsed OCR recipe data
 */

import { z } from 'zod';
import { DishCategory, MeasurementUnit, EnumUtils } from '@/constants/enums';

/**
 * Schema for parsed ingredient from OCR
 */
export const ParsedIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive().nullable(),
  unit: z.nativeEnum(MeasurementUnit).nullable(),
  originalText: z.string(),
  confidence: z.number().min(0).max(1),
});

/**
 * Schema for parsed instruction from OCR
 */
export const ParsedInstructionSchema = z.object({
  step: z.string().min(1),
  stepNumber: z.number().int().positive(),
  confidence: z.number().min(0).max(1),
});

/**
 * Schema for parsed metadata from OCR
 */
export const ParsedMetadataSchema = z.object({
  prepTime: z.number().int().positive().nullable(),
  cookTime: z.number().int().positive().nullable(),
  servings: z.number().int().positive().nullable(),
  category: z.nativeEnum(DishCategory),
});

/**
 * Schema for full parsed recipe from OCR
 */
export const ParsedRecipeSchema = z.object({
  title: z.string().min(1),
  titleConfidence: z.number().min(0).max(1),
  ingredients: z.array(ParsedIngredientSchema),
  ingredientsConfidence: z.number().min(0).max(1),
  instructions: z.array(ParsedInstructionSchema),
  instructionsConfidence: z.number().min(0).max(1),
  metadata: ParsedMetadataSchema,
  metadataConfidence: z.number().min(0).max(1),
  overallConfidence: z.number().min(0).max(1),
  rawText: z.string(),
});

/**
 * Schema for OCR ingredient passed to form (without confidence/originalText)
 */
export const OCRIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive().nullable(),
  unit: z
    .string()
    .nullable()
    .transform((val) => {
      if (val === null) return null;
      return EnumUtils.isValidMeasurementUnit(val) ? (val as MeasurementUnit) : null;
    }),
});

/**
 * Schema for OCR data passed to recipe form
 */
export const OCRDataSchema = z.object({
  title: z.string().default(''),
  ingredients: z.array(OCRIngredientSchema).default([]),
  steps: z.array(z.string()).default([]),
  servings: z.number().int().positive().default(4),
  category: z.nativeEnum(DishCategory).default(DishCategory.DINNER),
  prepTime: z.number().int().positive().nullable().default(null),
  cookTime: z.number().int().positive().nullable().default(null),
  imageUri: z.string().nullable().default(null),
  source: z.string().nullable().default(null),
});

export type ParsedIngredient = z.infer<typeof ParsedIngredientSchema>;
export type ParsedInstruction = z.infer<typeof ParsedInstructionSchema>;
export type ParsedMetadata = z.infer<typeof ParsedMetadataSchema>;
export type ParsedRecipeValidated = z.infer<typeof ParsedRecipeSchema>;
export type OCRIngredient = z.infer<typeof OCRIngredientSchema>;
export type OCRData = z.infer<typeof OCRDataSchema>;

/**
 * Safely parse JSON string to ParsedRecipe with validation
 */
export function safeParseParsedRecipe(jsonString: string | undefined): {
  success: boolean;
  data?: ParsedRecipeValidated;
  error?: string;
} {
  if (!jsonString) {
    return { success: false, error: 'No OCR data provided' };
  }

  try {
    const parsed = JSON.parse(jsonString);
    const result = ParsedRecipeSchema.safeParse(parsed);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return {
      success: false,
      error: `Invalid OCR data: ${result.error.errors[0]?.message || 'Unknown error'}`,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? `Failed to parse JSON: ${e.message}` : 'Failed to parse JSON',
    };
  }
}

/**
 * Safely parse JSON string to OCRData with validation
 */
export function safeParseOCRData(jsonString: string | undefined): {
  success: boolean;
  data?: OCRData;
  error?: string;
} {
  if (!jsonString) {
    return { success: false, error: 'No OCR data provided' };
  }

  try {
    const parsed = JSON.parse(jsonString);
    const result = OCRDataSchema.safeParse(parsed);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return {
      success: false,
      error: `Invalid OCR data: ${result.error.errors[0]?.message || 'Unknown error'}`,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? `Failed to parse JSON: ${e.message}` : 'Failed to parse JSON',
    };
  }
}

/**
 * Check if parsed recipe has minimum required data for form navigation
 */
export function hasMinimumRecipeData(recipe: ParsedRecipeValidated): boolean {
  const hasTitle = recipe.title.length > 0 && recipe.title !== 'Untitled Recipe';
  const hasIngredients = recipe.ingredients.length > 0;
  const hasInstructions = recipe.instructions.length > 0;

  return hasTitle || hasIngredients || hasInstructions;
}
