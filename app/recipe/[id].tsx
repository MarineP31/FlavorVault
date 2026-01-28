/**
 * Recipe Detail Screen
 * Displays complete recipe information with edit and delete actions
 */

import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Toast } from '@/components/ui/Toast';
import { Recipe, RecipeUtils } from '@/lib/db/schema/recipe';
import { recipeService } from '@/lib/db/services/recipe-service';
import { useRecipeShoppingList } from '@/lib/hooks/use-recipe-shopping-list';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const IMAGE_HEIGHT = 350;

export default function RecipeDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] =
    useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>(
    'success'
  );

  const hasValidId =
    typeof params.id === 'string' && (params.id as string).trim().length > 0;
  const recipeId = hasValidId ? (params.id as string) : '';

  const {
    isInShoppingList,
    isLoading: shoppingListLoading,
    toggleShoppingList,
  } = useRecipeShoppingList(recipeId, recipe?.title || '');

  const backgroundColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#8E8E93' : '#8E8E93';
  const cardBackgroundColor = isDark ? '#1C1C1E' : '#F2F2F7';
  const borderColor = isDark ? '#3A3A3C' : '#C7C7CC';

  useEffect(() => {
    if (!hasValidId) {
      return;
    }
    loadRecipe();
  }, [recipeId, hasValidId]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRecipe = await recipeService.getRecipeById(
        recipeId
      );

      if (!fetchedRecipe) {
        setError('Recipe not found');
        setRecipe(null);
      } else {
        setRecipe(fetchedRecipe);
      }
    } catch (err) {
      console.error('Error loading recipe:', err);
      setError('Failed to load recipe. Please try again.');
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/recipe-form/edit/${recipeId}`);
  };

  const handleDeletePress = () => {
    setDeleteDialogVisible(true);
  };

  const handleMoreOptionsPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit Recipe', 'Delete Recipe'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleEdit();
          } else if (buttonIndex === 2) {
            handleDeletePress();
          }
        }
      );
    } else {
      setMenuVisible(true);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await recipeService.deleteRecipe(recipeId);

      setToastMessage('Recipe deleted successfully');
      setToastType('success');
      setToastVisible(true);

      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setToastMessage('Failed to delete recipe. Please try again.');
      setToastType('error');
      setToastVisible(true);
      setDeleteDialogVisible(false);
      setDeleting(false);
    }
  };

  const handleAddToMealPlan = () => {
    setToastMessage('Meal planning feature coming soon!');
    setToastType('success');
    setToastVisible(true);
  };

  const handleShoppingListPress = () => {
    if (!shoppingListLoading) {
      toggleShoppingList();
    }
  };

  const formatTime = (minutes: number | null): string => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hr`;
  };

  const getDifficulty = (recipe: Recipe): string => {
    const totalTime = RecipeUtils.getTotalTime(recipe);
    const ingredientCount = recipe.ingredients.length;
    const stepCount = recipe.steps.length;

    if (
      (totalTime && totalTime > 90) ||
      ingredientCount > 15 ||
      stepCount > 10
    ) {
      return 'Hard';
    }
    if (
      (totalTime && totalTime > 45) ||
      ingredientCount > 8 ||
      stepCount > 5
    ) {
      return 'Medium';
    }
    return 'Easy';
  };

  if (!hasValidId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen options={{ title: 'Error' }} />
        <View style={styles.centerContainer}>
          <Icon
            name="alert-circle-outline"
            size={64}
            color="#FF3B30"
          />
          <Text style={[styles.errorTitle, { color: textColor }]}>
            Invalid recipe ID
          </Text>
          <Text
            style={[
              styles.errorMessage,
              { color: secondaryTextColor },
            ]}
          >
            This recipe cannot be loaded because the ID is missing or invalid.
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color="#007AFF"
            testID="loading-indicator"
          />
          <Text
            style={[
              styles.loadingText,
              { color: secondaryTextColor },
            ]}
          >
            Loading recipe...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen options={{ title: 'Error' }} />
        <View style={styles.centerContainer}>
          <Icon
            name="alert-circle-outline"
            size={64}
            color="#FF3B30"
          />
          <Text style={[styles.errorTitle, { color: textColor }]}>
            {error || 'Recipe not found'}
          </Text>
          <Text
            style={[
              styles.errorMessage,
              { color: secondaryTextColor },
            ]}
          >
            {error
              ? 'Please try again or return to the recipe list.'
              : 'This recipe may have been deleted or does not exist.'}
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const totalTime = RecipeUtils.getTotalTime(recipe);
  const difficulty = getDifficulty(recipe);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          {recipe.imageUri ? (
            <Image
              source={{ uri: recipe.imageUri }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Icon
                name="restaurant-outline"
                size={64}
                color="#8E8E93"
              />
            </View>
          )}

          {/* Overlay buttons on image */}
          <View
            style={[
              styles.heroOverlay,
              { paddingTop: insets.top + 8 },
            ]}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.heroButton}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Icon name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.heroButtonsRight}>
              <TouchableOpacity
                onPress={handleShoppingListPress}
                style={[
                  styles.heroButton,
                  isInShoppingList && styles.heroButtonActive,
                ]}
                activeOpacity={0.8}
                disabled={shoppingListLoading}
                accessibilityRole="button"
                accessibilityLabel={
                  isInShoppingList
                    ? 'Remove from shopping list'
                    : 'Add to shopping list'
                }
              >
                {shoppingListLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Icon
                    name={isInShoppingList ? 'cart' : 'cart-outline'}
                    size={24}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleMoreOptionsPress}
                style={styles.heroButton}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="More options"
              >
                <Icon
                  name="ellipsis-horizontal"
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content Card */}
        <View style={[styles.contentCard, { backgroundColor }]}>
          {/* Title */}
          <Text style={[styles.recipeTitle, { color: textColor }]}>
            {recipe.title}
          </Text>

          {/* Info Cards Row */}
          <View style={styles.infoCardsRow}>
            <View
              style={[
                styles.infoCard,
                { backgroundColor: cardBackgroundColor },
              ]}
            >
              <Icon name="time-outline" size={24} color="#E8965A" />
              <Text
                style={[
                  styles.infoCardLabel,
                  { color: secondaryTextColor },
                ]}
              >
                TIME
              </Text>
              <Text
                style={[styles.infoCardValue, { color: textColor }]}
              >
                {formatTime(totalTime)}
              </Text>
            </View>

            <View
              style={[
                styles.infoCard,
                { backgroundColor: cardBackgroundColor },
              ]}
            >
              <Icon name="people" size={24} color="#E8965A" />
              <Text
                style={[
                  styles.infoCardLabel,
                  { color: secondaryTextColor },
                ]}
              >
                SERVINGS
              </Text>
              <Text
                style={[styles.infoCardValue, { color: textColor }]}
              >
                {recipe.servings}
              </Text>
            </View>

            <View
              style={[
                styles.infoCard,
                { backgroundColor: cardBackgroundColor },
              ]}
            >
              <Icon
                name="bar-chart-outline"
                size={24}
                color="#E8965A"
              />
              <Text
                style={[
                  styles.infoCardLabel,
                  { color: secondaryTextColor },
                ]}
              >
                DIFFICULTY
              </Text>
              <Text
                style={[styles.infoCardValue, { color: textColor }]}
              >
                {difficulty}
              </Text>
            </View>
          </View>

          {/* Tags as horizontal pills */}
          {recipe.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {recipe.tags.slice(0, 5).map((tag, index) => (
                <View
                  key={tag}
                  style={[
                    styles.tagPill,
                    index === 0 && styles.tagPillPrimary,
                    {
                      borderColor:
                        index === 0 ? '#E8965A' : borderColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagPillText,
                      { color: index === 0 ? '#E8965A' : textColor },
                    ]}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Ingredients Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Ingredients
            </Text>
            <View style={styles.ingredientsCard}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientBullet}>
                    <Icon name="ellipse" size={8} color="#E8965A" />
                  </View>
                  <View style={styles.ingredientTextContainer}>
                    <Text
                      style={[
                        styles.ingredientName,
                        { color: textColor },
                      ]}
                    >
                      {ingredient.name}
                    </Text>
                    {(ingredient.quantity || ingredient.unit) && (
                      <Text
                        style={[
                          styles.ingredientQuantity,
                          { color: secondaryTextColor },
                        ]}
                      >
                        {ingredient.quantity &&
                          `${ingredient.quantity}`}
                        {ingredient.quantity &&
                          ingredient.unit &&
                          ' '}
                        {ingredient.unit && `${ingredient.unit}`}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Instructions
            </Text>
            <View style={styles.instructionsCard}>
              {recipe.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    style={[styles.stepText, { color: textColor }]}
                  >
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        title="Delete Recipe"
        description={`Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        confirmVariant="destructive"
        showCancel={!deleting}
      />

      {/* Toast Notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        duration={3000}
        onHide={() => setToastVisible(false)}
      />

      {/* Android Action Menu */}
      {Platform.OS === 'android' && (
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setMenuVisible(false)}
          >
            <View
              style={[
                styles.menuContainer,
                { backgroundColor: cardBackgroundColor },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  handleEdit();
                }}
              >
                <Icon
                  name="pencil-outline"
                  size={24}
                  color={textColor}
                />
                <Text
                  style={[styles.menuItemText, { color: textColor }]}
                >
                  Edit Recipe
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  handleDeletePress();
                }}
              >
                <Icon
                  name="trash-outline"
                  size={24}
                  color="#FF3B30"
                />
                <Text
                  style={[styles.menuItemText, { color: '#FF3B30' }]}
                >
                  Delete Recipe
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 200,
  },
  heroContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  heroButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroButtonActive: {
    backgroundColor: '#E8965A',
  },
  heroButtonsRight: {
    flexDirection: 'row',
    gap: 12,
  },
  contentCard: {
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 16,
    minHeight: 400,
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  infoCardLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  infoCardValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tagPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  tagPillPrimary: {
    backgroundColor: 'rgba(232, 150, 90, 0.1)',
  },
  tagPillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  ingredientsCard: {
    overflow: 'hidden',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  ingredientBullet: {
    width: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientName: {
    fontSize: 16,
    flex: 1,
  },
  ingredientQuantity: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionsCard: {
    overflow: 'hidden',
  },
  stepItem: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8965A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  bottomSpacer: {
    height: 40,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
