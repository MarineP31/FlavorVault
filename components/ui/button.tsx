/**
 * Button component
 * Base button component with variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
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
 * Button component
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[size],
        getVariantStyle(variant, isDark),
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={getTextColor(variant, isDark)}
          size="small"
        />
      ) : (
        <Text style={[styles.text, getTextStyle(variant, size, isDark)]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function getVariantStyle(variant: ButtonVariant, isDark: boolean): ViewStyle {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: '#007AFF',
      };
    case 'secondary':
      return {
        backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      };
    case 'destructive':
      return {
        backgroundColor: '#FF3B30',
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: isDark ? '#3A3A3C' : '#C7C7CC',
      };
    default:
      return {};
  }
}

function getTextStyle(
  variant: ButtonVariant,
  size: ButtonSize,
  isDark: boolean
): TextStyle {
  return {
    color: getTextColor(variant, isDark),
    fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
    fontWeight: '600',
  };
}

function getTextColor(variant: ButtonVariant, isDark: boolean): string {
  switch (variant) {
    case 'primary':
    case 'destructive':
      return '#FFFFFF';
    case 'secondary':
      return isDark ? '#FFFFFF' : '#000000';
    case 'outline':
      return isDark ? '#FFFFFF' : '#007AFF';
    default:
      return '#FFFFFF';
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: 'center',
  },
});
