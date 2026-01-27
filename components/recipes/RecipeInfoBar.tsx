/**
 * Recipe Info Bar Component
 * Task 6.2: Recipe Info Bar Component
 * Task 6.3: Icon Components
 *
 * Displays horizontal info bar with prep time, cook time, and servings with icons
 */

import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatTime, formatServings } from '@/lib/utils/recipe-formatter';

export interface RecipeInfoBarProps {
  prepTime: number | null;
  cookTime: number | null;
  servings: number;
  testID?: string;
}

/**
 * Recipe Info Bar Component
 *
 * Displays cooking metadata in a horizontal info bar with icons:
 * - Prep time (with clock icon)
 * - Cook time (with flame icon)
 * - Servings (with restaurant icon)
 *
 * Features:
 * - Responsive layout
 * - Dark mode support
 * - Accessibility labels
 * - Graceful handling of missing data (displays "N/A")
 *
 * @param props - Component props
 * @returns RecipeInfoBar component
 *
 * @example
 * ```tsx
 * <RecipeInfoBar
 *   prepTime={15}
 *   cookTime={30}
 *   servings={4}
 * />
 * ```
 */
export function RecipeInfoBar({
  prepTime,
  cookTime,
  servings,
  testID = 'recipe-info-bar',
}: RecipeInfoBarProps) {
  const formattedPrepTime = formatTime(prepTime);
  const formattedCookTime = formatTime(cookTime);
  const formattedServings = formatServings(servings);

  return (
    <View
      className="flex-row items-center justify-around px-4 py-4 bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-xl mx-4"
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={`Prep time: ${formattedPrepTime}, Cook time: ${formattedCookTime}, ${formattedServings}`}
    >
      {/* Prep Time */}
      <View className="flex-1 items-center" testID={`${testID}-prep-time`}>
        <View className="flex-row items-center gap-1.5">
          <Icon
            name="alarm-outline"
            size={20}
            color="#007AFF"
            accessibilityLabel="Prep time icon"
          />
          <View>
            <Text className="text-xs text-[#8E8E93] dark:text-[#8E8E93] font-medium">
              Prep
            </Text>
            <Text className="text-sm font-semibold text-black dark:text-white">
              {formattedPrepTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="w-px h-10 bg-[#C6C6C8] dark:bg-[#38383A]" />

      {/* Cook Time */}
      <View className="flex-1 items-center" testID={`${testID}-cook-time`}>
        <View className="flex-row items-center gap-1.5">
          <Icon
            name="flame-outline"
            size={20}
            color="#FF9500"
            accessibilityLabel="Cook time icon"
          />
          <View>
            <Text className="text-xs text-[#8E8E93] dark:text-[#8E8E93] font-medium">
              Cook
            </Text>
            <Text className="text-sm font-semibold text-black dark:text-white">
              {formattedCookTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="w-px h-10 bg-[#C6C6C8] dark:bg-[#38383A]" />

      {/* Servings */}
      <View className="flex-1 items-center" testID={`${testID}-servings`}>
        <View className="flex-row items-center gap-1.5">
          <Icon
            name="restaurant-outline"
            size={20}
            color="#34C759"
            accessibilityLabel="Servings icon"
          />
          <View>
            <Text className="text-xs text-[#8E8E93] dark:text-[#8E8E93] font-medium">
              Servings
            </Text>
            <Text className="text-sm font-semibold text-black dark:text-white">
              {servings}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
