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
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        borderRadius: 10,
        paddingLeft: 12,
        paddingRight: editable ? 6 : 12,
        paddingVertical: 8,
      }}
      testID={testID}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: '#FF6B35',
        }}
      >
        {value}
      </Text>

      {editable && (
        <View style={{ flexDirection: 'row', marginLeft: 6, gap: 2 }}>
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              style={{
                padding: 4,
                borderRadius: 6,
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID={`${testID}-edit`}
            >
              <Ionicons name="pencil-outline" size={14} color="#FF6B35" />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              style={{
                padding: 4,
                borderRadius: 6,
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID={`${testID}-delete`}
            >
              <Ionicons name="close-circle" size={16} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
