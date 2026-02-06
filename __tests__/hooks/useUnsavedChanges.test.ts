/**
 * Tests for useUnsavedChanges Hook
 * Task Group 6.1: Test unsaved changes detection logic
 */

import { renderHook, act } from '@testing-library/react-native';
import { Alert, BackHandler } from 'react-native';

// Mock expo-router
const mockRouterBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    back: mockRouterBack,
    push: jest.fn(),
  })),
}));

// Mock usePreventRemove from @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  usePreventRemove: jest.fn(),
}));

// Import after mocks are set up
import { useUnsavedChanges } from '@/lib/hooks/use-unsaved-changes';

// Mock BackHandler
const mockBackHandlerRemove = jest.fn();
const mockBackHandlerAddEventListener = jest.spyOn(BackHandler, 'addEventListener').mockImplementation(() => ({
  remove: mockBackHandlerRemove,
}));

describe('useUnsavedChanges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: isDirty is false when no changes
  it('should return isDirty as false when there are no changes', () => {
    const { result } = renderHook(() =>
      useUnsavedChanges({
        isDirty: false,
        onSave: jest.fn(),
      })
    );

    expect(result.current.isDirty).toBe(false);
  });

  // Test 2: isDirty is true when changes exist
  it('should return isDirty as true when changes exist', () => {
    const { result } = renderHook(() =>
      useUnsavedChanges({
        isDirty: true,
        onSave: jest.fn(),
      })
    );

    expect(result.current.isDirty).toBe(true);
  });

  // Test 3: showUnsavedChangesDialog displays Alert with correct options
  it('should show unsaved changes dialog with Save/Discard/Cancel options', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const mockOnSave = jest.fn();
    const { result } = renderHook(() =>
      useUnsavedChanges({
        isDirty: true,
        onSave: mockOnSave,
      })
    );

    act(() => {
      result.current.showUnsavedChangesDialog();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Unsaved Changes',
      'You have unsaved changes. What would you like to do?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Save' }),
        expect.objectContaining({ text: 'Discard' }),
        expect.objectContaining({ text: 'Cancel' }),
      ]),
      expect.any(Object)
    );

    alertSpy.mockRestore();
  });

  // Test 4: Save button calls onSave callback
  it('should call onSave when Save button is pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const mockOnSave = jest.fn();
    const { result } = renderHook(() =>
      useUnsavedChanges({
        isDirty: true,
        onSave: mockOnSave,
      })
    );

    act(() => {
      result.current.showUnsavedChangesDialog();
    });

    // Get the Save button's onPress callback
    const alertCall = alertSpy.mock.calls[0];
    const buttons = alertCall[2] as any[];
    const saveButton = buttons.find((btn: any) => btn.text === 'Save');

    // Simulate pressing Save
    act(() => {
      saveButton.onPress();
    });

    expect(mockOnSave).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  // Test 5: Discard button navigates back
  it('should navigate back when Discard button is pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { result } = renderHook(() =>
      useUnsavedChanges({
        isDirty: true,
        onSave: jest.fn(),
      })
    );

    act(() => {
      result.current.showUnsavedChangesDialog();
    });

    // Get the Discard button's onPress callback
    const alertCall = alertSpy.mock.calls[0];
    const buttons = alertCall[2] as any[];
    const discardButton = buttons.find((btn: any) => btn.text === 'Discard');

    // Simulate pressing Discard
    act(() => {
      discardButton.onPress();
    });

    expect(mockRouterBack).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  // Test 6: Cancel button does nothing (stays on form)
  it('should do nothing when Cancel button is pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const mockOnSave = jest.fn();
    const { result } = renderHook(() =>
      useUnsavedChanges({
        isDirty: true,
        onSave: mockOnSave,
      })
    );

    act(() => {
      result.current.showUnsavedChangesDialog();
    });

    // Get the Cancel button's onPress callback
    const alertCall = alertSpy.mock.calls[0];
    const buttons = alertCall[2] as any[];
    const cancelButton = buttons.find((btn: any) => btn.text === 'Cancel');

    // Simulate pressing Cancel
    act(() => {
      cancelButton.onPress();
    });

    // Should not call onSave or navigate back
    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockRouterBack).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  // Test 7: handleBackPress returns true when dirty (prevents default)
  it('should return true from handleBackPress when form is dirty', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { result } = renderHook(() =>
      useUnsavedChanges({
        isDirty: true,
        onSave: jest.fn(),
      })
    );

    const shouldPreventDefault = result.current.handleBackPress();

    expect(shouldPreventDefault).toBe(true);
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  // Test 8: handleBackPress returns false when not dirty (allows default)
  it('should return false from handleBackPress when form is not dirty', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { result } = renderHook(() =>
      useUnsavedChanges({
        isDirty: false,
        onSave: jest.fn(),
      })
    );

    const shouldPreventDefault = result.current.handleBackPress();

    expect(shouldPreventDefault).toBe(false);
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  // Test 9: BackHandler is set up and cleaned up properly
  it('should register and remove BackHandler listener', () => {
    const { unmount } = renderHook(() =>
      useUnsavedChanges({
        isDirty: true,
        onSave: jest.fn(),
      })
    );

    // Should register the listener
    expect(mockBackHandlerAddEventListener).toHaveBeenCalledWith(
      'hardwareBackPress',
      expect.any(Function)
    );

    // Should clean up on unmount
    unmount();
    expect(mockBackHandlerRemove).toHaveBeenCalled();
  });
});
