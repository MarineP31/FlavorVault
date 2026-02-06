/**
 * Ingredients List Component
 * Task 7.1: Ingredients List Component
 * Task 7.2: Ingredient Item Component
 * Task 7.3: Ingredients Display Logic
 *
 * Displays formatted list of recipe ingredients
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ingredient } from '@/lib/db/schema/recipe';
import { formatIngredient } from '@/lib/utils/recipe-formatter';

export interface IngredientsListProps {
  ingredients: Ingredient[];
  testID?: string;
}

/**
 * Ingredients List Component
 *
 * Displays recipe ingredients in a formatted list.
 * Each ingredient is formatted as "quantity unit name" (e.g., "2 cups flour").
 *
 * Features:
 * - Uses formatIngredient utility for consistent formatting
 * - Bullet point styling
 * - Dark mode support
 * - Accessibility labels
 * - Empty state handling
 * - Validation and error handling
 *
 * @param props - Component props
 * @returns IngredientsList component
 *
 * @example
 * ```tsx
 * <IngredientsList
 *   ingredients={[
 *     { name: 'flour', quantity: 2, unit: MeasurementUnit.CUP },
 *     { name: 'sugar', quantity: 1, unit: MeasurementUnit.CUP },
 *   ]}
 * />
 * ```
 */
export function IngredientsList({
  ingredients,
  testID = 'ingredients-list',
}: IngredientsListProps) {
  // Validate and filter ingredients
  const validIngredients = React.useMemo(() => {
    if (!ingredients || !Array.isArray(ingredients)) {
      return [];
    }
    return ingredients.filter(
      (ingredient) => ingredient && ingredient.name && ingredient.name.trim().length > 0
    );
  }, [ingredients]);

  // Handle empty ingredients
  if (validIngredients.length === 0) {
    return (
      <View className="px-4 py-6" testID={`${testID}-empty`}>
        <Text className="text-lg font-bold text-black dark:text-white mb-3">
          Ingredients
        </Text>
        <Text className="text-sm text-[#8E8E93] italic">
          No ingredients listed for this recipe.
        </Text>
      </View>
    );
  }

  return (
    <View className="px-4 py-6" testID={testID}>
      {/* Section Title */}
      <Text
        className="text-lg font-bold text-black dark:text-white mb-3"
        accessibilityRole="header"
      >
        Ingredients
      </Text>

      {/* Ingredients List */}
      <View
        className="gap-2.5"
        accessibilityLabel={`${validIngredients.length} ingredients`}
      >
        {validIngredients.map((ingredient, index) => (
          <IngredientItem
            key={`ingredient-${index}`}
            ingredient={ingredient}
            index={index}
            testID={`${testID}-item-${index}`}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Ingredient Item Component
 *
 * Displays a single ingredient with bullet point styling.
 *
 * Features:
 * - Bullet point indicator
 * - Formatted ingredient text
 * - Proper spacing
 * - Dark mode support
 * - Accessibility
 *
 * @param props - Component props
 * @returns IngredientItem component
 */
interface IngredientItemProps {
  ingredient: Ingredient;
  index: number;
  testID?: string;
}

function IngredientItem({ ingredient, index, testID }: IngredientItemProps) {
  const formattedIngredient = formatIngredient(ingredient);

  return (
    <View
      className="flex-row items-start gap-3"
      testID={testID}
      accessibilityLabel={formattedIngredient}
      accessibilityRole="text"
    >
      {/* Bullet Point */}
      <View className="mt-1.5">
        <View className="w-1.5 h-1.5 rounded-full bg-[#007AFF] dark:bg-[#0A84FF]" />
      </View>

      {/* Ingredient Text */}
      <Text className="flex-1 text-base text-black dark:text-white leading-relaxed">
        {formattedIngredient}
      </Text>
    </View>
  );
}
