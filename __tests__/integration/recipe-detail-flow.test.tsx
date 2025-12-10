/**
 * Task 14.2: Integration Tests - Complete Recipe Detail Flow
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import RecipeDetailScreen from '@/app/recipes/[id]';
import { recipeService } from '@/lib/db/services/recipe-service';
import { Recipe } from '@/lib/db/schema/recipe';
import { DishCategory } from '@/constants/enums';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  Stack: {
    Screen: ({ children }: any) => children,
  },
}));

jest.mock('@/lib/db/services/recipe-service', () => ({
  recipeService: {
    getRecipeById: jest.fn(),
    deleteRecipe: jest.fn(),
  },
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockRecipe: Recipe = {
  id: 'test-recipe-id',
  title: 'Test Recipe',
  servings: 4,
  category: DishCategory.MAIN_COURSE,
  ingredients: [
    { name: 'flour', quantity: 2, unit: 'cup' },
    { name: 'eggs', quantity: 3, unit: null },
  ],
  steps: ['Mix ingredients', 'Bake at 350F'],
  imageUri: 'file:///test-image.jpg',
  prepTime: 15,
  cookTime: 30,
  tags: ['easy', 'quick'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
};

describe('Recipe Detail Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (recipeService.getRecipeById as jest.Mock).mockResolvedValue(mockRecipe);
  });

  describe('Task 14.2: Edit Button Navigation', () => {
    it('should navigate to edit form when edit button is pressed', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      const { getByTestId } = render(<RecipeDetailScreen />);

      // Wait for recipe to load
      await waitFor(() => {
        expect(recipeService.getRecipeById).toHaveBeenCalledWith('test-recipe-id');
      });

      // Find and press edit button
      const editButton = getByTestId('recipe-detail-header-edit-button');
      fireEvent.press(editButton);

      // Should navigate to edit form
      expect(mockRouter.push).toHaveBeenCalledWith('/recipe-form/edit/test-recipe-id');
    });

    it('should handle edit navigation error gracefully', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      mockRouter.push.mockImplementation(() => {
        throw new Error('Navigation error');
      });

      const { getByTestId, getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(recipeService.getRecipeById).toHaveBeenCalled();
      });

      const editButton = getByTestId('recipe-detail-header-edit-button');
      fireEvent.press(editButton);

      // Should show error toast
      await waitFor(() => {
        expect(getByText('Failed to open editor. Please try again.')).toBeTruthy();
      });
    });
  });

  describe('Task 14.2: Delete Button Flow', () => {
    it('should show confirmation dialog when delete button is pressed', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      const { getByTestId, getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(recipeService.getRecipeById).toHaveBeenCalled();
      });

      // Press delete button
      const deleteButton = getByTestId('recipe-detail-header-delete-button');
      fireEvent.press(deleteButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(getByText('Delete Recipe')).toBeTruthy();
        expect(getByText(`Are you sure you want to delete "${mockRecipe.title}"? This action cannot be undone.`)).toBeTruthy();
      });
    });

    it('should delete recipe and navigate back on confirmation', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      (recipeService.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

      const { getByTestId, getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(recipeService.getRecipeById).toHaveBeenCalled();
      });

      // Press delete button
      const deleteButton = getByTestId('recipe-detail-header-delete-button');
      fireEvent.press(deleteButton);

      // Wait for dialog and confirm
      await waitFor(() => {
        expect(getByText('Delete Recipe')).toBeTruthy();
      });

      const confirmButton = getByText('Delete');
      fireEvent.press(confirmButton);

      // Should delete recipe
      await waitFor(() => {
        expect(recipeService.deleteRecipe).toHaveBeenCalledWith('test-recipe-id');
      });

      // Should show success toast
      await waitFor(() => {
        expect(getByText('Recipe deleted successfully')).toBeTruthy();
      });

      // Should navigate back after delay
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      }, { timeout: 2000 });
    });

    it('should handle delete error', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      (recipeService.deleteRecipe as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      const { getByTestId, getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(recipeService.getRecipeById).toHaveBeenCalled();
      });

      // Press delete button and confirm
      const deleteButton = getByTestId('recipe-detail-header-delete-button');
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(getByText('Delete Recipe')).toBeTruthy();
      });

      const confirmButton = getByText('Delete');
      fireEvent.press(confirmButton);

      // Should show error toast
      await waitFor(() => {
        expect(getByText('Failed to delete recipe. Please try again.')).toBeTruthy();
      });

      // Should not navigate
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('Task 14.2: Add to Queue Functionality', () => {
    it('should show success message when adding to queue', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      const { getByTestId, getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(recipeService.getRecipeById).toHaveBeenCalled();
      });

      // Press add to queue button
      const addToQueueButton = getByTestId('recipe-detail-header-add-to-queue-button');
      fireEvent.press(addToQueueButton);

      // Should show success message (placeholder implementation)
      await waitFor(() => {
        expect(getByText('Recipe added to meal plan!')).toBeTruthy();
      });
    });
  });

  describe('Task 14.2: Navigation Context Handling', () => {
    it('should navigate to meal planning screen when deleting from queue context', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'queue' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      (recipeService.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

      const { getByTestId, getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(recipeService.getRecipeById).toHaveBeenCalled();
      });

      // Press delete and confirm
      const deleteButton = getByTestId('recipe-detail-header-delete-button');
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(getByText('Delete Recipe')).toBeTruthy();
      });

      const confirmButton = getByText('Delete');
      fireEvent.press(confirmButton);

      // Should navigate to meal planning screen
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/meal-planning');
      }, { timeout: 2000 });
    });

    it('should show remove from queue button when source is queue', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'queue' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      const { getByTestId, queryByTestId } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(recipeService.getRecipeById).toHaveBeenCalled();
      });

      // Should show remove from queue button
      expect(getByTestId('recipe-detail-header-remove-from-queue-button')).toBeTruthy();

      // Should not show add to queue button
      expect(queryByTestId('recipe-detail-header-add-to-queue-button')).toBeNull();
    });
  });

  describe('Task 14.2: Error Handling Scenarios', () => {
    it('should show error state when recipe not found', async () => {
      const mockParams = { id: 'non-existent-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      (recipeService.getRecipeById as jest.Mock).mockResolvedValue(null);

      const { getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(getByText('Recipe not found')).toBeTruthy();
        expect(getByText('This recipe may have been deleted or does not exist.')).toBeTruthy();
      });
    });

    it('should show error state with retry on database error', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      (recipeService.getRecipeById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const { getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(getByText('Failed to load recipe. Please try again.')).toBeTruthy();
        expect(getByText('Retry')).toBeTruthy();
      });
    });

    it('should retry loading recipe on retry button press', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      // First call fails
      (recipeService.getRecipeById as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
      // Second call succeeds
      (recipeService.getRecipeById as jest.Mock).mockResolvedValueOnce(mockRecipe);

      const { getByText, getByTestId } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(getByText('Failed to load recipe. Please try again.')).toBeTruthy();
      });

      // Press retry button
      const retryButton = getByText('Retry');
      fireEvent.press(retryButton);

      // Should load recipe successfully
      await waitFor(() => {
        expect(getByText(mockRecipe.title)).toBeTruthy();
      });
    });
  });
});
