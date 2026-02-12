import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
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
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();

  const pendingShareIntentUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    if (hasShareIntent) {
      const url = shareIntent?.webUrl || shareIntent?.text;
      if (url && /^https?:\/\//i.test(url)) {
        pendingShareIntentUrl.current = url;
      }
    }
  }, [hasShareIntent, shareIntent]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const sharedUrl = pendingShareIntentUrl.current;

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (sharedUrl) {
      pendingShareIntentUrl.current = null;
      router.push({
        pathname: '/import/url',
        params: { sharedUrl: encodeURIComponent(sharedUrl) },
      });
      setTimeout(() => resetShareIntent(), 500);
      return;
    }

    if (inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, hasShareIntent, shareIntent]);

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
            <Stack.Screen name="import" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </BottomSheetModalProvider>
    </AuthenticatedProviders>
  );
}

export default function RootLayout() {
  return (
    <ShareIntentProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ToastProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </ToastProvider>
      </GestureHandlerRootView>
    </ShareIntentProvider>
  );
}
