import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MeasurementUnit } from '@/constants/enums';
import type { ShoppingListItem } from '@/lib/db/schema/shopping-list';

jest.mock('react-native', () => {
  const React = require('react');

  const mockComponent = (name: string) => {
    const Component = (props: any) => React.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };

  const Animated = {
    View: ({ children, style, testID, ...props }: any) => {
      const React = require('react');
      return React.createElement('View', { style, testID, ...props }, children);
    },
    Value: class {
      value: number;
      constructor(val: number) { this.value = val; }
    },
    timing: () => ({ start: (cb?: () => void) => cb?.() }),
    sequence: (anims: any[]) => ({ start: (cb?: () => void) => cb?.() }),
  };

  return {
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    Pressable: mockComponent('Pressable'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (style: any) => {
        if (Array.isArray(style)) {
          return Object.assign({}, ...style.filter(Boolean));
        }
        return style || {};
      },
    },
    Animated,
  };
});

jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  return (props: any) => React.createElement('Text', { testID: `icon-${props.name}`, ...props }, props.name);
});

import { ShoppingListItemComponent } from '../shopping-list/shopping-list-item';

describe('ShoppingListItem - Delete Button Behavior', () => {
  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  const createMockItem = (overrides: Partial<ShoppingListItem>): ShoppingListItem => ({
    id: 'test-id',
    name: 'Test Item',
    quantity: 1,
    unit: MeasurementUnit.UNIT,
    checked: false,
    recipeId: null,
    mealPlanId: null,
    category: 'Other',
    source: 'manual',
    originalName: 'Test Item',
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('delete button visibility', () => {
    it('should show delete button for manual items', () => {
      const manualItem = createMockItem({
        id: 'manual-1',
        name: 'Paper Towels',
        source: 'manual',
        recipeId: null,
      });

      const { getByTestId } = render(
        <ShoppingListItemComponent
          item={manualItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          testID="shopping-item"
        />
      );

      expect(getByTestId('icon-trash-outline')).toBeTruthy();
    });

    it('should NOT show delete button for recipe items', () => {
      const recipeItem = createMockItem({
        id: 'recipe-1',
        name: 'Milk',
        source: 'recipe',
        recipeId: 'recipe-123',
      });

      const { queryByTestId } = render(
        <ShoppingListItemComponent
          item={recipeItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          testID="shopping-item"
        />
      );

      expect(queryByTestId('icon-trash-outline')).toBeNull();
    });

    it('should NOT show delete button when onDelete is not provided', () => {
      const manualItem = createMockItem({
        id: 'manual-1',
        source: 'manual',
      });

      const { queryByTestId } = render(
        <ShoppingListItemComponent
          item={manualItem}
          onToggle={mockOnToggle}
          testID="shopping-item"
        />
      );

      expect(queryByTestId('icon-trash-outline')).toBeNull();
    });
  });

  describe('delete button functionality', () => {
    it('should trigger onDelete callback with item ID when pressed', () => {
      const manualItem = createMockItem({
        id: 'manual-item-123',
        source: 'manual',
      });

      const { getByLabelText } = render(
        <ShoppingListItemComponent
          item={manualItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          testID="shopping-item"
        />
      );

      const deleteButton = getByLabelText(`Delete ${manualItem.name}`);
      fireEvent.press(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('manual-item-123');
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('check-off functionality', () => {
    it('should work for manual items', () => {
      const manualItem = createMockItem({
        id: 'manual-1',
        name: 'Manual Test Item',
        source: 'manual',
        checked: false,
      });

      const { getByLabelText } = render(
        <ShoppingListItemComponent
          item={manualItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          testID="shopping-item"
        />
      );

      const accessibilityLabel = `${manualItem.name}, 1 unit, unchecked`;
      const checkbox = getByLabelText(accessibilityLabel);
      fireEvent.press(checkbox);

      expect(mockOnToggle).toHaveBeenCalledWith('manual-1');
    });

    it('should work for recipe items', () => {
      const recipeItem = createMockItem({
        id: 'recipe-1',
        name: 'Recipe Test Item',
        source: 'recipe',
        checked: false,
      });

      const { getByLabelText } = render(
        <ShoppingListItemComponent
          item={recipeItem}
          onToggle={mockOnToggle}
          testID="shopping-item"
        />
      );

      const accessibilityLabel = `${recipeItem.name}, 1 unit, unchecked`;
      const checkbox = getByLabelText(accessibilityLabel);
      fireEvent.press(checkbox);

      expect(mockOnToggle).toHaveBeenCalledWith('recipe-1');
    });
  });
});
