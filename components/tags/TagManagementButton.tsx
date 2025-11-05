/**
 * Tag Management Button Component
 * Button for accessing tag management from recipe form
 */

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TagManagementButtonProps {
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * Button to open tag management modal
 */
export function TagManagementButton({
  onPress,
  disabled = false,
  testID = 'tag-management-button',
}: TagManagementButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center justify-center py-3 px-4 bg-primary/10 dark:bg-primary-dark/20 rounded-lg mb-3"
      activeOpacity={0.7}
      testID={testID}
    >
      <Ionicons
        name="settings-outline"
        size={20}
        color={disabled ? '#8E8E93' : '#FF6B35'}
      />
      <Text
        className={`ml-2 text-base font-medium ${
          disabled
            ? 'text-[#8E8E93]'
            : 'text-primary dark:text-primary-light'
        }`}
      >
        Manage Tags
      </Text>
    </TouchableOpacity>
  );
}
