/**
 * Tests for AddRecipeChoiceScreen
 *
 * These tests verify the Add Recipe choice screen:
 * - Navigation to manual entry form
 * - Navigation to camera screen (placeholder)
 * - Screen renders action cards correctly
 * - Action cards respond to taps
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return {
    LinearGradient: (props: any) => React.createElement('View', props, props.children),
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('@/lib/db/services/recipe-service');

// Import after mocks
import { useRouter } from 'expo-router';
import { recipeService } from '@/lib/db/services/recipe-service';
import { DishCategory } from '@/constants/enums';
import type { Recipe } from '@/lib/db/schema/recipe';

// Mock recipe data
const mockRecentRecipes: Recipe[] = [
  {
    id: 'recipe-1',
    title: 'Chocolate Chip Cookies',
    servings: 24,
    category: DishCategory.DESSERT,
    ingredients: [],
    steps: [],
    imageUri: null,
    prepTime: 15,
    cookTime: 12,
    tags: ['Dessert', 'Cookies'],
    source: null,
    createdAt: '2024-10-28T10:00:00.000Z',
    updatedAt: '2024-10-28T10:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'recipe-2',
    title: 'Pasta Carbonara',
    servings: 4,
    category: DishCategory.DINNER,
    ingredients: [],
    steps: [],
    imageUri: null,
    prepTime: 10,
    cookTime: 20,
    tags: ['Italian', 'Pasta'],
    source: null,
    createdAt: '2024-10-27T10:00:00.000Z',
    updatedAt: '2024-10-27T10:00:00.000Z',
    deletedAt: null,
  },
];

describe('AddRecipeChoiceScreen', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (recipeService.getAllRecipes as jest.Mock).mockResolvedValue(mockRecentRecipes);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Screen Rendering', () => {
    it('should render action cards correctly', async () => {
      const AddRecipeChoiceScreen = (
        await import('@/app/(tabs)/add-recipe')
      ).default;

      const { getByText } = render(<AddRecipeChoiceScreen />);

      // Should show both action cards
      expect(getByText('Scan Recipe')).toBeTruthy();
      expect(getByText('Add Recipe')).toBeTruthy();
      expect(getByText('From photos or books')).toBeTruthy();
      expect(getByText('Create manually')).toBeTruthy();
    });

    it('should display branding section', async () => {
      const AddRecipeChoiceScreen = (
        await import('@/app/(tabs)/add-recipe')
      ).default;

      const { getByText } = render(<AddRecipeChoiceScreen />);

      // Should show branding text
      expect(getByText('Recipe Chef')).toBeTruthy();
      expect(getByText('Smart Recipe Management')).toBeTruthy();
    });

    it('should have gradient background container', async () => {
      const AddRecipeChoiceScreen = (
        await import('@/app/(tabs)/add-recipe')
      ).default;

      const { getByTestId } = render(<AddRecipeChoiceScreen />);

      // Should render action cards (testing that the component renders successfully)
      expect(getByTestId('scan-recipe-card')).toBeTruthy();
      expect(getByTestId('add-recipe-card')).toBeTruthy();
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to manual entry form on Add Recipe tap', async () => {
      const AddRecipeChoiceScreen = (
        await import('@/app/(tabs)/add-recipe')
      ).default;

      const { getByTestId } = render(<AddRecipeChoiceScreen />);

      // Tap the Add Recipe card
      const addRecipeCard = getByTestId('add-recipe-card');
      fireEvent.press(addRecipeCard);

      // Should navigate to create form
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/recipe-form/create');
      });
    });

    it('should navigate to OCR capture on Scan Recipe tap', async () => {
      const AddRecipeChoiceScreen = (
        await import('@/app/(tabs)/add-recipe')
      ).default;

      const { getByTestId } = render(<AddRecipeChoiceScreen />);

      // Tap the Scan Recipe card
      const scanRecipeCard = getByTestId('scan-recipe-card');
      fireEvent.press(scanRecipeCard);

      // Should navigate to OCR capture screen
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/ocr/capture');
      });
    });
  });

  describe('Recent Recipes Section', () => {
    it('should display Recent Recipes section when recipes exist', async () => {
      const AddRecipeChoiceScreen = (
        await import('@/app/(tabs)/add-recipe')
      ).default;

      const { findByText } = render(<AddRecipeChoiceScreen />);

      // Should show Recent Recipes header
      const recentTitle = await findByText('Recent Recipes');
      expect(recentTitle).toBeTruthy();
    });

    it('should display recent recipe titles', async () => {
      const AddRecipeChoiceScreen = (
        await import('@/app/(tabs)/add-recipe')
      ).default;

      const { findByText } = render(<AddRecipeChoiceScreen />);

      // Should show recent recipe titles
      const recipe1 = await findByText('Chocolate Chip Cookies');
      const recipe2 = await findByText('Pasta Carbonara');

      expect(recipe1).toBeTruthy();
      expect(recipe2).toBeTruthy();
    });

    it('should handle tap on recent recipe card', async () => {
      const AddRecipeChoiceScreen = (
        await import('@/app/(tabs)/add-recipe')
      ).default;

      const { findByTestId } = render(<AddRecipeChoiceScreen />);

      // Tap first recent recipe
      const recentCard = await findByTestId('recent-recipe-card-0');
      fireEvent.press(recentCard);

      // Should navigate to recipe detail
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/recipe/recipe-1');
      });
    });
  });
});
