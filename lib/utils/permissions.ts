/**
 * Permission utilities for camera and photo library access
 */

import * as ImagePicker from 'expo-image-picker';
import { PermissionStatus } from 'expo-modules-core';
import { Alert, Linking, Platform } from 'react-native';

/**
 * Request camera permissions
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status === 'granted') {
      return true;
    }

    if (status === 'denied') {
      showPermissionDeniedAlert('camera');
    }

    return false;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === 'granted') {
      return true;
    }

    if (status === 'denied') {
      showPermissionDeniedAlert('photo library');
    }

    return false;
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    return false;
  }
}

/**
 * Check camera permission status
 */
export async function getCameraPermissionStatus(): Promise<ImagePicker.PermissionStatus> {
  try {
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Error checking camera permission:', error);
    return PermissionStatus.UNDETERMINED;
  }
}

/**
 * Check media library permission status
 */
export async function getMediaLibraryPermissionStatus(): Promise<ImagePicker.PermissionStatus> {
  try {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Error checking media library permission:', error);
    return PermissionStatus.UNDETERMINED;
  }
}

/**
 * Show alert when permission is denied
 */
function showPermissionDeniedAlert(permissionType: 'camera' | 'photo library'): void {
  Alert.alert(
    'Permission Required',
    `This app needs ${permissionType} access to ${
      permissionType === 'camera' ? 'take photos of' : 'select images for'
    } your recipes. Please enable ${permissionType} access in your device settings.`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        },
      },
    ]
  );
}

/**
 * Check if all required permissions are granted
 */
export async function checkAllPermissions(): Promise<{
  camera: boolean;
  mediaLibrary: boolean;
}> {
  const cameraStatus = await getCameraPermissionStatus();
  const mediaLibraryStatus = await getMediaLibraryPermissionStatus();

  return {
    camera: cameraStatus === 'granted',
    mediaLibrary: mediaLibraryStatus === 'granted',
  };
}

/**
 * Request all required permissions
 */
export async function requestAllPermissions(): Promise<{
  camera: boolean;
  mediaLibrary: boolean;
}> {
  const camera = await requestCameraPermission();
  const mediaLibrary = await requestMediaLibraryPermission();

  return {
    camera,
    mediaLibrary,
  };
}
