import React, { useCallback, memo } from 'react';
import {
  Pressable,
  Text,
  View,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { ShoppingListItem as ShoppingListItemType } from '@/lib/db/schema/shopping-list';

export interface ShoppingListItemProps {
  item: ShoppingListItemType;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  testID?: string;
}

function formatQuantityDisplay(item: ShoppingListItemType): string {
  if (item.quantity === null && item.unit === null) {
    return '';
  }

  if (item.quantity === null) {
    return item.unit ? `(${item.unit})` : '';
  }

  const formattedQty = Number.isInteger(item.quantity)
    ? item.quantity.toString()
    : item.quantity.toFixed(2).replace(/\.?0+$/, '');

  if (item.unit === null) {
    return formattedQty;
  }

  return `${formattedQty} ${item.unit}`;
}

export const ShoppingListItemComponent = memo<ShoppingListItemProps>(
  ({ item, onToggle, onDelete, testID = 'shopping-list-item' }) => {
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const handlePress = useCallback(() => {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.97,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      onToggle(item.id);
    }, [item.id, onToggle, scaleValue]);

    const handleDelete = useCallback(() => {
      if (onDelete) {
        onDelete(item.id);
      }
    }, [item.id, onDelete]);

    const quantityText = formatQuantityDisplay(item);
    const isManual = item.source === 'manual';

    const accessibilityLabel = `${item.name}${quantityText ? `, ${quantityText}` : ''}${
      item.checked ? ', checked' : ', unchecked'
    }`;

    return (
      <Animated.View
        style={{ transform: [{ scale: scaleValue }] }}
        testID={testID}
      >
        <Pressable
          onPress={handlePress}
          className="flex-row items-center py-3 px-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.checked }}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint="Double tap to toggle checked state"
        >
          <Pressable
            onPress={handlePress}
            className="w-11 h-11 items-center justify-center mr-3"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.checked }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View
              className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
                item.checked
                  ? 'bg-primary border-primary dark:bg-primary-dark dark:border-primary-dark'
                  : 'bg-transparent border-gray-300 dark:border-gray-500'
              }`}
            >
              {item.checked && <Icon name="checkmark" size={18} color="#FFF" />}
            </View>
          </Pressable>

          <View className="flex-1 flex-row items-center justify-between">
            <View className="flex-1 mr-2">
              <Text
                className={`text-base ${
                  item.checked
                    ? 'text-gray-400 dark:text-gray-500 line-through'
                    : 'text-black dark:text-white font-semibold'
                }`}
                numberOfLines={2}
              >
                {item.name}
              </Text>

              {quantityText ? (
                <Text
                  className={`text-sm mt-0.5 ${
                    item.checked
                      ? 'text-gray-300 dark:text-gray-600 line-through'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {quantityText}
                </Text>
              ) : null}
            </View>

            {isManual && onDelete && (
              <Pressable
                onPress={handleDelete}
                className="w-10 h-10 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.name}`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="trash-outline" size={20} color="#FF3B30" />
              </Pressable>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }
);

ShoppingListItemComponent.displayName = 'ShoppingListItem';
