/**
 * Confidence Scorer
 * Calculates and categorizes confidence levels for OCR results
 */

import type { ParsedRecipe, ParsedInstruction } from './recipe-parser';
import type { ParsedIngredient } from './ingredient-parser';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConfidenceThresholds {
  high: number;
  medium: number;
}

const DEFAULT_THRESHOLDS: ConfidenceThresholds = {
  high: 0.8,
  medium: 0.6,
};

export function getConfidenceLevel(
  confidence: number,
  thresholds: ConfidenceThresholds = DEFAULT_THRESHOLDS
): ConfidenceLevel {
  if (confidence >= thresholds.high) return 'high';
  if (confidence >= thresholds.medium) return 'medium';
  return 'low';
}

export function getConfidencePercentage(confidence: number): number {
  return Math.round(confidence * 100);
}

export function getConfidenceLabel(level: ConfidenceLevel): string {
  switch (level) {
    case 'high':
      return 'High confidence';
    case 'medium':
      return 'Medium confidence';
    case 'low':
      return 'Low confidence';
  }
}

export function getConfidenceSummary(level: ConfidenceLevel): string {
  switch (level) {
    case 'high':
      return 'Text extracted with high accuracy';
    case 'medium':
      return 'Moderate confidence - review highlighted sections';
    case 'low':
      return 'Low confidence - manual review recommended';
  }
}

export interface FieldConfidence {
  title: ConfidenceLevel;
  ingredients: ConfidenceLevel;
  instructions: ConfidenceLevel;
  metadata: ConfidenceLevel;
  overall: ConfidenceLevel;
}

export function getRecipeFieldConfidence(recipe: ParsedRecipe): FieldConfidence {
  return {
    title: getConfidenceLevel(recipe.titleConfidence),
    ingredients: getConfidenceLevel(recipe.ingredientsConfidence),
    instructions: getConfidenceLevel(recipe.instructionsConfidence),
    metadata: getConfidenceLevel(recipe.metadataConfidence),
    overall: getConfidenceLevel(recipe.overallConfidence),
  };
}

export interface LowConfidenceItem {
  type: 'ingredient' | 'instruction';
  index: number;
  text: string;
  confidence: number;
}

export function findLowConfidenceItems(
  recipe: ParsedRecipe,
  threshold: number = DEFAULT_THRESHOLDS.medium
): LowConfidenceItem[] {
  const items: LowConfidenceItem[] = [];

  recipe.ingredients.forEach((ingredient, index) => {
    if (ingredient.confidence < threshold) {
      items.push({
        type: 'ingredient',
        index,
        text: ingredient.originalText,
        confidence: ingredient.confidence,
      });
    }
  });

  recipe.instructions.forEach((instruction, index) => {
    if (instruction.confidence < threshold) {
      items.push({
        type: 'instruction',
        index,
        text: instruction.step,
        confidence: instruction.confidence,
      });
    }
  });

  return items;
}

export function hasLowConfidenceItems(
  recipe: ParsedRecipe,
  threshold: number = DEFAULT_THRESHOLDS.medium
): boolean {
  return findLowConfidenceItems(recipe, threshold).length > 0;
}

export function shouldShowWarningBanner(recipe: ParsedRecipe): boolean {
  return recipe.overallConfidence < DEFAULT_THRESHOLDS.high || hasLowConfidenceItems(recipe);
}

export function isIngredientLowConfidence(
  ingredient: ParsedIngredient,
  threshold: number = DEFAULT_THRESHOLDS.medium
): boolean {
  return ingredient.confidence < threshold;
}

export function isInstructionLowConfidence(
  instruction: ParsedInstruction,
  threshold: number = DEFAULT_THRESHOLDS.medium
): boolean {
  return instruction.confidence < threshold;
}

export function getConfidenceColor(level: ConfidenceLevel): {
  border: string;
  background: string;
  text: string;
} {
  switch (level) {
    case 'high':
      return {
        border: '#8B5CF6', // Purple
        background: 'transparent',
        text: '#8B5CF6',
      };
    case 'medium':
      return {
        border: '#F59E0B', // Amber/Yellow
        background: '#FEF3C7',
        text: '#92400E',
      };
    case 'low':
      return {
        border: '#F59E0B',
        background: '#FEF3C7',
        text: '#92400E',
      };
  }
}

export function getProgressBarColor(confidence: number): string {
  const level = getConfidenceLevel(confidence);
  switch (level) {
    case 'high':
      return '#22C55E'; // Green
    case 'medium':
      return '#F59E0B'; // Amber
    case 'low':
      return '#EF4444'; // Red
  }
}
