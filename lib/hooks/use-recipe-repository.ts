/**
 * Custom hook for managing recipe repository data and operations
 * Handles loading, searching, filtering, pagination, and view mode management
 *
 * Task 2.2: Custom Hook for Repository Logic
 * Task 2.3: Repository State Management
 * Task 5.2: View Mode Switching Logic
 * Task 5.3: View Mode Persistence
 * Task 1.2-1.5: Horizontal Tag Filter Enhancement
 *
 * Features:
 * - Recipe data fetching with pagination
 * - Search state management with debouncing
 * - Filter state management (tag-based)
 * - Preset filter for "Quick" recipes
 * - Top tags computed by frequency
 * - All unique tags for modal display
 * - View mode preference persistence with error handling
 * - Loading and error state handling
 * - Database integration via RecipeService
 */

import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recipeService } from '@/lib/db';
import type { Recipe } from '@/lib/db';
import {
  ViewMode,
  DEFAULT_VIEW_MODE,
  getValidViewMode,
  VIEW_MODE_STORAGE_KEY,
  isValidViewMode
} from '@/lib/constants';

export type PresetFilter = 'all' | 'quick';

/**
 * Hook configuration options
 */
interface UseRecipeRepositoryOptions {
  /** Initial page size for pagination (default: 20) */
  initialPageSize?: number;
  /** Enable persistence of preferences to AsyncStorage (default: true) */
  enablePersistence?: boolean;
  /** Debounce delay for search in milliseconds (default: 300) */
  searchDebounceMs?: number;
}

/**
 * Hook return type
 */
interface UseRecipeRepositoryReturn {
  // Data
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  topTags: string[];
  allUniqueTags: string[];

  // Loading & Error States
  loading: boolean;
  error: string | null;

  // Search State
  searchQuery: string;

  // Filter State
  selectedTags: string[];
  presetFilter: PresetFilter;

  // View Mode State
  viewMode: ViewMode;

  // Pagination State
  page: number;
  hasMore: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  setPresetFilter: (preset: PresetFilter) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * AsyncStorage keys for persistence
 */
const STORAGE_KEYS = {
  VIEW_MODE: VIEW_MODE_STORAGE_KEY,
  SELECTED_TAGS: '@flavorvault:selected_tags',
  SEARCH_QUERY: '@flavorvault:search_query',
} as const;

/**
 * Hook for managing recipe repository state and operations
 *
 * @param options - Configuration options
 * @returns Recipe data and management functions
 *
 * @example
 * ```tsx
 * const {
 *   recipes,
 *   filteredRecipes,
 *   topTags,
 *   allUniqueTags,
 *   loading,
 *   searchQuery,
 *   setSearchQuery,
 *   selectedTags,
 *   toggleTag,
 *   presetFilter,
 *   setPresetFilter,
 *   viewMode,
 *   setViewMode,
 *   loadMore,
 *   refresh
 * } = useRecipeRepository({
 *   initialPageSize: 20,
 *   enablePersistence: true,
 *   searchDebounceMs: 300
 * });
 * ```
 */
export function useRecipeRepository(
  options: UseRecipeRepositoryOptions = {}
): UseRecipeRepositoryReturn {
  const {
    initialPageSize = 20,
    enablePersistence = true,
    searchDebounceMs = 300,
  } = options;

  // State Management
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQueryState] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [presetFilter, setPresetFilterState] = useState<PresetFilter>('all');
  const [viewMode, setViewModeState] = useState<ViewMode>(DEFAULT_VIEW_MODE);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Refs for debouncing - using ReturnType for React Native compatibility
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Task 1.2: Add `allUniqueTags` computed property
   * Extract unique tags from all loaded recipes, normalized to lowercase
   * Return alphabetically sorted array for modal display
   */
  const allUniqueTags = useMemo(() => {
    const tagSet = new Set<string>();

    recipes.forEach((recipe) => {
      recipe.tags.forEach((tag) => {
        tagSet.add(tag.toLowerCase());
      });
    });

    return Array.from(tagSet).sort();
  }, [recipes]);

  /**
   * Task 1.3: Add `topTags` computed property
   * Calculate tag frequency and return top 10 tags sorted by usage count descending
   * Reuses pattern from existing TagFilter.tsx tagCounts logic
   */
  const topTags = useMemo(() => {
    const counts = new Map<string, number>();

    recipes.forEach((recipe) => {
      recipe.tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase();
        counts.set(normalizedTag, (counts.get(normalizedTag) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ tag }) => tag);
  }, [recipes]);

  /**
   * Task 2.3: Implement search query state with debouncing
   * Debounced search input for performance (300ms delay)
   */
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(query);
    }, searchDebounceMs);
  }, [searchDebounceMs]);

  /**
   * Task 1.4: Add `presetFilter` state for "Quick" special filter
   * Type: 'all' | 'quick' (removed 'favorites' and 'healthy')
   */
  const setPresetFilter = useCallback((preset: PresetFilter) => {
    setPresetFilterState(preset);
  }, []);

  /**
   * Task 5.3: View preference loading on app start
   * Task 5.3: View preference error handling
   * Load persisted preferences from AsyncStorage
   */
  const loadPreferences = useCallback(async () => {
    if (!enablePersistence) return;

    try {
      const [storedViewMode, storedTags] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.VIEW_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_TAGS),
      ]);

      // Task 5.3: Validate and set view mode with fallback handling
      if (storedViewMode) {
        const validatedMode = getValidViewMode(storedViewMode);
        setViewModeState(validatedMode);
      } else {
        // Task 5.3: Fallback to default if no stored preference
        setViewModeState(DEFAULT_VIEW_MODE);
      }

      // Set selected tags
      if (storedTags) {
        try {
          const parsedTags = JSON.parse(storedTags);
          if (Array.isArray(parsedTags)) {
            setSelectedTags(parsedTags);
          }
        } catch (parseError) {
          console.error('Failed to parse stored tags:', parseError);
          // Task 5.3: Fallback to empty array on parse error
          setSelectedTags([]);
        }
      }
    } catch (err) {
      // Task 5.3: View preference error handling
      console.error('Failed to load preferences:', err);
      // Task 5.3: Fallback to defaults on error
      setViewModeState(DEFAULT_VIEW_MODE);
      setSelectedTags([]);
    }
  }, [enablePersistence]);

  /**
   * Task 5.3: Implement view preference persistence across app sessions
   * Task 5.3: Add view preference error handling
   * Persist view mode preference to AsyncStorage
   */
  const persistViewMode = useCallback(async (mode: ViewMode) => {
    if (!enablePersistence) return;

    try {
      // Task 5.2: Add view mode validation before persisting
      if (!isValidViewMode(mode)) {
        console.error('Attempted to persist invalid view mode:', mode);
        return;
      }

      await AsyncStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
    } catch (err) {
      // Task 5.3: View mode persistence error handling
      console.error('Failed to persist view mode:', err);
    }
  }, [enablePersistence]);

  /**
   * Persist selected tags to AsyncStorage
   */
  const persistTags = useCallback(async (tags: string[]) => {
    if (!enablePersistence) return;

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_TAGS, JSON.stringify(tags));
    } catch (err) {
      console.error('Failed to persist tags:', err);
    }
  }, [enablePersistence]);

  /**
   * Task 2.2: Implement recipe data fetching logic
   * Load recipes from database with pagination support
   */
  const loadRecipes = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const offset = (pageNum - 1) * initialPageSize;
      const allRecipes = await recipeService.getAllRecipes({
        limit: initialPageSize,
        offset: offset,
      });

      if (append) {
        setRecipes((current) => [...current, ...allRecipes]);
      } else {
        setRecipes(allRecipes);
      }

      // Update hasMore based on returned results
      setHasMore(allRecipes.length >= initialPageSize);
      setPage(pageNum);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recipes';
      setError(errorMessage);
      console.error('Failed to load recipes:', err);
    } finally {
      setLoading(false);
    }
  }, [initialPageSize]);

  /**
   * Task 2.3: Implement search query state and filter state management
   * Task 1.5: Update `filteredRecipes` to apply preset filter
   * Filter recipes based on search query, selected tags, and preset filter
   *
   * Search Logic:
   * - Search by recipe title (case-insensitive)
   * - Real-time results with debounced input
   *
   * Filter Logic:
   * - Multiple tag selection with AND logic
   * - Recipes must have ALL selected tags
   * - Apply preset filter ("Quick" time-based filter)
   */
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Task 2.2: Search by recipe title only (case-insensitive)
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const matchesTitle = recipe.title.toLowerCase().includes(query);

        if (!matchesTitle) {
          return false;
        }
      }

      // Task 2.2: Tag filtering with AND logic
      if (selectedTags.length > 0) {
        const recipeTags = recipe.tags.map(tag => tag.toLowerCase());
        const hasAllTags = selectedTags.every(
          selectedTag => recipeTags.includes(selectedTag.toLowerCase())
        );

        if (!hasAllTags) {
          return false;
        }
      }

      // Task 1.5: Apply preset filter ("Quick" time-based filter)
      if (presetFilter === 'quick') {
        const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
        if (totalTime > 20) {
          return false;
        }
      }

      return true;
    });
  }, [recipes, debouncedSearchQuery, selectedTags, presetFilter]);

  /**
   * Task 2.3: Add active filter tags state
   * Toggle a tag in the selected tags list
   */
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((current) => {
      const normalizedTag = tag.toLowerCase();
      const newTags = current.includes(normalizedTag)
        ? current.filter(t => t !== normalizedTag)
        : [...current, normalizedTag];

      persistTags(newTags);
      return newTags;
    });
  }, [persistTags]);

  /**
   * Clear all filters (search, tags, and preset)
   */
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedTags([]);
    setPresetFilterState('all');
    persistTags([]);
  }, [setSearchQuery, persistTags]);

  /**
   * Task 5.2: Implement view mode state management
   * Task 5.2: Add view mode validation
   * Task 5.3: Persist view mode across app sessions
   * Update view mode and persist to AsyncStorage
   */
  const setViewMode = useCallback((mode: ViewMode) => {
    // Task 5.2: Validate view mode before setting
    if (!isValidViewMode(mode)) {
      console.error('Invalid view mode provided:', mode);
      return;
    }

    setViewModeState(mode);
    // Task 5.3: Persist to AsyncStorage for cross-session persistence
    persistViewMode(mode);
  }, [persistViewMode]);

  /**
   * Task 2.2: Add pagination logic
   * Task 2.3: Add pagination state for infinite scroll
   * Load more recipes for infinite scroll
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = page + 1;
      await loadRecipes(nextPage, true);
    } catch (err) {
      console.error('Failed to load more recipes:', err);
    }
  }, [hasMore, loading, page, loadRecipes]);

  /**
   * Refresh recipes from database
   * Resets pagination and reloads from beginning
   */
  const refresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await loadRecipes(1, false);
  }, [loadRecipes]);

  /**
   * Task 2.3: Implement loading states for data fetching
   * Task 2.3: Add error states for failed operations
   * Task 5.3: Add view preference loading on app start
   * Load preferences and initial recipes on mount
   */
  useEffect(() => {
    loadPreferences();
    loadRecipes();
  }, [loadPreferences, loadRecipes]);

  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data
    recipes,
    filteredRecipes,
    topTags,
    allUniqueTags,

    // Loading & Error States (Task 2.3)
    loading,
    error,

    // Search State (Task 2.3)
    searchQuery,

    // Filter State (Task 2.3, Task 1.4)
    selectedTags,
    presetFilter,

    // View Mode State (Task 2.3, Task 5.2, Task 5.3)
    viewMode,

    // Pagination State (Task 2.3)
    page,
    hasMore,

    // Actions
    setSearchQuery,
    toggleTag,
    clearFilters,
    setViewMode,
    setPresetFilter,
    loadMore,
    refresh,
  };
}
