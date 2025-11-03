/**
 * Grid Recipe Card Component
 *
 * Task 6.2: Grid Recipe Card Component
 * - Grid-specific card layout optimized for 2-column display
 * - Larger thumbnail images for visual appeal
 * - Card height based on content
 * - Consistent spacing between cards
 *
 * Implementation Notes:
 * - This is a wrapper around RecipeCard with variant="grid"
 * - Grid layout is handled by RecipeGrid component
 * - Optimized with React.memo for performance
 * - Designed for 2-column FlatList layout
 */

import React from 'react';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '@/lib/db';

interface RecipeCardGridProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  testID?: string;
}

/**
 * Grid-specific Recipe Card Component
 *
 * Features:
 * - Vertical layout optimized for grid display
 * - Large thumbnail image (width: 100%, height: 140)
 * - Two-line title with ellipsis
 * - Compact metadata (time and servings)
 * - Up to 2 tags displayed
 * - Card height adapts to content
 * - Shadow and elevation for depth
 *
 * Layout:
 * ```
 * ┌─────────────┐
 * │   Image     │
 * │  (140px)    │
 * ├─────────────┤
 * │ Recipe Title│
 * │ (2 lines)   │
 * ├─────────────┤
 * │ ⏱ 30m 👥 4 │
 * ├─────────────┤
 * │ [tag] [tag] │
 * └─────────────┘
 * ```
 *
 * @param props - Component props
 * @returns Memoized grid recipe card
 *
 * @example
 * ```tsx
 * <RecipeCardGrid
 *   recipe={recipe}
 *   onPress={handleRecipePress}
 *   testID="recipe-card-grid-1"
 * />
 * ```
 */
export const RecipeCardGrid = React.memo<RecipeCardGridProps>(
  ({ recipe, onPress, testID }) => {
    return (
      <RecipeCard
        recipe={recipe}
        onPress={onPress}
        variant="grid"
        testID={testID}
      />
    );
  }
);

RecipeCardGrid.displayName = 'RecipeCardGrid';
