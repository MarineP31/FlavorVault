/**
 * Category Header Component
 * Displays category name with action buttons
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryHeaderProps {
  name: string;
  isCustom: boolean;
  customCount: number;
  maxCustom: number;
  onEdit?: () => void;
  onDelete?: () => void;
  testID?: string;
}

/**
 * Category header with name and action buttons
 */
export function CategoryHeader({
  name,
  isCustom,
  customCount,
  maxCustom,
  onEdit,
  onDelete,
  testID,
}: CategoryHeaderProps) {
  return (
    <View
      className="flex-row items-center justify-between py-2 px-4 bg-surface-light dark:bg-[#1C1C1E] rounded-t-lg"
      testID={testID}
    >
      <View className="flex-row items-center gap-2">
        <Text className="text-base font-semibold text-black dark:text-white">
          {name}
        </Text>

        {!isCustom && (
          <View className="bg-primary/10 dark:bg-primary-dark/20 px-2 py-0.5 rounded">
            <Text className="text-xs text-primary dark:text-primary-light">
              Default
            </Text>
          </View>
        )}

        {customCount > 0 && (
          <Text className="text-xs text-[#8E8E93] dark:text-[#8E8E93]">
            {customCount}/{maxCustom} custom
          </Text>
        )}
      </View>

      {isCustom && (
        <View className="flex-row gap-2">
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              className="p-2 rounded-lg bg-surface-light dark:bg-[#2C2C2E]"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID={`${testID}-edit`}
            >
              <Ionicons
                name="pencil"
                size={18}
                className="text-primary dark:text-primary-light"
              />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID={`${testID}-delete`}
            >
              <Ionicons
                name="trash"
                size={18}
                className="text-red-500 dark:text-red-400"
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
