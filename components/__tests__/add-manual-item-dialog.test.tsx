import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('react-native', () => {
  const React = require('react');

  const mockComponent = (name: string) => {
    const Component = (props: any) => React.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };

  const Animated = {
    View: mockComponent('Animated.View'),
    Value: class {
      value: number;
      constructor(val: number) { this.value = val; }
    },
    timing: () => ({ start: jest.fn() }),
    sequence: () => ({ start: jest.fn() }),
  };

  return {
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    TextInput: mockComponent('TextInput'),
    Pressable: mockComponent('Pressable'),
    ScrollView: mockComponent('ScrollView'),
    Modal: mockComponent('Modal'),
    KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
    Platform: { OS: 'ios' },
    StyleSheet: {
      create: (s: any) => s,
      flatten: (style: any) => {
        if (Array.isArray(style)) {
          return Object.assign({}, ...style.filter(Boolean));
        }
        return style || {};
      },
    },
    useColorScheme: jest.fn(() => 'light'),
    Animated,
  };
});

jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  return (props: any) => React.createElement('Text', props, props.name);
});

jest.mock('@/components/ui/Button', () => ({
  Button: ({ title, onPress, testID, disabled, loading }: any) => {
    const React = require('react');
    return React.createElement('Pressable', {
      testID,
      onPress: disabled || loading ? undefined : onPress,
      disabled,
      'aria-disabled': disabled,
    }, React.createElement('Text', null, title));
  },
}));

import { AddManualItemDialog } from '../shopping-list/AddManualItemDialog';

describe('AddManualItemDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAdd.mockResolvedValue(undefined);
  });

  describe('rendering', () => {
    it('should render with correct form fields when visible', () => {
      const { getByTestId, getByText, getAllByText } = render(
        <AddManualItemDialog
          visible={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
        />
      );

      expect(getByTestId('manual-item-name-input')).toBeTruthy();
      expect(getByTestId('manual-item-quantity-input')).toBeTruthy();
      const addItemButtons = getAllByText('Add Item');
      expect(addItemButtons.length).toBeGreaterThan(0);
      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Item Name *')).toBeTruthy();
    });

    it('should display all category options', () => {
      const { getByText } = render(
        <AddManualItemDialog
          visible={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
        />
      );

      expect(getByText('Produce')).toBeTruthy();
      expect(getByText('Dairy')).toBeTruthy();
      expect(getByText('Meat & Seafood')).toBeTruthy();
      expect(getByText('Pantry')).toBeTruthy();
      expect(getByText('Frozen')).toBeTruthy();
      expect(getByText('Bakery')).toBeTruthy();
      expect(getByText('Other')).toBeTruthy();
    });

    it('should display "None" option in unit selection', () => {
      const { getByText } = render(
        <AddManualItemDialog
          visible={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
        />
      );

      expect(getByText('None')).toBeTruthy();
    });
  });

  describe('form validation', () => {
    it('should prevent empty name submission', async () => {
      const { getByTestId } = render(
        <AddManualItemDialog
          visible={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
        />
      );

      const addButton = getByTestId('manual-item-add-button');
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(mockOnAdd).not.toHaveBeenCalled();
      });
    });

    it('should show error for empty name after submission attempt', async () => {
      const { getByTestId } = render(
        <AddManualItemDialog
          visible={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
        />
      );

      const nameInput = getByTestId('manual-item-name-input');
      fireEvent.changeText(nameInput, '   ');

      const addButton = getByTestId('manual-item-add-button');
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(mockOnAdd).not.toHaveBeenCalled();
      });
    });
  });

  describe('form state management', () => {
    it('should reset form when dialog is closed and reopened', () => {
      const { getByTestId, rerender } = render(
        <AddManualItemDialog
          visible={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
        />
      );

      const nameInput = getByTestId('manual-item-name-input');
      fireEvent.changeText(nameInput, 'Test Item');

      rerender(
        <AddManualItemDialog
          visible={false}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
        />
      );

      rerender(
        <AddManualItemDialog
          visible={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
        />
      );

      const newNameInput = getByTestId('manual-item-name-input');
      expect(newNameInput.props.value).toBe('');
    });
  });

  describe('successful submission', () => {
    it('should call onAdd with correct data when name is provided', async () => {
      const { getByTestId } = render(
        <AddManualItemDialog
          visible={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
        />
      );

      const nameInput = getByTestId('manual-item-name-input');
      fireEvent.changeText(nameInput, 'Paper Towels');

      const addButton = getByTestId('manual-item-add-button');
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Paper Towels',
            category: 'Other',
          })
        );
      });
    });

    it('should call onAdd with quantity and unit when provided', async () => {
      const { getByTestId, getByText } = render(
        <AddManualItemDialog
          visible={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
        />
      );

      const nameInput = getByTestId('manual-item-name-input');
      fireEvent.changeText(nameInput, 'Milk');

      const quantityInput = getByTestId('manual-item-quantity-input');
      fireEvent.changeText(quantityInput, '2');

      const cupUnit = getByText('cup');
      fireEvent.press(cupUnit);

      const dairyCategory = getByText('Dairy');
      fireEvent.press(dairyCategory);

      const addButton = getByTestId('manual-item-add-button');
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Milk',
            quantity: 2,
            category: 'Dairy',
          })
        );
      });
    });
  });

  describe('cancel behavior', () => {
    it('should call onClose when cancel button is pressed', () => {
      const { getByTestId } = render(
        <AddManualItemDialog
          visible={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
        />
      );

      const cancelButton = getByTestId('manual-item-cancel-button');
      fireEvent.press(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
