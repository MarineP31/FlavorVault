/**
 * Ingredient Parser
 * Parses ingredient text into structured quantity, unit, and name
 */

import { MeasurementUnit } from '@/constants/enums';

export interface ParsedIngredient {
  name: string;
  quantity: number | null;
  unit: MeasurementUnit | null;
  originalText: string;
  confidence: number;
}

const UNIT_MAPPINGS: Record<string, MeasurementUnit> = {
  // Teaspoon variations (English + French)
  'tsp': MeasurementUnit.TSP,
  'teaspoon': MeasurementUnit.TSP,
  'teaspoons': MeasurementUnit.TSP,
  't': MeasurementUnit.TSP,
  'cc': MeasurementUnit.TSP, // cuillère à café (French)
  'c. à c.': MeasurementUnit.TSP,
  'c.à.c.': MeasurementUnit.TSP,
  'cuillère à café': MeasurementUnit.TSP,
  'cuillères à café': MeasurementUnit.TSP,

  // Tablespoon variations (English + French)
  'tbsp': MeasurementUnit.TBSP,
  'tablespoon': MeasurementUnit.TBSP,
  'tablespoons': MeasurementUnit.TBSP,
  'tbs': MeasurementUnit.TBSP,
  'cs': MeasurementUnit.TBSP, // cuillère à soupe (French)
  'c. à s.': MeasurementUnit.TBSP,
  'c.à.s.': MeasurementUnit.TBSP,
  'cuillère à soupe': MeasurementUnit.TBSP,
  'cuillères à soupe': MeasurementUnit.TBSP,

  // Cup variations
  'cup': MeasurementUnit.CUP,
  'cups': MeasurementUnit.CUP,
  'c': MeasurementUnit.CUP,

  // Fluid ounce variations
  'fl oz': MeasurementUnit.FL_OZ,
  'fluid ounce': MeasurementUnit.FL_OZ,
  'fluid ounces': MeasurementUnit.FL_OZ,

  // Milliliter variations
  'ml': MeasurementUnit.ML,
  'milliliter': MeasurementUnit.ML,
  'milliliters': MeasurementUnit.ML,

  // Liter variations
  'l': MeasurementUnit.LITER,
  'liter': MeasurementUnit.LITER,
  'liters': MeasurementUnit.LITER,
  'litre': MeasurementUnit.LITER,
  'litres': MeasurementUnit.LITER,
  'cl': MeasurementUnit.ML, // centiliter (1cl = 10ml, approximate to ML)
  'centilitre': MeasurementUnit.ML,
  'centilitres': MeasurementUnit.ML,

  // Ounce variations
  'oz': MeasurementUnit.OZ,
  'ounce': MeasurementUnit.OZ,
  'ounces': MeasurementUnit.OZ,

  // Pound variations
  'lb': MeasurementUnit.LB,
  'lbs': MeasurementUnit.LB,
  'pound': MeasurementUnit.LB,
  'pounds': MeasurementUnit.LB,

  // Gram variations
  'g': MeasurementUnit.GRAM,
  'gram': MeasurementUnit.GRAM,
  'grams': MeasurementUnit.GRAM,

  // Kilogram variations
  'kg': MeasurementUnit.KG,
  'kilogram': MeasurementUnit.KG,
  'kilograms': MeasurementUnit.KG,

  // Count units
  'piece': MeasurementUnit.PIECE,
  'pieces': MeasurementUnit.PIECE,
  'slice': MeasurementUnit.SLICE,
  'slices': MeasurementUnit.SLICE,
  'clove': MeasurementUnit.CLOVE,
  'cloves': MeasurementUnit.CLOVE,
  'head': MeasurementUnit.HEAD,
  'heads': MeasurementUnit.HEAD,
  'bunch': MeasurementUnit.BUNCH,
  'bunches': MeasurementUnit.BUNCH,
  'can': MeasurementUnit.CAN,
  'cans': MeasurementUnit.CAN,
  'bottle': MeasurementUnit.BOTTLE,
  'bottles': MeasurementUnit.BOTTLE,
  'package': MeasurementUnit.PACKAGE,
  'packages': MeasurementUnit.PACKAGE,
  'bag': MeasurementUnit.BAG,
  'bags': MeasurementUnit.BAG,
  'box': MeasurementUnit.BOX,
  'boxes': MeasurementUnit.BOX,
};

const FRACTION_MAP: Record<string, number> = {
  '½': 0.5,
  '⅓': 0.333,
  '⅔': 0.666,
  '¼': 0.25,
  '¾': 0.75,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
  '1/2': 0.5,
  '1/3': 0.333,
  '2/3': 0.666,
  '1/4': 0.25,
  '3/4': 0.75,
  '1/8': 0.125,
  '3/8': 0.375,
  '5/8': 0.625,
  '7/8': 0.875,
};

function parseQuantity(text: string): { value: number | null; remaining: string } {
  let trimmed = text.trim();

  // Unicode fractions
  for (const [fraction, value] of Object.entries(FRACTION_MAP)) {
    if (trimmed.startsWith(fraction)) {
      return {
        value,
        remaining: trimmed.slice(fraction.length).trim(),
      };
    }
  }

  // Whole number + fraction (e.g., "1 1/2")
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const denom = parseInt(mixedMatch[3], 10);
    return {
      value: whole + num / denom,
      remaining: trimmed.slice(mixedMatch[0].length).trim(),
    };
  }

  // Regular fraction (e.g., "1/2")
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)/);
  if (fractionMatch) {
    const num = parseInt(fractionMatch[1], 10);
    const denom = parseInt(fractionMatch[2], 10);
    return {
      value: num / denom,
      remaining: trimmed.slice(fractionMatch[0].length).trim(),
    };
  }

  // Decimal or whole number
  const numberMatch = trimmed.match(/^(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    return {
      value: parseFloat(numberMatch[1]),
      remaining: trimmed.slice(numberMatch[0].length).trim(),
    };
  }

  return { value: null, remaining: trimmed };
}

function parseUnit(text: string): { unit: MeasurementUnit | null; remaining: string } {
  const trimmed = text.trim().toLowerCase();

  // Sort by length descending to match longer units first
  const sortedUnits = Object.keys(UNIT_MAPPINGS).sort((a, b) => b.length - a.length);

  for (const unitStr of sortedUnits) {
    if (trimmed.startsWith(unitStr)) {
      const afterUnit = trimmed.slice(unitStr.length);
      // Ensure it's a word boundary
      if (afterUnit.length === 0 || /^[\s.,]/.test(afterUnit)) {
        return {
          unit: UNIT_MAPPINGS[unitStr],
          remaining: text.slice(unitStr.length).trim(),
        };
      }
    }
  }

  return { unit: null, remaining: text };
}

export function parseIngredient(text: string): ParsedIngredient {
  const originalText = text.trim();
  let confidence = 1.0;

  // Remove bullet points, list markers, and SmartPoints-style leading numbers
  // Pattern: "3 15 g de beurre" where "3" is metadata, not quantity
  let cleaned = originalText
    .replace(/^[-•*·]\s*/, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^[a-zA-Z]\s+/, '') // Remove single letter prefixes (e.g., "a 100g flour")
    .trim();

  // Detect and remove leading metadata numbers (like SmartPoints)
  // Pattern: single digit followed by space, then another number+unit
  const metadataPattern = /^(\d)\s+(\d+\s*(?:g|kg|ml|l|cl|cc|cs|oz|lb)\b)/i;
  const metadataMatch = cleaned.match(metadataPattern);
  if (metadataMatch) {
    cleaned = cleaned.slice(metadataMatch[1].length).trim();
  }

  const { value: quantity, remaining: afterQuantity } = parseQuantity(cleaned);
  if (quantity === null) {
    confidence *= 0.8;
  }

  const { unit, remaining: afterUnit } = parseUnit(afterQuantity);
  if (unit === null && quantity !== null) {
    confidence *= 0.9;
  }

  // Remove common connecting words (English + French)
  let name = afterUnit
    .replace(/^of\s+/i, '')
    .replace(/^de\s+/i, '') // French "de" connector
    .replace(/^d'\s*/i, '') // French "d'" connector (e.g., "d'extrait")
    .replace(/,\s*.*$/, '') // Remove everything after comma (often preparation notes)
    .trim();

  // Clean up parenthetical notes but keep track
  const hasNotes = /\([^)]+\)/.test(name);
  if (hasNotes) {
    confidence *= 0.95;
  }
  name = name.replace(/\s*\([^)]+\)/g, '').trim();

  if (!name) {
    name = originalText;
    confidence *= 0.5;
  }

  // Capitalize first letter
  name = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    name,
    quantity,
    unit,
    originalText,
    confidence,
  };
}

export function parseIngredientsList(text: string): ParsedIngredient[] {
  const lines = text.split(/\n/).filter((line) => line.trim().length > 0);
  return lines.map(parseIngredient);
}

export function isLikelyIngredientLine(text: string): boolean {
  const line = text.trim().toLowerCase();

  // Starts with bullet - likely ingredient list
  if (/^[-•*·]/.test(line)) {
    return true;
  }

  // Contains measurement unit keywords - strong indicator
  for (const unitStr of Object.keys(UNIT_MAPPINGS)) {
    // Check for unit as a word boundary to avoid false matches
    const unitPattern = new RegExp(`\\b${unitStr}\\b`);
    if (unitPattern.test(line)) {
      return true;
    }
  }

  // Starts with fraction - likely ingredient
  if (/^[½⅓⅔¼¾⅛⅜⅝⅞]/.test(line)) {
    return true;
  }

  // Pattern: number followed by unit (e.g., "15 g", "350 ml", "2 cups")
  // This handles both "15 g de beurre" and "3 15 g de beurre" (with SmartPoints prefix)
  if (/\d+\s*(?:g|kg|ml|l|cl|cc|cs|oz|lb|cup|tsp|tbsp)\b/i.test(line)) {
    return true;
  }

  // Standalone number at start followed by word (but NOT instruction-like)
  // Instruction pattern: "1 Préchauffer" (number + verb/action with long text)
  // Ingredient pattern: "2 œufs" (number + short noun, typically food item)
  if (/^\d+\s+\S+/.test(line)) {
    // If it's a short line (< 50 chars) with a number at start, likely ingredient
    // Long lines starting with number are more likely instructions
    const isShort = line.length < 50;
    const hasUnit = /\d+\s*(?:g|kg|ml|l|cl|cc|cs|oz|lb|cup|tsp|tbsp)\b/i.test(line);
    if (isShort || hasUnit) {
      return true;
    }
  }

  return false;
}
