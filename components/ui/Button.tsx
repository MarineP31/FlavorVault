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
  StyleSheet,
  useColorScheme,
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

const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#FF8C5A',
  white: '#FFFFFF',
  black: '#000000',
  surfaceLight: '#F2F2F7',
  surfaceDark: '#2C2C2E',
  red: '#FF3B30',
};

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

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [styles.base];

    // Size
    if (size === 'small') {
      baseStyles.push(styles.sizeSmall);
    } else if (size === 'large') {
      baseStyles.push(styles.sizeLarge);
    } else {
      baseStyles.push(styles.sizeMedium);
    }

    // Variant
    if (variant === 'primary') {
      baseStyles.push(isDark ? styles.primaryDark : styles.primary);
    } else if (variant === 'secondary') {
      baseStyles.push(isDark ? styles.secondaryDark : styles.secondary);
    } else if (variant === 'destructive') {
      baseStyles.push(styles.destructive);
    } else if (variant === 'outline') {
      baseStyles.push(isDark ? styles.outlineDark : styles.outline);
    }

    if (fullWidth) {
      baseStyles.push(styles.fullWidth);
    }

    if (isDisabled) {
      baseStyles.push(styles.disabled);
    }

    if (style) {
      baseStyles.push(style);
    }

    return baseStyles;
  };

  const getTextStyle = () => {
    const textStyles: any[] = [styles.text];

    // Size
    if (size === 'small') {
      textStyles.push(styles.textSmall);
    } else if (size === 'large') {
      textStyles.push(styles.textLarge);
    } else {
      textStyles.push(styles.textMedium);
    }

    // Color
    if (variant === 'primary' || variant === 'destructive') {
      textStyles.push(styles.textWhite);
    } else if (variant === 'secondary') {
      textStyles.push(isDark ? styles.textWhite : styles.textBlack);
    } else if (variant === 'outline') {
      textStyles.push(isDark ? styles.textPrimaryDark : styles.textPrimary);
    }

    return textStyles;
  };

  const getActivityIndicatorColor = () => {
    if (variant === 'primary' || variant === 'destructive') {
      return COLORS.white;
    } else if (variant === 'outline') {
      return COLORS.primary;
    }
    return COLORS.black;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={getActivityIndicatorColor()} size="small" />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  sizeSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  sizeMedium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  sizeLarge: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  primaryDark: {
    backgroundColor: COLORS.primaryDark,
  },
  secondary: {
    backgroundColor: COLORS.surfaceLight,
  },
  secondaryDark: {
    backgroundColor: COLORS.surfaceDark,
  },
  destructive: {
    backgroundColor: COLORS.red,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  outlineDark: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  textWhite: {
    color: COLORS.white,
  },
  textBlack: {
    color: COLORS.black,
  },
  textPrimary: {
    color: COLORS.primary,
  },
  textPrimaryDark: {
    color: COLORS.primaryDark,
  },
});
