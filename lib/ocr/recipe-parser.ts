/**
 * Recipe Parser Service
 * Smart parsing algorithms to extract recipe components from OCR text
 */

import { DishCategory } from '@/constants/enums';
import { parseIngredient, isLikelyIngredientLine, type ParsedIngredient } from './ingredient-parser';

export interface ParsedInstruction {
  step: string;
  stepNumber: number;
  confidence: number;
}

export interface ParsedMetadata {
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  category: DishCategory;
}

export interface ParsedRecipe {
  title: string;
  titleConfidence: number;
  ingredients: ParsedIngredient[];
  ingredientsConfidence: number;
  instructions: ParsedInstruction[];
  instructionsConfidence: number;
  metadata: ParsedMetadata;
  metadataConfidence: number;
  overallConfidence: number;
  rawText: string;
}

const INGREDIENT_SECTION_HEADERS = [
  // English
  'ingredients',
  'ingredient list',
  'what you need',
  'you will need',
  'you\'ll need',
  'supplies',
  // French
  'ingrédients',
  'ingredients', // without accent (OCR might miss it)
];

const INSTRUCTION_SECTION_HEADERS = [
  // English
  'instructions',
  'directions',
  'method',
  'steps',
  'how to make',
  'preparation',
  'procedure',
  // French
  'préparation',
  'etapes',
  'étapes',
  'recette',
];

const TIME_PATTERNS = {
  // English patterns
  prep: /prep(?:aration)?\s*(?:time)?[:\s]*(\d+)\s*(min(?:ute)?s?|hr?s?|hour?s?)/i,
  cook: /cook(?:ing)?\s*(?:time)?[:\s]*(\d+)\s*(min(?:ute)?s?|hr?s?|hour?s?)/i,
  total: /total\s*(?:time)?[:\s]*(\d+)\s*(min(?:ute)?s?|hr?s?|hour?s?)/i,
  // French patterns
  prepFr: /pr[ée]paration\s*[:\s]*(\d+)\s*(min(?:ute)?s?|h(?:eure)?s?)/i,
  cookFr: /cuisson\s*[:\s]*(\d+)\s*(min(?:ute)?s?|h(?:eure)?s?)/i,
  restFr: /repos\s*[:\s]*(\d+)\s*(min(?:ute)?s?|h(?:eure)?s?)/i,
};

const SERVINGS_PATTERNS = [
  /(?:serves|servings|yield|makes)[:\s]*(\d+)/i,
  /pour\s*(\d+)\s*personnes?/i, // French: "pour 4 personnes"
  /(\d+)\s*personnes?/i, // French: "4 personnes"
  /(\d+)\s*portions?/i, // French: "4 portions"
];

function parseTimeToMinutes(value: number, unit: string): number {
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit.startsWith('h')) {
    return value * 60;
  }
  return value;
}

function extractMetadata(text: string): { metadata: ParsedMetadata; confidence: number } {
  let confidence = 0.5;
  const metadata: ParsedMetadata = {
    prepTime: null,
    cookTime: null,
    servings: null,
    category: DishCategory.DINNER, // Default
  };

  // Try English prep time first, then French
  const prepMatch = TIME_PATTERNS.prep.exec(text) || TIME_PATTERNS.prepFr.exec(text);
  if (prepMatch) {
    metadata.prepTime = parseTimeToMinutes(Number.parseInt(prepMatch[1], 10), prepMatch[2]);
    confidence += 0.15;
  }

  // Try English cook time first, then French
  const cookMatch = TIME_PATTERNS.cook.exec(text) || TIME_PATTERNS.cookFr.exec(text);
  if (cookMatch) {
    metadata.cookTime = parseTimeToMinutes(Number.parseInt(cookMatch[1], 10), cookMatch[2]);
    confidence += 0.15;
  }

  // French "repos" (rest time) - add to prep time if exists
  const restMatch = TIME_PATTERNS.restFr.exec(text);
  if (restMatch) {
    const restTime = parseTimeToMinutes(Number.parseInt(restMatch[1], 10), restMatch[2]);
    metadata.prepTime = (metadata.prepTime || 0) + restTime;
    confidence += 0.1;
  }

  // Try all servings patterns
  for (const pattern of SERVINGS_PATTERNS) {
    const servingsMatch = pattern.exec(text);
    if (servingsMatch) {
      metadata.servings = Number.parseInt(servingsMatch[1], 10);
      confidence += 0.15;
      break;
    }
  }

  // Try to detect category from keywords (English + French)
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes('breakfast') ||
    lowerText.includes('morning') ||
    lowerText.includes('petit-déjeuner') ||
    lowerText.includes('petit déjeuner')
  ) {
    metadata.category = DishCategory.BREAKFAST;
  } else if (
    lowerText.includes('dessert') ||
    lowerText.includes('cake') ||
    lowerText.includes('cookie') ||
    lowerText.includes('gâteau') ||
    lowerText.includes('tarte') ||
    lowerText.includes('far') ||
    lowerText.includes('flan') ||
    lowerText.includes('crème') ||
    lowerText.includes('mousse')
  ) {
    metadata.category = DishCategory.DESSERT;
  } else if (
    lowerText.includes('snack') ||
    lowerText.includes('appetizer') ||
    lowerText.includes('apéritif') ||
    lowerText.includes('entrée')
  ) {
    metadata.category = DishCategory.SNACK;
  } else if (lowerText.includes('lunch') || lowerText.includes('sandwich') || lowerText.includes('déjeuner')) {
    metadata.category = DishCategory.LUNCH;
  } else if (
    lowerText.includes('drink') ||
    lowerText.includes('smoothie') ||
    lowerText.includes('cocktail') ||
    lowerText.includes('boisson')
  ) {
    metadata.category = DishCategory.BEVERAGE;
  }

  return { metadata, confidence: Math.min(confidence, 1) };
}

function findSectionBoundaries(lines: string[]): {
  titleEnd: number;
  ingredientsStart: number;
  ingredientsEnd: number;
  instructionsStart: number;
} {
  let titleEnd = 0;
  let ingredientsStart = -1;
  let ingredientsEnd = -1;
  let instructionsStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const lowerLine = lines[i].toLowerCase().trim();

    // Find ingredients section
    if (ingredientsStart === -1) {
      for (const header of INGREDIENT_SECTION_HEADERS) {
        if (lowerLine.includes(header)) {
          ingredientsStart = i + 1;
          if (titleEnd === 0) titleEnd = i;
          break;
        }
      }
    }

    // Find instructions section
    if (instructionsStart === -1) {
      for (const header of INSTRUCTION_SECTION_HEADERS) {
        if (lowerLine.includes(header)) {
          instructionsStart = i + 1;
          if (ingredientsStart !== -1 && ingredientsEnd === -1) {
            ingredientsEnd = i;
          }
          break;
        }
      }
    }
  }

  // If no explicit sections found, use heuristics
  if (ingredientsStart === -1) {
    for (let i = 1; i < lines.length; i++) {
      if (isLikelyIngredientLine(lines[i])) {
        ingredientsStart = i;
        titleEnd = Math.max(0, i - 1);
        break;
      }
    }
  }

  if (ingredientsEnd === -1 && ingredientsStart !== -1) {
    for (let i = ingredientsStart; i < lines.length; i++) {
      const line = lines[i].trim();
      // Look for instruction patterns:
      // - "1. Do something" or "1) Do something"
      // - "1 Do something" (just number + space + uppercase, common in French recipes)
      // - "Step 1" or "Étape 1"
      const isNumberedInstruction =
        /^\d+[.)]\s+[A-Z]/i.test(line) ||
        /^\d+\s+[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ]/i.test(line) ||
        /^(?:step|étape)\s*\d/i.test(line);

      if (isNumberedInstruction && !isLikelyIngredientLine(line)) {
        ingredientsEnd = i;
        instructionsStart = i;
        break;
      }
      // Or non-ingredient-like lines after ingredients
      if (line.length > 0 && !isLikelyIngredientLine(line) && i > ingredientsStart + 2) {
        const nextFewAreNotIngredients = lines
          .slice(i, Math.min(i + 3, lines.length))
          .every((l) => !isLikelyIngredientLine(l));
        if (nextFewAreNotIngredients) {
          ingredientsEnd = i;
          instructionsStart = i;
          break;
        }
      }
    }
  }

  // Default fallbacks
  if (titleEnd === 0 && lines.length > 0) titleEnd = 1;
  if (ingredientsEnd === -1) ingredientsEnd = instructionsStart !== -1 ? instructionsStart : lines.length;
  if (instructionsStart === -1) instructionsStart = ingredientsEnd;

  return { titleEnd, ingredientsStart, ingredientsEnd, instructionsStart };
}

function extractTitle(lines: string[], endIndex: number): { title: string; confidence: number } {
  const titleLines = lines.slice(0, endIndex).filter((l) => l.trim().length > 0);

  if (titleLines.length === 0) {
    return { title: 'Untitled Recipe', confidence: 0.3 };
  }

  // First non-empty line is likely the title
  let title = titleLines[0].trim();

  // Clean up common prefixes
  title = title.replace(/^recipe[:\s]*/i, '').trim();

  // Remove trailing punctuation
  title = title.replace(/[.!?]+$/, '').trim();

  // Capitalize properly
  title = title
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  const confidence = title.length > 3 && title.length < 100 ? 0.85 : 0.6;

  return { title, confidence };
}

function extractIngredients(
  lines: string[],
  startIndex: number,
  endIndex: number
): { ingredients: ParsedIngredient[]; confidence: number } {
  if (startIndex === -1 || startIndex >= endIndex) {
    return { ingredients: [], confidence: 0.3 };
  }

  const ingredientLines = lines.slice(startIndex, endIndex).filter((l) => l.trim().length > 0);

  const ingredients = ingredientLines.map((line) => parseIngredient(line));

  const validIngredients = ingredients.filter((ing) => ing.name.length > 1);

  if (validIngredients.length === 0) {
    return { ingredients: [], confidence: 0.3 };
  }

  const avgConfidence =
    validIngredients.reduce((sum, ing) => sum + ing.confidence, 0) / validIngredients.length;

  return { ingredients: validIngredients, confidence: avgConfidence };
}

function extractInstructions(
  lines: string[],
  startIndex: number
): { instructions: ParsedInstruction[]; confidence: number } {
  if (startIndex === -1 || startIndex >= lines.length) {
    return { instructions: [], confidence: 0.3 };
  }

  const instructionLines = lines.slice(startIndex).filter((l) => l.trim().length > 0);

  const instructions: ParsedInstruction[] = [];
  let stepNumber = 1;

  for (const line of instructionLines) {
    let step = line.trim();
    let confidence = 0.8;

    // Remove step numbers if present (handles "1.", "1)", "1 ", "Step 1", "Étape 1")
    const numberedMatch = /^(?:(?:step|étape)\s*)?(\d+)[.):]*\s+(.+)/i.exec(step);
    if (numberedMatch) {
      step = numberedMatch[2].trim();
      confidence = 0.9;
    } else {
      // Remove bullet points
      step = step.replace(/^[-•*·]\s*/, '').trim();
    }

    if (step.length < 5) {
      continue; // Skip very short lines
    }

    // Check if it looks like a section header
    const lowerStep = step.toLowerCase();
    const isHeader = [...INGREDIENT_SECTION_HEADERS, ...INSTRUCTION_SECTION_HEADERS].some((h) =>
      lowerStep.includes(h)
    );
    if (isHeader) {
      continue;
    }

    // Lower confidence for very long steps (might be multiple merged)
    if (step.length > 300) {
      confidence *= 0.8;
    }

    instructions.push({
      step,
      stepNumber,
      confidence,
    });

    stepNumber++;
  }

  if (instructions.length === 0) {
    return { instructions: [], confidence: 0.3 };
  }

  const avgConfidence =
    instructions.reduce((sum, inst) => sum + inst.confidence, 0) / instructions.length;

  return { instructions, confidence: avgConfidence };
}

export function parseRecipeText(rawText: string): ParsedRecipe {
  const lines = rawText.split(/\n/).map((l) => l.trim());
  const nonEmptyLines = lines.filter((l) => l.length > 0);

  if (nonEmptyLines.length === 0) {
    return {
      title: 'Untitled Recipe',
      titleConfidence: 0,
      ingredients: [],
      ingredientsConfidence: 0,
      instructions: [],
      instructionsConfidence: 0,
      metadata: {
        prepTime: null,
        cookTime: null,
        servings: 4,
        category: DishCategory.DINNER,
      },
      metadataConfidence: 0,
      overallConfidence: 0,
      rawText,
    };
  }

  const boundaries = findSectionBoundaries(nonEmptyLines);

  const { title, confidence: titleConfidence } = extractTitle(nonEmptyLines, boundaries.titleEnd);

  const { ingredients, confidence: ingredientsConfidence } = extractIngredients(
    nonEmptyLines,
    boundaries.ingredientsStart,
    boundaries.ingredientsEnd
  );

  const { instructions, confidence: instructionsConfidence } = extractInstructions(
    nonEmptyLines,
    boundaries.instructionsStart
  );

  const { metadata, confidence: metadataConfidence } = extractMetadata(rawText);

  // Set default servings if not found
  metadata.servings ??= 4;

  // Calculate overall confidence (weighted average)
  const overallConfidence =
    titleConfidence * 0.15 +
    ingredientsConfidence * 0.35 +
    instructionsConfidence * 0.35 +
    metadataConfidence * 0.15;

  return {
    title,
    titleConfidence,
    ingredients,
    ingredientsConfidence,
    instructions,
    instructionsConfidence,
    metadata,
    metadataConfidence,
    overallConfidence,
    rawText,
  };
}

