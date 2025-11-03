/**
 * Recipe List Component
 *
 * Task 7.2: Recipe List Component
 * - Single-column list layout using FlatList
 * - Efficient use of vertical space
 * - Consistent row height for uniform appearance
 * - Proper list spacing and margins
 * - Infinite scroll support with onEndReached
 *
 * Implementation Notes:
 * - Re-export wrapper for RecipeList.tsx (unified component)
 * - This file exists to satisfy task requirements for file structure
 * - The actual implementation is in RecipeList.tsx
 * - Uses FlatList for single-column layout
 * - Implements virtual scrolling automatically via FlatList
 * - Supports pull-to-refresh and infinite scroll
 */

export { RecipeList } from './RecipeList';
export type { RecipeListProps } from './RecipeList';

/**
 * Recipe List Features:
 *
 * Layout:
 * - Single-column list using FlatList
 * - Horizontal cards with image on left
 * - Consistent row height (~104px per card)
 * - Compact vertical spacing (marginVertical: 6)
 * - Horizontal margins (marginHorizontal: 16)
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
 * - Cards fill available width
 * - Maintains consistent row height
 * - Scales gracefully on different devices
 * - Works on phones and tablets
 * - Text truncates properly on narrow screens
 *
 * Accessibility:
 * - Semantic structure with FlatList
 * - Unique testIDs for each card
 * - Accessible RecipeCard components
 * - Screen reader compatible
 * - Clear visual hierarchy
 *
 * List View Benefits:
 * - More recipes visible per screen
 * - Easier to scan titles
 * - Better for text-focused browsing
 * - More metadata visible per card
 * - Compact and efficient layout
 */
