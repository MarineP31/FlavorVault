/**
 * Filter Chips Component (Recipe-specific wrapper)
 *
 * Task 4.1: Filter Chips Component
 *
 * This is a re-export of the TagFilter component from components/ui/
 * The actual implementation is in components/ui/TagFilter.tsx as a reusable component.
 *
 * Features implemented:
 * - Filter chip display in horizontal scrollable container
 * - Chip remove/toggle functionality (tap to select/deselect)
 * - Active filter state indication (blue background when selected)
 * - Filter chip styling with rounded corners
 * - Tag counts displayed on each chip
 * - Sorted by frequency (most used tags first)
 * - Dark mode support
 * - Accessibility support with testID
 * - Responsive design with horizontal scrolling
 *
 * Usage in RecipeRepositoryScreen:
 * - Connected to useRecipeRepository hook
 * - Multiple tag selection with AND logic
 * - Filter state management
 * - Clear all filters via EmptyState action
 * - Filter persistence during session
 * - Integration with recipe data (extracts unique tags)
 */

export { TagFilter as FilterChips } from '@/components/ui/TagFilter';
export type { TagFilter as FilterChipsComponent } from '@/components/ui/TagFilter';
