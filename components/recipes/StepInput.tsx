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
import Icon from 'react-native-vector-icons/Ionicons';

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
            style={styles.removeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="trash-outline" size={20} color="#FF3B30" />
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
    marginBottom: 8,
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
  input: {
    minHeight: 80,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  inputLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C7C7CC',
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
