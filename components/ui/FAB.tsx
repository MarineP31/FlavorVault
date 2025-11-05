/**
 * FAB (Floating Action Button) component
 * Displays a floating action button for primary actions
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface FABProps {
  icon?: string;
  onPress: () => void;
  testID?: string;
}

/**
 * Floating Action Button component
 *
 * @param props - Component props
 * @returns FAB component
 *
 * @example
 * ```tsx
 * <FAB
 *   icon="add"
 *   onPress={handleAddRecipe}
 * />
 * ```
 */
export function FAB({
  icon = 'add',
  onPress,
  testID = 'fab',
}: FABProps) {
  return (
    <TouchableOpacity
      className="absolute right-5 bottom-5 w-14 h-14 rounded-full bg-primary dark:bg-primary-dark items-center justify-center shadow-lg"
      onPress={onPress}
      activeOpacity={0.8}
      testID={testID}
    >
      <Icon name={icon} size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}
