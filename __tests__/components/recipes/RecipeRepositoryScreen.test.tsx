/**
 * Task 4.1: Integration Tests for RecipeRepositoryScreen with Horizontal Tag Filter
 */

import { RecipeRepositoryScreen } from '@/components/recipes/RecipeRepositoryScreen';
import { DishCategory } from '@/constants/enums';
import {
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react-native';
import React from 'react';

jest.mock('@/lib/db/services/recipe-service', () => ({
  recipeService: {
    getAllRecipes: jest.fn(),
  },
}));

jest.mock('@/lib/db', () => ({
  recipeService: {
    getAllRecipes: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({
      push: jest.fn(),
    }),
    useFocusEffect: jest.fn((callback) => {
      React.useEffect(() => {
        callback();
      }, []);
    }),
  };
});

jest.mock('@/components/ui/EmptyState', () => ({
  EmptyState: (props: any) => {
    const React = require('react');
    return React.createElement(
      'View',
      { testID: 'empty-state' },
      props.title,
    );
  },
}));

jest.mock('@/components/ui/SearchBar', () => ({
  SearchBar: (props: any) => {
    const React = require('react');
    return React.createElement('View', { testID: 'search-bar' });
  },
}));

jest.mock('@/components/ui/ViewModeToggle', () => ({
  ViewModeToggle: (props: any) => {
    const React = require('react');
    return React.createElement('View', {
      testID: 'view-mode-toggle',
    });
  },
}));

jest.mock('@/components/recipes/RecipeGrid', () => ({
  RecipeGrid: (props: any) => {
    const React = require('react');
    return React.createElement('View', { testID: 'recipe-grid' });
  },
}));

jest.mock('@/components/recipes/RecipeList', () => ({
  RecipeList: (props: any) => {
    const React = require('react');
    return React.createElement('View', { testID: 'recipe-list' });
  },
}));

const mockRecipes = [
  {
    id: '1',
    title: 'Quick Pasta',
    servings: 4,
    category: DishCategory.DINNER,
    ingredients: [{ name: 'pasta', quantity: 200, unit: 'g' }],
    steps: ['Boil', 'Cook'],
    imageUri: null,
    prepTime: 5,
    cookTime: 10,
    tags: ['italian', 'easy', 'dinner'],
    source: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
  },
  {
    id: '2',
    title: 'Slow Roast',
    servings: 6,
    category: DishCategory.DINNER,
    ingredients: [{ name: 'beef', quantity: 1, unit: 'kg' }],
    steps: ['Season', 'Roast'],
    imageUri: null,
    prepTime: 30,
    cookTime: 180,
    tags: ['dinner', 'comfort'],
    source: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
  },
  {
    id: '3',
    title: 'Asian Salad',
    servings: 2,
    category: DishCategory.LUNCH,
    ingredients: [{ name: 'greens', quantity: 100, unit: 'g' }],
    steps: ['Mix'],
    imageUri: null,
    prepTime: 10,
    cookTime: 0,
    tags: ['asian', 'healthy', 'easy'],
    source: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
  },
];

const { recipeService: mockedRecipeService } = require('@/lib/db');

describe('RecipeRepositoryScreen Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRecipeService.getAllRecipes.mockResolvedValue(mockRecipes);
  });

  it('should render HorizontalTagFilter instead of old segment chips', async () => {
    const { getByTestId, queryByText } = render(
      <RecipeRepositoryScreen />,
    );

    await waitFor(() => {
      expect(getByTestId('horizontal-tag-filter')).toBeTruthy();
    });

    expect(queryByText('Favorites')).toBeNull();
    expect(queryByText('Healthy')).toBeNull();
  });

  it('should filter recipes when a tag is selected', async () => {
    const { getByTestId } = render(<RecipeRepositoryScreen />);

    await waitFor(() => {
      expect(getByTestId('horizontal-tag-filter')).toBeTruthy();
    });

    const italianTag = getByTestId(
      'horizontal-tag-filter-tag-italian',
    );
    fireEvent.press(italianTag);

    await waitFor(() => {
      expect(
        getByTestId('horizontal-tag-filter-tag-italian'),
      ).toBeTruthy();
    });
  });

  it('should open modal when filter button is pressed', async () => {
    const { getByTestId } = render(<RecipeRepositoryScreen />);

    await waitFor(() => {
      expect(getByTestId('horizontal-tag-filter')).toBeTruthy();
    });

    const filterButton = getByTestId('horizontal-tag-filter-see-all');
    fireEvent.press(filterButton);

    await waitFor(() => {
      expect(getByTestId('tag-filter-modal')).toBeTruthy();
    });
  });

  it('should filter recipes with Quick preset (<= 20 min)', async () => {
    const { getByTestId } = render(<RecipeRepositoryScreen />);

    await waitFor(() => {
      expect(getByTestId('horizontal-tag-filter')).toBeTruthy();
    });

    const quickChip = getByTestId('horizontal-tag-filter-quick');
    fireEvent.press(quickChip);

    await waitFor(() => {
      expect(getByTestId('horizontal-tag-filter-quick')).toBeTruthy();
    });
  });

  it('should apply multi-tag AND logic correctly', async () => {
    const { getByTestId } = render(<RecipeRepositoryScreen />);

    await waitFor(() => {
      expect(getByTestId('horizontal-tag-filter')).toBeTruthy();
    });

    const easyTag = getByTestId('horizontal-tag-filter-tag-easy');
    fireEvent.press(easyTag);

    await waitFor(() => {
      expect(
        getByTestId('horizontal-tag-filter-tag-easy'),
      ).toBeTruthy();
    });
  });
});
