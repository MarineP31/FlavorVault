/**
 * Confidence Bar Component
 * Progress bar showing OCR confidence percentage
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { getProgressBarColor, getConfidenceLevel, getConfidenceSummary } from '@/lib/ocr/confidence-scorer';

interface ConfidenceBarProps {
  confidence: number;
  showSummary?: boolean;
}

export function ConfidenceBar({ confidence, showSummary = true }: ConfidenceBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const percentage = Math.round(confidence * 100);
  const barColor = getProgressBarColor(confidence);
  const level = getConfidenceLevel(confidence);
  const summary = getConfidenceSummary(level);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, isDark && styles.labelDark]}>OCR Confidence</Text>
        <Text style={[styles.percentage, { color: barColor }]}>{percentage}%</Text>
      </View>

      <View style={[styles.track, isDark && styles.trackDark]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      {showSummary && (
        <Text style={[styles.summary, isDark && styles.summaryDark]}>{summary}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  labelDark: {
    color: '#FFFFFF',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  track: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackDark: {
    backgroundColor: '#3A3A3C',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  summary: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 6,
  },
  summaryDark: {
    color: '#8E8E93',
  },
});
