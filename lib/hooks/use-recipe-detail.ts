/**
 * Custom hook for recipe detail data fetching and state management
 * Task 2.2: Custom Hook for Recipe Data
 */

import { useEffect, useState, useCallback } from 'react';
import { Recipe } from '@/lib/db/schema/recipe';
import { recipeService } from '@/lib/db/services/recipe-service';

interface UseRecipeDetailResult {
  recipe: Recipe | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing recipe detail data
 *
 * Features:
 * - Fetches recipe by ID
 * - Loading state management
 * - Error state handling
 * - Data validation
 * - Refetch functionality
 *
 * @param recipeId - The ID of the recipe to fetch
 * @returns Recipe detail state and refetch function
 *
 * @example
 * ```tsx
 * const { recipe, loading, error, refetch } = useRecipeDetail(recipeId);
 * ```
 */
export function useRecipeDetail(recipeId: string | undefined): UseRecipeDetailResult {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch recipe data from database
   */
  const fetchRecipe = useCallback(async () => {
    // Validate recipe ID
    if (!recipeId) {
      setError('Recipe ID is required');
      setLoading(false);
      setRecipe(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch recipe from service
      const fetchedRecipe = await recipeService.getRecipeById(recipeId);

      if (!fetchedRecipe) {
        setError('Recipe not found');
        setRecipe(null);
      } else {
        // Validate recipe data
        if (!fetchedRecipe.title || !fetchedRecipe.ingredients || !fetchedRecipe.steps) {
          setError('Invalid recipe data');
          setRecipe(null);
        } else {
          setRecipe(fetchedRecipe);
        }
      }
    } catch (err) {
      console.error('Error fetching recipe:', err);
      setError('Failed to load recipe. Please try again.');
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  /**
   * Initial data fetch on mount or when recipe ID changes
   */
  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  return {
    recipe,
    loading,
    error,
    refetch: fetchRecipe,
  };
}
