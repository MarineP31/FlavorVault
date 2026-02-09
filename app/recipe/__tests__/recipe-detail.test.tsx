import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockToggleShoppingList = jest.fn();
const mockShowToast = jest.fn();

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

jest.mock('@/components/ui/Toast', () => {
  const React = require('react');
  return {
    useToast: () => ({
      showToast: mockShowToast,
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

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'recipe-123' }),
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  Stack: {
    Screen: () => null,
  },
}));

jest.mock('@/lib/db/services/recipe-service', () => ({
  recipeService: {
    getRecipeById: jest.fn(() =>
      Promise.resolve({
        id: 'recipe-123',
        title: 'Test Recipe',
        servings: 4,
        category: 'dinner',
        ingredients: [{ name: 'Eggs', quantity: 2, unit: null }],
        steps: ['Step 1'],
        imageUri: null,
        prepTime: 10,
        cookTime: 20,
        tags: [],
        source: null,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        deletedAt: null,
      })
    ),
    deleteRecipe: jest.fn(),
  },
}));

const { useRecipeShoppingList } = require('@/lib/hooks/use-recipe-shopping-list');

import RecipeDetailScreen from '../[id]';

describe('Recipe Detail Shopping List Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRecipeShoppingList.mockReturnValue({
      isInShoppingList: false,
      isLoading: false,
      toggleShoppingList: mockToggleShoppingList,
    });
  });

  it('should render shopping list button', async () => {
    const { getByLabelText } = render(<RecipeDetailScreen />);

    await waitFor(() => {
      const button = getByLabelText('Add to shopping list');
      expect(button).toBeTruthy();
    });
  });

  it('should show correct state based on shopping list', async () => {
    useRecipeShoppingList.mockReturnValue({
      isInShoppingList: true,
      isLoading: false,
      toggleShoppingList: mockToggleShoppingList,
    });

    const { getByLabelText } = render(<RecipeDetailScreen />);

    await waitFor(() => {
      expect(getByLabelText('Remove from shopping list')).toBeTruthy();
    });
  });

  it('should trigger toggle on button press', async () => {
    const { getByLabelText } = render(<RecipeDetailScreen />);

    await waitFor(() => {
      const button = getByLabelText('Add to shopping list');
      fireEvent.press(button);
    });

    expect(mockToggleShoppingList).toHaveBeenCalled();
  });

  it('should show loading state when isLoading is true', async () => {
    useRecipeShoppingList.mockReturnValue({
      isInShoppingList: false,
      isLoading: true,
      toggleShoppingList: mockToggleShoppingList,
    });

    const { getByLabelText } = render(<RecipeDetailScreen />);

    await waitFor(() => {
      const button = getByLabelText('Add to shopping list');
      expect(button.props.disabled).toBe(true);
    });
  });
});
