import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Button } from '@/components/ui/Button';
import { CATEGORY_ORDER, ShoppingListCategory } from '@/lib/db/schema/shopping-list';
import { MeasurementUnit } from '@/constants/enums';

interface AddManualItemDialogProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: {
    name: string;
    quantity?: number;
    unit?: string;
    category?: string;
  }) => void;
}

const COMMON_UNITS: { label: string; value: MeasurementUnit | null }[] = [
  { label: 'None', value: null },
  { label: 'tsp', value: MeasurementUnit.TSP },
  { label: 'tbsp', value: MeasurementUnit.TBSP },
  { label: 'cup', value: MeasurementUnit.CUP },
  { label: 'oz', value: MeasurementUnit.OZ },
  { label: 'lb', value: MeasurementUnit.LB },
  { label: 'g', value: MeasurementUnit.GRAM },
  { label: 'unit', value: MeasurementUnit.UNIT },
  { label: 'piece', value: MeasurementUnit.PIECE },
];

export function AddManualItemDialog({
  visible,
  onClose,
  onAdd,
}: AddManualItemDialogProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<MeasurementUnit | null>(null);
  const [category, setCategory] = useState<ShoppingListCategory>('Other');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setName('');
      setQuantity('');
      setUnit(null);
      setCategory('Other');
      setError(null);
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleAdd = useCallback(async () => {
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }

    if (name.trim().length > 100) {
      setError('Item name must be 100 characters or less');
      return;
    }

    const parsedQuantity = quantity ? parseFloat(quantity) : undefined;
    if (quantity && (isNaN(parsedQuantity!) || parsedQuantity! <= 0)) {
      setError('Quantity must be a positive number');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAdd({
        name: name.trim(),
        quantity: parsedQuantity,
        unit: unit ?? undefined,
        category,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      setIsSubmitting(false);
    }
  }, [name, quantity, unit, category, onAdd]);

  const handleQuantityChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      setQuantity(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setQuantity(cleaned);
    }
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={onClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className={`rounded-t-3xl max-h-[80%] ${
              isDark ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-xl font-bold text-black dark:text-white">
                Add Item
              </Text>
              <Pressable
                onPress={onClose}
                className="w-8 h-8 items-center justify-center"
                accessibilityLabel="Close"
              >
                <Icon
                  name="close"
                  size={24}
                  color={isDark ? '#FFF' : '#000'}
                />
              </Pressable>
            </View>

            <ScrollView
              className="px-5 py-4"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="mb-4">
                <Text className="text-sm font-semibold mb-2 text-black dark:text-white">
                  Item Name *
                </Text>
                <TextInput
                  className={`h-12 px-4 rounded-xl border text-base ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-black'
                  } ${error && !name.trim() ? 'border-red-500' : ''}`}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Paper towels"
                  placeholderTextColor="#8E8E93"
                  autoFocus
                  returnKeyType="next"
                  testID="manual-item-name-input"
                />
              </View>

              <View className="flex-row mb-4">
                <View className="flex-1 mr-3">
                  <Text className="text-sm font-semibold mb-2 text-black dark:text-white">
                    Quantity
                  </Text>
                  <TextInput
                    className={`h-12 px-4 rounded-xl border text-base ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                    value={quantity}
                    onChangeText={handleQuantityChange}
                    placeholder="1"
                    placeholderTextColor="#8E8E93"
                    keyboardType="decimal-pad"
                    testID="manual-item-quantity-input"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-semibold mb-2 text-black dark:text-white">
                    Unit
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="h-12"
                  >
                    <View className="flex-row items-center">
                      {COMMON_UNITS.map((u) => (
                        <Pressable
                          key={u.label}
                          onPress={() => setUnit(u.value)}
                          className={`px-3 py-2 rounded-lg mr-2 ${
                            unit === u.value
                              ? 'bg-primary dark:bg-primary-dark'
                              : isDark
                                ? 'bg-gray-800'
                                : 'bg-gray-100'
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              unit === u.value
                                ? 'text-white font-semibold'
                                : 'text-black dark:text-white'
                            }`}
                          >
                            {u.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semibold mb-2 text-black dark:text-white">
                  Category
                </Text>
                <View className="flex-row flex-wrap">
                  {CATEGORY_ORDER.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-lg mr-2 mb-2 ${
                        category === cat
                          ? 'bg-primary dark:bg-primary-dark'
                          : isDark
                            ? 'bg-gray-800'
                            : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          category === cat
                            ? 'text-white font-semibold'
                            : 'text-black dark:text-white'
                        }`}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {error && (
                <View className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Text className="text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </Text>
                </View>
              )}

              <View className="flex-row mb-6">
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={onClose}
                  style={{ flex: 1, marginRight: 8 }}
                  testID="manual-item-cancel-button"
                />
                <Button
                  title="Add Item"
                  variant="primary"
                  onPress={handleAdd}
                  loading={isSubmitting}
                  disabled={!name.trim()}
                  style={{ flex: 1, marginLeft: 8 }}
                  testID="manual-item-add-button"
                />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
