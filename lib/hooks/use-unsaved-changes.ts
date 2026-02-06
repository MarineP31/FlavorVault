/**
 * useUnsavedChanges Hook
 * Task Group 6.2-6.3: Custom hook for unsaved changes detection and navigation guard
 *
 * Provides:
 * - isDirty state tracking
 * - Navigation interception with usePreventRemove
 * - Android back button handling
 * - Unsaved changes Alert dialog
 */

import { useEffect, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { usePreventRemove } from '@react-navigation/native';

export interface UseUnsavedChangesOptions {
  /**
   * Whether the form has unsaved changes
   */
  isDirty: boolean;

  /**
   * Callback to save the form
   * Should handle validation and save logic
   */
  onSave: () => void | Promise<void>;
}

export interface UseUnsavedChangesReturn {
  /**
   * Current dirty state
   */
  isDirty: boolean;

  /**
   * Show the unsaved changes dialog
   */
  showUnsavedChangesDialog: () => void;

  /**
   * Handle Android back button press
   * Returns true to prevent default behavior, false to allow it
   */
  handleBackPress: () => boolean;
}

/**
 * Hook to handle unsaved changes in forms
 *
 * Features:
 * - Intercepts navigation when form has unsaved changes
 * - Shows Alert dialog with Save/Discard/Cancel options
 * - Handles Android back button
 * - Works with iOS swipe-back gesture
 *
 * @param options Configuration options
 * @returns Unsaved changes utilities
 *
 * @example
 * ```tsx
 * const { isDirty, showUnsavedChangesDialog, handleBackPress } = useUnsavedChanges({
 *   isDirty: formIsDirty,
 *   onSave: handleSaveForm,
 * });
 * ```
 */
export function useUnsavedChanges({
  isDirty,
  onSave,
}: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
  const router = useRouter();

  /**
   * Show unsaved changes Alert dialog
   * Presents three options: Save, Discard, Cancel
   */
  const showUnsavedChangesDialog = useCallback(() => {
    Alert.alert(
      'Unsaved Changes',
      'You have unsaved changes. What would you like to do?',
      [
        {
          text: 'Save',
          onPress: async () => {
            await onSave();
          },
          style: 'default',
        },
        {
          text: 'Discard',
          onPress: () => {
            router.back();
          },
          style: 'destructive',
        },
        {
          text: 'Cancel',
          onPress: () => {
            // Do nothing - stay on form
          },
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }, [onSave, router]);

  /**
   * Intercept navigation when form has unsaved changes
   * Uses React Navigation's usePreventRemove hook
   * Works with iOS swipe-back gesture and header back button
   */
  usePreventRemove(isDirty, ({ data }) => {
    showUnsavedChangesDialog();
  });

  /**
   * Handle Android back button press
   * Returns true to prevent default behavior when form is dirty
   * Returns false to allow default behavior when form is clean
   */
  const handleBackPress = useCallback((): boolean => {
    if (isDirty) {
      showUnsavedChangesDialog();
      return true; // Prevent default back behavior
    }
    return false; // Allow default back behavior
  }, [isDirty, showUnsavedChangesDialog]);

  /**
   * Set up Android back button handler
   * Listens for hardwareBackPress event
   * Cleanup on unmount to prevent memory leaks
   */
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => backHandler.remove();
  }, [handleBackPress]);

  return {
    isDirty,
    showUnsavedChangesDialog,
    handleBackPress,
  };
}
