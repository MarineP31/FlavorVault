import { Stack } from 'expo-router';
import { HeaderBackButton } from '@/components/ui/HeaderBackButton';

export default function ImportLayout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => <HeaderBackButton />,
        headerTitle: '',
        headerTransparent: true,
      }}
    >
      <Stack.Screen name="url" />
    </Stack>
  );
}
