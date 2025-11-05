/**
 * Tag Management Custom Hook
 * Centralized logic for tag and category management operations
 * Task Group 8: Custom Hook Implementation
 * Task Group 9: Data Management & Synchronization
 * Task Group 10: Success Feedback System
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { tagService } from '@/lib/db/services/tag-service';
import { CategoryWithTags, CategoryType } from '@/lib/db/schema/tags';
import { VALIDATION_CONSTRAINTS } from '@/constants/enums';

interface UseTagManagementOptions {
  autoLoad?: boolean;
  onTagsUpdated?: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
}

interface UseTagManagementReturn {
  // State
  categories: CategoryWithTags[];
  filteredCategories: CategoryWithTags[];
  loading: boolean;
  searchQuery: string;

  // Tag operations
  createTag: (categoryName: string, tagValue: string) => Promise<void>;
  updateTag: (oldValue: string, newValue: string) => Promise<void>;
  deleteTag: (tagValue: string) => Promise<void>;

  // Category operations
  createCategory: (name: string) => Promise<void>;
  updateCategory: (categoryId: string, newName: string) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;

  // Search operations
  setSearchQuery: (query: string) => void;
  searchTags: (query: string) => Promise<CategoryWithTags[]>;

  // Utility operations
  loadCategories: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  getCategoryByName: (name: string) => CategoryWithTags | undefined;
  canAddMoreCategories: boolean;
  canAddMoreTags: (categoryName: string) => boolean;
}

/**
 * Custom hook for tag management operations
 * Task 8.1: Tag Management Hook
 * Task 8.2: Hook Methods Implementation
 * Task 8.3: Hook Integration
 * Task 9.3: Data Synchronization - Real-time updates for tag changes
 * Task 10.1 & 10.2: Toast Notification System
 */
export function useTagManagement(
  options: UseTagManagementOptions = {}
): UseTagManagementReturn {
  const { autoLoad = true, onTagsUpdated, showToast } = options;

  // State management
  const [categories, setCategories] = useState<CategoryWithTags[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryWithTags[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQueryState] = useState('');

  /**
   * Show success or error feedback
   * Task 10.1: Success toast notifications
   * Task 10.2: Error toast notifications
   */
  const showFeedback = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      if (showToast) {
        showToast(message, type);
      } else {
        // Fallback to Alert if no toast provider
        if (type === 'error') {
          Alert.alert('Error', message);
        } else if (type === 'success') {
          Alert.alert('Success', message);
        } else {
          Alert.alert('Info', message);
        }
      }
    },
    [showToast]
  );

  // Auto-load categories on mount
  useEffect(() => {
    if (autoLoad) {
      loadCategories();
    }
  }, [autoLoad]);

  // Filter categories when search query changes
  // Task 9.3: Data synchronization across components
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = categories
        .map((category) => ({
          ...category,
          tags: category.tags.filter((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.tags.length > 0);
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  /**
   * Load all categories and tags
   * Task 8.1: Tag management state initialization
   * Task 9.3: Real-time updates for tag changes
   */
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const allTags = await tagService.getAllTags();
      setCategories(allTags);
      setFilteredCategories(allTags);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showFeedback('Failed to load tags. Please try again.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  /**
   * Refresh categories (alias for loadCategories)
   * Task 9.3: Data synchronization across components
   */
  const refreshCategories = useCallback(async () => {
    await loadCategories();
  }, [loadCategories]);

  /**
   * Create a new tag
   * Task 8.2: Tag creation methods
   * Task 9.1: Automatic recipe updates
   * Task 10.1: Tag created success feedback
   * Task 12.1: Form validation errors
   * Task 12.3: Limit exceeded errors
   */
  const createTag = useCallback(
    async (categoryName: string, tagValue: string) => {
      try {
        const category = categories.find((c) => c.name === categoryName);
        if (!category) {
          throw new Error('Category not found');
        }

        // Task 12.3: Limit exceeded error prevention
        if (!canAddMoreTags(categoryName)) {
          const errorMsg = `Maximum ${VALIDATION_CONSTRAINTS.MAX_CUSTOM_TAGS_PER_CATEGORY} custom tags allowed per category`;
          showFeedback(errorMsg, 'error');
          throw new Error(errorMsg);
        }

        await tagService.createTag({
          categoryType: category.type,
          categoryName,
          tagValue,
        });

        // Task 9.3: Real-time updates for tag changes
        await loadCategories();
        onTagsUpdated?.();

        // Task 10.1: Tag created success feedback
        showFeedback(`Tag "${tagValue}" created successfully`, 'success');
      } catch (error: any) {
        console.error('Failed to create tag:', error);
        // Task 10.2: Validation error feedback
        const errorMsg = error.message || 'Failed to create tag. Please try again.';
        showFeedback(errorMsg, 'error');
        throw error;
      }
    },
    [categories, loadCategories, onTagsUpdated, showFeedback]
  );

  /**
   * Update a tag (rename across all recipes)
   * Task 8.2: Tag update methods
   * Task 9.1: Automatic updates when tags are renamed
   * Task 10.1: Tag updated success feedback
   * Task 12.1: Form validation errors
   */
  const updateTag = useCallback(
    async (oldValue: string, newValue: string) => {
      if (oldValue === newValue) return;

      try {
        // Task 9.1: Automatic updates when tags are renamed
        // The tagService.updateTag method automatically updates all recipes
        await tagService.updateTag(oldValue, newValue);

        // Task 9.3: Real-time updates for tag changes
        await loadCategories();
        onTagsUpdated?.();

        // Task 10.1: Tag updated success feedback
        showFeedback(
          `Tag renamed to "${newValue}" across all recipes`,
          'success'
        );
      } catch (error: any) {
        console.error('Failed to update tag:', error);
        // Task 10.2: Validation error feedback
        const errorMsg = error.message || 'Failed to rename tag. Please try again.';
        showFeedback(errorMsg, 'error');
        throw error;
      }
    },
    [loadCategories, onTagsUpdated, showFeedback]
  );

  /**
   * Delete a tag (remove from all recipes)
   * Task 8.2: Tag deletion methods
   * Task 9.1: Automatic updates when tags are deleted
   * Task 9.2: Data cleanup on tag deletion
   * Task 10.1: Tag deleted success feedback
   */
  const deleteTag = useCallback(
    async (tagValue: string) => {
      try {
        // Task 9.1: Automatic updates when tags are deleted
        // Task 9.2: Data cleanup on tag deletion
        // The tagService.deleteTag method automatically removes from all recipes
        await tagService.deleteTag(tagValue);

        // Task 9.3: Real-time updates for tag changes
        await loadCategories();
        onTagsUpdated?.();

        // Task 10.1: Tag deleted success feedback
        showFeedback(
          `Tag "${tagValue}" removed from all recipes`,
          'success'
        );
      } catch (error: any) {
        console.error('Failed to delete tag:', error);
        // Task 10.2: Database error feedback
        const errorMsg = error.message || 'Failed to delete tag. Please try again.';
        showFeedback(errorMsg, 'error');
        throw error;
      }
    },
    [loadCategories, onTagsUpdated, showFeedback]
  );

  /**
   * Create a new custom category
   * Task 8.2: Category management methods
   * Task 10.1: Category created success feedback
   * Task 12.3: Limit exceeded errors
   */
  const createCategory = useCallback(
    async (name: string) => {
      try {
        // Task 12.3: Limit exceeded error prevention
        if (!canAddMoreCategories) {
          const errorMsg = `Maximum ${VALIDATION_CONSTRAINTS.MAX_CUSTOM_CATEGORIES} custom categories allowed`;
          showFeedback(errorMsg, 'error');
          throw new Error(errorMsg);
        }

        await tagService.createCategory({ name });

        // Task 9.3: Real-time updates for tag changes
        await loadCategories();
        onTagsUpdated?.();

        // Task 10.1: Category created success feedback
        showFeedback(`Category "${name}" created successfully`, 'success');
      } catch (error: any) {
        console.error('Failed to create category:', error);
        // Task 10.2: Validation error feedback
        const errorMsg = error.message || 'Failed to create category. Please try again.';
        showFeedback(errorMsg, 'error');
        throw error;
      }
    },
    [loadCategories, onTagsUpdated, showFeedback]
  );

  /**
   * Update a custom category
   * Task 8.2: Category management methods
   * Task 9.1: Automatic updates when categories are renamed
   * Task 10.1: Category updated success feedback
   */
  const updateCategory = useCallback(
    async (categoryId: string, newName: string) => {
      try {
        // Task 9.1: Automatic updates when categories are renamed
        // The tagService.updateCategory method automatically updates all related tags
        await tagService.updateCategory({ id: categoryId, name: newName });

        // Task 9.3: Real-time updates for tag changes
        await loadCategories();
        onTagsUpdated?.();

        // Task 10.1: Category updated success feedback
        showFeedback(`Category renamed to "${newName}"`, 'success');
      } catch (error: any) {
        console.error('Failed to update category:', error);
        // Task 10.2: Validation error feedback
        const errorMsg = error.message || 'Failed to rename category. Please try again.';
        showFeedback(errorMsg, 'error');
        throw error;
      }
    },
    [loadCategories, onTagsUpdated, showFeedback]
  );

  /**
   * Delete a custom category and all its tags
   * Task 8.2: Category management methods
   * Task 9.1: Automatic updates when categories are deleted
   * Task 9.2: Data cleanup on tag deletion
   * Task 10.1: Category deleted success feedback
   */
  const deleteCategory = useCallback(
    async (categoryId: string) => {
      try {
        // Task 9.1: Automatic updates when categories are deleted
        // Task 9.2: Data cleanup - removes all tags in the category from all recipes
        await tagService.deleteCategory(categoryId);

        // Task 9.3: Real-time updates for tag changes
        await loadCategories();
        onTagsUpdated?.();

        // Task 10.1: Category deleted success feedback
        showFeedback(
          'Category and all its tags removed',
          'success'
        );
      } catch (error: any) {
        console.error('Failed to delete category:', error);
        // Task 10.2: Database error feedback
        const errorMsg = error.message || 'Failed to delete category. Please try again.';
        showFeedback(errorMsg, 'error');
        throw error;
      }
    },
    [loadCategories, onTagsUpdated, showFeedback]
  );

  /**
   * Search tags by query
   * Task 8.2: Search methods
   * Task 11.3: Search performance optimization
   */
  const searchTags = useCallback(async (query: string) => {
    try {
      const results = await tagService.searchTags(query);
      return results;
    } catch (error) {
      console.error('Failed to search tags:', error);
      throw error;
    }
  }, []);

  /**
   * Set search query and trigger filtering
   * Task 8.2: Search methods
   */
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  /**
   * Get category by name
   * Task 11.2: UI performance optimization with memoization
   */
  const getCategoryByName = useCallback(
    (name: string) => {
      return categories.find((c) => c.name === name);
    },
    [categories]
  );

  /**
   * Check if more categories can be added
   * Task 11.2: UI performance optimization with memoization
   */
  const canAddMoreCategories = useMemo(
    () =>
      categories.filter((c) => c.type === 'custom').length <
      VALIDATION_CONSTRAINTS.MAX_CUSTOM_CATEGORIES,
    [categories]
  );

  /**
   * Check if more tags can be added to a category
   * Task 11.2: UI performance optimization with memoization
   */
  const canAddMoreTags = useCallback(
    (categoryName: string) => {
      const category = categories.find((c) => c.name === categoryName);
      if (!category) return false;

      return category.customCount < VALIDATION_CONSTRAINTS.MAX_CUSTOM_TAGS_PER_CATEGORY;
    },
    [categories]
  );

  return {
    // State
    categories,
    filteredCategories,
    loading,
    searchQuery,

    // Tag operations
    createTag,
    updateTag,
    deleteTag,

    // Category operations
    createCategory,
    updateCategory,
    deleteCategory,

    // Search operations
    setSearchQuery,
    searchTags,

    // Utility operations
    loadCategories,
    refreshCategories,
    getCategoryByName,
    canAddMoreCategories,
    canAddMoreTags,
  };
}
