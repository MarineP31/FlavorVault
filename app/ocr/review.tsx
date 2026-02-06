/**
 * OCR Review Screen
 * Review and edit OCR-extracted recipe data before saving
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { MeasurementUnit } from '@/constants/enums';
import { ConfidenceBanner } from '@/components/ocr/ConfidenceBanner';
import { ConfidenceBar } from '@/components/ocr/ConfidenceBar';
import { ImagePreview } from '@/components/ocr/ImagePreview';
import { ParsedRecipeSection } from '@/components/ocr/ParsedRecipeSection';
import { HighlightedText } from '@/components/ocr/HighlightedText';
import { Button } from '@/components/ui/Button';
import {
  getConfidenceLevel,
  shouldShowWarningBanner,
  isIngredientLowConfidence,
  isInstructionLowConfidence,
} from '@/lib/ocr/confidence-scorer';
import type { ParsedRecipe } from '@/lib/ocr/recipe-parser';
import {
  safeParseParsedRecipe,
  hasMinimumRecipeData,
} from '@/lib/ocr/schemas/ocr-result-schema';

const HEADER_BUTTON_SIZE = 48;
const HEADER_PADDING = 16;

export default function OCRReviewScreen() {
  const params = useLocalSearchParams<{
    imageUri: string;
    parsedRecipe: string;
    ocrConfidence: string;
  }>();

  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const contentTopPadding = insets.top + HEADER_BUTTON_SIZE + HEADER_PADDING;

  const parseResult = useMemo(
    () => safeParseParsedRecipe(params.parsedRecipe),
    [params.parsedRecipe]
  );

  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipe | null>(
    parseResult.success ? (parseResult.data as ParsedRecipe) : null
  );
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const ocrConfidence = parseFloat(params.ocrConfidence || '0');

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!parsedRecipe) {
      Alert.alert('Error', 'No recipe data to continue with.');
      return;
    }

    if (!hasMinimumRecipeData(parsedRecipe)) {
      Alert.alert(
        'Insufficient Data',
        'The scan did not detect enough recipe information. Please try scanning again or enter the recipe manually.',
        [
          { text: 'Go Back', onPress: handleGoBack },
          { text: 'Continue Anyway', onPress: navigateToForm },
        ]
      );
      return;
    }

    navigateToForm();
  };

  const navigateToForm = () => {
    if (!parsedRecipe) return;
    const ingredients = parsedRecipe.ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
    }));

    const steps = parsedRecipe.instructions.map((inst) => inst.step);

    router.push({
      pathname: '/recipe-form/create',
      params: {
        ocrData: JSON.stringify({
          title: parsedRecipe.title,
          ingredients,
          steps,
          servings: parsedRecipe.metadata.servings || 4,
          category: parsedRecipe.metadata.category,
          prepTime: parsedRecipe.metadata.prepTime,
          cookTime: parsedRecipe.metadata.cookTime,
          imageUri: params.imageUri,
        }),
      },
    });
  };

  if (!parsedRecipe) {
    return (
      <View style={[styles.container, isDark && styles.containerDark, styles.errorContainer]}>
        <Text style={[styles.errorText, isDark && styles.textDark]}>
          Failed to parse recipe data
        </Text>
        <Text style={[styles.errorSubtext, isDark && styles.errorSubtextDark]}>
          {parseResult.error || 'Unknown error'}
        </Text>
        <Button title="Go Back" variant="primary" onPress={handleGoBack} style={styles.errorButton} />
      </View>
    );
  }

  const titleConfidenceLevel = getConfidenceLevel(parsedRecipe.titleConfidence);
  const ingredientsConfidenceLevel = getConfidenceLevel(parsedRecipe.ingredientsConfidence);
  const instructionsConfidenceLevel = getConfidenceLevel(parsedRecipe.instructionsConfidence);
  const showBanner = !bannerDismissed && shouldShowWarningBanner(parsedRecipe);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: contentTopPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <ConfidenceBanner visible={showBanner} onDismiss={() => setBannerDismissed(true)} />

        <ImagePreview imageUri={params.imageUri} />

        <ConfidenceBar confidence={ocrConfidence} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Extracted Text</Text>
        </View>

        <ParsedRecipeSection title="Recipe Title" confidenceLevel={titleConfidenceLevel}>
          <Text style={[styles.titleText, isDark && styles.textDark]}>{parsedRecipe.title}</Text>
        </ParsedRecipeSection>

        <ParsedRecipeSection title="Ingredients" confidenceLevel={ingredientsConfidenceLevel}>
          {parsedRecipe.ingredients.length > 0 ? (
            parsedRecipe.ingredients.map((ingredient, index) => (
              <HighlightedText
                key={index}
                text={formatIngredient(ingredient)}
                highlighted={isIngredientLowConfidence(ingredient)}
                prefix="•"
              />
            ))
          ) : (
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              No ingredients detected
            </Text>
          )}
        </ParsedRecipeSection>

        <ParsedRecipeSection title="Instructions" confidenceLevel={instructionsConfidenceLevel}>
          {parsedRecipe.instructions.length > 0 ? (
            parsedRecipe.instructions.map((instruction, index) => (
              <HighlightedText
                key={index}
                text={instruction.step}
                highlighted={isInstructionLowConfidence(instruction)}
                prefix={`${instruction.stepNumber}.`}
              />
            ))
          ) : (
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              No instructions detected
            </Text>
          )}
        </ParsedRecipeSection>

        {(parsedRecipe.metadata.prepTime ||
          parsedRecipe.metadata.cookTime ||
          parsedRecipe.metadata.servings) && (
          <View style={styles.metadataSection}>
            <Text style={[styles.metadataTitle, isDark && styles.textDark]}>
              Additional Details
            </Text>
            {parsedRecipe.metadata.prepTime && (
              <Text style={[styles.metadataText, isDark && styles.metadataTextDark]}>
                Prep time: {parsedRecipe.metadata.prepTime} min
              </Text>
            )}
            {parsedRecipe.metadata.cookTime && (
              <Text style={[styles.metadataText, isDark && styles.metadataTextDark]}>
                Cook time: {parsedRecipe.metadata.cookTime} min
              </Text>
            )}
            {parsedRecipe.metadata.servings && (
              <Text style={[styles.metadataText, isDark && styles.metadataTextDark]}>
                Servings: {parsedRecipe.metadata.servings}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, isDark && styles.footerDark]}>
        <Button
          title="Rescan"
          variant="outline"
          onPress={handleGoBack}
          style={styles.rescanButton}
        />
        <Button
          title="Edit in Form →"
          variant="primary"
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </View>
    </View>
  );
}

function formatIngredient(ingredient: {
  name: string;
  quantity: number | null;
  unit: MeasurementUnit | null;
}): string {
  const parts: string[] = [];

  if (ingredient.quantity !== null) {
    parts.push(formatQuantity(ingredient.quantity));
  }

  if (ingredient.unit) {
    parts.push(ingredient.unit);
  }

  parts.push(ingredient.name);

  return parts.join(' ');
}

function formatQuantity(quantity: number): string {
  const fractions: Record<number, string> = {
    0.25: '¼',
    0.333: '⅓',
    0.5: '½',
    0.666: '⅔',
    0.75: '¾',
  };

  const whole = Math.floor(quantity);
  const decimal = quantity - whole;

  // Check if the decimal is close to a known fraction
  for (const [value, symbol] of Object.entries(fractions)) {
    if (Math.abs(decimal - parseFloat(value)) < 0.05) {
      return whole > 0 ? `${whole} ${symbol}` : symbol;
    }
  }

  // Return as decimal or whole number
  if (decimal === 0) {
    return whole.toString();
  }

  return quantity.toFixed(1).replace(/\.0$/, '');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  textDark: {
    color: '#FFFFFF',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  emptyTextDark: {
    color: '#8E8E93',
  },
  metadataSection: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  metadataTextDark: {
    color: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  footerDark: {
    backgroundColor: '#000000',
    borderTopColor: '#3A3A3C',
  },
  rescanButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorSubtextDark: {
    color: '#8E8E93',
  },
  errorButton: {
    minWidth: 120,
  },
});
