/**
 * HorizontalTagFilter Component
 * Task Group 2: Horizontal scrollable tag filter with special filters
 *
 * Displays:
 * - "All" chip (clears all selections)
 * - "Quick" chip (filters recipes <= 20 min)
 * - Top 10 most-used tags
 * - Filter button to open modal with all tags
 */

import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import type { PresetFilter } from '@/lib/hooks/use-recipe-repository';

interface HorizontalTagFilterProps {
  topTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  presetFilter: PresetFilter;
  onPresetChange: (preset: PresetFilter) => void;
  onFilterPress: () => void;
  testID?: string;
}

export function HorizontalTagFilter({
  topTags,
  selectedTags,
  onToggleTag,
  presetFilter,
  onPresetChange,
  onFilterPress,
  testID = 'horizontal-tag-filter',
}: HorizontalTagFilterProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isAllSelected = presetFilter === 'all' && selectedTags.length === 0;
  const isQuickSelected = presetFilter === 'quick';

  const handleAllPress = () => {
    onPresetChange('all');
  };

  const handleQuickPress = () => {
    onPresetChange(presetFilter === 'quick' ? 'all' : 'quick');
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
          Quick Filters
        </Text>
        <TouchableOpacity onPress={onFilterPress} testID={`${testID}-see-all`}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All Chip - Always First */}
        <TouchableOpacity
          onPress={handleAllPress}
          style={[
            styles.chip,
            isAllSelected ? styles.chipSelected : (isDark ? styles.chipUnselectedDark : styles.chipUnselected),
          ]}
          testID={`${testID}-all`}
        >
          <Text
            style={[
              styles.chipText,
              isAllSelected ? styles.chipTextSelected : (isDark ? styles.chipTextUnselectedDark : styles.chipTextUnselected),
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {/* Quick Chip - Always Second */}
        <TouchableOpacity
          onPress={handleQuickPress}
          style={[
            styles.chip,
            isQuickSelected ? styles.chipSelected : (isDark ? styles.chipUnselectedDark : styles.chipUnselected),
          ]}
          testID={`${testID}-quick`}
        >
          <Text
            style={[
              styles.chipText,
              isQuickSelected ? styles.chipTextSelected : (isDark ? styles.chipTextUnselectedDark : styles.chipTextUnselected),
            ]}
          >
            Quick
          </Text>
        </TouchableOpacity>

        {/* Dynamic Tag Chips */}
        {topTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.toLowerCase());

          return (
            <TouchableOpacity
              key={tag}
              onPress={() => onToggleTag(tag)}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : (isDark ? styles.chipUnselectedDark : styles.chipUnselected),
              ]}
              testID={`${testID}-tag-${tag}`}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : (isDark ? styles.chipTextUnselectedDark : styles.chipTextUnselected),
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  headerTitleDark: {
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B35',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#FF6B35',
  },
  chipUnselected: {
    backgroundColor: '#F2F2F7',
  },
  chipUnselectedDark: {
    backgroundColor: '#2C2C2E',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextUnselected: {
    color: '#1C1C1E',
  },
  chipTextUnselectedDark: {
    color: '#FFFFFF',
  },
});
