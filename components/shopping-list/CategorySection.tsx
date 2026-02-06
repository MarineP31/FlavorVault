import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';

import { ShoppingListItemComponent } from './ShoppingListItem';
import {
  ShoppingListItem,
  ShoppingListCategory,
} from '@/lib/db/schema/shopping-list';

export interface CategorySectionProps {
  category: ShoppingListCategory;
  items: ShoppingListItem[];
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  testID?: string;
}

function sortItemsAlphabetically(items: ShoppingListItem[]): ShoppingListItem[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export const CategorySection = memo<CategorySectionProps>(
  ({ category, items, onToggle, onDelete, testID = 'category-section' }) => {
    const sortedItems = useMemo(() => sortItemsAlphabetically(items), [items]);

    const checkedCount = useMemo(
      () => items.filter((item) => item.checked).length,
      [items]
    );

    const handleToggle = useCallback(
      (id: string) => {
        try {
          onToggle(id);
        } catch (error) {
          console.error('Error toggling item in category section:', error);
        }
      },
      [onToggle]
    );

    const handleDelete = useCallback(
      (id: string) => {
        try {
          onDelete?.(id);
        } catch (error) {
          console.error('Error deleting item in category section:', error);
        }
      },
      [onDelete]
    );

    const renderItem = useCallback(
      ({ item }: { item: ShoppingListItem }) => (
        <ShoppingListItemComponent
          item={item}
          onToggle={handleToggle}
          onDelete={item.source === 'manual' ? handleDelete : undefined}
          testID={`${testID}-item-${item.id}`}
        />
      ),
      [handleToggle, handleDelete, testID]
    );

    const keyExtractor = useCallback((item: ShoppingListItem) => item.id, []);

    const getItemLayout = useCallback(
      (_data: ArrayLike<ShoppingListItem> | null | undefined, index: number) => ({
        length: 64,
        offset: 64 * index,
        index,
      }),
      []
    );

    if (items.length === 0) {
      return null;
    }

    return (
      <View testID={testID}>
        <View
          className="flex-row items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
          accessibilityRole="header"
          accessibilityLabel={`${category} section with ${items.length} items, ${checkedCount} checked`}
        >
          <Text className="text-base font-bold text-black dark:text-white">
            {category}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {checkedCount}/{items.length}
          </Text>
        </View>

        <FlatList
          data={sortedItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          scrollEnabled={false}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
          testID={`${testID}-list`}
        />
      </View>
    );
  }
);

CategorySection.displayName = 'CategorySection';

export function getCategorySectionData(
  items: ShoppingListItem[],
  category: ShoppingListCategory
): ShoppingListItem[] {
  return items.filter((item) => item.category === category);
}

export function getCategorySectionItemCount(
  items: ShoppingListItem[],
  category: ShoppingListCategory
): number {
  return items.filter((item) => item.category === category).length;
}

export function getCategorySectionCheckedCount(
  items: ShoppingListItem[],
  category: ShoppingListCategory
): number {
  return items.filter(
    (item) => item.category === category && item.checked
  ).length;
}

export function sortCategorySectionItems(
  items: ShoppingListItem[]
): ShoppingListItem[] {
  return sortItemsAlphabetically(items);
}

export function getCategorySectionStats(
  items: ShoppingListItem[],
  category: ShoppingListCategory
): { total: number; checked: number; unchecked: number } {
  const categoryItems = getCategorySectionData(items, category);
  const checked = categoryItems.filter((item) => item.checked).length;
  return {
    total: categoryItems.length,
    checked,
    unchecked: categoryItems.length - checked,
  };
}
