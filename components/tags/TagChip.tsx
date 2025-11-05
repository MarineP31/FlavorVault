/**
 * Tag Chip Component
 * Displays individual tags with edit/delete actions
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TagChipProps {
  value: string;
  onEdit?: () => void;
  onDelete?: () => void;
  editable?: boolean;
  testID?: string;
}

/**
 * Tag chip component with edit/delete actions
 */
export function TagChip({
  value,
  onEdit,
  onDelete,
  editable = true,
  testID,
}: TagChipProps) {
  return (
    <View
      className="flex-row items-center bg-primary/10 dark:bg-primary-dark/20 rounded-lg px-3 py-2 m-1"
      testID={testID}
    >
      <Text className="text-sm text-primary dark:text-primary-light font-medium">
        {value}
      </Text>

      {editable && (
        <View className="flex-row ml-2 gap-1">
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              className="p-1"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID={`${testID}-edit`}
            >
              <Ionicons
                name="pencil"
                size={14}
                className="text-primary dark:text-primary-light"
              />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              className="p-1"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID={`${testID}-delete`}
            >
              <Ionicons
                name="close-circle"
                size={14}
                className="text-red-500 dark:text-red-400"
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
