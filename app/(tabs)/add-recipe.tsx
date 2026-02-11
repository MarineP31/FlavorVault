/**
 * Add Recipe Tab Screen
 * Choice screen for Camera vs Manual Recipe Entry
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { recipeService } from '@/lib/db/services/recipe-service';
import { getRecipeCreateRoute, getRecipeDetailRoute } from '@/lib/navigation/helpers';
import { useSubscription } from '@/lib/contexts/subscription-context';
import type { Recipe } from '@/lib/db/schema/recipe';

export default function AddRecipeChoiceScreen() {
  const router = useRouter();
  const { isPro, showPaywall } = useSubscription();
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Load recent recipes
  useEffect(() => {
    loadRecentRecipes();
  }, []);

  const loadRecentRecipes = async () => {
    try {
      setLoading(true);
      const recipes = await recipeService.getAllRecipes({ limit: 3 });
      setRecentRecipes(recipes);
    } catch (error) {
      console.error('Failed to load recent recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanRecipe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isPro) {
      router.push('/ocr/capture' as any);
    } else {
      showPaywall(() => {
        router.push('/ocr/capture' as any);
      });
    }
  };

  const handleAddManually = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(getRecipeCreateRoute() as any);
  };

  const handleRecipePress = (recipe: Recipe) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(getRecipeDetailRoute(recipe.id) as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B35', '#FF8C42', '#FFA559']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Branding Section */}
          <View style={styles.brandingSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="restaurant" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>Recipe Chef</Text>
            <Text style={styles.brandSubtitle}>Smart Recipe Management</Text>
          </View>

          {/* Action Cards */}
          <View style={styles.actionsContainer}>
            {/* Scan Recipe Card */}
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={handleScanRecipe}
              testID="scan-recipe-card"
            >
              <View style={styles.iconCircle}>
                <Ionicons name="camera" size={32} color="#FF6B35" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Scan Recipe</Text>
                <Text style={styles.cardSubtitle}>From photos or books</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#8E8E93" />
            </Pressable>

            {/* Add Recipe Card */}
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={handleAddManually}
              testID="add-recipe-card"
            >
              <View style={styles.iconCircle}>
                <Ionicons name="add-circle" size={32} color="#FF6B35" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Add Recipe</Text>
                <Text style={styles.cardSubtitle}>Create manually</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#8E8E93" />
            </Pressable>
          </View>

          {/* Recent Recipes Section */}
          {recentRecipes.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>Recent Recipes</Text>
              <View style={styles.recentCards}>
                {recentRecipes.map((recipe, index) => (
                  <View
                    key={recipe.id}
                    style={styles.recentCardWrapper}
                  >
                    <Pressable
                      onPress={() => handleRecipePress(recipe)}
                      testID={`recent-recipe-card-${index}`}
                      style={({ pressed }) => [
                        styles.recentCardPressable,
                        pressed && styles.recentCardPressed,
                      ]}
                    >
                      <View style={styles.recentCardContent}>
                        <Ionicons
                          name="restaurant-outline"
                          size={20}
                          color="#FFFFFF"
                          style={styles.recentCardIcon}
                        />
                        <Text
                          style={styles.recentCardText}
                          numberOfLines={1}
                        >
                          {recipe.title}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  actionCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  recentSection: {
    paddingHorizontal: 20,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  recentCards: {
    gap: 12,
  },
  recentCardWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  recentCardPressable: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  recentCardPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  recentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentCardIcon: {
    marginRight: 12,
  },
  recentCardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
});
