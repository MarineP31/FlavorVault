import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button } from '@/components/ui/Button';
import { parseRecipeFromUrl } from '@/lib/import/recipe-url-parser';

type ImportState =
  | { status: 'loading' }
  | { status: 'error'; message: string; sourceUrl: string };

export default function ImportUrlScreen() {
  const { sharedUrl } = useLocalSearchParams<{ sharedUrl: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [state, setState] = useState<ImportState>({ status: 'loading' });

  const importRecipe = async (url: string) => {
    setState({ status: 'loading' });

    const result = await parseRecipeFromUrl(url);

    if (result.success && result.data) {
      const ocrData = JSON.stringify({
        title: result.data.title || '',
        ingredients: (result.data.ingredients || []).map((ing) => ({
          name: ing.name,
          quantity: ing.quantity ?? null,
          unit: ing.unit ?? null,
        })),
        steps: result.data.steps || [],
        servings: result.data.servings || 4,
        category: result.data.category || 'dinner',
        prepTime: result.data.prepTime ?? null,
        cookTime: result.data.cookTime ?? null,
        imageUri: result.data.imageUri ?? null,
        source: result.data.source ?? url,
      });

      router.replace({
        pathname: '/recipe-form/create',
        params: { ocrData },
      });
    } else {
      setState({
        status: 'error',
        message: result.error || 'Failed to import recipe',
        sourceUrl: url,
      });
    }
  };

  useEffect(() => {
    if (sharedUrl) {
      importRecipe(decodeURIComponent(sharedUrl));
    } else {
      setState({
        status: 'error',
        message: 'No URL provided',
        sourceUrl: '',
      });
    }
  }, [sharedUrl]);

  if (state.status === 'loading') {
    return (
      <View style={[styles.container, isDark && styles.containerDark, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={[styles.loadingText, isDark && styles.textDark]}>
            Importing recipe...
          </Text>
          <Text style={[styles.subText, isDark && styles.subTextDark]}>
            Fetching recipe data from URL
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
          <Icon name="alert-circle-outline" size={48} color="#FF6B35" />
        </View>
        <Text style={[styles.errorTitle, isDark && styles.textDark]}>
          Couldn't import recipe
        </Text>
        <Text style={[styles.errorMessage, isDark && styles.subTextDark]}>
          {state.message}
        </Text>
        <View style={styles.actions}>
          <Button
            title="Try Again"
            variant="outline"
            onPress={() => {
              if (state.sourceUrl) importRecipe(state.sourceUrl);
            }}
            style={styles.button}
          />
          <Button
            title="Add Manually"
            variant="primary"
            onPress={() => {
              const ocrData = state.sourceUrl
                ? JSON.stringify({ source: state.sourceUrl })
                : undefined;
              router.replace({
                pathname: '/recipe-form/create',
                params: ocrData ? { ocrData } : undefined,
              });
            }}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 20,
  },
  subText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  subTextDark: {
    color: '#8E8E93',
  },
  textDark: {
    color: '#FFFFFF',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainerDark: {
    backgroundColor: '#3A2A20',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
  },
});
