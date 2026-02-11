/**
 * Confidence Banner Component
 * Warning banner displayed when OCR confidence is low
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfidenceBannerProps {
  visible: boolean;
  onDismiss: () => void;
}

export function ConfidenceBanner({ visible, onDismiss }: ConfidenceBannerProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="warning" size={20} color="#92400E" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Low confidence detected</Text>
          <Text style={styles.subtitle}>Some text may need manual correction</Text>
        </View>
      </View>
      <Pressable onPress={onDismiss} hitSlop={8}>
        <Ionicons name="close" size={20} color="#92400E" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  subtitle: {
    fontSize: 12,
    color: '#92400E',
    opacity: 0.8,
  },
});
