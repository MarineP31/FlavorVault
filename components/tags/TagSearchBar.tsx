/**
 * Tag Search Bar Component
 * Search input with filtering logic for tag management
 */

import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TagSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  testID?: string;
}

/**
 * Tag search bar with clear button
 */
export function TagSearchBar({
  value,
  onChangeText,
  placeholder = 'Search tags...',
  testID = 'tag-search-bar',
}: TagSearchBarProps) {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View
      className="flex-row items-center bg-surface-light dark:bg-[#1C1C1E] rounded-lg px-3 h-11"
      testID={testID}
    >
      <Ionicons
        name="search"
        size={20}
        color="#8E8E93"
        className="mr-2"
      />

      <TextInput
        className="flex-1 text-base py-0 text-black dark:text-white"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        testID={`${testID}-input`}
      />

      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          className="p-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID={`${testID}-clear`}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color="#8E8E93"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
