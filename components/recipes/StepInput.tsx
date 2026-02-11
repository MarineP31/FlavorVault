/**
 * Step Input Component
 * Reusable component for instruction step entry
 * Task 11.1: Optimized with React.memo for performance
 */

import React, { useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StepInputProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  error?: string;
  showRemove?: boolean;
  index: number;
}

/**
 * Step input component for instruction entry
 * Task 11.1: Performance optimized with memoization
 */
function StepInputComponent({
  value,
  onChange,
  onRemove,
  error,
  showRemove = true,
  index,
}: StepInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Task 11.1: Memoize handler to prevent unnecessary re-renders
  const handleChange = useCallback(
    (text: string) => {
      onChange(text);
    },
    [onChange]
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
          Step {index + 1}
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

      <TextInput
        style={[
          styles.input,
          isDark ? styles.inputDark : styles.inputLight,
          error && styles.inputError,
        ]}
        placeholder={`Describe step ${index + 1}...`}
        placeholderTextColor="#8E8E93"
        value={value}
        onChangeText={handleChange}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// Task 11.1: Export memoized component for performance optimization
export const StepInput = React.memo(StepInputComponent);

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
    marginBottom: 8,
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
  input: {
    minHeight: 80,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  inputLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5EA',
    color: '#000000',
  },
  inputDark: {
    backgroundColor: '#1C1C1E',
    borderColor: '#3A3A3C',
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});
