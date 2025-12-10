import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import 'react-native-reanimated';

// Import Nativewind global styles
import '../global.css';

// Import crypto polyfill BEFORE any code that uses uuid
import '@/lib/utils/crypto-polyfill';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { initializeDatabase } from '@/lib/db';
import { ToastProvider } from '@/components/ui/Toast';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    async function initDb() {
      try {
        await initializeDatabase();
        setIsDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Still set ready to true to allow app to load
        setIsDbReady(true);
      }
    }

    initDb();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <BottomSheetModalProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen name="recipe/[id]" options={{ headerShown: true }} />
              <Stack.Screen name="recipes/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="recipe-form/create" options={{ headerShown: true }} />
              <Stack.Screen name="recipe-form/edit/[id]" options={{ headerShown: true }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}
