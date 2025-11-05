/**
 * Tag Selector Component
 * Multi-select component for recipe tags organized by category
 * Integrated with Tag Management System (Task 6.2)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  CUISINE_TAGS,
  DIETARY_TAGS,
  MEAL_TYPE_TAGS,
  COOKING_METHOD_TAGS,
} from '@/constants/enums';
import { TagManagementButton } from '@/components/tags/TagManagementButton';
import { TagManagementModal } from '@/components/tags/TagManagementModal';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

interface TagCategoryData {
  title: string;
  tags: readonly string[];
}

const TAG_CATEGORIES: TagCategoryData[] = [
  { title: 'Cuisine', tags: CUISINE_TAGS },
  { title: 'Dietary', tags: DIETARY_TAGS },
  { title: 'Meal Type', tags: MEAL_TYPE_TAGS },
  { title: 'Cooking Method', tags: COOKING_METHOD_TAGS },
];

/**
 * Tag selector component with categorized multi-select
 * Task 6.2: Integrated with Tag Management Modal
 */
export function TagSelector({
  selectedTags,
  onTagsChange,
  maxTags = 20,
}: TagSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [showTagManagement, setShowTagManagement] = useState(false);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < maxTags) {
        onTagsChange([...selectedTags, tag]);
      }
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tag));
  };

  const handleOpenTagManagement = () => {
    setShowTagManagement(true);
  };

  const handleCloseTagManagement = () => {
    setShowTagManagement(false);
  };

  const handleTagsUpdated = () => {
    // Optionally reload tags or notify parent component
    // For now, the modal handles its own state
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isDark && styles.titleDark]}>
        Tags (Optional)
      </Text>

      {/* Task 6.2: Tag Management Button Integration */}
      <TagManagementButton
        onPress={handleOpenTagManagement}
        testID="tag-selector-manage-button"
      />

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedTags}
          >
            {selectedTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.selectedTag,
                  isDark ? styles.selectedTagDark : styles.selectedTagLight,
                ]}
                onPress={() => removeTag(tag)}
              >
                <Text
                  style={[
                    styles.selectedTagText,
                    isDark && styles.selectedTagTextDark,
                  ]}
                >
                  {tag}
                </Text>
                <Icon name="close" size={16} color="#007AFF" />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.tagCount}>
            {selectedTags.length} / {maxTags} tags
          </Text>
        </View>
      )}

      {/* Tag Categories */}
      {TAG_CATEGORIES.map((category) => {
        const isExpanded = expandedCategories.has(category.title);
        return (
          <View key={category.title} style={styles.category}>
            <TouchableOpacity
              style={[
                styles.categoryHeader,
                isDark
                  ? styles.categoryHeaderDark
                  : styles.categoryHeaderLight,
              ]}
              onPress={() => toggleCategory(category.title)}
            >
              <Text
                style={[
                  styles.categoryTitle,
                  isDark && styles.categoryTitleDark,
                ]}
              >
                {category.title}
              </Text>
              <Icon
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={isDark ? '#8E8E93' : '#8E8E93'}
              />
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.tagsGrid}>
                {category.tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagChip,
                        isSelected
                          ? styles.tagChipSelected
                          : isDark
                          ? styles.tagChipDark
                          : styles.tagChipLight,
                      ]}
                      onPress={() => toggleTag(tag)}
                      disabled={
                        !isSelected && selectedTags.length >= maxTags
                      }
                    >
                      <Text
                        style={[
                          styles.tagChipText,
                          isSelected
                            ? styles.tagChipTextSelected
                            : isDark && styles.tagChipTextDark,
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}

      {/* Task 6.2: Tag Management Modal */}
      <TagManagementModal
        visible={showTagManagement}
        onClose={handleCloseTagManagement}
        onTagsUpdated={handleTagsUpdated}
        testID="tag-selector-management-modal"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  selectedTagsContainer: {
    marginBottom: 12,
  },
  selectedTags: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  selectedTagLight: {
    backgroundColor: '#E3F2FD',
  },
  selectedTagDark: {
    backgroundColor: '#1E3A5F',
  },
  selectedTagText: {
    fontSize: 14,
    color: '#007AFF',
  },
  selectedTagTextDark: {
    color: '#64B5F6',
  },
  tagCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  category: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  categoryHeaderLight: {
    backgroundColor: '#F2F2F7',
  },
  categoryHeaderDark: {
    backgroundColor: '#2C2C2E',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  categoryTitleDark: {
    color: '#FFFFFF',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagChipLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C7C7CC',
  },
  tagChipDark: {
    backgroundColor: '#1C1C1E',
    borderColor: '#3A3A3C',
  },
  tagChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tagChipText: {
    fontSize: 14,
    color: '#000000',
  },
  tagChipTextDark: {
    color: '#FFFFFF',
  },
  tagChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
