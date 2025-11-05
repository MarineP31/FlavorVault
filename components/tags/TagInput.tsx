/**
 * Tag Input Component
 * Input field for creating new tags with validation
 */

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tagValueSchema } from '@/lib/validations/tag-schema';
import { VALIDATION_CONSTRAINTS } from '@/constants/enums';

interface TagInputProps {
  onSubmit: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  existingTags?: string[];
  testID?: string;
}

/**
 * Tag input component with inline validation
 */
export function TagInput({
  onSubmit,
  onCancel,
  placeholder = 'Enter tag name',
  existingTags = [],
  testID = 'tag-input',
}: TagInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateInput = (text: string): boolean => {
    setError(null);

    if (!text.trim()) {
      setError('Tag name is required');
      return false;
    }

    // Validate with Zod schema
    const result = tagValueSchema.safeParse(text.trim());
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Invalid tag name');
      return false;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = existingTags.some(
      (tag) => tag.toLowerCase() === text.trim().toLowerCase()
    );
    if (isDuplicate) {
      setError('A tag with this name already exists');
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
            className="px-3 py-2 bg-surface-light dark:bg-[#2C2C2E] rounded-lg text-black dark:text-white"
            autoFocus
            maxLength={VALIDATION_CONSTRAINTS.TAG_NAME_MAX_LENGTH}
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
          className="p-2 bg-primary dark:bg-primary-dark rounded-lg"
          disabled={!value.trim()}
          testID={`${testID}-submit`}
        >
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCancel}
          className="p-2 bg-surface-light dark:bg-[#2C2C2E] rounded-lg"
          testID={`${testID}-cancel`}
        >
          <Ionicons name="close" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <Text className="text-xs text-[#8E8E93]">
        {value.length}/{VALIDATION_CONSTRAINTS.TAG_NAME_MAX_LENGTH} characters
      </Text>
    </View>
  );
}
