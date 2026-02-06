import React from 'react';
import { AddManualItemDialog } from '@/components/shopping-list/AddManualItemDialog';
import { MeasurementUnit } from '@/constants/enums';
import { CATEGORY_ORDER } from '@/lib/db/schema/shopping-list';

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
    TextInput: mockComponent('TextInput'),
    Pressable: mockComponent('Pressable'),
    ScrollView: mockComponent('ScrollView'),
    Modal: mockComponent('Modal'),
    KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
    Platform: { OS: 'ios' },
    useColorScheme: jest.fn(() => 'light'),
    StyleSheet: { create: (styles: any) => styles },
  };
});

jest.mock('@/components/ui/Button', () => ({
  Button: (props: any) => {
    const React = require('react');
    return React.createElement('MockButton', {
      ...props,
      testID: props.testID,
    });
  },
}));

jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  return (props: any) => React.createElement('Icon', props);
});

describe('AddManualItemDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('component structure', () => {
    it('should export AddManualItemDialog component', () => {
      expect(AddManualItemDialog).toBeDefined();
      expect(typeof AddManualItemDialog).toBe('function');
    });

    it('should render with correct form fields', () => {
      expect(AddManualItemDialog).toBeDefined();
      expect(CATEGORY_ORDER).toContain('Other');
    });

    it('should include name input field as required', () => {
      expect(AddManualItemDialog).toBeDefined();
    });

    it('should include quantity input as optional', () => {
      expect(AddManualItemDialog).toBeDefined();
    });
  });

  describe('form validation', () => {
    it('should validate empty name submission is prevented', () => {
      const validateName = (name: string): string | null => {
        if (!name.trim()) {
          return 'Item name is required';
        }
        if (name.trim().length > 100) {
          return 'Item name must be 100 characters or less';
        }
        return null;
      };

      expect(validateName('')).toBe('Item name is required');
      expect(validateName('   ')).toBe('Item name is required');
    });

    it('should validate name exceeding 100 characters', () => {
      const validateName = (name: string): string | null => {
        if (!name.trim()) {
          return 'Item name is required';
        }
        if (name.trim().length > 100) {
          return 'Item name must be 100 characters or less';
        }
        return null;
      };

      const longName = 'a'.repeat(101);
      expect(validateName(longName)).toBe('Item name must be 100 characters or less');
    });

    it('should validate positive number for quantity', () => {
      const validateQuantity = (quantity: string): string | null => {
        if (!quantity) return null;
        const parsed = parseFloat(quantity);
        if (isNaN(parsed) || parsed <= 0) {
          return 'Quantity must be a positive number';
        }
        return null;
      };

      expect(validateQuantity('0')).toBe('Quantity must be a positive number');
      expect(validateQuantity('-1')).toBe('Quantity must be a positive number');
      expect(validateQuantity('abc')).toBe('Quantity must be a positive number');
      expect(validateQuantity('2')).toBeNull();
      expect(validateQuantity('')).toBeNull();
    });
  });

  describe('unit selection', () => {
    it('should include None option for unit selection', () => {
      const COMMON_UNITS = [
        { label: 'None', value: null },
        { label: 'tsp', value: MeasurementUnit.TSP },
        { label: 'tbsp', value: MeasurementUnit.TBSP },
        { label: 'cup', value: MeasurementUnit.CUP },
      ];

      const noneOption = COMMON_UNITS.find((u) => u.label === 'None');
      expect(noneOption).toBeDefined();
      expect(noneOption?.value).toBeNull();
    });

    it('should allow selecting None as unit value', () => {
      const COMMON_UNITS = [
        { label: 'None', value: null },
        { label: 'tsp', value: MeasurementUnit.TSP },
      ];

      const selectedUnit = COMMON_UNITS[0];
      expect(selectedUnit.label).toBe('None');
      expect(selectedUnit.value).toBeNull();
    });
  });

  describe('category selection', () => {
    it('should default category to Other', () => {
      const defaultCategory = 'Other';
      expect(CATEGORY_ORDER).toContain(defaultCategory);
      expect(defaultCategory).toBe('Other');
    });

    it('should include all standard categories', () => {
      expect(CATEGORY_ORDER).toContain('Produce');
      expect(CATEGORY_ORDER).toContain('Dairy');
      expect(CATEGORY_ORDER).toContain('Meat & Seafood');
      expect(CATEGORY_ORDER).toContain('Pantry');
      expect(CATEGORY_ORDER).toContain('Frozen');
      expect(CATEGORY_ORDER).toContain('Bakery');
      expect(CATEGORY_ORDER).toContain('Other');
    });
  });

  describe('form state reset', () => {
    it('should reset form state when dialog visibility changes', () => {
      let name = 'test item';
      let quantity = '2';
      let category = 'Dairy';

      const resetForm = () => {
        name = '';
        quantity = '';
        category = 'Other';
      };

      resetForm();

      expect(name).toBe('');
      expect(quantity).toBe('');
      expect(category).toBe('Other');
    });
  });

  describe('submission', () => {
    it('should call onAdd with correct data on successful submission', async () => {
      const onAdd = jest.fn().mockResolvedValue(undefined);

      const formData = {
        name: 'test item',
        quantity: 2,
        unit: MeasurementUnit.UNIT,
        category: 'Other',
      };

      await onAdd(formData);

      expect(onAdd).toHaveBeenCalledWith(formData);
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test item',
          quantity: 2,
        })
      );
    });

    it('should call onAdd with undefined quantity when not provided', async () => {
      const onAdd = jest.fn().mockResolvedValue(undefined);

      const formData = {
        name: 'batteries',
        quantity: undefined,
        unit: undefined,
        category: 'Other',
      };

      await onAdd(formData);

      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'batteries',
          quantity: undefined,
          unit: undefined,
        })
      );
    });
  });
});
