/**
 * SearchBar component for filtering recipes
 * Provides text input with search icon and clear button
 */

import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  testID?: string;
}

/**
 * SearchBar component with clear button
 *
 * @param props - Component props
 * @returns SearchBar component
 *
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   placeholder="Search recipes..."
 * />
 * ```
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search recipes...',
  testID = 'search-bar',
}: SearchBarProps) {
  return (
    <View className="px-4 py-2">
      <View className="flex-row items-center rounded-xl px-3 h-11 bg-surface-light dark:bg-[#1C1C1E]">
        <Icon
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
          testID={testID}
        />

        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            className="p-1"
            testID={`${testID}-clear`}
          >
            <Icon
              name="close-circle"
              size={20}
              color="#8E8E93"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
