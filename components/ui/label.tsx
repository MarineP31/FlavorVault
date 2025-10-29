/**
 * Label component
 * Accessible label for form inputs
 */

import React from 'react';
import { Text, StyleSheet, useColorScheme, TextStyle } from 'react-native';

interface LabelProps {
  children: React.ReactNode;
  required?: boolean;
  style?: TextStyle;
}

/**
 * Label component for form fields
 */
export function Label({ children, required = false, style }: LabelProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Text style={[styles.label, isDark && styles.labelDark, style]}>
      {children}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000000',
  },
  labelDark: {
    color: '#FFFFFF',
  },
  required: {
    color: '#FF3B30',
  },
});
