/**
 * SearchBar component for filtering recipes
 * Provides text input with search icon and clear button
 */

import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedView } from '@/components/ThemedView';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#1C1C1E' : '#F2F2F7';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const placeholderColor = isDark ? '#8E8E93' : '#8E8E93';
  const iconColor = isDark ? '#8E8E93' : '#8E8E93';

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor }]}>
        <Icon
          name="search"
          size={20}
          color={iconColor}
          style={styles.searchIcon}
        />

        <TextInput
          style={[styles.input, { color: textColor }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          testID={testID}
        />

        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            style={styles.clearButton}
            testID={`${testID}-clear`}
          >
            <Icon
              name="close-circle"
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
});
