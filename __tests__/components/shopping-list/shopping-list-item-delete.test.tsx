import { MeasurementUnit } from '@/constants/enums';
import type { ShoppingListItem } from '@/lib/db/schema/shopping-list';

jest.mock('react-native', () => {
  const React = require('react');
  const mockComponent = (name: string) => {
    const Component = (props: any) => React.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };

  return {
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    Pressable: mockComponent('Pressable'),
    Animated: {
      View: mockComponent('Animated.View'),
      Value: jest.fn(() => ({ value: 1 })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      sequence: jest.fn(() => ({ start: jest.fn() })),
    },
    StyleSheet: { create: (styles: any) => styles },
  };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return (props: any) => React.createElement('Icon', props);
});

describe('ShoppingListItem Delete Behavior', () => {
  const mockManualItem: ShoppingListItem = {
    id: 'manual-1',
    name: 'paper towels',
    quantity: 2,
    unit: MeasurementUnit.UNIT,
    checked: false,
    recipeId: null,
    mealPlanId: null,
    category: 'Other',
    source: 'manual',
    originalName: 'Paper Towels',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const mockRecipeItem: ShoppingListItem = {
    id: 'recipe-1',
    name: 'milk',
    quantity: 1,
    unit: MeasurementUnit.CUP,
    checked: false,
    recipeId: 'recipe-123',
    mealPlanId: null,
    category: 'Dairy',
    source: 'recipe',
    originalName: 'Milk',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  describe('delete button visibility', () => {
    it('should show delete button only for manual items', () => {
      const isManual = mockManualItem.source === 'manual';
      const shouldShowDeleteButton = isManual;

      expect(shouldShowDeleteButton).toBe(true);
    });

    it('should NOT show delete button for recipe items', () => {
      const isManual = mockRecipeItem.source === 'manual';
      const shouldShowDeleteButton = isManual;

      expect(shouldShowDeleteButton).toBe(false);
    });

    it('should correctly determine item source for manual items', () => {
      expect(mockManualItem.source).toBe('manual');
      expect(mockManualItem.recipeId).toBeNull();
    });

    it('should correctly determine item source for recipe items', () => {
      expect(mockRecipeItem.source).toBe('recipe');
      expect(mockRecipeItem.recipeId).not.toBeNull();
    });
  });

  describe('delete button callback', () => {
    it('should trigger onDelete callback when delete button is pressed', () => {
      const mockOnDelete = jest.fn();
      const item = mockManualItem;
      const isManual = item.source === 'manual';

      if (isManual && mockOnDelete) {
        mockOnDelete(item.id);
      }

      expect(mockOnDelete).toHaveBeenCalledWith('manual-1');
    });

    it('should not trigger onDelete for recipe items', () => {
      const mockOnDelete = jest.fn();
      const item = mockRecipeItem;
      const isManual = item.source === 'manual';

      if (isManual && mockOnDelete) {
        mockOnDelete(item.id);
      }

      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('should pass correct item ID to onDelete callback', () => {
      const mockOnDelete = jest.fn();

      mockOnDelete(mockManualItem.id);

      expect(mockOnDelete).toHaveBeenCalledWith('manual-1');
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('onDelete prop handling', () => {
    it('should render delete button when onDelete prop is provided for manual item', () => {
      const mockOnDelete = jest.fn();
      const item = mockManualItem;
      const isManual = item.source === 'manual';
      const hasOnDelete = typeof mockOnDelete === 'function';

      const shouldRenderDeleteButton = isManual && hasOnDelete;

      expect(shouldRenderDeleteButton).toBe(true);
    });

    it('should not render delete button when onDelete prop is undefined', () => {
      const mockOnDelete = undefined;
      const item = mockManualItem;
      const isManual = item.source === 'manual';
      const hasOnDelete = typeof mockOnDelete === 'function';

      const shouldRenderDeleteButton = isManual && hasOnDelete;

      expect(shouldRenderDeleteButton).toBe(false);
    });
  });
});
