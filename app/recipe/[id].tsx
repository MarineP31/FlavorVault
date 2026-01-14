/**
 * Recipe Detail Screen
 * Displays complete recipe information with edit and delete actions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Recipe } from '@/lib/db/schema/recipe';
import { recipeService } from '@/lib/db/services/recipe-service';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Toast } from '@/components/ui/Toast';
import { DishCategory } from '@/constants/enums';
import { useRecipeShoppingList } from '@/lib/hooks/use-recipe-shopping-list';

export default function RecipeDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const recipeId = params.id as string;

  const { isInShoppingList, isLoading: shoppingListLoading, toggleShoppingList } =
    useRecipeShoppingList(recipeId, recipe?.title || '');

  const backgroundColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#8E8E93' : '#8E8E93';
  const cardBackgroundColor = isDark ? '#1C1C1E' : '#F2F2F7';
  const borderColor = isDark ? '#3A3A3C' : '#C7C7CC';

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRecipe = await recipeService.getRecipeById(recipeId);

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
    return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
  };

  const getCategoryLabel = (category: DishCategory): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const organizeTagsByCategory = (tags: string[]) => {
    const cuisineTags = ['Italian', 'Mexican', 'Asian', 'Chinese', 'Japanese', 'Thai', 'Indian', 'Mediterranean', 'French', 'American'];
    const dietaryTags = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb', 'Keto', 'Paleo'];
    const mealTypeTags = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer', 'Beverage'];
    const cookingMethodTags = ['Baking', 'Grilling', 'Roasting', 'Sautéing', 'Slow Cooker', 'Instant Pot', 'Stovetop', 'No-Cook'];

    return {
      cuisine: tags.filter(tag => cuisineTags.includes(tag)),
      dietary: tags.filter(tag => dietaryTags.includes(tag)),
      mealType: tags.filter(tag => mealTypeTags.includes(tag)),
      cookingMethod: tags.filter(tag => cookingMethodTags.includes(tag)),
    };
  };

  const renderTagChip = (tag: string) => (
    <View
      key={tag}
      style={[styles.tagChip, { backgroundColor: cardBackgroundColor, borderColor }]}
    >
      <Text style={[styles.tagText, { color: textColor }]}>{tag}</Text>
    </View>
  );

  const renderTagsSection = () => {
    if (!recipe || recipe.tags.length === 0) return null;

    const organizedTags = organizeTagsByCategory(recipe.tags);
    const hasAnyTags = recipe.tags.length > 0;

    if (!hasAnyTags) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Tags</Text>

        {organizedTags.cuisine.length > 0 && (
          <View style={styles.tagCategory}>
            <Text style={[styles.tagCategoryTitle, { color: secondaryTextColor }]}>
              Cuisine
            </Text>
            <View style={styles.tagChipContainer}>
              {organizedTags.cuisine.map(renderTagChip)}
            </View>
          </View>
        )}

        {organizedTags.dietary.length > 0 && (
          <View style={styles.tagCategory}>
            <Text style={[styles.tagCategoryTitle, { color: secondaryTextColor }]}>
              Dietary
            </Text>
            <View style={styles.tagChipContainer}>
              {organizedTags.dietary.map(renderTagChip)}
            </View>
          </View>
        )}

        {organizedTags.mealType.length > 0 && (
          <View style={styles.tagCategory}>
            <Text style={[styles.tagCategoryTitle, { color: secondaryTextColor }]}>
              Meal Type
            </Text>
            <View style={styles.tagChipContainer}>
              {organizedTags.mealType.map(renderTagChip)}
            </View>
          </View>
        )}

        {organizedTags.cookingMethod.length > 0 && (
          <View style={styles.tagCategory}>
            <Text style={[styles.tagCategoryTitle, { color: secondaryTextColor }]}>
              Cooking Method
            </Text>
            <View style={styles.tagChipContainer}>
              {organizedTags.cookingMethod.map(renderTagChip)}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[styles.loadingText, { color: secondaryTextColor }]}>
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
          <Icon name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={[styles.errorTitle, { color: textColor }]}>
            {error || 'Recipe not found'}
          </Text>
          <Text style={[styles.errorMessage, { color: secondaryTextColor }]}>
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['bottom']}>
      <Stack.Screen options={{ title: recipe.title }} />

      {/* Sticky Shopping List Button */}
      <TouchableOpacity
        onPress={handleShoppingListPress}
        style={styles.stickyShoppingButton}
        activeOpacity={0.8}
        disabled={shoppingListLoading}
        testID="shopping-list-sticky-button"
        accessibilityRole="button"
        accessibilityLabel={
          isInShoppingList
            ? 'Remove from shopping list'
            : 'Add to shopping list'
        }
      >
        {shoppingListLoading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Icon
            name={isInShoppingList ? 'cart' : 'cart-outline'}
            size={24}
            color={isInShoppingList ? '#007AFF' : '#8E8E93'}
          />
        )}
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Recipe Image */}
        {recipe.imageUri && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: recipe.imageUri }}
              style={styles.recipeImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Recipe Title */}
        <View style={styles.section}>
          <Text style={[styles.recipeTitle, { color: textColor }]}>
            {recipe.title}
          </Text>

          {/* Category */}
          <View style={styles.categoryBadge}>
            <Text style={[styles.categoryText, { color: secondaryTextColor }]}>
              {getCategoryLabel(recipe.category)}
            </Text>
          </View>
        </View>

        {/* Time and Servings Info */}
        <View style={[styles.infoCard, { backgroundColor: cardBackgroundColor }]}>
          <View style={styles.infoItem}>
            <Icon name="time-outline" size={24} color="#007AFF" />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                Prep Time
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {formatTime(recipe.prepTime)}
              </Text>
            </View>
          </View>

          <View style={[styles.infoDivider, { backgroundColor: borderColor }]} />

          <View style={styles.infoItem}>
            <Icon name="flame-outline" size={24} color="#FF9500" />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                Cook Time
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {formatTime(recipe.cookTime)}
              </Text>
            </View>
          </View>

          <View style={[styles.infoDivider, { backgroundColor: borderColor }]} />

          <View style={styles.infoItem}>
            <Icon name="people-outline" size={24} color="#34C759" />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                Servings
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {recipe.servings}
              </Text>
            </View>
          </View>
        </View>

        {/* Ingredients Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Ingredients
          </Text>
          <View style={styles.ingredientsCard}>
            {recipe.ingredients.map((ingredient, index) => (
              <View
                key={index}
                style={styles.ingredientItem}
              >
                <View style={styles.ingredientBullet}>
                  <Icon name="ellipse" size={8} color="#007AFF" />
                </View>
                <View style={styles.ingredientTextContainer}>
                  <Text style={[styles.ingredientName, { color: textColor }]}>
                    {ingredient.name}
                  </Text>
                  {(ingredient.quantity || ingredient.unit) && (
                    <Text style={[styles.ingredientQuantity, { color: secondaryTextColor }]}>
                      {ingredient.quantity && `${ingredient.quantity}`}
                      {ingredient.quantity && ingredient.unit && ' '}
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
              <View
                key={index}
                style={styles.stepItem}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: textColor }]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tags Section */}
        {renderTagsSection()}

        {/* Action Buttons */}
        <View style={styles.section}>
          <Button
            title="Edit Recipe"
            onPress={handleEdit}
            variant="primary"
            fullWidth
            style={styles.actionButton}
          />
          <Button
            title="Add to Meal Plan"
            onPress={handleAddToMealPlan}
            variant="secondary"
            fullWidth
            style={styles.actionButton}
          />
          <Button
            title="Delete Recipe"
            onPress={handleDeletePress}
            variant="destructive"
            fullWidth
            style={styles.actionButton}
          />
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
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
    </SafeAreaView>
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
    paddingBottom: 20,
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
  stickyShoppingButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#E5E5EA',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  infoTextContainer: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  infoDivider: {
    width: 1,
    height: '100%',
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
    backgroundColor: '#007AFF',
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
  tagCategory: {
    marginBottom: 16,
  },
  tagCategoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    marginBottom: 12,
  },
  bottomSpacer: {
    height: 20,
  },
});
