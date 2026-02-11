/**
 * Image Picker Button Component
 * Component for selecting images from camera or photo library
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {
  requestCameraPermission,
  requestMediaLibraryPermission,
} from '@/lib/utils/permissions';
import { saveImageToStorage } from '@/lib/utils/image-processor';
import { validateImageFile } from '@/lib/supabase/image-storage';

interface ImagePickerButtonProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
  error?: string;
}

export function ImagePickerButton({
  imageUri,
  onImageSelected,
  onImageRemoved,
  error,
}: ImagePickerButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isProcessing, setIsProcessing] = useState(false);

  const showImageSourceOptions = () => {
    Alert.alert('Select Image Source', 'Choose where to get your recipe image', [
      {
        text: 'Take Photo',
        onPress: handleCameraPress,
      },
      {
        text: 'Choose from Library',
        onPress: handleLibraryPress,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const handleCameraPress = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        return;
      }

      setIsProcessing(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLibraryPress = async () => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        return;
      }

      setIsProcessing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processImage = async (uri: string) => {
    try {
      const validation = await validateImageFile(uri);
      if (!validation.valid) {
        Alert.alert('Image Error', validation.error || 'Invalid image file.');
        return;
      }

      const savedUri = await saveImageToStorage(uri);
      onImageSelected(savedUri);
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    }
  };

  const handleRemoveImage = () => {
    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: onImageRemoved,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.imagePreview}
            accessible={true}
            accessibilityLabel="Recipe image preview"
            accessibilityRole="image"
          />
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isDark ? styles.actionButtonDark : styles.actionButtonLight,
              ]}
              onPress={showImageSourceOptions}
              disabled={isProcessing}
              accessible={true}
              accessibilityLabel="Change recipe image"
              accessibilityHint="Opens options to take a new photo or choose from library"
              accessibilityRole="button"
            >
              <Ionicons name="camera-outline" size={20} color="#FF6B35" />
              <Text
                style={[
                  styles.actionButtonText,
                  isDark && styles.actionButtonTextDark,
                ]}
              >
                Change Image
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.removeButton,
                isDark && styles.removeButtonDark,
              ]}
              onPress={handleRemoveImage}
              disabled={isProcessing}
              accessible={true}
              accessibilityLabel="Remove recipe image"
              accessibilityHint="Removes the current recipe image"
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.uploadButton,
            isDark ? styles.uploadButtonDark : styles.uploadButtonLight,
            error && styles.uploadButtonError,
          ]}
          onPress={showImageSourceOptions}
          disabled={isProcessing}
          accessible={true}
          accessibilityLabel="Add recipe image"
          accessibilityHint="Opens options to take a photo or choose from library"
          accessibilityRole="button"
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <>
              <Ionicons
                name="camera-outline"
                size={36}
                color={isDark ? '#FF8C5A' : '#FF6B35'}
              />
              <Text
                style={[
                  styles.uploadButtonText,
                  isDark && styles.uploadButtonTextDark,
                ]}
              >
                Add Recipe Image
              </Text>
              <Text style={styles.uploadButtonSubtext}>
                Take a photo or choose from library
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  labelDark: {
    color: '#FFFFFF',
  },
  uploadButton: {
    height: 180,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadButtonLight: {
    backgroundColor: '#FFF9F6',
    borderColor: '#FFD4C4',
  },
  uploadButtonDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#3A3A3C',
  },
  uploadButtonError: {
    borderColor: '#FF3B30',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    color: '#000000',
  },
  uploadButtonTextDark: {
    color: '#FFFFFF',
  },
  uploadButtonSubtext: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  imagePreviewContainer: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonLight: {
    backgroundColor: '#FFF5F0',
  },
  actionButtonDark: {
    backgroundColor: '#2C2C2E',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  actionButtonTextDark: {
    color: '#FF8C5A',
  },
  removeButton: {
    backgroundColor: '#FFE5E5',
  },
  removeButtonDark: {
    backgroundColor: '#3A2C2C',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});
