/**
 * Category Section Component
 * Displays a category with its tags and management actions
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryHeader } from './CategoryHeader';
import { TagChip } from './TagChip';
import { Button } from '@/components/ui/Button';

interface CategorySectionProps {
  name: string;
  isCustom: boolean;
  tags: string[];
  customCount: number;
  maxCustomTags: number;
  onAddTag?: (tagValue: string) => void;
  onEditTag?: (oldValue: string, newValue: string) => void;
  onDeleteTag?: (tagValue: string) => void;
  onEditCategory?: () => void;
  onDeleteCategory?: () => void;
  testID?: string;
}

/**
 * Category section with tags display and management
 */
export function CategorySection({
  name,
  isCustom,
  tags,
  customCount,
  maxCustomTags,
  onAddTag,
  onEditTag,
  onDeleteTag,
  onEditCategory,
  onDeleteCategory,
  testID,
}: CategorySectionProps) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagValue, setEditTagValue] = useState('');

  const handleAddTag = () => {
    if (newTagValue.trim() && onAddTag) {
      onAddTag(newTagValue.trim());
      setNewTagValue('');
      setIsAddingTag(false);
    }
  };

  const handleStartEdit = (tagValue: string) => {
    setEditingTag(tagValue);
    setEditTagValue(tagValue);
  };

  const handleSaveEdit = () => {
    if (editTagValue.trim() && editingTag && onEditTag) {
      onEditTag(editingTag, editTagValue.trim());
      setEditingTag(null);
      setEditTagValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditTagValue('');
  };

  const canAddMoreTags = customCount < maxCustomTags;

  return (
    <View
      className="mb-4 bg-white dark:bg-[#1C1C1E] rounded-lg overflow-hidden"
      testID={testID}
    >
      <CategoryHeader
        name={name}
        isCustom={isCustom}
        customCount={customCount}
        maxCustom={maxCustomTags}
        onEdit={onEditCategory}
        onDelete={onDeleteCategory}
        testID={`${testID}-header`}
      />

      <View className="p-4">
        {/* Tags Display */}
        {tags.length > 0 ? (
          <View className="flex-row flex-wrap mb-2">
            {tags.map((tag) => (
              <React.Fragment key={tag}>
                {editingTag === tag ? (
                  <View className="flex-row items-center bg-surface-light dark:bg-[#2C2C2E] rounded-lg px-3 py-2 m-1">
                    <TextInput
                      value={editTagValue}
                      onChangeText={setEditTagValue}
                      placeholder="Tag name"
                      placeholderTextColor="#8E8E93"
                      className="text-sm text-black dark:text-white min-w-[100px]"
                      autoFocus
                      testID={`${testID}-edit-input-${tag}`}
                    />
                    <View className="flex-row ml-2 gap-1">
                      <TouchableOpacity
                        onPress={handleSaveEdit}
                        className="p-1"
                        testID={`${testID}-save-${tag}`}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#34C759"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCancelEdit}
                        className="p-1"
                        testID={`${testID}-cancel-${tag}`}
                      >
                        <Ionicons
                          name="close-circle"
                          size={18}
                          color="#8E8E93"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TagChip
                    value={tag}
                    onEdit={() => handleStartEdit(tag)}
                    onDelete={() => onDeleteTag?.(tag)}
                    editable={onEditTag !== undefined || onDeleteTag !== undefined}
                    testID={`${testID}-tag-${tag}`}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        ) : (
          <Text className="text-sm text-[#8E8E93] dark:text-[#8E8E93] mb-2">
            No tags in this category yet
          </Text>
        )}

        {/* Add Tag Input */}
        {isAddingTag ? (
          <View className="flex-row items-center gap-2 mt-2">
            <TextInput
              value={newTagValue}
              onChangeText={setNewTagValue}
              placeholder="Enter tag name"
              placeholderTextColor="#8E8E93"
              className="flex-1 px-3 py-2 bg-surface-light dark:bg-[#2C2C2E] rounded-lg text-black dark:text-white"
              autoFocus
              maxLength={30}
              testID={`${testID}-add-input`}
            />
            <TouchableOpacity
              onPress={handleAddTag}
              className="p-2 bg-primary dark:bg-primary-dark rounded-lg"
              testID={`${testID}-save-new`}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsAddingTag(false);
                setNewTagValue('');
              }}
              className="p-2 bg-surface-light dark:bg-[#2C2C2E] rounded-lg"
              testID={`${testID}-cancel-new`}
            >
              <Ionicons name="close" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsAddingTag(true)}
            className="flex-row items-center py-2"
            disabled={!canAddMoreTags || !onAddTag}
            testID={`${testID}-add-button`}
          >
            <Ionicons
              name="add-circle"
              size={20}
              color={canAddMoreTags && onAddTag ? '#FF6B35' : '#8E8E93'}
            />
            <Text
              className={`ml-2 text-sm ${
                canAddMoreTags && onAddTag
                  ? 'text-primary dark:text-primary-light'
                  : 'text-[#8E8E93]'
              }`}
            >
              {canAddMoreTags
                ? 'Add Tag'
                : `Maximum ${maxCustomTags} custom tags reached`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
