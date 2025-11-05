/**
 * RecipeRepositoryScreen component
 * Main screen for browsing, searching, and filtering recipes
 *
 * Task 2.1: Recipe Repository Screen
 * - Create main repository screen with basic layout structure
 * - Implement screen state management
 * - Add navigation integration
 * - Implement loading states
 * - Test basic screen functionality
 *
 * Task 5.2: View Mode Switching Logic
 * - Implement smooth transition animations
 * - Add view mode validation
 */

import { EmptyState } from '@/components/ui/EmptyState';
import { FAB } from '@/components/ui/FAB';
import { SearchBar } from '@/components/ui/SearchBar';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { Colors } from '@/constants/theme';
import { isValidViewMode } from '@/lib/constants/view-modes';
import type { Recipe } from '@/lib/db';
import { useRecipeRepository } from '@/lib/hooks/use-recipe-repository';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { RecipeGrid } from './RecipeGrid';
import { RecipeList } from './RecipeList';

function applyPresetFilter(
  recipes: Recipe[],
  preset: 'all' | 'favorites' | 'quick' | 'healthy'
) {
  if (preset === 'all') return recipes;
  if (preset === 'favorites')
    return recipes.filter((r) => r.tags.includes('favorite'));
  if (preset === 'quick')
    return recipes.filter(
      (r) => (r.prepTime || 0) + (r.cookTime || 0) <= 20
    );
  if (preset === 'healthy')
    return recipes.filter((r) =>
      r.tags.some((t) => t.toLowerCase() === 'healthy')
    );
  return recipes;
}

/**
 * Recipe Repository Screen - Main browsing interface
 *
 * Features:
 * - Search recipes by title (case-insensitive)
 * - Filter by tags with AND logic (recipes must have ALL selected tags)
 * - Toggle between grid (2-column) and list (single-column) view
 * - Smooth transition animations when switching view modes
 * - Pull-to-refresh for data updates
 * - Infinite scroll pagination with lazy loading
 * - FAB for adding new recipes
 * - Navigation to recipe detail and create screens
 * - View preferences persist across app sessions via AsyncStorage
 * - Loading and error state handling with retry functionality
 *
 * @returns RecipeRepositoryScreen component
 *
 * @example
 * ```tsx
 * // In app/(tabs)/index.tsx
 * export { RecipeRepositoryScreen as default } from '@/components/recipes/RecipeRepositoryScreen';
 * ```
 */
export function RecipeRepositoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  /**
   * Task 2.1: Add screen state management
   * Use custom hook for repository logic and state management
   */
  const {
    recipes,
    filteredRecipes,
    loading,
    error,
    searchQuery,
    selectedTags,
    viewMode,
    setSearchQuery,
    clearFilters,
    setViewMode,
    loadMore,
    refresh,
  } = useRecipeRepository({
    initialPageSize: 20,
    enablePersistence: true,
    searchDebounceMs: 300,
  });

  /**
   * Task 5.2: Implement smooth transition animations
   * Animated value for view mode transitions
   */
  const [fadeAnim] = React.useState(new Animated.Value(1));
  const [presetFilter, setPresetFilter] = React.useState<
    'all' | 'favorites' | 'quick' | 'healthy'
  >('all');

  /**
   * Task 5.2: View mode switching with smooth animations
   * Animate fade out/in when switching between grid and list views
   */
  const handleViewModeToggle = useCallback(
    (mode: typeof viewMode) => {
      // Task 5.2: Add view mode validation
      if (!isValidViewMode(mode)) {
        console.error('Invalid view mode:', mode);
        return;
      }

      if (mode === viewMode) {
        return; // No change needed
      }

      // Task 5.2: Smooth transition animation
      // Fade out current view
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        // Switch view mode
        setViewMode(mode);
        // Fade in new view
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    },
    [viewMode, setViewMode, fadeAnim]
  );

  const backgroundColor = isDark ? '#000000' : '#FFFFFF';

  /**
   * Task 2.1: Implement navigation integration
   * Handle recipe card press - navigate to detail screen (Read flow)
   */
  const handleRecipePress = useCallback(
    (recipe: Recipe) => {
      try {
        if (!recipe.id) {
          console.error('Recipe missing ID:', recipe);
          return;
        }
        router.push(`/recipe/${recipe.id}` as any);
      } catch (error) {
        console.error('Navigation error:', error);
        // Gracefully handle navigation error - could show toast notification
      }
    },
    [router]
  );

  /**
   * Task 2.1: Implement navigation integration
   * Handle FAB press - navigate to create screen (Create flow)
   */
  const handleAddRecipe = useCallback(() => {
    try {
      router.push('/recipe-form/create' as any);
    } catch (error) {
      console.error('Navigation error:', error);
      // Gracefully handle navigation error
    }
  }, [router]);

  /**
   * Task 2.1: Implement basic screen layout structure
   * Render header with search, filters, and view toggle
   */
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Top title row mimicking @HomeScreen.png */}
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>My Recipes</Text>
          <Text
            style={styles.subtitle}
            accessibilityLabel={`${recipes.length} recipes saved`}
          >
            {recipes.length} recipes saved
          </Text>
        </View>
        <View style={styles.titleActions}>
          <View
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Backup"
          >
            <Icon
              name="cloud-upload-outline"
              size={16}
              color="#FFFFFF"
            />
          </View>
          <View
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Icon
              name="add"
              size={20}
              color="#FFFFFF"
            />
          </View>
        </View>
      </View>

      {/* Search and view toggle row */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search recipes..."
          />
        </View>
        {/* Small filters icon next to search */}
        <View
          style={styles.smallIconButton}
          accessibilityRole="button"
          accessibilityLabel="Filters"
        >
          <Icon
            name="options-outline"
            size={20}
            color="#1C1C1E"
          />
        </View>
        <ViewModeToggle
          viewMode={viewMode}
          onToggle={handleViewModeToggle}
        />
      </View>

      {/* Preset segment chips */}
      <View style={styles.segmentRow}>
        {(['all', 'favorites', 'quick', 'healthy'] as const).map(
          (key) => {
            const label =
              key === 'all'
                ? 'All'
                : key.charAt(0).toUpperCase() + key.slice(1);
            const isSelected = presetFilter === key;
            return (
              <View
                key={key}
                style={[
                  styles.segmentChip,
                  isSelected && styles.segmentChipActive,
                ]}
              >
                <Text
                  onPress={() => setPresetFilter(key)}
                  accessibilityRole="button"
                  style={[
                    styles.segmentText,
                    isSelected && styles.segmentTextActive,
                  ]}
                >
                  {label}
                </Text>
              </View>
            );
          }
        )}
      </View>
    </View>
  );

  /**
   * Task 2.1: Add loading states
   * Render empty state based on context
   */
  const renderEmptyState = () => {
    if (loading) {
      return null;
    }

    // Error state with retry functionality
    if (error) {
      return (
        <EmptyState
          icon="alert-circle-outline"
          title="Something went wrong"
          message={error}
          actionLabel="Try again"
          onAction={refresh}
        />
      );
    }

    // Empty collection state
    if (recipes.length === 0) {
      return (
        <EmptyState
          icon="restaurant-outline"
          title="No recipes yet"
          message="Start building your recipe collection by adding your first recipe"
          actionLabel="Add Recipe"
          onAction={handleAddRecipe}
        />
      );
    }

    // No filtered results state
    if (filteredRecipes.length === 0) {
      const hasFilters =
        searchQuery.length > 0 || selectedTags.length > 0;

      if (hasFilters) {
        return (
          <EmptyState
            icon="search-outline"
            title="No recipes found"
            message="Try adjusting your search or filters"
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        );
      }
    }

    return null;
  };

  /**
   * Task 2.1: Add loading states
   * Render initial loading indicator
   */
  if (loading && recipes.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={
              isDark ? Colors.dark.primary : Colors.light.primary
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Task 2.1: Implement basic screen layout structure
   * Task 5.2: Add smooth transition animations for view mode changes
   * Main screen render
   */
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top']}
    >
      {renderHeader()}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {viewMode === 'grid' ? (
          <RecipeGrid
            recipes={applyPresetFilter(filteredRecipes, presetFilter)}
            onRecipePress={handleRecipePress}
            onEndReached={loadMore}
            onRefresh={refresh}
            refreshing={loading}
            ListEmptyComponent={renderEmptyState() || undefined}
          />
        ) : (
          <RecipeList
            recipes={applyPresetFilter(filteredRecipes, presetFilter)}
            onRecipePress={handleRecipePress}
            onEndReached={loadMore}
            onRefresh={refresh}
            refreshing={loading}
            ListEmptyComponent={renderEmptyState() || undefined}
          />
        )}
      </Animated.View>

      <FAB icon="add" onPress={handleAddRecipe} />
    </SafeAreaView>
  );
}

/**
 * Styles for RecipeRepositoryScreen
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  segmentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    paddingTop: 12,
  },
  segmentChip: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  segmentChipActive: {
    backgroundColor: '#FF6B35',
  },
  segmentText: {
    color: '#1C1C1E',
    fontSize: 14,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  titleRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#8E8E93',
  },
  titleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    height: 32,
    width: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
  },
  smallIconButton: {
    height: 40,
    width: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  searchContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
