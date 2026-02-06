/**
 * Input component
 * Base text input component with label and error support
 */

import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  containerStyle?: any;
  showPasswordToggle?: boolean;
}

/**
 * Input component with label and error handling
 */
export function Input({
  label,
  error,
  fullWidth = true,
  containerStyle,
  style,
  showPasswordToggle = false,
  secureTextEntry,
  ...props
}: InputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const shouldHideText = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[fullWidth && styles.fullWidth, containerStyle]}>
      {label && (
        <Text style={[styles.label, isDark && styles.labelDark]}>
          {label}
        </Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isDark ? styles.inputDark : styles.inputLight,
            error && styles.inputError,
            showPasswordToggle && styles.inputWithToggle,
            style,
          ]}
          placeholderTextColor={isDark ? '#8E8E93' : '#A0A0A5'}
          secureTextEntry={shouldHideText}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons
              name={isPasswordVisible ? 'visibility' : 'visibility-off'}
              size={22}
              color={isDark ? '#8E8E93' : '#6B7280'}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000000',
  },
  labelDark: {
    color: '#FFFFFF',
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1.5,
  },
  inputWithToggle: {
    paddingRight: 48,
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
  toggleButton: {
    position: 'absolute',
    right: 14,
    height: 48,
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});
