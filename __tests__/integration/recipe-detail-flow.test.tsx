/**
 * Task 14.2: Integration Tests - Complete Recipe Detail Flow
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import RecipeDetailScreen from '@/app/recipe/[id]';
import { recipeService } from '@/lib/db/services/recipe-service';
import { Recipe } from '@/lib/db/schema/recipe';
import { DishCategory, MeasurementUnit } from '@/constants/enums';

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

jest.mock('@/lib/contexts/shopping-list-context', () => ({
  useShoppingList: () => ({
    flatItems: [],
    refreshList: jest.fn(),
  }),
}));

jest.mock('@/lib/hooks/use-recipe-shopping-list', () => ({
  useRecipeShoppingList: () => ({
    isInShoppingList: false,
    isLoading: false,
    toggleShoppingList: jest.fn(),
  }),
}));

jest.mock('@/lib/contexts/meal-plan-context', () => ({
  useMealPlan: () => ({
    queue: [],
    addToQueue: jest.fn(),
    removeFromQueue: jest.fn(),
    isInQueue: jest.fn(() => false),
  }),
}));

jest.mock('@/components/ui/Toast', () => {
  const React = require('react');
  return {
    useToast: () => ({
      showToast: jest.fn(),
    }),
    Toast: () => null,
  };
});

jest.mock('@/components/ui/Dialog', () => {
  const React = require('react');
  return {
    Dialog: () => null,
  };
});

jest.mock('@/components/ui/Button', () => {
  const React = require('react');
  return {
    Button: (props: any) => React.createElement('TouchableOpacity', props, props.title),
  };
});

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockRecipe: Recipe = {
  id: 'test-recipe-id',
  title: 'Test Recipe',
  servings: 4,
  category: DishCategory.DINNER,
  ingredients: [
    { name: 'flour', quantity: 2, unit: MeasurementUnit.CUP },
    { name: 'eggs', quantity: 3, unit: null },
  ],
  steps: ['Mix ingredients', 'Bake at 350F'],
  imageUri: 'file:///test-image.jpg',
  prepTime: 15,
  cookTime: 30,
  tags: ['easy', 'quick'],
  source: null,
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
    it('should load recipe on mount', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(recipeService.getRecipeById).toHaveBeenCalledWith('test-recipe-id');
      });
    });

    it('should display recipe title after loading', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      const { getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(getByText('Test Recipe')).toBeTruthy();
      });
    });
  });

  describe('Task 14.2: Recipe Display', () => {
    it('should display recipe ingredients', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      const { getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(getByText('Ingredients')).toBeTruthy();
      });
    });

    it('should display recipe instructions', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      const { getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(getByText('Instructions')).toBeTruthy();
      });
    });

    it('should display recipe servings', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      const { getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(getByText('SERVINGS')).toBeTruthy();
        expect(getByText('4')).toBeTruthy();
      });
    });
  });

  describe('Task 14.2: Recipe Time Display', () => {
    it('should display recipe time information', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      const { getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(getByText('TIME')).toBeTruthy();
      });
    });
  });

  describe('Task 14.2: Recipe Difficulty Display', () => {
    it('should display recipe difficulty', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      const { getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(getByText('DIFFICULTY')).toBeTruthy();
      });
    });

    it('should display Easy difficulty for simple recipes', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      const { getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(getByText('Easy')).toBeTruthy();
      });
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
      });
    });

    it('should show error state on database error', async () => {
      const mockParams = { id: 'test-recipe-id', source: 'list' };
      const useLocalSearchParamsMock = require('expo-router').useLocalSearchParams;
      useLocalSearchParamsMock.mockReturnValue(mockParams);

      (recipeService.getRecipeById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const { getByText } = render(<RecipeDetailScreen />);

      await waitFor(() => {
        expect(getByText('Failed to load recipe. Please try again.')).toBeTruthy();
      });
    });
  });
});
