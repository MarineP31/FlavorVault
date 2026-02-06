/**
 * Image Preview Component
 * Expandable image preview for OCR source image
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';

interface ImagePreviewProps {
  imageUri: string;
}

export function ImagePreview({ imageUri }: ImagePreviewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Pressable onPress={() => setExpanded(true)} style={styles.container}>
        <Image source={{ uri: imageUri }} style={styles.thumbnail} contentFit="cover" />
        <Text style={[styles.caption, isDark && styles.captionDark]}>Tap to expand image</Text>
      </Pressable>

      <Modal
        visible={expanded}
        animationType="fade"
        transparent
        onRequestClose={() => setExpanded(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.closeButton} onPress={() => setExpanded(false)}>
            <Icon name="close-circle" size={36} color="#FFFFFF" />
          </Pressable>
          <Image source={{ uri: imageUri }} style={styles.expandedImage} contentFit="contain" />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
  },
  thumbnail: {
    width: '100%',
    height: 150,
  },
  caption: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 8,
  },
  captionDark: {
    color: '#8E8E93',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  expandedImage: {
    width: '95%',
    height: '80%',
  },
});
