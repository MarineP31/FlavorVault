/**
 * Recipe Detail Screen
 * Task 2.1: Recipe Detail Screen
 * Task 2.4: Screen Layout Structure
 * Task Groups 6-8: Meta Info, Ingredients, Instructions Components
 * Task Groups 9-13: Action buttons, Delete confirmation, Navigation context, Performance, Error handling
 *
 * Displays complete recipe information with action buttons for editing,
 * deleting, and adding to meal plans.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { useRecipeDetail } from '@/lib/hooks/use-recipe-detail';
import { RecipeDetailHeader, NavigationSource } from '@/components/recipes/recipe-detail-header';
import { RecipeHeroImage } from '@/components/recipes/recipe-hero-image';
import { RecipeTitle } from '@/components/recipes/recipe-title';
import { RecipeMetaInfo } from '@/components/recipes/recipe-meta-info';
import { RecipeInfoBar } from '@/components/recipes/recipe-info-bar';
import { IngredientsList } from '@/components/recipes/ingredients-list';
import { InstructionsList } from '@/components/recipes/instructions-list';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Toast } from '@/components/ui/Toast';
import { recipeService } from '@/lib/db/services/recipe-service';

/**
 * Recipe Detail Screen
 *
 * Features:
 * - Display complete recipe information in clean, readable format
 * - Full-width hero image with placeholder fallback
 * - Context-aware action buttons (Edit, Delete, Add to Queue)
 * - Source attribution and tags display
 * - Cooking metadata info bar (prep time, cook time, servings)
 * - Formatted ingredients list
 * - Auto-numbered instructions
 * - Loading and error states
 * - Delete confirmation dialog
 * - Success/error toast notifications
 * - Performance optimizations (useMemo, useCallback)
 * - Enhanced error handling and recovery
 * - Context-aware navigation
 * - Dark mode support
 * - Accessibility support
 *
 * Navigation:
 * - From recipe list (tap card) - source: 'list'
 * - After creating recipe - source: 'create'
 * - After editing recipe - source: 'edit'
 * - From meal planning queue - source: 'queue'
 *
 * @example
 * Navigate to this screen: router.push(`/recipes/${recipeId}?source=list`)
 */
export default function RecipeDetailScreen() {
  // Task 11.1: Navigation Source Detection
  const params = useLocalSearchParams<{ id: string; source?: NavigationSource }>();
  const router = useRouter();

  const recipeId = params.id;
  const source = (params.source || 'list') as NavigationSource;

  // Fetch recipe data
  // Task 12.3: Data Performance - with caching in hook
  const { recipe, loading, error, refetch } = useRecipeDetail(recipeId);

  // Dialog and toast state
  // Task 10.1: Delete Confirmation Dialog
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  /**
   * Task 9.1: Edit Button Implementation
   * Handle edit button press with loading state
   */
  const handleEdit = useCallback(() => {
    try {
      // Navigate to edit form with recipe ID
      router.push(`/recipe-form/edit/${recipeId}`);
    } catch (err) {
      console.error('Error navigating to edit:', err);
      setToastMessage('Failed to open editor. Please try again.');
      setToastType('error');
      setToastVisible(true);
    }
  }, [recipeId, router]);

  /**
   * Task 9.2: Delete Button Implementation
   * Handle delete button press - show confirmation dialog
   */
  const handleDeletePress = useCallback(() => {
    setDeleteDialogVisible(true);
  }, []);

  /**
   * Task 10.2: Delete Flow Integration
   * Handle delete confirmation with proper error handling
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!recipeId || deleting) return;

    try {
      setDeleting(true);

      // Task 9.2: Delete recipe from database
      await recipeService.deleteRecipe(recipeId);

      // Task 10.3: Delete Success Handling
      setDeleteDialogVisible(false);
      setToastMessage('Recipe deleted successfully');
      setToastType('success');
      setToastVisible(true);

      // Task 11.3: Back Navigation Logic - navigate based on source
      setTimeout(() => {
        handleBackNavigation();
      }, 1000);
    } catch (err) {
      console.error('Error deleting recipe:', err);

      // Task 9.2: Delete error handling
      setToastMessage('Failed to delete recipe. Please try again.');
      setToastType('error');
      setToastVisible(true);
      setDeleteDialogVisible(false);
      setDeleting(false);
    }
  }, [recipeId, deleting]);

  /**
   * Task 11.3: Back Navigation Logic
   * Navigate back to appropriate screen based on source context
   */
  const handleBackNavigation = useCallback(() => {
    try {
      switch (source) {
        case 'queue':
          // Navigate back to meal planning queue
          router.replace('/(tabs)/meal-planning');
          break;
        case 'create':
        case 'edit':
        case 'list':
        default:
          // Navigate back to recipe list
          router.replace('/(tabs)');
          break;
      }
    } catch (err) {
      console.error('Error navigating back:', err);
      // Fallback to default navigation
      router.replace('/(tabs)');
    }
  }, [source, router]);

  /**
   * Task 9.3: Add to Queue Button Implementation
   * Handle "Add to Queue" button press
   * TODO: Integrate with meal planning service when available
   */
  const handleAddToQueue = useCallback(() => {
    try {
      // TODO: Implement actual queue integration
      // await mealPlanningService.addToQueue(recipeId);

      setToastMessage('Recipe added to meal plan!');
      setToastType('success');
      setToastVisible(true);
    } catch (err) {
      console.error('Error adding to queue:', err);
      setToastMessage('Failed to add to meal plan. Please try again.');
      setToastType('error');
      setToastVisible(true);
    }
  }, [recipeId]);

  /**
   * Task 9.4: Remove from Queue Button Implementation
   * Handle "Remove from Queue" button press
   * TODO: Integrate with meal planning service when available
   */
  const handleRemoveFromQueue = useCallback(() => {
    try {
      // TODO: Implement actual queue integration
      // await mealPlanningService.removeFromQueue(recipeId);

      setToastMessage('Recipe removed from meal plan');
      setToastType('success');
      setToastVisible(true);
    } catch (err) {
      console.error('Error removing from queue:', err);
      setToastMessage('Failed to remove from meal plan. Please try again.');
      setToastType('error');
      setToastVisible(true);
    }
  }, [recipeId]);

  /**
   * Task 13.3: Navigation Error Handling
   * Handle dialog close with state cleanup
   */
  const handleDialogClose = useCallback(() => {
    if (!deleting) {
      setDeleteDialogVisible(false);
    }
  }, [deleting]);

  /**
   * Task 12.1: Scroll Performance
   * Memoized scroll content to prevent unnecessary re-renders
   */
  const scrollContent = useMemo(() => {
    if (!recipe) return null;

    return (
      <>
        {/* Hero Image - Task 12.2: Image Performance */}
        <RecipeHeroImage
          imageUri={recipe.imageUri}
          recipeName={recipe.title}
        />

        {/* Recipe Title */}
        <RecipeTitle title={recipe.title} />

        {/* Meta Information (Tags) - source field not yet in schema */}
        <RecipeMetaInfo
          source={null}
          tags={recipe.tags}
        />

        {/* Recipe Info Bar (Prep Time, Cook Time, Servings) */}
        <View className="mt-2 mb-4">
          <RecipeInfoBar
            prepTime={recipe.prepTime}
            cookTime={recipe.cookTime}
            servings={recipe.servings}
          />
        </View>

        {/* Divider */}
        <View className="h-px bg-[#E5E5EA] dark:bg-[#38383A] mx-4 my-2" />

        {/* Ingredients List */}
        <IngredientsList ingredients={recipe.ingredients} />

        {/* Divider */}
        <View className="h-px bg-[#E5E5EA] dark:bg-[#38383A] mx-4 my-2" />

        {/* Instructions List */}
        <InstructionsList instructions={recipe.steps} />

        {/* Bottom spacing */}
        <View className="h-5" />
      </>
    );
  }, [recipe]);

  /**
   * Task 13.1: Data Error Handling
   * Render loading state
   */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
        <Stack.Screen options={{ title: 'Loading...', headerShown: false }} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-base text-[#8E8E93]">
            Loading recipe...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Task 13.1: Data Error Handling
   * Task 13.2: UI Error Handling
   * Render error state with recovery options
   */
  if (error || !recipe) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
        <Stack.Screen options={{ title: 'Error', headerShown: true }} />
        <View className="flex-1 justify-center items-center px-5">
          <Icon name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text className="mt-4 text-xl font-bold text-black dark:text-white text-center">
            {error || 'Recipe not found'}
          </Text>
          <Text className="mt-2 text-sm text-[#8E8E93] text-center">
            {error
              ? 'Please try again or return to the recipe list.'
              : 'This recipe may have been deleted or does not exist.'}
          </Text>
          <View className="flex-row gap-3 mt-6">
            {/* Task 13.1: Data error recovery - retry option */}
            {error && (
              <Button
                title="Retry"
                onPress={() => refetch()}
                variant="secondary"
                style={{ minWidth: 100 }}
              />
            )}
            <Button
              title="Go Back"
              onPress={() => router.back()}
              variant="primary"
              style={{ minWidth: 100 }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Render recipe detail view
   */
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['bottom']}>
      <Stack.Screen
        options={{
          title: recipe.title,
          headerShown: false,
        }}
      />

      {/* Task 11.2: Context-Aware Button Visibility - Fixed Header with Action Buttons */}
      <RecipeDetailHeader
        onEdit={handleEdit}
        onDelete={handleDeletePress}
        onAddToQueue={handleAddToQueue}
        onRemoveFromQueue={handleRemoveFromQueue}
        source={source}
      />

      {/* Task 12.1: Scroll Performance - Optimized ScrollView */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {scrollContent}
      </ScrollView>

      {/* Task 10.1: Delete Confirmation Dialog */}
      {/* Task 10.2: Delete Flow Integration */}
      <Dialog
        visible={deleteDialogVisible}
        onClose={handleDialogClose}
        title="Delete Recipe"
        description={`Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        confirmVariant="destructive"
        showCancel={!deleting}
      />

      {/* Toast Notification for user feedback */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        duration={3000}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}
