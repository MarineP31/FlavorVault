/**
 * EmptyState component
 * Displays friendly message when no content is available
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

/**
 * EmptyState component for displaying no content messages
 */
export function EmptyState({
  icon = 'document-outline',
  title,
  message,
  actionLabel,
  onAction,
  testID = 'empty-state',
}: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container} testID={testID}>
      <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
        <Ionicons name={icon} size={40} color={isDark ? '#8E8E93' : '#9CA3AF'} />
      </View>

      <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>

      <Text style={[styles.message, isDark && styles.messageDark]}>{message}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.button}
          onPress={onAction}
          activeOpacity={0.8}
          testID={`${testID}-action`}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FF6B35" />
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainerDark: {
    backgroundColor: '#2C2C2E',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  messageDark: {
    color: '#8E8E93',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5EB',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
});
