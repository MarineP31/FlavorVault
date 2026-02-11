import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  Text,
  View,
  Alert,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ShoppingListItemComponent } from '@/components/shopping-list/ShoppingListItem';
import { EmptyShoppingList } from '@/components/shopping-list/EmptyShoppingList';
import { useShoppingList } from '@/lib/contexts/shopping-list-context';
import {
  ShoppingListItem,
  CATEGORY_ORDER,
  ShoppingListCategory,
} from '@/lib/db/schema/shopping-list';
import { AddManualItemDialog } from '@/components/shopping-list/AddManualItemDialog';
import { MeasurementUnit, EnumUtils } from '@/constants/enums';

const VALID_CATEGORIES: ShoppingListCategory[] = [
  'Produce',
  'Dairy',
  'Meat & Seafood',
  'Pantry',
  'Frozen',
  'Bakery',
  'Other',
];

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
    clearAllItems,
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
    async (id: string) => {
      try {
        await toggleItemChecked(id);
      } catch (error) {
        console.error('Failed to toggle item:', error);
      }
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
            onPress: async () => {
              try {
                await deleteItem(id);
              } catch (error) {
                console.error('Failed to delete item:', error);
              }
            },
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
        const validatedUnit = item.unit && EnumUtils.isValidMeasurementUnit(item.unit)
          ? (item.unit as MeasurementUnit)
          : undefined;
        const validatedCategory = item.category && VALID_CATEGORIES.includes(item.category as ShoppingListCategory)
          ? (item.category as ShoppingListCategory)
          : undefined;

        await addManualItem({
          name: item.name,
          quantity: item.quantity,
          unit: validatedUnit,
          category: validatedCategory,
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

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear Shopping List',
      'Are you sure you want to remove all items from your shopping list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllItems();
            } catch (error) {
              console.error('Failed to clear shopping list:', error);
            }
          },
        },
      ]
    );
  }, [clearAllItems]);

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
      const allChecked = checkedInSection === totalInSection;

      return (
        <View
          style={styles.sectionHeader}
          accessibilityRole="header"
          accessibilityLabel={`${section.title} section with ${totalInSection} items, ${checkedInSection} checked`}
        >
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View
            style={[
              styles.sectionBadge,
              allChecked ? styles.sectionBadgeComplete : styles.sectionBadgeIncomplete,
            ]}
          >
            <Text
              style={[
                styles.sectionBadgeText,
                allChecked ? styles.sectionBadgeTextComplete : styles.sectionBadgeTextIncomplete,
              ]}
            >
              {checkedInSection}/{totalInSection}
            </Text>
          </View>
        </View>
      );
    },
    []
  );

  const keyExtractor = useCallback((item: ShoppingListItem) => item.id, []);

  if (isLoading && totalItemCount === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8965A" />
          <Text style={styles.loadingText}>Loading shopping list...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && totalItemCount === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping List</Text>
        </View>

        <View style={styles.errorContainer} testID="shopping-list-error">
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (totalItemCount === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping List</Text>
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
    <SafeAreaView style={styles.containerWithItems} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping List</Text>
        <View style={styles.headerRight}>
          {isRegenerating && (
            <ActivityIndicator
              size="small"
              color="#E8965A"
              style={styles.headerSpinner}
            />
          )}
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={handleClearAll}
            accessibilityLabel="Clear all items"
            accessibilityHint="Removes all items from the shopping list"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {checkedCount}/{totalItemCount}
            </Text>
          </View>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <Pressable onPress={handleRetry}>
            <Text style={styles.errorBannerRetry}>Tap to retry</Text>
          </Pressable>
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
            tintColor="#E8965A"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={15}
        windowSize={10}
        initialNumToRender={20}
        testID="shopping-list"
      />

      <TouchableOpacity
        style={styles.addItemFab}
        onPress={handleOpenDialog}
        activeOpacity={0.8}
        testID="add-item-fab"
      >
        <Ionicons name="add" size={28} color="#1F2937" />
      </TouchableOpacity>

      <AddManualItemDialog
        visible={isDialogVisible}
        onClose={handleCloseDialog}
        onAdd={handleAddManualItem}
      />
    </SafeAreaView>
  );
}

export default function ShoppingListScreen() {
  return <ShoppingListContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerWithItems: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSpinner: {
    marginRight: 8,
  },
  clearAllButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  countBadge: {
    backgroundColor: 'rgba(232, 150, 90, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8965A',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorIconText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#EF4444',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#E8965A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FEE2E2',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  errorBannerText: {
    fontSize: 14,
    color: '#DC2626',
  },
  errorBannerRetry: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeIncomplete: {
    backgroundColor: '#E5E7EB',
  },
  sectionBadgeComplete: {
    backgroundColor: 'rgba(232, 150, 90, 0.15)',
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionBadgeTextIncomplete: {
    color: '#6B7280',
  },
  sectionBadgeTextComplete: {
    color: '#E8965A',
  },
  addItemFab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F5C99D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
