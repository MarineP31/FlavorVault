import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import 'react-native-reanimated';

import '../global.css';

SplashScreen.preventAutoHideAsync();

import '@/lib/utils/crypto-polyfill';

import { useColorScheme } from '@/lib/hooks/use-color-scheme';
import { ToastProvider } from '@/components/ui/Toast';
import { ShoppingListProvider } from '@/lib/contexts/shopping-list-context';
import { MealPlanProvider } from '@/lib/contexts/meal-plan-context';
import { AuthProvider, useAuth } from '@/lib/auth/auth-context';
import { SubscriptionProvider } from '@/lib/contexts/subscription-context';
import { seedService } from '@/lib/db/services/seed-service';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthenticatedProviders({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const hasSeeded = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasSeeded.current) {
      hasSeeded.current = true;
      seedService.seedDefaultRecipes();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <SubscriptionProvider>
      <ShoppingListProvider>
        <MealPlanProvider>{children}</MealPlanProvider>
      </ShoppingListProvider>
    </SubscriptionProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return null;
  }

  return (
    <AuthenticatedProviders>
      <BottomSheetModalProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="recipe-form" options={{ headerShown: false }} />
            <Stack.Screen name="ocr" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </BottomSheetModalProvider>
    </AuthenticatedProviders>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}
