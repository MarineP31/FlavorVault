import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RecipeCard } from '../RecipeCard';
import { DishCategory, MeasurementUnit } from '@/constants/enums';
import type { Recipe } from '@/lib/db/schema/recipe';

const mockToggleShoppingList = jest.fn();

jest.mock('@/lib/hooks/use-recipe-shopping-list', () => ({
  useRecipeShoppingList: jest.fn(() => ({
    isInShoppingList: false,
    isLoading: false,
    toggleShoppingList: mockToggleShoppingList,
  })),
}));

jest.mock('@/lib/contexts/shopping-list-context', () => ({
  useShoppingList: () => ({
    flatItems: [],
    refreshList: jest.fn(),
  }),
}));

jest.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

const { useRecipeShoppingList } = require('@/lib/hooks/use-recipe-shopping-list');

const mockRecipe: Recipe = {
  id: 'recipe-123',
  title: 'Test Recipe',
  servings: 4,
  category: DishCategory.DINNER,
  ingredients: [
    { name: 'Eggs', quantity: 2, unit: null },
    { name: 'Milk', quantity: 1, unit: MeasurementUnit.CUP },
  ],
  steps: ['Step 1', 'Step 2'],
  imageUri: null,
  prepTime: 10,
  cookTime: 20,
  tags: [],
  source: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  deletedAt: null,
};

describe('RecipeCard Shopping List Button', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRecipeShoppingList.mockReturnValue({
      isInShoppingList: false,
      isLoading: false,
      toggleShoppingList: mockToggleShoppingList,
    });
  });

  it('should render with cart icon instead of heart icon', () => {
    const { getByLabelText } = render(
      <RecipeCard recipe={mockRecipe} onPress={mockOnPress} variant="list" />
    );

    expect(getByLabelText('Add to shopping list')).toBeTruthy();
  });

  it('should show "in list" state when isInShoppingList is true', () => {
    useRecipeShoppingList.mockReturnValue({
      isInShoppingList: true,
      isLoading: false,
      toggleShoppingList: mockToggleShoppingList,
    });

    const { getByLabelText } = render(
      <RecipeCard recipe={mockRecipe} onPress={mockOnPress} variant="list" />
    );

    expect(getByLabelText('Remove from shopping list')).toBeTruthy();
  });

  it('should show "not in list" state when isInShoppingList is false', () => {
    useRecipeShoppingList.mockReturnValue({
      isInShoppingList: false,
      isLoading: false,
      toggleShoppingList: mockToggleShoppingList,
    });

    const { getByLabelText } = render(
      <RecipeCard recipe={mockRecipe} onPress={mockOnPress} variant="list" />
    );

    expect(getByLabelText('Add to shopping list')).toBeTruthy();
  });

  it('should trigger toggleShoppingList on button press', async () => {
    const { getByLabelText } = render(
      <RecipeCard recipe={mockRecipe} onPress={mockOnPress} variant="list" />
    );

    const button = getByLabelText('Add to shopping list');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockToggleShoppingList).toHaveBeenCalled();
    });
  });

  it('should disable button interaction when loading', () => {
    useRecipeShoppingList.mockReturnValue({
      isInShoppingList: false,
      isLoading: true,
      toggleShoppingList: mockToggleShoppingList,
    });

    const { getByTestId } = render(
      <RecipeCard
        recipe={mockRecipe}
        onPress={mockOnPress}
        variant="list"
        testID="recipe-card"
      />
    );

    const button = getByTestId('shopping-list-button');
    fireEvent.press(button);

    expect(mockToggleShoppingList).not.toHaveBeenCalled();
  });
});
