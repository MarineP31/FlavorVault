import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { MealPlanEmptyState } from '@/components/meal-plan/MealPlanEmptyState';
import { MealPlanQueueItem } from '@/components/meal-plan/MealPlanQueueItem';
import { useMealPlan } from '@/lib/contexts/meal-plan-context';
import type { MealPlanWithRecipe } from '@/lib/db/schema/meal-plan';

export default function MealPlanScreen() {
  const router = useRouter();
  const {
    queuedRecipes,
    isLoading,
    error,
    removeRecipe,
    clearAll,
    refresh,
  } = useMealPlan();

  const handleNavigateToRecipe = useCallback(
    (recipeId: string) => {
      router.push(`/recipe/${recipeId}` as any);
    },
    [router]
  );

  const handleAddMoreRecipes = useCallback(() => {
    router.push('/(tabs)/' as any);
  }, [router]);

  const handleClearAll = useCallback(async () => {
    await clearAll();
  }, [clearAll]);

  const handleRemoveRecipe = useCallback(
    async (recipeId: string) => {
      await removeRecipe(recipeId);
    },
    [removeRecipe]
  );

  const renderItem = useCallback(
    ({ item }: { item: MealPlanWithRecipe }) => (
      <MealPlanQueueItem
        item={item}
        onRemove={handleRemoveRecipe}
        onPress={() => handleNavigateToRecipe(item.recipeId)}
      />
    ),
    [handleRemoveRecipe, handleNavigateToRecipe]
  );

  const keyExtractor = useCallback(
    (item: MealPlanWithRecipe) => item.recipeId,
    []
  );

  const ListFooterComponent = useCallback(
    () => (
      <TouchableOpacity
        style={styles.addMoreButton}
        onPress={handleAddMoreRecipes}
        activeOpacity={0.8}
        testID="add-more-recipes-button"
        accessibilityRole="button"
        accessibilityLabel="Add more recipes to meal plan"
      >
        <Icon name="add-circle-outline" size={20} color="#FF6B35" />
        <Text style={styles.addMoreButtonText}>Add More Recipes</Text>
      </TouchableOpacity>
    ),
    [handleAddMoreRecipes]
  );

  if (isLoading && queuedRecipes.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meal Plan</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading meal plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && queuedRecipes.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meal Plan</Text>
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (queuedRecipes.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meal Plan</Text>
        </View>
        <MealPlanEmptyState onAddRecipes={handleAddMoreRecipes} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Plan</Text>
        <TouchableOpacity
          onPress={handleClearAll}
          activeOpacity={0.7}
          testID="clear-all-button"
          accessibilityRole="button"
          accessibilityLabel="Clear all recipes from meal plan"
        >
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={queuedRecipes}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        testID="meal-plan-list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  clearAllText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorIconText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#EF4444',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 24,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5EB',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addMoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
});
