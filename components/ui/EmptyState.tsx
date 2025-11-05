/**
 * EmptyState component
 * Displays friendly message when no content is available
 */

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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
 *
 * @param props - Component props
 * @returns EmptyState component
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="search-outline"
 *   title="No recipes found"
 *   message="Try adjusting your search or filters"
 *   actionLabel="Clear filters"
 *   onAction={clearFilters}
 * />
 * ```
 */
export function EmptyState({
  icon = 'document-outline',
  title,
  message,
  actionLabel,
  onAction,
  testID = 'empty-state',
}: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center px-8 py-16" testID={testID}>
      <Icon name={icon} size={64} color="#8E8E93" className="dark:text-icon-dark" />

      <Text className="text-xl font-semibold mt-4 text-center text-black dark:text-white">
        {title}
      </Text>

      <Text className="text-sm mt-2 text-center leading-5 text-text-secondary">
        {message}
      </Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          className="mt-6 px-6 py-3 rounded-lg bg-primary dark:bg-primary-dark"
          onPress={onAction}
          testID={`${testID}-action`}
        >
          <Text className="text-white text-base font-semibold">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
