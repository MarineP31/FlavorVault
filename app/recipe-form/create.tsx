/**
 * Recipe Create Screen
 * Task 7.1: Create Operation with proper navigation to recipe detail
 * Supports pre-filling with OCR data when available
 */

import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { RecipeFormScreen } from '@/components/recipes/RecipeFormScreen';
import type { Recipe } from '@/lib/db/schema/recipe';
import type { RecipeFormData } from '@/lib/validations/recipe-form-schema';
import { DishCategory } from '@/constants/enums';
import { safeParseOCRData } from '@/lib/ocr/schemas/ocr-result-schema';

export default function RecipeCreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ocrData?: string }>();

  const initialData: Partial<RecipeFormData> | undefined = useMemo(() => {
    if (!params.ocrData) return undefined;

    const result = safeParseOCRData(params.ocrData);
    if (!result.success || !result.data) {
      console.warn('Failed to parse OCR data:', result.error);
      return undefined;
    }

    const ocrData = result.data;
    return {
      title: ocrData.title || '',
      servings: ocrData.servings || 4,
      category: ocrData.category || DishCategory.DINNER,
      ingredients: ocrData.ingredients.length > 0
        ? ocrData.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          }))
        : [{ name: '', quantity: null, unit: null }],
      steps: ocrData.steps.length > 0 ? ocrData.steps : [''],
      imageUri: ocrData.imageUri,
      prepTime: ocrData.prepTime,
      cookTime: ocrData.cookTime,
      tags: [],
    };
  }, [params.ocrData]);

  const handleSave = (_recipe: Recipe) => {
    router.replace('/(tabs)');
  };

  return (
    <RecipeFormScreen mode="create" onSave={handleSave} initialData={initialData} />
  );
}
