/**
 * Recipe Grid Component
 *
 * Task 7.1: Recipe Grid Component
 * - 2-column grid layout using FlatList
 * - Equal-width cards for consistent appearance
 * - Responsive design for different screen sizes
 * - Proper grid spacing and margins
 * - Infinite scroll support with onEndReached
 *
 * Implementation Notes:
 * - Re-export wrapper for RecipeGrid.tsx (unified component)
 * - This file exists to satisfy task requirements for file structure
 * - The actual implementation is in RecipeGrid.tsx
 * - Uses FlatList with numColumns={2} for 2-column layout
 * - Implements virtual scrolling automatically via FlatList
 * - Supports pull-to-refresh and infinite scroll
 */

export { RecipeGrid } from './RecipeGrid';
export type { RecipeGridProps } from './RecipeGrid';

/**
 * Recipe Grid Features:
 *
 * Layout:
 * - 2-column grid using FlatList with numColumns={2}
 * - Equal-width cards (flex: 1, maxWidth: '50%')
 * - Consistent spacing between cards (gap: 16)
 * - Padding around grid (16px)
 * - Space at bottom for FAB (paddingBottom: 100)
 *
 * Performance:
 * - Virtual scrolling via FlatList (automatic)
 * - Lazy loading for recipe images
 * - Optimized re-rendering with React.memo on RecipeCard
 * - Efficient keyExtractor (recipe.id)
 *
 * Infinite Scroll:
 * - onEndReached callback for pagination
 * - onEndReachedThreshold={0.5} triggers at 50% from bottom
 * - Loading states for seamless pagination
 * - Prevents duplicate loads during fetch
 *
 * Interactions:
 * - Pull-to-refresh with onRefresh callback
 * - Recipe card press for navigation
 * - Empty state when no recipes
 * - Loading indicator during refresh
 *
 * Responsive Design:
 * - Cards adapt to screen width (50% each minus gaps)
 * - Maintains aspect ratio for images
 * - Scales gracefully on different devices
 * - Works on phones and tablets
 *
 * Accessibility:
 * - Semantic structure with FlatList
 * - Unique testIDs for each card
 * - Accessible RecipeCard components
 * - Screen reader compatible
 */
