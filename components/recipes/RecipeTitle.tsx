/**
 * Recipe Title Component
 * Task 5.1: Recipe Title Component
 * Task 5.2: Title Styling and Layout
 */

import React from 'react';
import { Text, View } from 'react-native';

interface RecipeTitleProps {
  title: string;
  testID?: string;
}

/**
 * Recipe title component with proper typography hierarchy
 *
 * Features:
 * - Large, bold title styling
 * - Proper typography hierarchy
 * - Truncation for long titles (optional)
 * - Responsive design
 * - Accessibility support
 * - Dark mode support
 *
 * @param props - Component props
 * @returns RecipeTitle component
 *
 * @example
 * ```tsx
 * <RecipeTitle title="Chocolate Chip Cookies" />
 * ```
 */
export function RecipeTitle({
  title,
  testID = 'recipe-title',
}: RecipeTitleProps) {
  return (
    <View
      className="px-4 mt-6"
      testID={testID}
    >
      <Text
        className="text-3xl font-bold leading-tight text-black dark:text-white"
        accessibilityRole="header"
        accessibilityLabel={`Recipe title: ${title}`}
        numberOfLines={3}
      >
        {title}
      </Text>
    </View>
  );
}
