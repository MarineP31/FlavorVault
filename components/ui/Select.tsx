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
          <View style={styles.chevronContainer}>
            <Icon
              name="chevron-down"
              size={18}
              color={isDark ? '#8E8E93' : '#6D6D72'}
            />
          </View>
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
              <View style={styles.handleContainer}>
                <View style={[styles.handle, isDark && styles.handleDark]} />
              </View>
              <View
                style={[
                  styles.modalHeader,
                  isDark && styles.modalHeaderDark,
                ]}
              >
                <Text
                  style={[styles.modalTitle, isDark && styles.modalTitleDark]}
                >
                  {label || 'Select'}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.optionsList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.optionsListContent}
              >
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      isDark && styles.optionDark,
                      option.value === value && (isDark ? styles.optionSelectedDark : styles.optionSelected),
                      index === options.length - 1 && styles.optionLast,
                    ]}
                    onPress={() => {
                      onChange(option.value);
                      setShowModal(false);
                    }}
                    activeOpacity={0.6}
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
                      <View style={styles.checkmarkContainer}>
                        <Icon name="checkmark-circle" size={22} color="#007AFF" />
                      </View>
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
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
  },
  selectButtonLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5EA',
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
    flex: 1,
  },
  selectTextDark: {
    color: '#FFFFFF',
  },
  placeholder: {
    color: '#A0A0A5',
  },
  chevronContainer: {
    marginLeft: 8,
    opacity: 0.8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 34,
  },
  modalContentLight: {
    backgroundColor: '#FFFFFF',
  },
  modalContentDark: {
    backgroundColor: '#2C2C2E',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  handleDark: {
    backgroundColor: '#4A4A4C',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalHeaderDark: {
    borderBottomColor: '#3A3A3C',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.4,
  },
  modalTitleDark: {
    color: '#FFFFFF',
  },
  doneButton: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionsListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  optionDark: {
    backgroundColor: 'transparent',
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionSelected: {
    backgroundColor: '#F2F2F7',
  },
  optionSelectedDark: {
    backgroundColor: '#3A3A3C',
  },
  optionText: {
    fontSize: 17,
    color: '#000000',
    letterSpacing: -0.4,
  },
  optionTextDark: {
    color: '#FFFFFF',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
  checkmarkContainer: {
    marginLeft: 12,
  },
});
