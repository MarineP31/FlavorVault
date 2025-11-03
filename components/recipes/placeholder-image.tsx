/**
 * Placeholder Image Component
 *
 * Task 6.5: Placeholder Image Component
 * - Default recipe image when imageUri is null
 * - Placeholder styling with category-based icon
 * - Accessibility support
 * - Smooth animations
 *
 * Features:
 * - Category-specific icons (breakfast, lunch, dinner, dessert, etc.)
 * - Centered icon display
 * - Gray background (#E5E5EA)
 * - Dark mode support
 * - Configurable size
 * - Accessible labels
 */

import React from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { DishCategory } from '@/lib/db';

interface PlaceholderImageProps {
  /**
   * Recipe category for icon selection
   */
  category?: DishCategory;

  /**
   * Size of the placeholder (width and height)
   * @default undefined (fills container)
   */
  size?: number;

  /**
   * Icon size
   * @default 48
   */
  iconSize?: number;

  /**
   * Custom style for container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Get category-specific icon name
 */
const getCategoryIcon = (category?: DishCategory): string => {
  if (!category) return 'restaurant-outline';

  switch (category) {
    case DishCategory.BREAKFAST:
      return 'sunny-outline';
    case DishCategory.LUNCH:
      return 'restaurant-outline';
    case DishCategory.DINNER:
      return 'moon-outline';
    case DishCategory.DESSERT:
      return 'ice-cream-outline';
    case DishCategory.SNACK:
      return 'fast-food-outline';
    case DishCategory.APPETIZER:
      return 'nutrition-outline';
    case DishCategory.BEVERAGE:
      return 'cafe-outline';
    default:
      return 'restaurant-outline';
  }
};

/**
 * Placeholder Image Component
 *
 * Displays a category-appropriate icon when recipe image is not available.
 * Used in RecipeCard for recipes without imageUri.
 *
 * @param props - Component props
 * @returns PlaceholderImage component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PlaceholderImage category={DishCategory.DINNER} />
 *
 * // With custom size
 * <PlaceholderImage
 *   category={DishCategory.BREAKFAST}
 *   size={100}
 *   iconSize={40}
 * />
 *
 * // With custom style
 * <PlaceholderImage
 *   category={DishCategory.DESSERT}
 *   style={{ borderRadius: 8 }}
 * />
 * ```
 */
export const PlaceholderImage = React.memo<PlaceholderImageProps>(
  ({
    category,
    size,
    iconSize = 48,
    style,
    testID = 'placeholder-image',
  }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const backgroundColor = isDark ? '#2C2C2E' : '#E5E5EA';
    const iconColor = isDark ? '#8E8E93' : '#8E8E93';

    const containerStyle: ViewStyle = {
      backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      ...(size && { width: size, height: size }),
    };

    const iconName = getCategoryIcon(category);

    return (
      <View
        style={[styles.container, containerStyle, style]}
        testID={testID}
        accessibilityLabel={`Placeholder image for ${category || 'recipe'}`}
        accessibilityRole="image"
      >
        <Icon
          name={iconName}
          size={iconSize}
          color={iconColor}
          testID={`${testID}-icon`}
        />
      </View>
    );
  }
);

PlaceholderImage.displayName = 'PlaceholderImage';

const styles = StyleSheet.create({
  container: {
    // Base styles - actual size/background set dynamically
  },
});

/**
 * Category Icon Mappings:
 *
 * - BREAKFAST: sunny-outline (sun icon)
 * - LUNCH: restaurant-outline (fork/knife icon)
 * - DINNER: moon-outline (moon icon)
 * - DESSERT: ice-cream-outline (ice cream icon)
 * - SNACK: fast-food-outline (burger icon)
 * - APPETIZER: nutrition-outline (nutrition icon)
 * - BEVERAGE: cafe-outline (coffee icon)
 * - Default: restaurant-outline
 *
 * Design Notes:
 * - Gray background for visual consistency
 * - Category icons help identify recipe type at a glance
 * - Centered icon placement
 * - Matches RecipeCard's placeholder styling
 * - Dark mode support with appropriate colors
 * - Accessible with proper labels and roles
 */
