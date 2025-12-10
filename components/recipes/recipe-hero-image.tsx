/**
 * Recipe Hero Image Component
 * Task 4.1: Recipe Hero Image Component
 * Task 4.3: Image Display Logic
 * Task 12.2: Image Performance
 */

import React, { useState, memo } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { PlaceholderImage } from './PlaceholderImage';

interface RecipeHeroImageProps {
  imageUri: string | null | undefined;
  recipeName: string;
  aspectRatio?: number;
  testID?: string;
}

/**
 * Full-width hero image component for recipe detail view
 *
 * Features:
 * - Full-width responsive image display
 * - Loading states for image display
 * - Error handling with placeholder fallback
 * - Optimized image rendering with caching
 * - Performance optimization with React.memo
 * - Lazy loading support
 * - Accessibility support
 *
 * @param props - Component props
 * @returns RecipeHeroImage component
 *
 * @example
 * ```tsx
 * <RecipeHeroImage
 *   imageUri={recipe.imageUri}
 *   recipeName={recipe.title}
 * />
 * ```
 */
function RecipeHeroImageComponent({
  imageUri,
  recipeName,
  aspectRatio = 16 / 9,
  testID = 'recipe-hero-image',
}: RecipeHeroImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Task 13.2: UI Error Handling - Show placeholder if no image URI or if image failed to load
  const showPlaceholder = !imageUri || imageError;

  if (showPlaceholder) {
    return (
      <View
        className="w-full bg-[#E5E5EA] dark:bg-[#1C1C1E]"
        style={{ aspectRatio }}
        testID={`${testID}-placeholder`}
      >
        <PlaceholderImage size="large" />
      </View>
    );
  }

  return (
    <View
      className="w-full relative bg-[#E5E5EA] dark:bg-[#1C1C1E]"
      style={{ aspectRatio }}
      testID={testID}
    >
      {/* Hero Image - Task 12.2: Image Performance with caching */}
      <Image
        source={{ uri: imageUri, cache: 'force-cache' }}
        className="w-full h-full"
        resizeMode="cover"
        onLoadStart={() => {
          setImageLoading(true);
          setImageError(false);
        }}
        onLoadEnd={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false);
          setImageError(true);
        }}
        // Task 12.2: Image memory management
        progressiveRenderingEnabled={true}
        fadeDuration={200}
        accessibilityLabel={`${recipeName} recipe image`}
        accessibilityRole="image"
      />

      {/* Loading Indicator */}
      {imageLoading && (
        <View className="absolute inset-0 justify-center items-center bg-[#E5E5EA]/50 dark:bg-[#1C1C1E]/50">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
}

// Task 12.2: Performance optimization with React.memo
export const RecipeHeroImage = memo(RecipeHeroImageComponent);
