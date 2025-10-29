/**
 * Dialog component
 * Modal dialog for confirmations and alerts
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Button } from './button';

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  confirmVariant?: 'primary' | 'destructive';
  showCancel?: boolean;
}

/**
 * Dialog component for alerts and confirmations
 */
export function Dialog({
  visible,
  onClose,
  title,
  description,
  children,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  confirmVariant = 'primary',
  showCancel = true,
}: DialogProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.dialog,
            isDark ? styles.dialogDark : styles.dialogLight,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.content}>
            <Text style={[styles.title, isDark && styles.titleDark]}>
              {title}
            </Text>
            {description && (
              <Text
                style={[styles.description, isDark && styles.descriptionDark]}
              >
                {description}
              </Text>
            )}
            {children}
          </View>

          <View style={styles.actions}>
            {showCancel && (
              <Button
                title={cancelLabel}
                onPress={onClose}
                variant="outline"
                style={styles.button}
              />
            )}
            <Button
              title={confirmLabel}
              onPress={handleConfirm}
              variant={confirmVariant}
              style={styles.button}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    borderRadius: 14,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  dialogLight: {
    backgroundColor: '#FFFFFF',
  },
  dialogDark: {
    backgroundColor: '#1C1C1E',
  },
  content: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000000',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8E8E93',
  },
  descriptionDark: {
    color: '#8E8E93',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
