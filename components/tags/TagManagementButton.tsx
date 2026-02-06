/**
 * Tag Management Button Component
 * Button for accessing tag management from recipe form
 */

import React from 'react';
import { TouchableOpacity, Text, View, useColorScheme } from 'react-native';
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: isDark ? 'rgba(255, 107, 53, 0.15)' : 'rgba(255, 107, 53, 0.08)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 107, 53, 0.3)' : 'rgba(255, 107, 53, 0.2)',
        marginBottom: 16,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: isDark ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 107, 53, 0.12)',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}
      >
        <Ionicons
          name="pricetags-outline"
          size={16}
          color={disabled ? '#8E8E93' : '#FF6B35'}
        />
      </View>
      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: disabled ? '#8E8E93' : '#FF6B35',
          marginRight: 6,
        }}
      >
        Manage Tags
      </Text>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={disabled ? '#8E8E93' : '#FF6B35'}
        style={{ opacity: 0.7 }}
      />
    </TouchableOpacity>
  );
}
