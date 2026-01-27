import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export interface EmptyShoppingListProps {
  onAddItem?: () => void;
  hasQueuedRecipes?: boolean;
  testID?: string;
}

export const EmptyShoppingList = memo<EmptyShoppingListProps>(
  ({ onAddItem, hasQueuedRecipes = false, testID = 'empty-shopping-list' }) => {
    const { title, message } = getEmptyStateMessage(hasQueuedRecipes);

    return (
      <View
        style={styles.container}
        testID={testID}
        accessibilityRole="text"
        accessibilityLabel={`${title}. ${message}`}
      >
        <View style={styles.iconContainer}>
          <Icon name="cart-outline" size={64} color="#9CA3AF" />
        </View>

        <Text style={styles.title}>{title}</Text>

        <Text style={styles.message}>{message}</Text>

        {onAddItem && (
          <TouchableOpacity
            style={styles.button}
            onPress={onAddItem}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add item to shopping list"
            testID={`${testID}-add-button`}
          >
            <Icon name="add-circle-outline" size={20} color="#FF6B35" />
            <Text style={styles.buttonText}>Add Item</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

EmptyShoppingList.displayName = 'EmptyShoppingList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5EB',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
});

export function isShoppingListEmpty(itemCount: number): boolean {
  return itemCount === 0;
}

export function getEmptyStateMessage(hasQueuedRecipes: boolean): {
  title: string;
  message: string;
} {
  if (hasQueuedRecipes) {
    return {
      title: 'No Items Yet',
      message: 'Your meal plan has recipes but no shopping items have been generated. Pull down to refresh.',
    };
  }

  return {
    title: 'Your List is Empty',
    message: 'Add recipes to your meal plan to automatically generate a shopping list, or add items manually.',
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
        title: 'Your List is Empty',
        message: 'Add recipes to your meal plan to automatically generate a shopping list, or add items manually.',
        icon: 'cart-outline',
      };
    case 'no-items':
      return {
        title: 'No Items Yet',
        message: 'Your meal plan has recipes but no shopping items have been generated. Pull down to refresh.',
        icon: 'refresh-outline',
      };
    case 'all-checked':
      return {
        title: 'All Done!',
        message: 'You have completed your shopping list.',
        icon: 'checkmark-circle-outline',
      };
    default:
      return {
        title: 'Your List is Empty',
        message: 'Add recipes to your meal plan to get started!',
        icon: 'cart-outline',
      };
  }
}
