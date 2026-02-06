import React, { useCallback, memo } from 'react';
import {
  Pressable,
  Text,
  View,
  Animated,
  StyleSheet,
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
    return item.unit ? `${item.unit}` : '';
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
          toValue: 0.98,
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
        style={[styles.container, { transform: [{ scale: scaleValue }] }]}
        testID={testID}
      >
        <Pressable
          onPress={handlePress}
          style={[
            styles.pressable,
            item.checked ? styles.pressableChecked : styles.pressableUnchecked,
          ]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.checked }}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint="Double tap to toggle checked state"
        >
          <Pressable
            onPress={handlePress}
            style={styles.checkboxContainer}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.checked }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View
              style={[
                styles.checkbox,
                item.checked ? styles.checkboxChecked : styles.checkboxUnchecked,
              ]}
            >
              {item.checked && <Icon name="checkmark" size={18} color="#FFF" />}
            </View>
          </Pressable>

          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.itemName,
                  item.checked ? styles.itemNameChecked : styles.itemNameUnchecked,
                ]}
                numberOfLines={2}
              >
                {item.name}
              </Text>

              {quantityText ? (
                <View style={styles.quantityRow}>
                  <View
                    style={[
                      styles.quantityBadge,
                      item.checked ? styles.quantityBadgeChecked : styles.quantityBadgeUnchecked,
                    ]}
                  >
                    <Text
                      style={[
                        styles.quantityText,
                        item.checked ? styles.quantityTextChecked : styles.quantityTextUnchecked,
                      ]}
                    >
                      {quantityText}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            {isManual && onDelete && (
              <Pressable
                onPress={handleDelete}
                style={styles.deleteButton}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.name}`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="trash-outline" size={18} color="#EF4444" />
              </Pressable>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }
);

ShoppingListItemComponent.displayName = 'ShoppingListItem';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginBottom: 8,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  pressableUnchecked: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pressableChecked: {
    backgroundColor: '#F9FAFB',
  },
  checkboxContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxUnchecked: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  checkboxChecked: {
    backgroundColor: '#E8965A',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
  },
  itemNameUnchecked: {
    color: '#111827',
    fontWeight: '500',
  },
  itemNameChecked: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  quantityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  quantityBadgeUnchecked: {
    backgroundColor: 'rgba(232, 150, 90, 0.1)',
  },
  quantityBadgeChecked: {
    backgroundColor: '#F3F4F6',
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  quantityTextUnchecked: {
    color: '#E8965A',
  },
  quantityTextChecked: {
    color: '#9CA3AF',
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
  },
});
