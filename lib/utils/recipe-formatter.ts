/**
 * Recipe Data Formatting Utilities
 * Task 2.3: Recipe Data Formatting Utilities
 */

import { Ingredient } from '@/lib/db/schema/recipe';
import { MeasurementUnit } from '@/constants/enums';

/**
 * Format ingredient with quantity, unit, and name
 * Format: "quantity unit name" (e.g., "2 cups flour")
 *
 * @param ingredient - The ingredient to format
 * @returns Formatted ingredient string
 *
 * @example
 * ```tsx
 * formatIngredient({ name: 'flour', quantity: 2, unit: MeasurementUnit.CUP })
 * // Returns: "2 cups flour"
 * ```
 */
export function formatIngredient(ingredient: Ingredient): string {
  const parts: string[] = [];

  // Add quantity if present
  if (ingredient.quantity !== null && ingredient.quantity !== undefined) {
    // Format decimal quantities nicely
    const quantity = ingredient.quantity;
    if (Number.isInteger(quantity)) {
      parts.push(quantity.toString());
    } else {
      // Convert to fraction for common values
      const formatted = formatQuantityAsFraction(quantity);
      parts.push(formatted);
    }
  }

  // Add unit if present
  if (ingredient.unit) {
    parts.push(ingredient.unit);
  }

  // Add name (always present)
  parts.push(ingredient.name);

  return parts.join(' ');
}

/**
 * Format quantity as fraction for common decimal values
 *
 * @param quantity - The decimal quantity
 * @returns Formatted quantity string (fraction or decimal)
 */
function formatQuantityAsFraction(quantity: number): string {
  const fractionMap: { [key: number]: string } = {
    0.25: '1/4',
    0.33: '1/3',
    0.5: '1/2',
    0.66: '2/3',
    0.75: '3/4',
  };

  // Check if quantity matches a common fraction
  const rounded = Math.round(quantity * 100) / 100;
  if (fractionMap[rounded]) {
    return fractionMap[rounded];
  }

  // For mixed numbers (e.g., 1.5 -> 1 1/2)
  const whole = Math.floor(quantity);
  const decimal = quantity - whole;
  const roundedDecimal = Math.round(decimal * 100) / 100;

  if (whole > 0 && fractionMap[roundedDecimal]) {
    return `${whole} ${fractionMap[roundedDecimal]}`;
  }

  // Default to decimal with up to 2 decimal places
  return quantity.toFixed(2).replace(/\.?0+$/, '');
}

/**
 * Format time display (e.g., "30 min" or "1 hr 15 min")
 *
 * @param minutes - Time in minutes
 * @returns Formatted time string
 *
 * @example
 * ```tsx
 * formatTime(30)       // "30 min"
 * formatTime(60)       // "1 hr"
 * formatTime(75)       // "1 hr 15 min"
 * formatTime(null)     // "N/A"
 * ```
 */
export function formatTime(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || minutes === 0) {
    return 'N/A';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Format servings display
 *
 * @param servings - Number of servings
 * @returns Formatted servings string
 *
 * @example
 * ```tsx
 * formatServings(1)  // "1 serving"
 * formatServings(4)  // "4 servings"
 * ```
 */
export function formatServings(servings: number): string {
  if (servings === 1) {
    return '1 serving';
  }
  return `${servings} servings`;
}

/**
 * Format instruction step with automatic numbering
 *
 * @param step - The instruction step text
 * @param index - The step index (0-based)
 * @returns Object with step number and text
 *
 * @example
 * ```tsx
 * formatInstructionStep('Mix ingredients', 0)
 * // Returns: { number: 1, text: 'Mix ingredients' }
 * ```
 */
export function formatInstructionStep(
  step: string,
  index: number
): { number: number; text: string } {
  return {
    number: index + 1,
    text: step.trim(),
  };
}

/**
 * Calculate total cooking time (prep + cook)
 *
 * @param prepTime - Prep time in minutes
 * @param cookTime - Cook time in minutes
 * @returns Total time in minutes, or null if both are null
 *
 * @example
 * ```tsx
 * getTotalTime(15, 30)  // 45
 * getTotalTime(15, null) // 15
 * getTotalTime(null, null) // null
 * ```
 */
export function getTotalTime(
  prepTime: number | null,
  cookTime: number | null
): number | null {
  const prep = prepTime || 0;
  const cook = cookTime || 0;
  const total = prep + cook;
  return total > 0 ? total : null;
}
