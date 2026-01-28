/**
 * OCR Flow Layout
 * Stack navigator for the OCR capture and review screens
 */

import { Stack } from 'expo-router';

export default function OCRLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="capture"
        options={{
          title: 'Scan Recipe',
          headerBackTitle: 'Cancel',
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          title: 'OCR Review',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
