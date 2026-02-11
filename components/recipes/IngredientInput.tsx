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
import { Ionicons } from '@expo/vector-icons';
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
            style={[styles.removeButton, isDark && styles.removeButtonDark]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
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
        <View style={styles.quantityInput}>
          <Input
            placeholder="Amount"
            value={quantity?.toString() || ''}
            onChangeText={handleQuantityChange}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.unitInput}>
          <Select
            value={unit || ''}
            options={unitOptions}
            onChange={handleUnitChange}
            placeholder="Unit"
          />
        </View>
      </View>
    </View>
  );
}

// Task 11.1: Export memoized component for performance optimization
export const IngredientInput = React.memo(IngredientInputComponent);

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  containerLight: {
    backgroundColor: '#FAFAFA',
    borderColor: '#EEEEEE',
  },
  containerDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#3A3A3C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B35',
  },
  labelDark: {
    color: '#FF8C5A',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonDark: {
    backgroundColor: '#3A2C2C',
  },
  inputContainer: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  quantityInput: {
    flex: 1,
  },
  unitInput: {
    flex: 1,
  },
});
