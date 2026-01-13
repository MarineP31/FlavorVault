import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  Text,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FAB } from '@/components/ui/FAB';
import { ShoppingListItemComponent } from '@/components/shopping-list/shopping-list-item';
import { EmptyShoppingList } from '@/components/shopping-list/empty-shopping-list';
import {
  ShoppingListProvider,
  useShoppingList,
} from '@/lib/contexts/shopping-list-context';
import {
  ShoppingListItem,
  CATEGORY_ORDER,
  ShoppingListCategory,
} from '@/lib/db/schema/shopping-list';
import { AddManualItemDialog } from '@/components/shopping-list/add-manual-item-dialog';

interface SectionData {
  title: ShoppingListCategory;
  data: ShoppingListItem[];
}

function ShoppingListContent() {
  const {
    items,
    isLoading,
    isRegenerating,
    error,
    hasQueuedRecipes,
    toggleItemChecked,
    addManualItem,
    deleteItem,
    refreshList,
    regenerateList,
    clearError,
    retryLastOperation,
  } = useShoppingList();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const sections: SectionData[] = useMemo(() => {
    const result: SectionData[] = [];

    for (const category of CATEGORY_ORDER) {
      const categoryItems = items[category] || [];
      if (categoryItems.length > 0) {
        const sortedItems = [...categoryItems].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        result.push({
          title: category,
          data: sortedItems,
        });
      }
    }

    return result;
  }, [items]);

  const totalItemCount = useMemo(() => {
    return sections.reduce((sum, section) => sum + section.data.length, 0);
  }, [sections]);

  const checkedCount = useMemo(() => {
    return sections.reduce(
      (sum, section) =>
        sum + section.data.filter((item) => item.checked).length,
      0
    );
  }, [sections]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await regenerateList();
    } finally {
      setIsRefreshing(false);
    }
  }, [regenerateList]);

  const handleToggle = useCallback(
    (id: string) => {
      toggleItemChecked(id);
    },
    [toggleItemChecked]
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        'Delete Item',
        'Are you sure you want to delete this item?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteItem(id),
          },
        ]
      );
    },
    [deleteItem]
  );

  const handleOpenDialog = useCallback(() => {
    setIsDialogVisible(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogVisible(false);
  }, []);

  const handleAddManualItem = useCallback(
    async (item: { name: string; quantity?: number; unit?: string; category?: string }) => {
      try {
        await addManualItem({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit as any,
          category: item.category as any,
        });
        setIsDialogVisible(false);
      } catch (err) {
        console.error('Failed to add manual item:', err);
      }
    },
    [addManualItem]
  );

  const handleRetry = useCallback(async () => {
    clearError();
    await retryLastOperation();
  }, [clearError, retryLastOperation]);

  const renderItem = useCallback(
    ({ item }: { item: ShoppingListItem }) => (
      <ShoppingListItemComponent
        item={item}
        onToggle={handleToggle}
        onDelete={item.source === 'manual' ? handleDelete : undefined}
        testID={`shopping-item-${item.id}`}
      />
    ),
    [handleToggle, handleDelete]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionData }) => {
      const checkedInSection = section.data.filter((i) => i.checked).length;
      const totalInSection = section.data.length;

      return (
        <View
          className="flex-row items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
          accessibilityRole="header"
          accessibilityLabel={`${section.title} section with ${totalInSection} items, ${checkedInSection} checked`}
        >
          <Text className="text-base font-bold text-black dark:text-white">
            {section.title}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {checkedInSection}/{totalInSection}
          </Text>
        </View>
      );
    },
    []
  );

  const keyExtractor = useCallback((item: ShoppingListItem) => item.id, []);

  const getItemLayout = useCallback(
    (_data: SectionData[] | null, index: number) => ({
      length: 64,
      offset: 64 * index,
      index,
    }),
    []
  );

  if (isLoading && totalItemCount === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-gray-500 dark:text-gray-400">
            Loading shopping list...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && totalItemCount === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
        <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-2xl font-bold text-black dark:text-white">
            Shopping List
          </Text>
        </View>

        <View
          className="flex-1 justify-center items-center px-8"
          testID="shopping-list-error"
        >
          <View className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mb-6">
            <Text className="text-4xl">!</Text>
          </View>
          <Text className="text-xl font-semibold text-center text-black dark:text-white mb-2">
            Something went wrong
          </Text>
          <Text className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
            {error}
          </Text>
          <View className="flex-row">
            <View
              className="px-6 py-3 rounded-lg bg-primary dark:bg-primary-dark mr-3"
              onTouchEnd={handleRetry}
            >
              <Text className="text-white text-base font-semibold">Try Again</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (totalItemCount === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
        <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-2xl font-bold text-black dark:text-white">
            Shopping List
          </Text>
        </View>

        <EmptyShoppingList
          onAddItem={handleOpenDialog}
          hasQueuedRecipes={hasQueuedRecipes}
          testID="shopping-list-empty"
        />

        <AddManualItemDialog
          visible={isDialogVisible}
          onClose={handleCloseDialog}
          onAdd={handleAddManualItem}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-2xl font-bold text-black dark:text-white">
          Shopping List
        </Text>
        <View className="flex-row items-center">
          {isRegenerating && (
            <ActivityIndicator
              size="small"
              color="#007AFF"
              className="mr-2"
            />
          )}
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {checkedCount}/{totalItemCount} items
          </Text>
        </View>
      </View>

      {error && (
        <View className="px-4 py-3 bg-red-100 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
          <Text className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </Text>
          <Text
            className="text-red-600 dark:text-red-400 text-sm font-semibold mt-1"
            onPress={handleRetry}
          >
            Tap to retry
          </Text>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={15}
        windowSize={10}
        initialNumToRender={20}
        testID="shopping-list"
      />

      <FAB icon="add" onPress={handleOpenDialog} testID="add-item-fab" />

      <AddManualItemDialog
        visible={isDialogVisible}
        onClose={handleCloseDialog}
        onAdd={handleAddManualItem}
      />
    </SafeAreaView>
  );
}

export default function ShoppingListScreen() {
  return (
    <ShoppingListProvider>
      <ShoppingListContent />
    </ShoppingListProvider>
  );
}
