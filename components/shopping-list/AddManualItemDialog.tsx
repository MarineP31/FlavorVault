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
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { CATEGORY_ORDER, ShoppingListCategory } from '@/lib/db/schema/shopping-list';
import { MeasurementUnit } from '@/constants/enums';

export interface AddManualItemDialogProps {
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
        style={styles.keyboardView}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[styles.container, isDark && styles.containerDark]}
          >
            <View style={styles.header}>
              <Text style={[styles.headerTitle, isDark && styles.textDark]}>
                Add Item
              </Text>
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Close"
              >
                <Icon
                  name="close"
                  size={24}
                  color={isDark ? '#FFF' : '#6B7280'}
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, isDark && styles.textDark]}>
                  Item Name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    isDark && styles.inputDark,
                    error && !name.trim() && styles.inputError,
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Paper towels"
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                  returnKeyType="next"
                  testID="manual-item-name-input"
                />
              </View>

              <View style={styles.row}>
                <View style={styles.quantityField}>
                  <Text style={[styles.label, isDark && styles.textDark]}>
                    Quantity
                  </Text>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    value={quantity}
                    onChangeText={handleQuantityChange}
                    placeholder="1"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    testID="manual-item-quantity-input"
                  />
                </View>

                <View style={styles.unitField}>
                  <Text style={[styles.label, isDark && styles.textDark]}>
                    Unit
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.unitScroll}
                  >
                    <View style={styles.unitContainer}>
                      {COMMON_UNITS.map((u) => (
                        <Pressable
                          key={u.label}
                          onPress={() => setUnit(u.value)}
                          style={[
                            styles.chip,
                            unit === u.value
                              ? styles.chipSelected
                              : isDark
                                ? styles.chipDark
                                : styles.chipLight,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              unit === u.value
                                ? styles.chipTextSelected
                                : isDark
                                  ? styles.chipTextDark
                                  : styles.chipTextLight,
                            ]}
                          >
                            {u.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, isDark && styles.textDark]}>
                  Category
                </Text>
                <View style={styles.categoryContainer}>
                  {CATEGORY_ORDER.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.chip,
                        styles.categoryChip,
                        category === cat
                          ? styles.chipSelected
                          : isDark
                            ? styles.chipDark
                            : styles.chipLight,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          category === cat
                            ? styles.chipTextSelected
                            : isDark
                              ? styles.chipTextDark
                              : styles.chipTextLight,
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.buttonRow}>
                <Pressable
                  onPress={onClose}
                  style={[styles.button, styles.cancelButton]}
                  testID="manual-item-cancel-button"
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleAdd}
                  disabled={!name.trim() || isSubmitting}
                  style={[
                    styles.button,
                    styles.addButton,
                    (!name.trim() || isSubmitting) && styles.addButtonDisabled,
                  ]}
                  testID="manual-item-add-button"
                >
                  <Text
                    style={[
                      styles.addButtonText,
                      (!name.trim() || isSubmitting) && styles.addButtonTextDisabled,
                    ]}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Item'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    fontSize: 16,
    color: '#1F2937',
  },
  inputDark: {
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  quantityField: {
    width: 100,
    marginRight: 16,
  },
  unitField: {
    flex: 1,
  },
  unitScroll: {
    height: 52,
  },
  unitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  chipLight: {
    backgroundColor: '#F3F4F6',
  },
  chipDark: {
    backgroundColor: '#2C2C2E',
  },
  chipSelected: {
    backgroundColor: '#F5C99D',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextLight: {
    color: '#4B5563',
  },
  chipTextDark: {
    color: '#FFFFFF',
  },
  chipTextSelected: {
    color: '#1F2937',
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginBottom: 8,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  addButton: {
    backgroundColor: '#F5C99D',
    marginLeft: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButtonTextDisabled: {
    color: '#9CA3AF',
  },
  textDark: {
    color: '#FFFFFF',
  },
});
