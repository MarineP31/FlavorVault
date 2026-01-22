/**
 * Base RecipeCard component
 * Displays recipe information in a card format
 */

import type { Recipe } from '@/lib/db';
import { DishCategory } from '@/lib/db';
import { useRecipeShoppingList } from '@/lib/hooks/use-recipe-shopping-list';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export interface RecipeCardProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  variant?: 'grid' | 'list';
  testID?: string;
}

const getDifficultyTag = (tags: string[]): string | null => {
  const difficultyTags = ['Easy', 'Medium', 'Hard'];
  return tags.find((t) => difficultyTags.includes(t)) || null;
};

const getRating = (tags: string[]): string | null => {
  const ratingTag = tags.find((t) => t.startsWith('rating:'));
  return ratingTag ? ratingTag.split(':')[1] : null;
};

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

export const RecipeCard = React.memo<RecipeCardProps>(
  ({ recipe, onPress, variant = 'grid', testID = 'recipe-card' }) => {
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
    const { isInShoppingList, isLoading, toggleShoppingList } =
      useRecipeShoppingList(recipe.id, recipe.title);
    const difficulty = getDifficultyTag(recipe.tags);
    const rating = getRating(recipe.tags);

    const handleShoppingListPress = () => {
      if (!isLoading) {
        toggleShoppingList();
      }
    };

    if (variant === 'list') {
      return (
        <TouchableOpacity
          style={styles.listCard}
          onPress={() => onPress(recipe)}
          testID={testID}
          accessibilityLabel={`Recipe: ${recipe.title}`}
          accessibilityHint="Double tap to view recipe details"
          accessibilityRole="button"
        >
          {/* Image Container */}
          <View style={styles.listImageContainer}>
            {recipe.imageUri ? (
              <Image
                source={{ uri: recipe.imageUri }}
                style={styles.listImage}
                resizeMode="cover"
                accessibilityLabel={`${recipe.title} image`}
              />
            ) : (
              <View style={styles.listPlaceholder}>
                <Icon
                  name={getCategoryIcon(recipe.category)}
                  size={64}
                  color="#8E8E93"
                />
              </View>
            )}

            {/* Shopping list button - top right */}
            <TouchableOpacity
              onPress={handleShoppingListPress}
              accessibilityRole="button"
              accessibilityLabel={
                isInShoppingList
                  ? 'Remove from shopping list'
                  : 'Add to shopping list'
              }
              style={styles.listShoppingButton}
              activeOpacity={0.8}
              disabled={isLoading}
              testID="shopping-list-button"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Icon
                  name={isInShoppingList ? 'cart' : 'cart-outline'}
                  size={22}
                  color={isInShoppingList ? '#FF6B35' : '#8E8E93'}
                />
              )}
            </TouchableOpacity>

            {/* Bottom-left badges: time and difficulty */}
            <View style={styles.listBadgeContainer}>
              {totalTime > 0 && (
                <View style={styles.timeBadge}>
                  <Text style={styles.badgeText}>
                    {totalTime} min
                  </Text>
                </View>
              )}
              {difficulty && (
                <View style={styles.difficultyBadge}>
                  <Text style={styles.badgeText}>{difficulty}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Content */}
          <View style={styles.listContent}>
            <Text style={styles.listTitle} numberOfLines={1}>
              {recipe.title}
            </Text>

            {/* Metadata row */}
            <View style={styles.metadataRow}>
              <View style={styles.metadataItem}>
                <Icon name="time-outline" size={16} color="#8E8E93" />
                <Text style={styles.metadataText}>
                  {totalTime} min
                </Text>
              </View>

              <View style={styles.metadataItem}>
                <Icon
                  name="people-outline"
                  size={16}
                  color="#8E8E93"
                />
                <Text style={styles.metadataText}>
                  {recipe.servings} servings
                </Text>
              </View>

              {rating && (
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={18} color="#FFC107" />
                  <Text style={styles.ratingText}>{rating}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    // Grid variant
    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => onPress(recipe)}
        testID={testID}
        accessibilityLabel={`Recipe: ${recipe.title}`}
        accessibilityHint="Double tap to view recipe details"
        accessibilityRole="button"
      >
        {/* Image Container */}
        <View style={styles.gridImageContainer}>
          {recipe.imageUri ? (
            <Image
              source={{ uri: recipe.imageUri }}
              style={styles.gridImage}
              resizeMode="cover"
              accessibilityLabel={`${recipe.title} image`}
            />
          ) : (
            <View style={styles.gridPlaceholder}>
              <Icon
                name={getCategoryIcon(recipe.category)}
                size={48}
                color="#8E8E93"
              />
            </View>
          )}

          {/* Shopping list button - top right */}
          <TouchableOpacity
            onPress={handleShoppingListPress}
            accessibilityRole="button"
            accessibilityLabel={
              isInShoppingList
                ? 'Remove from shopping list'
                : 'Add to shopping list'
            }
            style={styles.gridShoppingButton}
            activeOpacity={0.8}
            disabled={isLoading}
            testID="shopping-list-button"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Icon
                name={isInShoppingList ? 'cart' : 'cart-outline'}
                size={16}
                color={isInShoppingList ? '#007AFF' : '#8E8E93'}
              />
            )}
          </TouchableOpacity>

          {/* Bottom-left badges: time and difficulty */}
          <View style={styles.gridBadgeContainer}>
            {totalTime > 0 && (
              <View style={styles.timeBadgeSmall}>
                <Text style={styles.badgeTextSmall}>
                  {totalTime} min
                </Text>
              </View>
            )}
            {difficulty && (
              <View style={styles.difficultyBadgeSmall}>
                <Text style={styles.badgeTextSmall}>
                  {difficulty}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.gridContent}>
          <Text style={styles.gridTitle} numberOfLines={2}>
            {recipe.title}
          </Text>

          <View style={styles.gridMetadataRow}>
            <View style={styles.gridMetadataLeft}>
              <View style={styles.metadataItemSmall}>
                <Icon name="time-outline" size={12} color="#8E8E93" />
                <Text style={styles.metadataTextSmall}>
                  {totalTime} min
                </Text>
              </View>

              <View style={styles.metadataItemSmall}>
                <Icon
                  name="people-outline"
                  size={12}
                  color="#8E8E93"
                />
                <Text style={styles.metadataTextSmall}>
                  {recipe.servings}
                </Text>
              </View>
            </View>

            {rating && (
              <View style={styles.ratingContainerSmall}>
                <Icon name="star" size={12} color="#FFC107" />
                <Text style={styles.ratingTextSmall}>{rating}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

RecipeCard.displayName = 'RecipeCard';

const styles = StyleSheet.create({
  listCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listImageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listShoppingButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  listBadgeContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  listContent: {
    padding: 16,
    gap: 8,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 16,
  },
  metadataText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  gridCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gridImageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridShoppingButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gridBadgeContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  gridContent: {
    padding: 12,
    gap: 4,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  gridMetadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridMetadataLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  metadataItemSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metadataTextSmall: {
    fontSize: 11,
    color: '#8E8E93',
  },
  ratingContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1965A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
