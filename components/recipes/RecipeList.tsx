/**
 * RecipeList component
 * Displays recipes in a vertical list layout
 *
 * Task 7.2: Recipe List Component
 * Task 8.1: Infinite Scroll Logic (FlatList with onEndReached)
 * Task 8.3: Performance Optimization (Virtual scrolling via FlatList)
 */

import React from 'react';
import {
  FlatList,
  StyleSheet,
} from 'react-native';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '@/lib/db';

export interface RecipeListProps {
  recipes: Recipe[];
  onRecipePress: (recipe: Recipe) => void;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListEmptyComponent?: React.ReactElement;
  testID?: string;
}

/**
 * List layout component for recipes
 *
 * Features:
 * - Single-column list layout using FlatList
 * - Virtual scrolling for performance (automatic via FlatList)
 * - Infinite scroll with onEndReached
 * - Pull-to-refresh support
 * - Lazy loading for images
 * - Efficient vertical space usage
 *
 * Performance:
 * - FlatList provides virtual scrolling automatically
 * - RecipeCard is memoized with React.memo
 * - Efficient keyExtractor using recipe.id
 * - onEndReachedThreshold={0.5} for smooth pagination
 *
 * @param props - Component props
 * @returns RecipeList component
 *
 * @example
 * ```tsx
 * <RecipeList
 *   recipes={filteredRecipes}
 *   onRecipePress={handleRecipePress}
 *   onEndReached={loadMore}
 *   onRefresh={refresh}
 *   refreshing={loading}
 * />
 * ```
 */
export function RecipeList({
  recipes,
  onRecipePress,
  onEndReached,
  onRefresh,
  refreshing = false,
  ListEmptyComponent,
  testID = 'recipe-list',
}: RecipeListProps) {
  const renderItem = ({ item }: { item: Recipe }) => (
    <RecipeCard
      recipe={item}
      onPress={onRecipePress}
      variant="list"
      testID={`${testID}-card-${item.id}`}
    />
  );

  return (
    <FlatList
      data={recipes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={ListEmptyComponent}
      testID={testID}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={15}
      windowSize={21}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingBottom: 100, // Space for FAB
  },
});
