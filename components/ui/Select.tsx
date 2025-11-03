/**
 * Select component
 * Dropdown select component using Picker
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Platform,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

/**
 * Select component for dropdown selections
 */
export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  error,
  disabled = false,
  testID,
}: SelectProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showModal, setShowModal] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  // For iOS, use a custom modal picker
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        {label && (
          <Text style={[styles.label, isDark && styles.labelDark]}>
            {label}
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.selectButton,
            isDark ? styles.selectButtonDark : styles.selectButtonLight,
            error && styles.selectButtonError,
            disabled && styles.selectButtonDisabled,
          ]}
          onPress={() => !disabled && setShowModal(true)}
          disabled={disabled}
          testID={testID}
        >
          <Text
            style={[
              styles.selectText,
              isDark && styles.selectTextDark,
              !selectedOption && styles.placeholder,
            ]}
          >
            {displayValue}
          </Text>
          <Icon
            name="chevron-down"
            size={20}
            color={isDark ? '#8E8E93' : '#8E8E93'}
          />
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}

        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowModal(false)}
          >
            <Pressable
              style={[
                styles.modalContent,
                isDark ? styles.modalContentDark : styles.modalContentLight,
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[styles.modalTitle, isDark && styles.modalTitleDark]}
                >
                  {label || 'Select'}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.optionsList}>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      option.value === value && styles.optionSelected,
                    ]}
                    onPress={() => {
                      onChange(option.value);
                      setShowModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isDark && styles.optionTextDark,
                        option.value === value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.value === value && (
                      <Icon name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }

  // For Android, use native Picker
  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      )}
      <View
        style={[
          styles.pickerContainer,
          isDark ? styles.selectButtonDark : styles.selectButtonLight,
          error && styles.selectButtonError,
        ]}
      >
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          enabled={!disabled}
          style={[styles.picker, isDark && styles.pickerDark]}
          testID={testID}
        >
          <Picker.Item label={placeholder} value="" enabled={false} />
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000000',
  },
  labelDark: {
    color: '#FFFFFF',
  },
  selectButton: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  selectButtonLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C7C7CC',
  },
  selectButtonDark: {
    backgroundColor: '#1C1C1E',
    borderColor: '#3A3A3C',
  },
  selectButtonError: {
    borderColor: '#FF3B30',
  },
  selectButtonDisabled: {
    opacity: 0.5,
  },
  selectText: {
    fontSize: 16,
    color: '#000000',
  },
  selectTextDark: {
    color: '#FFFFFF',
  },
  placeholder: {
    color: '#8E8E93',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
  },
  picker: {
    height: 44,
  },
  pickerDark: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    maxHeight: '70%',
  },
  modalContentLight: {
    backgroundColor: '#FFFFFF',
  },
  modalContentDark: {
    backgroundColor: '#1C1C1E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  modalTitleDark: {
    color: '#FFFFFF',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  optionSelected: {
    backgroundColor: '#F2F2F7',
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
  },
  optionTextDark: {
    color: '#FFFFFF',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
});
