/**
 * Parsed Recipe Section Component
 * Section container with confidence-based border color
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { ConfidenceLevel, getConfidenceColor, getConfidenceLabel } from '@/lib/ocr/confidence-scorer';

interface ParsedRecipeSectionProps {
  title: string;
  confidenceLevel: ConfidenceLevel;
  children: React.ReactNode;
}

export function ParsedRecipeSection({ title, confidenceLevel, children }: ParsedRecipeSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = getConfidenceColor(confidenceLevel);
  const label = getConfidenceLabel(confidenceLevel);

  return (
    <View style={[styles.container, { borderLeftColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
      </View>
      <Text style={styles.confidenceLabel}>{title} - {label}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginBottom: 20,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  content: {
    marginTop: 4,
  },
});
