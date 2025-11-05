/**
 * Tag Management Modal Component
 * Main modal for comprehensive tag management operations
 * Task Group 4: Core Tag Management Components
 * Task Group 10: Success Feedback System
 * Task Group 13: Navigation & User Experience
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategorySection } from './CategorySection';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { useTagManagement } from '@/lib/hooks/use-tag-management';
import { useToast } from '@/components/ui/Toast';
import { VALIDATION_CONSTRAINTS } from '@/constants/enums';

interface TagManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onTagsUpdated?: () => void;
  testID?: string;
}

/**
 * Tag management modal with search and category management
 * Task 13.1: Tag management flow navigation
 * Task 13.2: User experience optimization
 */
export function TagManagementModal({
  visible,
  onClose,
  onTagsUpdated,
  testID = 'tag-management-modal',
}: TagManagementModalProps) {
  const { showToast } = useToast();

  // Use tag management hook with toast integration
  // Task 10.1 & 10.2: Toast notification system
  const {
    filteredCategories,
    loading,
    searchQuery,
    setSearchQuery,
    createTag,
    updateTag,
    deleteTag,
    createCategory,
    updateCategory,
    deleteCategory,
    canAddMoreCategories,
    refreshCategories,
  } = useTagManagement({
    autoLoad: true,
    onTagsUpdated,
    showToast,
  });

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Load categories when modal opens
  // Task 13.2: Loading states for tag operations
  useEffect(() => {
    if (visible) {
      refreshCategories();
    }
  }, [visible]);

  /**
   * Handle tag creation
   * Task 13.2: User feedback for all actions
   */
  const handleAddTag = async (categoryName: string, tagValue: string) => {
    try {
      await createTag(categoryName, tagValue);
    } catch (error) {
      // Error already handled in hook with toast
      console.error('Failed to add tag:', error);
    }
  };

  /**
   * Handle tag update
   * Task 13.2: User feedback for all actions
   */
  const handleEditTag = async (oldValue: string, newValue: string) => {
    if (oldValue === newValue) return;

    try {
      await updateTag(oldValue, newValue);
    } catch (error) {
      // Error already handled in hook with toast
      console.error('Failed to edit tag:', error);
    }
  };

  /**
   * Handle tag deletion with confirmation
   * Task 7.2: Dialog integration with tag deletion
   * Task 13.2: User feedback for all actions
   */
  const handleDeleteTag = async (tagValue: string) => {
    Alert.alert(
      'Delete Tag',
      `Are you sure you want to delete "${tagValue}"? This will remove it from all recipes.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTag(tagValue);
            } catch (error) {
              // Error already handled in hook with toast
              console.error('Failed to delete tag:', error);
            }
          },
        },
      ]
    );
  };

  /**
   * Handle category creation
   * Task 13.2: User feedback for all actions
   */
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await createCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (error) {
      // Error already handled in hook with toast
      console.error('Failed to add category:', error);
    }
  };

  /**
   * Handle category deletion with confirmation
   * Task 7.2: Dialog integration with category deletion
   * Task 13.2: User feedback for all actions
   */
  const handleDeleteCategory = async (categoryId?: string, categoryName?: string) => {
    if (!categoryId || !categoryName) return;

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"? This will remove all tags in this category from all recipes.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(categoryId);
            } catch (error) {
              // Error already handled in hook with toast
              console.error('Failed to delete category:', error);
            }
          },
        },
      ]
    );
  };

  /**
   * Separate default and custom categories for optimized rendering
   * Task 11.2: UI performance optimization
   */
  const { defaultCategories, customCategories } = useMemo(() => {
    return {
      defaultCategories: filteredCategories.filter((c) => c.type === 'default'),
      customCategories: filteredCategories.filter((c) => c.type === 'custom'),
    };
  }, [filteredCategories]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      testID={testID}
    >
      <View className="flex-1 bg-white dark:bg-black">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-[#C7C7CC] dark:border-[#3A3A3C]">
          <Text className="text-xl font-bold text-black dark:text-white">
            Tag Management
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID={`${testID}-close`}
          >
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="p-4">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tags..."
            testID={`${testID}-search`}
          />
        </View>

        {/* Content */}
        {/* Task 13.2: Smooth transitions between screens */}
        <ScrollView className="flex-1 px-4" testID={`${testID}-content`}>
          {loading ? (
            // Task 13.2: Loading states for tag operations
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text className="mt-4 text-sm text-[#8E8E93]">
                Loading tags...
              </Text>
            </View>
          ) : (
            <>
              {/* Default Categories Section */}
              <Text className="text-lg font-semibold text-black dark:text-white mb-3 mt-2">
                Default Categories
              </Text>
              {defaultCategories.map((category) => (
                <CategorySection
                  key={category.name}
                  name={category.name}
                  isCustom={false}
                  tags={category.tags}
                  customCount={category.customCount}
                  maxCustomTags={
                    VALIDATION_CONSTRAINTS.MAX_CUSTOM_TAGS_PER_CATEGORY
                  }
                  onAddTag={(tagValue) => handleAddTag(category.name, tagValue)}
                  onEditTag={handleEditTag}
                  onDeleteTag={handleDeleteTag}
                  testID={`${testID}-category-${category.name}`}
                />
              ))}

              {/* Custom Categories Section */}
              {customCategories.length > 0 && (
                <>
                  <Text className="text-lg font-semibold text-black dark:text-white mb-3 mt-4">
                    Custom Categories
                  </Text>
                  {customCategories.map((category) => (
                    <CategorySection
                      key={category.name}
                      name={category.name}
                      isCustom={true}
                      tags={category.tags}
                      customCount={category.customCount}
                      maxCustomTags={
                        VALIDATION_CONSTRAINTS.MAX_CUSTOM_TAGS_PER_CATEGORY
                      }
                      onAddTag={(tagValue) =>
                        handleAddTag(category.name, tagValue)
                      }
                      onEditTag={handleEditTag}
                      onDeleteTag={handleDeleteTag}
                      onEditCategory={() => {
                        if (category.id) {
                          // Simplified edit - could use a modal for more complex UI
                          Alert.prompt(
                            'Rename Category',
                            `Enter new name for "${category.name}"`,
                            async (newName) => {
                              if (newName && newName.trim() && category.id) {
                                try {
                                  await updateCategory(category.id, newName.trim());
                                } catch (error) {
                                  console.error('Failed to rename category:', error);
                                }
                              }
                            }
                          );
                        }
                      }}
                      onDeleteCategory={() => handleDeleteCategory(category.id, category.name)}
                      testID={`${testID}-category-${category.name}`}
                    />
                  ))}
                </>
              )}

              {/* Add Category Section */}
              <View className="mb-6 mt-2">
                {isAddingCategory ? (
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={newCategoryName}
                      onChangeText={setNewCategoryName}
                      placeholder="Enter category name"
                      placeholderTextColor="#8E8E93"
                      className="flex-1 px-4 py-3 bg-surface-light dark:bg-[#1C1C1E] rounded-lg text-black dark:text-white"
                      autoFocus
                      maxLength={30}
                      testID={`${testID}-add-category-input`}
                    />
                    <TouchableOpacity
                      onPress={handleAddCategory}
                      className="p-3 bg-primary dark:bg-primary-dark rounded-lg"
                      testID={`${testID}-save-category`}
                    >
                      <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName('');
                      }}
                      className="p-3 bg-surface-light dark:bg-[#2C2C2E] rounded-lg"
                      testID={`${testID}-cancel-category`}
                    >
                      <Ionicons name="close" size={24} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setIsAddingCategory(true)}
                    className="flex-row items-center justify-center py-3 px-4 bg-primary/10 dark:bg-primary-dark/20 rounded-lg"
                    disabled={!canAddMoreCategories}
                    testID={`${testID}-add-category-button`}
                  >
                    <Ionicons
                      name="add-circle"
                      size={24}
                      color={canAddMoreCategories ? '#FF6B35' : '#8E8E93'}
                    />
                    <Text
                      className={`ml-2 text-base font-medium ${
                        canAddMoreCategories
                          ? 'text-primary dark:text-primary-light'
                          : 'text-[#8E8E93]'
                      }`}
                    >
                      {canAddMoreCategories
                        ? 'Add Category'
                        : `Maximum ${VALIDATION_CONSTRAINTS.MAX_CUSTOM_CATEGORIES} categories reached`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Empty State */}
              {filteredCategories.length === 0 && !loading && (
                <View className="items-center justify-center py-8">
                  <Ionicons name="pricetag-outline" size={64} color="#8E8E93" />
                  <Text className="mt-4 text-lg font-medium text-[#8E8E93]">
                    No tags found
                  </Text>
                  {searchQuery && (
                    <Text className="mt-2 text-sm text-[#8E8E93]">
                      Try a different search term
                    </Text>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
