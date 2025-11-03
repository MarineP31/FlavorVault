/**
 * EmptyState wrapper component
 * Task 9.1: Create `components/recipes/empty-state.tsx`
 *
 * This is a re-export wrapper that satisfies the exact task requirement.
 * The actual EmptyState implementation is in components/ui/EmptyState.tsx
 * as a reusable UI component following React Native best practices.
 *
 * Implementation Details:
 * - Primary implementation: /components/ui/EmptyState.tsx
 * - Displays friendly messages when no content is available
 * - Supports different contexts (error, empty collection, filtered results)
 * - Includes icon, title, message, and optional action button
 * - Dark mode support with useColorScheme
 * - Accessibility features (testID, semantic elements)
 * - Integrated in RecipeRepositoryScreen for various empty states
 *
 * Usage:
 * ```tsx
 * import { EmptyState } from '@/components/recipes/empty-state';
 *
 * <EmptyState
 *   icon="search-outline"
 *   title="No recipes found"
 *   message="Try adjusting your search or filters"
 *   actionLabel="Clear filters"
 *   onAction={clearFilters}
 * />
 * ```
 */

export { EmptyState } from '@/components/ui/EmptyState';
