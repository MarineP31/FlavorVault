/**
 * Base RecipeCard component
 * Displays recipe information in a card format
 *
 * Task 6.1: Base Recipe Card Component
 * Task 6.4: Recipe Card Data Display
 * Task 8.3: Performance Optimization (React.memo)
 */

import type { Recipe } from '@/lib/db';
import { DishCategory } from '@/lib/db';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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
 * - Tags (first 2 as overlay on image)
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
  ({ recipe, onPress, variant = 'grid', testID = 'recipe-card' }) => {
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
    const [isFavorite, setIsFavorite] = React.useState(false);

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
          className="flex-col mx-4 my-2 rounded-2xl overflow-hidden bg-white dark:bg-[#1C1C1E] shadow-sm"
          onPress={() => onPress(recipe)}
          testID={testID}
          accessibilityLabel={`Recipe: ${recipe.title}`}
          accessibilityHint="Double tap to view recipe details"
          accessibilityRole="button"
        >
          {/* Image Container with Overlay Tags */}
          <View className="relative w-full h-[200px]">
            {recipe.imageUri ? (
              <Image
                source={{ uri: recipe.imageUri }}
                className="w-full h-full"
                resizeMode="cover"
                accessibilityLabel={`${recipe.title} image`}
              />
            ) : (
              <View className="w-full h-full bg-[#E5E5EA] justify-center items-center">
                <Icon
                  name={getCategoryIcon(recipe.category)}
                  size={56}
                  color="#8E8E93"
                />
              </View>
            )}

            {/* Top-right favorite button */}
            <TouchableOpacity
              onPress={() => setIsFavorite((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite
                  ? 'Remove from favorites'
                  : 'Add to favorites'
              }
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white items-center justify-center shadow-md"
              activeOpacity={0.8}
            >
              <Icon
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#FF3B30' : '#8E8E93'}
              />
            </TouchableOpacity>

            {/* Bottom-left info chips: time and tags */}
            <View className="absolute bottom-3 left-3 flex-row gap-2">
              {totalTime > 0 && (
                <View className="flex-row items-center bg-black/75 px-2.5 py-1 rounded-lg">
                  <Icon
                    name="time-outline"
                    size={12}
                    color="#FFFFFF"
                  />
                  <Text className="ml-1 text-xs font-semibold text-white">
                    {totalTime} min
                  </Text>
                </View>
              )}
              {recipe.tags.slice(0, 1).map((tag, index) => (
                <View
                  key={index}
                  className="flex-row items-center bg-green-600 px-2.5 py-1 rounded-lg"
                >
                  <Text className="text-xs font-semibold text-white">
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Content */}
          <View className="p-4 gap-1.5">
            <Text
              className="text-lg font-bold leading-snug text-black dark:text-white"
              numberOfLines={1}
            >
              {recipe.title}
            </Text>

            {recipe.description && (
              <Text
                className="text-sm leading-relaxed text-[#8E8E93]"
                numberOfLines={2}
              >
                {recipe.description}
              </Text>
            )}

            <View className="flex-row items-center gap-4 mt-0.5">
              <View className="flex-row items-center gap-1">
                <Icon
                  name="time-outline"
                  size={16}
                  color="#8E8E93"
                />
                <Text className="text-xs text-[#8E8E93]">
                  {totalTime} min
                </Text>
              </View>

              <View className="flex-row items-center gap-1">
                <Icon
                  name="restaurant-outline"
                  size={16}
                  color="#8E8E93"
                />
                <Text className="text-xs text-[#8E8E93]">
                  {recipe.servings} servings
                </Text>
              </View>

              {/* Rating - show if rating tag exists */}
              {recipe.tags.some((t) => t.startsWith('rating:')) && (
                <View className="flex-row items-center gap-1 ml-auto">
                  <Icon name="star" size={16} color="#FFC107" />
                  <Text className="text-sm font-semibold text-[#1C1C1E] dark:text-white">
                    {
                      recipe.tags
                        .find((t) => t.startsWith('rating:'))!
                        .split(':')[1]
                    }
                  </Text>
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
        className="rounded-2xl overflow-hidden bg-white dark:bg-[#1C1C1E] shadow-sm"
        onPress={() => onPress(recipe)}
        testID={testID}
        accessibilityLabel={`Recipe: ${recipe.title}`}
        accessibilityHint="Double tap to view recipe details"
        accessibilityRole="button"
      >
        {/* Image Container with Overlay Tags */}
        <View className="relative w-full h-[140px]">
          {recipe.imageUri ? (
            <Image
              source={{ uri: recipe.imageUri }}
              className="w-full h-full"
              resizeMode="cover"
              accessibilityLabel={`${recipe.title} image`}
            />
          ) : (
            <View className="w-full h-full bg-[#E5E5EA] justify-center items-center">
              <Icon
                name={getCategoryIcon(recipe.category)}
                size={48}
                color="#8E8E93"
              />
            </View>
          )}

          {/* Top-right favorite button */}
          <TouchableOpacity
            onPress={() => setIsFavorite((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? 'Remove from favorites'
                : 'Add to favorites'
            }
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white items-center justify-center shadow-sm"
            activeOpacity={0.8}
          >
            <Icon
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={16}
              color={isFavorite ? '#FF3B30' : '#8E8E93'}
            />
          </TouchableOpacity>

          {/* Bottom-left info chips: time and tag */}
          <View className="absolute bottom-2 left-2 flex-row gap-1">
            {totalTime > 0 && (
              <View className="flex-row items-center bg-black/70 px-1.5 py-0.5 rounded">
                <Icon
                  name="time-outline"
                  size={10}
                  color="#FFFFFF"
                />
                <Text className="ml-0.5 text-[10px] font-semibold text-white">
                  {totalTime} min
                </Text>
              </View>
            )}
            {recipe.tags.length > 0 && (
              <View className="flex-row items-center bg-emerald-600 px-1.5 py-0.5 rounded">
                <Text className="text-[10px] font-semibold text-white">
                  {recipe.tags[0]}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View className="p-3 gap-1">
          <Text
            className="text-sm font-semibold min-h-[32px] text-black dark:text-white"
            numberOfLines={2}
          >
            {recipe.title}
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row gap-2">
              <View className="flex-row items-center gap-0.5">
                <Icon name="time-outline" size={12} color="#8E8E93" />
                <Text className="text-[11px] text-[#8E8E93]">
                  {totalTime} min
                </Text>
              </View>

              <View className="flex-row items-center gap-0.5">
                <Icon name="restaurant-outline" size={12} color="#8E8E93" />
                <Text className="text-[11px] text-[#8E8E93]">
                  {recipe.servings} servings
                </Text>
              </View>
            </View>

            {/* Rating */}
            {recipe.tags.some((t) => t.startsWith('rating:')) && (
              <View className="flex-row items-center gap-0.5">
                <Icon name="star" size={12} color="#FFC107" />
                <Text className="text-[11px] font-semibold text-[#1C1C1E] dark:text-white">
                  {
                    recipe.tags
                      .find((t) => t.startsWith('rating:'))!
                      .split(':')[1]
                  }
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

RecipeCard.displayName = 'RecipeCard';
