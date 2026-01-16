/**
 * RecipeRepositoryScreen component
 * Main screen for browsing, searching, and filtering recipes
 *
 * Task 2.1: Recipe Repository Screen
 * Task 5.2: View Mode Switching Logic
 * Task Group 4: Horizontal Tag Filter Integration
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
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HorizontalTagFilter } from './HorizontalTagFilter';
import { TagFilterModal } from './TagFilterModal';
import { RecipeGrid } from './RecipeGrid';
import { RecipeList } from './RecipeList';

/**
 * Recipe Repository Screen - Main browsing interface
 *
 * Features:
 * - Search recipes by title (case-insensitive)
 * - Filter by tags with AND logic (recipes must have ALL selected tags)
 * - Horizontal tag filter with top 10 tags and Quick preset
 * - Tag filter modal for accessing all tags
 * - Toggle between grid (2-column) and list (single-column) view
 * - Pull-to-refresh for data updates
 * - Infinite scroll pagination with lazy loading
 * - FAB for adding new recipes
 * - Navigation to recipe detail and create screens
 */
export function RecipeRepositoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    recipes,
    filteredRecipes,
    topTags,
    allUniqueTags,
    loading,
    error,
    searchQuery,
    selectedTags,
    presetFilter,
    viewMode,
    setSearchQuery,
    toggleTag,
    clearFilters,
    setViewMode,
    setPresetFilter,
    loadMore,
    refresh,
  } = useRecipeRepository({
    initialPageSize: 20,
    enablePersistence: true,
    searchDebounceMs: 300,
  });

  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const handleViewModeToggle = useCallback(
    (mode: typeof viewMode) => {
      if (!isValidViewMode(mode)) {
        console.error('Invalid view mode:', mode);
        return;
      }

      if (mode === viewMode) {
        return;
      }

      setViewMode(mode);
    },
    [viewMode, setViewMode]
  );

  const backgroundColor = isDark ? '#000000' : '#FFFFFF';

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
      }
    },
    [router]
  );

  const handleAddRecipe = useCallback(() => {
    try {
      router.push('/recipe-form/create' as any);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [router]);

  const handleFilterPress = useCallback(() => {
    setFilterModalVisible(true);
  }, []);

  const handlePresetChange = (preset: 'all' | 'quick') => {
    if (preset === 'all') {
      clearFilters();
    } else {
      setPresetFilter(preset);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, isDark && styles.headerDark]}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search recipes..."
          />
        </View>
        <ViewModeToggle
          viewMode={viewMode}
          onToggle={handleViewModeToggle}
        />
      </View>

      <HorizontalTagFilter
        topTags={topTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        presetFilter={presetFilter}
        onPresetChange={handlePresetChange}
        onFilterPress={handleFilterPress}
      />
    </View>
  );

  const renderEmptyState = () => {
    if (loading) {
      return null;
    }

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

    if (filteredRecipes.length === 0) {
      const hasFilters =
        searchQuery.length > 0 || selectedTags.length > 0 || presetFilter !== 'all';

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top']}
    >
      {renderHeader()}

      <View style={styles.content}>
        {viewMode === 'grid' ? (
          <RecipeGrid
            recipes={filteredRecipes}
            onRecipePress={handleRecipePress}
            onEndReached={loadMore}
            onRefresh={refresh}
            refreshing={loading}
            ListEmptyComponent={renderEmptyState() || undefined}
          />
        ) : (
          <RecipeList
            recipes={filteredRecipes}
            onRecipePress={handleRecipePress}
            onEndReached={loadMore}
            onRefresh={refresh}
            refreshing={loading}
            ListEmptyComponent={renderEmptyState() || undefined}
          />
        )}
      </View>

      <TagFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        allTags={allUniqueTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
      />

      <FAB icon="add" onPress={handleAddRecipe} />
    </SafeAreaView>
  );
}

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
  headerDark: {
    backgroundColor: '#000000',
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
