/**
 * Base Recipe Card Component
 *
 * Re-export wrapper for RecipeCard from unified RecipeCard.tsx
 *
 * Task 6.1: Base Recipe Card Component
 * - Base recipe card structure with thumbnail, title, servings, prep time, cook time
 * - Recipe card styling for both grid and list variants
 * - Accessibility support with testID
 * - Press handling for navigation
 * - Dark mode support
 *
 * Implementation Notes:
 * - The actual implementation is in RecipeCard.tsx (unified component)
 * - This file exists to satisfy task requirements for file structure
 * - RecipeCard.tsx handles both grid and list variants via the 'variant' prop
 * - Uses React Native's TouchableOpacity for press handling
 * - Displays placeholder image when recipe.imageUri is null
 * - All accessibility requirements are met with proper labels and testIDs
 */

export { RecipeCard } from './RecipeCard';
export type { RecipeCardProps } from './RecipeCard';

/**
 * Recipe Card Features:
 *
 * Data Display:
 * - Thumbnail image (or placeholder with category icon)
 * - Recipe title
 * - Servings count
 * - Prep time
 * - Cook time (combined as total time)
 * - Tags (first 2-3 displayed)
 * - Category icon
 *
 * Interaction:
 * - TouchableOpacity with onPress handler
 * - Navigation to recipe detail on press
 * - Visual feedback on press
 *
 * Styling:
 * - Dark mode support with useColorScheme
 * - Shadow and elevation for card depth
 * - Rounded corners (borderRadius: 12)
 * - Responsive spacing
 * - Icon-based metadata display
 *
 * Accessibility:
 * - testID prop for testing
 * - Semantic component structure
 * - Clear visual hierarchy
 *
 * Variants:
 * - Grid variant: vertical layout, larger images, 2-column compatible
 * - List variant: horizontal layout, image on left, compact display
 */
