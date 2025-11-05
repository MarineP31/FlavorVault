/**
 * Category Input Component
 * Input field for creating new categories with validation
 */

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryNameSchema } from '@/lib/validations/tag-schema';
import { VALIDATION_CONSTRAINTS } from '@/constants/enums';
import { getAllPredefinedCategoryNames } from '@/lib/db/schema/tags';

interface CategoryInputProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
  placeholder?: string;
  existingCategories?: string[];
  testID?: string;
}

/**
 * Category input component with inline validation
 */
export function CategoryInput({
  onSubmit,
  onCancel,
  placeholder = 'Enter category name',
  existingCategories = [],
  testID = 'category-input',
}: CategoryInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateInput = (text: string): boolean => {
    setError(null);

    if (!text.trim()) {
      setError('Category name is required');
      return false;
    }

    // Validate with Zod schema
    const result = categoryNameSchema.safeParse(text.trim());
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Invalid category name');
      return false;
    }

    // Check if it's a default category name
    const defaultCategories = getAllPredefinedCategoryNames();
    const isDefaultCategory = defaultCategories.some(
      (cat) => cat.toLowerCase() === text.trim().toLowerCase()
    );
    if (isDefaultCategory) {
      setError('Cannot use default category names');
      return false;
    }

    // Check for duplicates (case-insensitive)
    const allCategories = [...defaultCategories, ...existingCategories];
    const isDuplicate = allCategories.some(
      (cat) => cat.toLowerCase() === text.trim().toLowerCase()
    );
    if (isDuplicate) {
      setError('A category with this name already exists');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateInput(value)) {
      onSubmit(value.trim());
      setValue('');
      setError(null);
    }
  };

  const handleCancel = () => {
    setValue('');
    setError(null);
    onCancel();
  };

  const handleChangeText = (text: string) => {
    setValue(text);
    // Clear error as user types
    if (error) {
      setError(null);
    }
  };

  return (
    <View className="gap-2" testID={testID}>
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <TextInput
            value={value}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor="#8E8E93"
            className="px-4 py-3 bg-surface-light dark:bg-[#1C1C1E] rounded-lg text-black dark:text-white"
            autoFocus
            maxLength={VALIDATION_CONSTRAINTS.TAG_CATEGORY_MAX_LENGTH}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            testID={`${testID}-field`}
          />
          {error && (
            <Text
              className="text-xs text-red-500 dark:text-red-400 mt-1"
              testID={`${testID}-error`}
            >
              {error}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          className="p-3 bg-primary dark:bg-primary-dark rounded-lg"
          disabled={!value.trim()}
          testID={`${testID}-submit`}
        >
          <Ionicons name="checkmark" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCancel}
          className="p-3 bg-surface-light dark:bg-[#2C2C2E] rounded-lg"
          testID={`${testID}-cancel`}
        >
          <Ionicons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <Text className="text-xs text-[#8E8E93]">
        {value.length}/{VALIDATION_CONSTRAINTS.TAG_CATEGORY_MAX_LENGTH} characters
      </Text>
    </View>
  );
}
