/**
 * List Recipe Card Component
 *
 * Task 6.3: List Recipe Card Component
 * - List-specific card layout for single-column display
 * - Horizontal card layout with image on left
 * - Compact information display
 * - Consistent row height for uniform appearance
 *
 * Implementation Notes:
 * - This is a wrapper around RecipeCard with variant="list"
 * - List layout is handled by RecipeList component
 * - Optimized with React.memo for performance
 * - Designed for single-column FlatList layout
 */

import React from 'react';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '@/lib/db';

interface RecipeCardListProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  testID?: string;
}

/**
 * List-specific Recipe Card Component
 *
 * Features:
 * - Horizontal layout with image on left
 * - Square thumbnail image (80x80)
 * - Single-line title with ellipsis
 * - Full metadata row (time, servings, category)
 * - Up to 3 tags displayed with overflow count
 * - Chevron indicator on right
 * - Consistent row height (~104px)
 * - Efficient vertical space usage
 *
 * Layout:
 * ```
 * ┌────┬──────────────────────────────┬─┐
 * │    │ Recipe Title                 │›│
 * │IMG │ ⏱ 30m  👥 4  🍽 Dinner      │ │
 * │    │ [tag] [tag] [tag] +2         │ │
 * └────┴──────────────────────────────┴─┘
 * ```
 *
 * @param props - Component props
 * @returns Memoized list recipe card
 *
 * @example
 * ```tsx
 * <RecipeCardList
 *   recipe={recipe}
 *   onPress={handleRecipePress}
 *   testID="recipe-card-list-1"
 * />
 * ```
 */
export const RecipeCardList = React.memo<RecipeCardListProps>(
  ({ recipe, onPress, testID }) => {
    return (
      <RecipeCard
        recipe={recipe}
        onPress={onPress}
        variant="list"
        testID={testID}
      />
    );
  }
);

RecipeCardList.displayName = 'RecipeCardList';
