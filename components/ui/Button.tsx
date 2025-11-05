/**
 * Button component
 * Base button component with variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  testID?: string;
  style?: ViewStyle;
}

/**
 * Button component with Nativewind styling
 */
export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  testID,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Get button classes based on variant and size
  const getButtonClasses = () => {
    let classes = 'rounded-xl justify-center items-center flex-row ';

    // Size classes
    if (size === 'small') {
      classes += 'px-3 py-2 min-h-[32px] ';
    } else if (size === 'large') {
      classes += 'px-5 py-4 min-h-[52px] ';
    } else {
      classes += 'px-4 py-3 min-h-[44px] ';
    }

    // Variant classes
    if (variant === 'primary') {
      classes += 'bg-primary dark:bg-primary-dark ';
    } else if (variant === 'secondary') {
      classes += 'bg-surface-light dark:bg-[#2C2C2E] ';
    } else if (variant === 'destructive') {
      classes += 'bg-red-500 ';
    } else if (variant === 'outline') {
      classes += 'bg-transparent border border-[#C7C7CC] dark:border-[#3A3A3C] ';
    }

    // Full width
    if (fullWidth) {
      classes += 'w-full ';
    }

    // Disabled state
    if (isDisabled) {
      classes += 'opacity-50 ';
    }

    return classes.trim();
  };

  const getTextClasses = () => {
    let classes = 'font-semibold text-center ';

    // Text size
    if (size === 'small') {
      classes += 'text-sm ';
    } else if (size === 'large') {
      classes += 'text-lg ';
    } else {
      classes += 'text-base ';
    }

    // Text color
    if (variant === 'primary' || variant === 'destructive') {
      classes += 'text-white ';
    } else if (variant === 'secondary') {
      classes += 'text-black dark:text-white ';
    } else if (variant === 'outline') {
      classes += 'text-primary dark:text-white ';
    }

    return classes.trim();
  };

  const getActivityIndicatorColor = () => {
    if (variant === 'primary' || variant === 'destructive') {
      return '#FFFFFF';
    } else if (variant === 'outline') {
      return '#FF6B35';
    }
    return '#000000';
  };

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      testID={testID}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          color={getActivityIndicatorColor()}
          size="small"
        />
      ) : (
        <Text className={getTextClasses()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
