/**
 * OCR Capture Screen
 * Photo capture/selection screen for recipe scanning
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

import { extractTextFromImage } from '@/lib/ocr/text-extractor-service';
import { parseRecipeText } from '@/lib/ocr/recipe-parser';
import { Button } from '@/components/ui/Button';

type ProcessingState = 'idle' | 'extracting' | 'parsing';
type ImageSource = 'camera' | 'library' | null;

export default function OCRCaptureScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<ImageSource>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in your device settings to scan recipes.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo Library Permission Required',
        'Please enable photo library access in your device settings to select recipe images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setImageSource('camera');
    }
  };

  const handleSelectFromLibrary = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setImageSource('library');
    }
  };

  const handleRetake = () => {
    if (imageSource === 'library') {
      handleSelectFromLibrary();
    } else {
      handleTakePhoto();
    }
  };

  const handleProcessImage = async () => {
    if (!selectedImage) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProcessingState('extracting');

    try {
      const extractionResult = await extractTextFromImage(selectedImage);

      if (!extractionResult.success) {
        Alert.alert(
          'Extraction Failed',
          extractionResult.error || 'Could not extract text from image. Please try a clearer photo.',
          [{ text: 'OK' }]
        );
        setProcessingState('idle');
        return;
      }

      setProcessingState('parsing');
      const parsedRecipe = parseRecipeText(extractionResult.text);

      router.push({
        pathname: '/ocr/review',
        params: {
          imageUri: selectedImage,
          parsedRecipe: JSON.stringify(parsedRecipe),
          ocrConfidence: extractionResult.confidence.toString(),
        },
      });
    } catch (error) {
      console.error('OCR processing error:', error);
      Alert.alert(
        'Processing Error',
        'An error occurred while processing the image. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessingState('idle');
    }
  };

  const handleClearImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedImage(null);
    setImageSource(null);
  };

  const isProcessing = processingState !== 'idle';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {selectedImage ? (
        <>
          <View style={styles.previewContainer}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} contentFit="contain" />
              <Pressable style={styles.clearButton} onPress={handleClearImage} disabled={isProcessing}>
                <Icon name="close-circle" size={32} color="#FF3B30" />
              </Pressable>
            </View>
          </View>

          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={[styles.processingText, isDark && styles.textDark]}>
                {processingState === 'extracting' ? 'Extracting text...' : 'Parsing recipe...'}
              </Text>
            </View>
          ) : (
            <View style={[styles.footer, isDark && styles.footerDark]}>
              <Button
                title="Retake"
                variant="outline"
                onPress={handleRetake}
                style={styles.actionButton}
              />
              <Button
                title="Continue"
                variant="primary"
                onPress={handleProcessImage}
                style={styles.actionButton}
              />
            </View>
          )}
        </>
      ) : (
        <View style={styles.selectionContainer}>
          <View style={styles.iconContainer}>
            <Icon name="scan-outline" size={64} color="#FF6B35" />
          </View>

          <Text style={[styles.title, isDark && styles.textDark]}>Scan a Recipe</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Take a photo or select an image of a recipe to extract the text
          </Text>

          <View style={styles.optionsContainer}>
            <Pressable
              style={({ pressed }) => [styles.optionCard, pressed && styles.optionCardPressed]}
              onPress={handleTakePhoto}
            >
              <View style={styles.optionIconCircle}>
                <Icon name="camera" size={32} color="#FF6B35" />
              </View>
              <Text style={[styles.optionTitle, isDark && styles.textDark]}>Take Photo</Text>
              <Text style={[styles.optionSubtitle, isDark && styles.subtitleDark]}>
                Use camera to capture
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.optionCard, pressed && styles.optionCardPressed]}
              onPress={handleSelectFromLibrary}
            >
              <View style={styles.optionIconCircle}>
                <Icon name="images" size={32} color="#FF6B35" />
              </View>
              <Text style={[styles.optionTitle, isDark && styles.textDark]}>Photo Library</Text>
              <Text style={[styles.optionSubtitle, isDark && styles.subtitleDark]}>
                Select from gallery
              </Text>
            </Pressable>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={[styles.tipsTitle, isDark && styles.textDark]}>Tips for best results:</Text>
            <Text style={[styles.tipText, isDark && styles.subtitleDark]}>
              • Ensure good lighting
            </Text>
            <Text style={[styles.tipText, isDark && styles.subtitleDark]}>
              • Keep the recipe flat and in focus
            </Text>
            <Text style={[styles.tipText, isDark && styles.subtitleDark]}>
              • Avoid shadows on the text
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  selectionContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  textDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 40,
  },
  subtitleDark: {
    color: '#8E8E93',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  optionCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  optionIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  footerDark: {
    backgroundColor: '#000000',
    borderTopColor: '#3A3A3C',
  },
  actionButton: {
    flex: 1,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#000000',
  },
});
