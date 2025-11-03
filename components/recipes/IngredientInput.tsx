/**
 * Ingredient Input Component
 * Reusable component for ingredient entry with name, quantity, and unit
 * Task 11.1: Optimized with React.memo for performance
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { MeasurementUnit, EnumUtils } from '@/constants/enums';

interface IngredientInputProps {
  name: string;
  quantity: number | null;
  unit: MeasurementUnit | null;
  onNameChange: (value: string) => void;
  onQuantityChange: (value: number | null) => void;
  onUnitChange: (value: MeasurementUnit | null) => void;
  onRemove: () => void;
  error?: string;
  showRemove?: boolean;
  index: number;
}

/**
 * Ingredient input component with name, quantity, and unit fields
 * Task 11.1: Performance optimized with memoization
 */
function IngredientInputComponent({
  name,
  quantity,
  unit,
  onNameChange,
  onQuantityChange,
  onUnitChange,
  onRemove,
  error,
  showRemove = true,
  index,
}: IngredientInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Task 11.1: Memoize unit options to prevent recreation on every render
  const unitOptions: SelectOption[] = useMemo(
    () => [
      { label: 'No unit', value: '' },
      ...EnumUtils.getAllMeasurementUnits().map((u) => ({
        label: u,
        value: u,
      })),
    ],
    []
  );

  // Task 11.1: Memoize handlers to prevent unnecessary re-renders
  const handleQuantityChange = useCallback(
    (text: string) => {
      if (text === '') {
        onQuantityChange(null);
      } else {
        const num = parseFloat(text);
        if (!isNaN(num) && num > 0) {
          onQuantityChange(num);
        }
      }
    },
    [onQuantityChange]
  );

  const handleUnitChange = useCallback(
    (value: string) => {
      if (value === '') {
        onUnitChange(null);
      } else {
        onUnitChange(value as MeasurementUnit);
      }
    },
    [onUnitChange]
  );

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.label, isDark && styles.labelDark]}>
          Ingredient {index + 1}
        </Text>
        {showRemove && (
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      <Input
        placeholder="e.g., All-purpose flour"
        value={name}
        onChangeText={onNameChange}
        error={error}
        containerStyle={styles.inputContainer}
      />

      <View style={styles.row}>
        <Input
          placeholder="Amount"
          value={quantity?.toString() || ''}
          onChangeText={handleQuantityChange}
          keyboardType="decimal-pad"
          containerStyle={styles.quantityInput}
        />

        <Select
          value={unit || ''}
          options={unitOptions}
          onChange={handleUnitChange}
          placeholder="Unit"
        />
      </View>
    </View>
  );
}

// Task 11.1: Export memoized component for performance optimization
export const IngredientInput = React.memo(IngredientInputComponent);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  containerLight: {
    backgroundColor: '#F9F9F9',
    borderColor: '#E5E5EA',
  },
  containerDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#3A3A3C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  labelDark: {
    color: '#FFFFFF',
  },
  removeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityInput: {
    flex: 1,
  },
});
