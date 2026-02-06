/**
 * OCR Flow Layout
 * Stack navigator for the OCR capture and review screens
 */

import { Stack } from 'expo-router';
import { HeaderBackButton } from '@/components/ui/HeaderBackButton';

export default function OCRLayout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => <HeaderBackButton />,
        headerTitle: '',
        headerTransparent: true,
      }}
    >
      <Stack.Screen name="capture" />
      <Stack.Screen name="review" />
    </Stack>
  );
}
