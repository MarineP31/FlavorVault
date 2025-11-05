/**
 * Confirmation Dialog Component
 * Reusable confirmation dialog for destructive actions
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'destructive' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
}

/**
 * Confirmation dialog with cancel and confirm actions
 * Task 7.1: Confirmation Dialog Component
 */
export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  testID = 'confirmation-dialog',
}: ConfirmationDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      testID={testID}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white dark:bg-[#1C1C1E] rounded-2xl w-[90%] max-w-[400px] overflow-hidden">
          {/* Header */}
          <View className="p-4 border-b border-[#C7C7CC] dark:border-[#3A3A3C]">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-black dark:text-white flex-1">
                {title}
              </Text>
              <TouchableOpacity
                onPress={onCancel}
                className="p-1"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                testID={`${testID}-close`}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Message */}
          <View className="p-4">
            <Text className="text-base text-[#3C3C43] dark:text-[#EBEBF5] leading-5">
              {message}
            </Text>
          </View>

          {/* Actions */}
          <View className="flex-row p-4 gap-3 border-t border-[#C7C7CC] dark:border-[#3A3A3C]">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-3 px-4 bg-surface-light dark:bg-[#2C2C2E] rounded-lg"
              testID={`${testID}-cancel`}
            >
              <Text className="text-center text-base font-semibold text-black dark:text-white">
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className={`flex-1 py-3 px-4 rounded-lg ${
                confirmVariant === 'destructive'
                  ? 'bg-red-500'
                  : 'bg-primary dark:bg-primary-dark'
              }`}
              testID={`${testID}-confirm`}
            >
              <Text className="text-center text-base font-semibold text-white">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
