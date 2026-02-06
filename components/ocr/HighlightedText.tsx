/**
 * Highlighted Text Component
 * Text with yellow highlight for low confidence items
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

interface HighlightedTextProps {
  text: string;
  highlighted: boolean;
  prefix?: string;
}

export function HighlightedText({ text, highlighted, prefix }: HighlightedTextProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, highlighted && styles.highlighted]}>
      <Text style={[styles.text, isDark && styles.textDark]}>
        {prefix && <Text style={styles.prefix}>{prefix} </Text>}
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginVertical: 2,
  },
  highlighted: {
    backgroundColor: '#FEF3C7',
  },
  text: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
  },
  textDark: {
    color: '#FFFFFF',
  },
  prefix: {
    fontWeight: '600',
  },
});
