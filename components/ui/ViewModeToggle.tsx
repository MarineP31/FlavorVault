/**
 * ViewModeToggle component for switching between grid and list views
 * Displays icon buttons for grid and list modes
 *
 * Task 5.1: View Toggle Component
 * - Implement grid/list toggle button
 * - Add toggle button styling
 * - Implement toggle button accessibility
 * - Add toggle button animations
 */

import React from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { ViewMode } from '@/lib/constants/view-modes';
import {
  VIEW_MODE_ICONS,
  VIEW_MODE_A11Y_LABELS,
  VIEW_MODE_DESCRIPTIONS,
} from '@/lib/constants/view-modes';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onToggle: (mode: ViewMode) => void;
  testID?: string;
}

/**
 * Toggle button for switching between grid and list view modes
 *
 * Features:
 * - Grid and list view toggle buttons
 * - Visual indication of active mode
 * - Smooth animations when switching modes
 * - Full accessibility support with labels and hints
 * - Dark mode support
 * - Touch-friendly button sizes (minimum 44x44 points)
 *
 * @param props - Component props
 * @returns ViewModeToggle component
 *
 * @example
 * ```tsx
 * <ViewModeToggle
 *   viewMode={viewMode}
 *   onToggle={setViewMode}
 * />
 * ```
 */
export function ViewModeToggle({
  viewMode,
  onToggle,
  testID = 'view-mode-toggle',
}: ViewModeToggleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const activeColor = isDark ? '#FF8C5A' : '#FF6B35';
  const inactiveColor = isDark ? '#8E8E93' : '#8E8E93';
  const backgroundColor = isDark ? '#1C1C1E' : '#F2F2F7';
  const dividerColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Animation values for smooth transitions
  const [gridScale] = React.useState(new Animated.Value(viewMode === 'grid' ? 1 : 1));
  const [listScale] = React.useState(new Animated.Value(viewMode === 'list' ? 1 : 1));

  // Animate scale when view mode changes
  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(gridScale, {
        toValue: viewMode === 'grid' ? 1 : 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      Animated.spring(listScale, {
        toValue: viewMode === 'list' ? 1 : 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
    ]).start();
  }, [viewMode, gridScale, listScale]);

  const handleGridPress = () => {
    if (viewMode !== 'grid') {
      // Subtle press animation
      Animated.sequence([
        Animated.timing(gridScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(gridScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }),
      ]).start();
      onToggle('grid');
    }
  };

  const handleListPress = () => {
    if (viewMode !== 'list') {
      // Subtle press animation
      Animated.sequence([
        Animated.timing(listScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(listScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }),
      ]).start();
      onToggle('list');
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor }]}
      testID={testID}
      accessibilityRole="radiogroup"
      accessibilityLabel="View mode selection"
    >
      {/* Grid View Button */}
      <TouchableOpacity
        onPress={handleGridPress}
        style={[
          styles.button,
          viewMode === 'grid' && styles.activeButton,
        ]}
        testID={`${testID}-grid`}
        accessibilityRole="radio"
        accessibilityState={{ checked: viewMode === 'grid', selected: viewMode === 'grid' }}
        accessibilityLabel={VIEW_MODE_A11Y_LABELS.grid}
        accessibilityHint={VIEW_MODE_DESCRIPTIONS.grid}
        disabled={viewMode === 'grid'}
      >
        <Animated.View style={{ transform: [{ scale: gridScale }] }}>
          <Icon
            name={VIEW_MODE_ICONS.grid}
            size={24}
            color={viewMode === 'grid' ? activeColor : inactiveColor}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      {/* List View Button */}
      <TouchableOpacity
        onPress={handleListPress}
        style={[
          styles.button,
          viewMode === 'list' && styles.activeButton,
        ]}
        testID={`${testID}-list`}
        accessibilityRole="radio"
        accessibilityState={{ checked: viewMode === 'list', selected: viewMode === 'list' }}
        accessibilityLabel={VIEW_MODE_A11Y_LABELS.list}
        accessibilityHint={VIEW_MODE_DESCRIPTIONS.list}
        disabled={viewMode === 'list'}
      >
        <Animated.View style={{ transform: [{ scale: listScale }] }}>
          <Icon
            name={VIEW_MODE_ICONS.list}
            size={24}
            color={viewMode === 'list' ? activeColor : inactiveColor}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    marginRight: 16,
  },
  button: {
    padding: 8,
    borderRadius: 6,
    // Ensure minimum touch target size (44x44 points)
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  divider: {
    width: 1,
    marginVertical: 4,
  },
});
