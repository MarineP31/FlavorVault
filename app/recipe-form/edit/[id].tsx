/**
 * Recipe Edit Screen
 * Task 7.3: Update Operation with proper navigation back to recipe detail
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RecipeFormScreen } from '@/components/recipes/RecipeFormScreen';
import { validateRecipeParams } from '@/lib/navigation/helpers';
import type { Recipe } from '@/lib/db/schema/recipe';

export default function RecipeEditScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Validate route parameters
  if (!validateRecipeParams(params)) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid recipe ID</Text>
      </View>
    );
  }

  const { id } = params;

  const handleSave = (recipe: Recipe) => {
    // Task 7.3: Navigate back to recipe detail screen after successful update
    if (recipe.id) {
      router.replace(`/recipe/${recipe.id}`);
    } else {
      // Fallback - navigate back if recipe ID is not available
      router.back();
    }
  };

  return (
    <RecipeFormScreen mode="edit" recipeId={id} onSave={handleSave} />
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});
