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
      <View
        style={{
          flex: 1,
          backgroundColor: '#F2F2F7',
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5EA',
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#000000',
              letterSpacing: -0.4,
            }}
          >
            Tag Management
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#F2F2F7',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID={`${testID}-close`}
          >
            <Ionicons name="close" size={18} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          testID={`${testID}-content`}
        >
          {loading ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 40,
              }}
            >
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: '#8E8E93',
                }}
              >
                Loading tags...
              </Text>
            </View>
          ) : (
            <>
              {/* Default Categories Section */}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: '#8E8E93',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 12,
                  marginLeft: 4,
                }}
              >
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
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: '#8E8E93',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      marginTop: 24,
                      marginBottom: 12,
                      marginLeft: 4,
                    }}
                  >
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
              <View style={{ marginTop: 16, marginBottom: 32 }}>
                {isAddingCategory ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <TextInput
                      value={newCategoryName}
                      onChangeText={setNewCategoryName}
                      placeholder="Enter category name"
                      placeholderTextColor="#8E8E93"
                      style={{
                        flex: 1,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 12,
                        fontSize: 16,
                        color: '#000000',
                        borderWidth: 1,
                        borderColor: '#E5E5EA',
                      }}
                      autoFocus
                      maxLength={30}
                      testID={`${testID}-add-category-input`}
                    />
                    <TouchableOpacity
                      onPress={handleAddCategory}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: '#FF6B35',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      testID={`${testID}-save-category`}
                    >
                      <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName('');
                      }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#E5E5EA',
                      }}
                      testID={`${testID}-cancel-category`}
                    >
                      <Ionicons name="close" size={22} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setIsAddingCategory(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: canAddMoreCategories ? '#FF6B35' : '#E5E5EA',
                      borderStyle: 'dashed',
                      opacity: canAddMoreCategories ? 1 : 0.6,
                    }}
                    disabled={!canAddMoreCategories}
                    testID={`${testID}-add-category-button`}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={22}
                      color={canAddMoreCategories ? '#FF6B35' : '#8E8E93'}
                    />
                    <Text
                      style={{
                        marginLeft: 8,
                        fontSize: 16,
                        fontWeight: '600',
                        color: canAddMoreCategories ? '#FF6B35' : '#8E8E93',
                      }}
                    >
                      {canAddMoreCategories
                        ? 'Add Custom Category'
                        : `Maximum ${VALIDATION_CONSTRAINTS.MAX_CUSTOM_CATEGORIES} categories`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Empty State */}
              {filteredCategories.length === 0 && !loading && (
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 40,
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: '#F2F2F7',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Ionicons name="pricetag-outline" size={36} color="#8E8E93" />
                  </View>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '600',
                      color: '#000000',
                    }}
                  >
                    No tags found
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
