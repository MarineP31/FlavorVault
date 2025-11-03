/**
 * Base RecipeCard component
 * Displays recipe information in a card format
 *
 * Task 6.1: Base Recipe Card Component
 * Task 6.4: Recipe Card Data Display
 * Task 8.3: Performance Optimization (React.memo)
 */

import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { Recipe } from '@/lib/db';
import { DishCategory } from '@/lib/db';

export interface RecipeCardProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  variant?: 'grid' | 'list';
  testID?: string;
}

/**
 * Recipe card component with grid and list variants
 *
 * Displays recipe information:
 * - Thumbnail image (or placeholder with category icon)
 * - Recipe title
 * - Servings count
 * - Prep time + cook time (total time)
 * - Category (list variant only)
 * - Tags (first 2-3)
 *
 * Performance optimized with React.memo to prevent unnecessary re-renders.
 *
 * @param props - Component props
 * @returns RecipeCard component
 *
 * @example
 * ```tsx
 * <RecipeCard
 *   recipe={recipe}
 *   onPress={handleRecipePress}
 *   variant="grid"
 * />
 * ```
 */
export const RecipeCard = React.memo<RecipeCardProps>(
  ({
    recipe,
    onPress,
    variant = 'grid',
    testID = 'recipe-card',
  }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBackground = isDark ? '#1C1C1E' : '#FFFFFF';
    const textPrimary = isDark ? '#FFFFFF' : '#000000';
    const textSecondary = isDark ? '#8E8E93' : '#8E8E93';

    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

    const getCategoryIcon = (category: DishCategory) => {
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

    if (variant === 'list') {
      return (
        <TouchableOpacity
          style={[styles.listCard, { backgroundColor: cardBackground }]}
          onPress={() => onPress(recipe)}
          testID={testID}
          accessibilityLabel={`Recipe: ${recipe.title}`}
          accessibilityHint="Double tap to view recipe details"
          accessibilityRole="button"
        >
          {recipe.imageUri ? (
            <Image
              source={{ uri: recipe.imageUri }}
              style={styles.listImage}
              resizeMode="cover"
              accessibilityLabel={`${recipe.title} image`}
            />
          ) : (
            <View
              style={[styles.listImage, styles.placeholderImage]}
              accessibilityLabel={`${recipe.category} placeholder image`}
            >
              <Icon
                name={getCategoryIcon(recipe.category)}
                size={32}
                color={textSecondary}
              />
            </View>
          )}

          <View style={styles.listContent}>
            <Text
              style={[styles.listTitle, { color: textPrimary }]}
              numberOfLines={1}
            >
              {recipe.title}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon name="time-outline" size={14} color={textSecondary} />
                <Text style={[styles.metaText, { color: textSecondary }]}>
                  {totalTime} min
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Icon name="people-outline" size={14} color={textSecondary} />
                <Text style={[styles.metaText, { color: textSecondary }]}>
                  {recipe.servings}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Icon
                  name={getCategoryIcon(recipe.category)}
                  size={14}
                  color={textSecondary}
                />
                <Text style={[styles.metaText, { color: textSecondary }]}>
                  {recipe.category}
                </Text>
              </View>
            </View>

            {recipe.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {recipe.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={[styles.tagText, { color: textSecondary }]}>
                      {tag}
                    </Text>
                  </View>
                ))}
                {recipe.tags.length > 3 && (
                  <Text style={[styles.tagText, { color: textSecondary }]}>
                    +{recipe.tags.length - 3}
                  </Text>
                )}
              </View>
            )}
          </View>

          <Icon name="chevron-forward" size={20} color={textSecondary} />
        </TouchableOpacity>
      );
    }

    // Grid variant
    return (
      <TouchableOpacity
        style={[styles.gridCard, { backgroundColor: cardBackground }]}
        onPress={() => onPress(recipe)}
        testID={testID}
        accessibilityLabel={`Recipe: ${recipe.title}`}
        accessibilityHint="Double tap to view recipe details"
        accessibilityRole="button"
      >
        {recipe.imageUri ? (
          <Image
            source={{ uri: recipe.imageUri }}
            style={styles.gridImage}
            resizeMode="cover"
            accessibilityLabel={`${recipe.title} image`}
          />
        ) : (
          <View
            style={[styles.gridImage, styles.placeholderImage]}
            accessibilityLabel={`${recipe.category} placeholder image`}
          >
            <Icon
              name={getCategoryIcon(recipe.category)}
              size={48}
              color={textSecondary}
            />
          </View>
        )}

        <View style={styles.gridContent}>
          <Text
            style={[styles.gridTitle, { color: textPrimary }]}
            numberOfLines={2}
          >
            {recipe.title}
          </Text>

          <View style={styles.gridMetaRow}>
            <View style={styles.metaItem}>
              <Icon name="time-outline" size={12} color={textSecondary} />
              <Text style={[styles.gridMetaText, { color: textSecondary }]}>
                {totalTime}m
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Icon name="people-outline" size={12} color={textSecondary} />
              <Text style={[styles.gridMetaText, { color: textSecondary }]}>
                {recipe.servings}
              </Text>
            </View>
          </View>

          {recipe.tags.length > 0 && (
            <View style={styles.gridTagsRow}>
              {recipe.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.gridTag}>
                  <Text style={[styles.gridTagText, { color: textSecondary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

RecipeCard.displayName = 'RecipeCard';

const styles = StyleSheet.create({
  // List variant styles
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  listContent: {
    flex: 1,
    gap: 6,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  tagText: {
    fontSize: 11,
  },

  // Grid variant styles
  gridCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: 140,
  },
  gridContent: {
    padding: 12,
    gap: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    minHeight: 36,
  },
  gridMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gridMetaText: {
    fontSize: 11,
  },
  gridTagsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  gridTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  gridTagText: {
    fontSize: 10,
  },

  // Shared styles
  placeholderImage: {
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
