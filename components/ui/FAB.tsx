/**
 * FAB (Floating Action Button) component
 * Displays a floating action button for primary actions
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
      className="absolute right-5 bottom-5 w-16 h-16 rounded-full bg-primary items-center justify-center"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
      }}
      onPress={onPress}
      activeOpacity={0.8}
      testID={testID}
    >
      <Ionicons name={icon} size={32} color="#FFFFFF" />
    </TouchableOpacity>
  );
}
