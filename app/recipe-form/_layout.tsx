/**
 * Recipe Form Layout
 * Stack navigator for recipe create and edit screens
 */

import { Stack } from 'expo-router';
import { HeaderBackButton } from '@/components/ui/HeaderBackButton';

export default function RecipeFormLayout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => <HeaderBackButton />,
        headerTitle: '',
        headerTransparent: true,
      }}
    >
      <Stack.Screen name="create" />
      <Stack.Screen name="edit/[id]" />
    </Stack>
  );
}
