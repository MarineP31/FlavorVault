/**
 * TagFilter component for filtering recipes by tags
 * Displays horizontal scrollable list of tag chips
 */

import React, { useMemo } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Recipe } from '@/lib/db';

interface TagFilterProps {
  recipes: Recipe[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  testID?: string;
}

/**
 * TagFilter component with horizontal scrollable chips
 *
 * @param props - Component props
 * @returns TagFilter component
 *
 * @example
 * ```tsx
 * <TagFilter
 *   recipes={recipes}
 *   selectedTags={selectedTags}
 *   onToggleTag={toggleTag}
 * />
 * ```
 */
export function TagFilter({
  recipes,
  selectedTags,
  onToggleTag,
  testID = 'tag-filter',
}: TagFilterProps) {
  // Extract unique tags from all recipes with counts
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();

    recipes.forEach((recipe) => {
      recipe.tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase();
        counts.set(normalizedTag, (counts.get(normalizedTag) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count); // Sort by frequency
  }, [recipes]);

  if (tagCounts.length === 0) {
    return null;
  }

  return (
    <View className="py-2" testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {tagCounts.map(({ tag, count }) => {
          const isSelected = selectedTags.includes(tag);

          return (
            <TouchableOpacity
              key={tag}
              onPress={() => onToggleTag(tag)}
              className={
                isSelected
                  ? 'flex-row items-center px-3 py-2 rounded-2xl gap-1.5 bg-primary dark:bg-primary-dark'
                  : 'flex-row items-center px-3 py-2 rounded-2xl gap-1.5 bg-surface-light dark:bg-[#2C2C2E]'
              }
              testID={`${testID}-chip-${tag}`}
            >
              <Text
                className={
                  isSelected
                    ? 'text-sm font-medium text-white'
                    : 'text-sm font-medium text-black dark:text-white'
                }
              >
                {tag}
              </Text>
              <Text
                className={
                  isSelected
                    ? 'text-xs font-semibold opacity-70 text-white'
                    : 'text-xs font-semibold opacity-70 text-black dark:text-white'
                }
              >
                {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
