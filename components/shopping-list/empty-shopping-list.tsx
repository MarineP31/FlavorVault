import React, { memo, useCallback, useRef, useEffect } from 'react';
import { Animated, Text, View, Pressable, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export interface EmptyShoppingListProps {
  onAddItem?: () => void;
  hasQueuedRecipes?: boolean;
  testID?: string;
}

export const EmptyShoppingList = memo<EmptyShoppingListProps>(
  ({ onAddItem, hasQueuedRecipes = false, testID = 'empty-shopping-list' }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, scaleAnim]);

    const handleAddPress = useCallback(() => {
      try {
        onAddItem?.();
      } catch (error) {
        console.error('Error handling add item press:', error);
      }
    }, [onAddItem]);

    const { title, message } = getEmptyStateMessage(hasQueuedRecipes);

    return (
      <Animated.View
        className="flex-1 justify-center items-center px-8 py-16"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        testID={testID}
        accessibilityRole="text"
        accessibilityLabel={`${title}. ${message}`}
      >
        <View
          className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-6"
        >
          <Icon
            name="cart-outline"
            size={48}
            color="#8E8E93"
          />
        </View>

        <Text
          className="text-xl font-semibold text-center text-black dark:text-white mb-2"
          accessibilityRole="header"
        >
          {title}
        </Text>

        <Text
          className="text-sm text-center leading-5 text-gray-500 dark:text-gray-400 max-w-xs"
        >
          {message}
        </Text>

        {shouldShowAddButton(hasQueuedRecipes) && onAddItem && (
          <Pressable
            onPress={handleAddPress}
            className="mt-6 px-6 py-3 rounded-lg bg-primary dark:bg-primary-dark active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Add item manually"
            accessibilityHint="Opens dialog to add a custom item to your shopping list"
            testID={`${testID}-add-button`}
          >
            <Text className="text-white text-base font-semibold">Add Item</Text>
          </Pressable>
        )}

        {hasQueuedRecipes && (
          <Text
            className="mt-4 text-xs text-center text-gray-400 dark:text-gray-500"
            testID={`${testID}-hint`}
          >
            Pull down to refresh
          </Text>
        )}
      </Animated.View>
    );
  }
);

EmptyShoppingList.displayName = 'EmptyShoppingList';

export function isShoppingListEmpty(itemCount: number): boolean {
  return itemCount === 0;
}

export function getEmptyStateMessage(hasQueuedRecipes: boolean): {
  title: string;
  message: string;
} {
  if (hasQueuedRecipes) {
    return {
      title: 'No items generated yet',
      message: 'Pull down to refresh and generate items from your meal plan.',
    };
  }

  return {
    title: 'Your shopping list is empty',
    message:
      'Add recipes to your meal plan to generate a shopping list, or add items manually.',
  };
}

export function shouldShowAddButton(hasQueuedRecipes: boolean): boolean {
  return true;
}

export function getEmptyStateIcon(hasQueuedRecipes: boolean): string {
  return hasQueuedRecipes ? 'refresh-outline' : 'cart-outline';
}

export type EmptyStateType = 'no-recipes' | 'no-items' | 'all-checked';

export function determineEmptyStateType(
  hasQueuedRecipes: boolean,
  itemCount: number,
  checkedCount: number
): EmptyStateType {
  if (itemCount === 0 && !hasQueuedRecipes) {
    return 'no-recipes';
  }
  if (itemCount === 0 && hasQueuedRecipes) {
    return 'no-items';
  }
  if (itemCount > 0 && checkedCount === itemCount) {
    return 'all-checked';
  }
  return 'no-items';
}

export function getEmptyStateContent(type: EmptyStateType): {
  title: string;
  message: string;
  icon: string;
} {
  switch (type) {
    case 'no-recipes':
      return {
        title: 'Your shopping list is empty',
        message: 'Add recipes to your meal plan to generate a shopping list, or add items manually.',
        icon: 'cart-outline',
      };
    case 'no-items':
      return {
        title: 'No items generated yet',
        message: 'Pull down to refresh and generate items from your meal plan.',
        icon: 'refresh-outline',
      };
    case 'all-checked':
      return {
        title: 'All done!',
        message: 'You have completed your shopping list.',
        icon: 'checkmark-circle-outline',
      };
    default:
      return {
        title: 'Your shopping list is empty',
        message: 'Add recipes to your queue to get started!',
        icon: 'cart-outline',
      };
  }
}
