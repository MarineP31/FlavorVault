/**
 * Recipe Meta Info Component
 * Task 6.1: Recipe Meta Info Component
 * Task 6.4: Tag Display Component
 *
 * Displays source attribution and tags in a grouped section
 */

import React from 'react';
import { View, Text } from 'react-native';

export interface RecipeMetaInfoProps {
  source?: string | null;
  tags: string[];
  testID?: string;
}

/**
 * Recipe Meta Info Component
 *
 * Displays recipe metadata:
 * - Source attribution (if available)
 * - Tags as chips/badges
 *
 * Features:
 * - Responsive tag wrapping
 * - Dark mode support
 * - Accessibility labels
 * - Graceful handling of missing data
 * - Tag chip styling with color variants
 *
 * @param props - Component props
 * @returns RecipeMetaInfo component
 *
 * @example
 * ```tsx
 * <RecipeMetaInfo
 *   source="Grandma's Recipe Book"
 *   tags={['vegetarian', 'quick', 'healthy']}
 * />
 * ```
 */
export function RecipeMetaInfo({
  source,
  tags,
  testID = 'recipe-meta-info',
}: RecipeMetaInfoProps) {
  const hasSource = source && source.trim().length > 0;
  const hasTags = tags && tags.length > 0;

  // Don't render if there's no source and no tags
  if (!hasSource && !hasTags) {
    return null;
  }

  return (
    <View
      className="px-4 py-3 gap-3"
      testID={testID}
    >
      {/* Source Attribution */}
      {hasSource && (
        <View testID={`${testID}-source`}>
          <Text className="text-xs text-[#8E8E93] dark:text-[#8E8E93] font-medium mb-1">
            Source
          </Text>
          <Text
            className="text-sm text-black dark:text-white"
            accessibilityLabel={`Source: ${source}`}
            numberOfLines={2}
          >
            {source}
          </Text>
        </View>
      )}

      {/* Tags Display */}
      {hasTags && (
        <View testID={`${testID}-tags`}>
          <Text className="text-xs text-[#8E8E93] dark:text-[#8E8E93] font-medium mb-2">
            Tags
          </Text>
          <View
            className="flex-row flex-wrap gap-2"
            accessibilityLabel={`Tags: ${tags.join(', ')}`}
            accessibilityRole="text"
          >
            {tags.map((tag, index) => (
              <TagChip
                key={`${tag}-${index}`}
                value={tag}
                testID={`${testID}-tag-${index}`}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Tag Chip Component
 *
 * Displays individual tag as a chip/badge.
 * Read-only version (no edit/delete actions) for recipe detail view.
 *
 * Features:
 * - Color variants for different tag types
 * - Rounded corners
 * - Proper padding and spacing
 * - Dark mode support
 * - Accessibility
 *
 * @param props - Component props
 * @returns TagChip component
 */
interface TagChipProps {
  value: string;
  testID?: string;
}

function TagChip({ value, testID }: TagChipProps) {
  // Determine tag color based on content
  const getTagColor = (tag: string) => {
    const lowerTag = tag.toLowerCase();

    // Dietary/Health tags
    if (['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'healthy'].some(t => lowerTag.includes(t))) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    }

    // Time-based tags
    if (['quick', 'easy', 'fast', '15-min'].some(t => lowerTag.includes(t))) {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    }

    // Meal type tags
    if (['breakfast', 'lunch', 'dinner', 'dessert', 'snack'].some(t => lowerTag.includes(t))) {
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    }

    // Cooking method tags
    if (['baked', 'grilled', 'fried', 'slow-cooker', 'instant-pot'].some(t => lowerTag.includes(t))) {
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    }

    // Default
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  return (
    <View
      className={`px-3 py-1.5 rounded-full ${getTagColor(value)}`}
      testID={testID}
    >
      <Text
        className="text-xs font-medium"
        accessibilityLabel={`Tag: ${value}`}
      >
        {value}
      </Text>
    </View>
  );
}
