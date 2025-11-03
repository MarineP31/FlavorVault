/**
 * Search Bar Component (Recipe-specific wrapper)
 *
 * Task 3.1: Search Bar Component
 *
 * This is a re-export of the SearchBar component from components/ui/
 * The actual implementation is in components/ui/SearchBar.tsx as a reusable component.
 *
 * Features implemented:
 * - Search input field with placeholder
 * - Clear search functionality with X button (appears when text is entered)
 * - Search input styling with rounded container and icon
 * - Search bar accessibility (testID, keyboard settings)
 * - Dark mode support
 * - Auto-capitalize disabled for better search experience
 * - Return key type set to "search"
 *
 * Usage in RecipeRepositoryScreen:
 * - Connected to useRecipeRepository hook
 * - Real-time search with 300ms debouncing
 * - Case-insensitive title search
 * - Search state persistence during session
 */

export { SearchBar } from '@/components/ui/SearchBar';
export type { SearchBar as SearchBarComponent } from '@/components/ui/SearchBar';
