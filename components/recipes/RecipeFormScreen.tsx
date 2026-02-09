/**
 * Recipe Form Screen Component
 * Task Group 5: Recipe Form Implementation
 * Task Group 9: Form Validation & Error Handling
 * Task Group 11: Performance & Optimization
 * Shared component for create and edit modes with React Hook Form integration
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from 'react-native-vector-icons/Ionicons';
import { DishCategory, EnumUtils } from '@/constants/enums';
import { recipeService } from '@/lib/db/services/recipe-service';
import type { Recipe, CreateRecipeInput, UpdateRecipeInput, Ingredient } from '@/lib/db/schema/recipe';
import { RecipeFormSchema, RecipeFormData } from '@/lib/validations/recipe-form-schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import { IngredientInput } from '@/components/recipes/IngredientInput';
import { StepInput } from '@/components/recipes/StepInput';
import { TagSelector } from '@/components/recipes/TagSelector';
import { ImagePickerButton } from '@/components/recipes/ImagePickerButton';
import { Toast } from '@/components/ui/Toast';

const HEADER_BUTTON_SIZE = 48;
const HEADER_PADDING = 16;

interface RecipeFormScreenProps {
  mode: 'create' | 'edit';
  recipeId?: string;
  onSave: (recipe: Recipe) => void;
  initialData?: Partial<RecipeFormData>;
}

/**
 * Shared recipe form component for create and edit modes
 * Task 5.1: Recipe Form Screen
 * Task 9.1: Form Validation Implementation
 * Task 9.2: Error Handling System
 * Task 9.3: Success Feedback System
 * Task 11.1: Form Performance Optimization
 */
export function RecipeFormScreen({ mode, recipeId, onSave, initialData }: RecipeFormScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const contentTopPadding = insets.top + HEADER_BUTTON_SIZE + HEADER_PADDING;
  const [loadingRecipe, setLoadingRecipe] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

  // Task 5.1 & 9.1 & 11.1: React Hook Form setup with optimized validation
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(RecipeFormSchema) as any,
    mode: 'onBlur', // Task 11.1: Changed from onChange to onBlur for better performance
    reValidateMode: 'onBlur', // Task 11.1: Optimize revalidation
    defaultValues: {
      title: initialData?.title ?? '',
      servings: initialData?.servings ?? 4,
      category: initialData?.category ?? DishCategory.DINNER,
      ingredients: initialData?.ingredients?.length
        ? initialData.ingredients
        : [{ name: '', quantity: null, unit: null }],
      steps: initialData?.steps?.length ? initialData.steps : [''],
      imageUri: initialData?.imageUri ?? null,
      prepTime: initialData?.prepTime ?? null,
      cookTime: initialData?.cookTime ?? null,
      tags: initialData?.tags ?? [],
      source: initialData?.source ?? null,
    },
  });

  const { control, handleSubmit, formState: { errors, isValid }, reset } = form;

  // Task 5.4 & 11.1: Dynamic ingredients field array with optimized rendering
  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: 'ingredients',
  });

  // Task 5.5 & 11.1: Dynamic instructions field array with optimized rendering
  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: 'steps' as any,
  });

  // Task 11.1: Memoize category options to prevent unnecessary re-renders
  const categoryOptions: SelectOption[] = useMemo(
    () =>
      EnumUtils.getAllDishCategories().map((cat) => ({
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        value: cat,
      })),
    []
  );

  // Load recipe data in edit mode
  useEffect(() => {
    if (mode === 'edit' && recipeId) {
      loadRecipeData();
    }
  }, [mode, recipeId]);

  /**
   * Task 9.2: Enhanced database error handling with user-friendly messages
   */
  const loadRecipeData = async () => {
    if (!recipeId) return;

    setLoadingRecipe(true);
    try {
      const recipe = await recipeService.getRecipeById(recipeId);
      if (recipe) {
        // Reset form with recipe data
        reset({
          title: recipe.title,
          servings: recipe.servings,
          category: recipe.category,
          ingredients: recipe.ingredients.length > 0
            ? recipe.ingredients.map(ing => ({
                name: ing.name,
                quantity: ing.quantity ?? null,
                unit: ing.unit ?? null,
              }))
            : [{ name: '', quantity: null, unit: null }],
          steps: recipe.steps.length > 0 ? recipe.steps : [''],
          imageUri: recipe.imageUri ?? null,
          prepTime: recipe.prepTime ?? null,
          cookTime: recipe.cookTime ?? null,
          tags: recipe.tags || [],
          source: recipe.source ?? null,
        });
      } else {
        // Task 9.2: Handle recipe not found
        setToast({
          visible: true,
          message: 'Recipe not found. It may have been deleted.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to load recipe:', error);
      // Task 9.2: User-friendly database error message
      const errorMessage = error instanceof Error
        ? `Failed to load recipe: ${error.message}`
        : 'Failed to load recipe data. Please check your connection and try again.';

      setToast({
        visible: true,
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setLoadingRecipe(false);
    }
  };

  /**
   * Task 5.1 & 9.2 & 9.3: Form submission handling with enhanced error handling and success feedback
   */
  const onSubmit: SubmitHandler<RecipeFormData> = async (data) => {
    try {
      setIsSubmitting(true);

      // Transform form data to match Ingredient interface
      const transformedIngredients: Ingredient[] = data.ingredients.map(ing => ({
        name: ing.name,
        quantity: ing.quantity ?? null,
        unit: ing.unit ?? null,
      }));

      if (mode === 'create') {
        // Create new recipe
        const recipeInput: CreateRecipeInput = {
          title: data.title,
          servings: data.servings,
          category: data.category,
          ingredients: transformedIngredients,
          steps: data.steps,
          imageUri: data.imageUri ?? null,
          prepTime: data.prepTime ?? null,
          cookTime: data.cookTime ?? null,
          tags: data.tags || [],
          source: data.source ?? null,
        };

        const createdRecipe = await recipeService.createRecipe(recipeInput);

        // Task 9.3: Create success feedback
        setToast({
          visible: true,
          message: 'Recipe created successfully',
          type: 'success',
        });

        // Delay navigation to show toast
        setTimeout(() => {
          onSave(createdRecipe);
        }, 1000);
      } else if (mode === 'edit' && recipeId) {
        // Update existing recipe
        const updateInput: UpdateRecipeInput = {
          id: recipeId,
          title: data.title,
          servings: data.servings,
          category: data.category,
          ingredients: transformedIngredients,
          steps: data.steps,
          imageUri: data.imageUri ?? null,
          prepTime: data.prepTime ?? null,
          cookTime: data.cookTime ?? null,
          tags: data.tags || [],
          source: data.source ?? null,
        };

        const updatedRecipe = await recipeService.updateRecipe(updateInput);

        // Task 9.3: Update success feedback
        setToast({
          visible: true,
          message: 'Recipe updated successfully',
          type: 'success',
        });

        // Delay navigation to show toast
        setTimeout(() => {
          onSave(updatedRecipe);
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving recipe:', error);

      // Task 9.2 & 9.3: Enhanced database error handling with specific messages
      let errorMessage = `Failed to ${mode === 'create' ? 'create' : 'update'} recipe. `;

      if (error instanceof Error) {
        // Provide more specific error messages based on error type
        if (error.message.includes('UNIQUE constraint')) {
          errorMessage += 'A recipe with this title already exists.';
        } else if (error.message.includes('NOT NULL constraint')) {
          errorMessage += 'Required fields are missing.';
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage += 'Please check your connection and try again.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please try again.';
      }

      // Task 9.3: Error toast notification
      setToast({
        visible: true,
        message: errorMessage,
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  /**
   * Task 11.1: Memoized handlers to prevent unnecessary re-renders
   */
  const handleAddIngredient = useCallback(() => {
    appendIngredient({ name: '', quantity: null, unit: null });
  }, [appendIngredient]);

  const handleAddStep = useCallback(() => {
    appendStep('' as any);
  }, [appendStep]);

  const handleRemoveIngredient = useCallback((index: number) => {
    removeIngredient(index);
  }, [removeIngredient]);

  const handleRemoveStep = useCallback((index: number) => {
    removeStep(index);
  }, [removeStep]);

  /**
   * Handle cancel with unsaved changes warning
   */
  const handleCancel = useCallback(() => {
    Alert.alert(
      'Discard Changes?',
      `Are you sure you want to discard ${mode === 'create' ? 'this recipe' : 'your changes'}?`,
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => onSave({} as Recipe), // Trigger navigation back
        },
      ]
    );
  }, [mode, onSave]);

  /**
   * Task 9.2: Loading state with error handling
   */
  if (loadingRecipe) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Loading recipe...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={[styles.scrollView, isDark && styles.scrollViewDark]}
        contentContainerStyle={[styles.scrollContent, { paddingTop: contentTopPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true} // Task 11.1: Performance optimization
      >
        {/* Task 5.2: Basic Info Section */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconContainer, isDark && styles.sectionIconContainerDark]}>
                <Icon name="document-text-outline" size={20} color="#FF6B35" />
              </View>
              <Text style={[styles.sectionTitle, styles.sectionTitleInHeader, isDark && styles.sectionTitleDark]}>
                Basic Information
              </Text>
            </View>
          </View>

          {/* Task 9.1: Field-level validation with inline error messages */}
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Recipe Title *"
                  placeholder="e.g., Classic Chocolate Chip Cookies"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                />
              )}
            />
          </View>

          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, isDark && styles.labelDark]}>
                  Category *
                </Text>
                <Select
                  value={value}
                  options={categoryOptions}
                  onChange={onChange}
                  placeholder="Select category"
                />
                {errors.category && (
                  <Text style={styles.errorText}>{errors.category.message}</Text>
                )}
              </View>
            )}
          />

          {/* Task 9.2: Image picker with error handling */}
          <View style={styles.imageSection}>
            <Text style={[styles.imageLabel, isDark && styles.imageLabelDark]}>
              Recipe Image (Optional)
            </Text>
            <Controller
              control={control}
              name="imageUri"
              render={({ field: { onChange, value } }) => (
                <ImagePickerButton
                  imageUri={value ?? null}
                  onImageSelected={onChange}
                  onImageRemoved={() => onChange(null)}
                  error={errors.imageUri?.message}
                />
              )}
            />
          </View>
        </View>

        {/* Task 5.3: Time & Servings Section */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconContainer, isDark && styles.sectionIconContainerDark]}>
                <Icon name="time-outline" size={20} color="#FF6B35" />
              </View>
              <Text style={[styles.sectionTitle, styles.sectionTitleInHeader, isDark && styles.sectionTitleDark]}>
                Time & Servings
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Controller
              control={control}
              name="servings"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Servings *"
                  placeholder="4"
                  value={value?.toString() || ''}
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    onChange(isNaN(num) ? 1 : num);
                  }}
                  keyboardType="number-pad"
                  error={errors.servings?.message}
                  containerStyle={styles.halfWidth}
                />
              )}
            />

            <Controller
              control={control}
              name="prepTime"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Prep Time (min)"
                  placeholder="15"
                  value={value?.toString() || ''}
                  onChangeText={(text) => {
                    if (text === '') {
                      onChange(null);
                    } else {
                      const num = parseInt(text);
                      onChange(isNaN(num) ? null : num);
                    }
                  }}
                  keyboardType="number-pad"
                  error={errors.prepTime?.message}
                  containerStyle={styles.halfWidth}
                />
              )}
            />
          </View>

          <Controller
            control={control}
            name="cookTime"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Cook Time (min)"
                placeholder="30"
                value={value?.toString() || ''}
                onChangeText={(text) => {
                  if (text === '') {
                    onChange(null);
                  } else {
                    const num = parseInt(text);
                    onChange(isNaN(num) ? null : num);
                  }
                }}
                keyboardType="number-pad"
                error={errors.cookTime?.message}
              />
            )}
          />
        </View>

        {/* Task 5.4 & 11.1: Dynamic Ingredients Section with optimized rendering */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconContainer, isDark && styles.sectionIconContainerDark]}>
                <Icon name="nutrition-outline" size={20} color="#FF6B35" />
              </View>
              <Text style={[styles.sectionTitle, styles.sectionTitleInHeader, isDark && styles.sectionTitleDark]}>
                Ingredients
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddIngredient}
              activeOpacity={0.8}
            >
              <Icon name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Task 9.1 & 11.1: Ingredient field validation with optimized rendering */}
          {ingredientFields.map((field, index) => (
            <Controller
              key={field.id}
              control={control}
              name={`ingredients.${index}`}
              render={({ field: { onChange, value } }) => (
                <IngredientInput
                  index={index}
                  name={value.name}
                  quantity={value.quantity ?? null}
                  unit={value.unit ?? null}
                  onNameChange={(name) => onChange({ ...value, name })}
                  onQuantityChange={(quantity) => onChange({ ...value, quantity })}
                  onUnitChange={(unit) => onChange({ ...value, unit })}
                  onRemove={() => handleRemoveIngredient(index)}
                  showRemove={ingredientFields.length > 1}
                  error={errors.ingredients?.[index]?.name?.message}
                />
              )}
            />
          ))}

          {/* Task 9.1: Form-level validation error */}
          {errors.ingredients && typeof errors.ingredients.message === 'string' && (
            <Text style={styles.errorText}>{errors.ingredients.message}</Text>
          )}
        </View>

        {/* Task 5.5 & 11.1: Dynamic Instructions Section with optimized rendering */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconContainer, isDark && styles.sectionIconContainerDark]}>
                <Icon name="list-outline" size={20} color="#FF6B35" />
              </View>
              <Text style={[styles.sectionTitle, styles.sectionTitleInHeader, isDark && styles.sectionTitleDark]}>
                Instructions
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddStep}
              activeOpacity={0.8}
            >
              <Icon name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Task 9.1 & 11.1: Step field validation with optimized rendering */}
          {stepFields.map((field, index) => (
            <Controller
              key={field.id}
              control={control}
              name={`steps.${index}` as any}
              render={({ field: { onChange, value } }) => (
                <StepInput
                  index={index}
                  value={typeof value === 'string' ? value : ''}
                  onChange={onChange}
                  onRemove={() => handleRemoveStep(index)}
                  showRemove={stepFields.length > 1}
                  error={errors.steps?.[index]?.message}
                />
              )}
            />
          ))}

          {/* Task 9.1: Form-level validation error */}
          {errors.steps && typeof errors.steps.message === 'string' && (
            <Text style={styles.errorText}>{errors.steps.message}</Text>
          )}
        </View>

        {/* Task 5.6: Tags Section */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconContainer, isDark && styles.sectionIconContainerDark]}>
                <Icon name="pricetags-outline" size={20} color="#FF6B35" />
              </View>
              <Text style={[styles.sectionTitle, styles.sectionTitleInHeader, isDark && styles.sectionTitleDark]}>
                Tags
              </Text>
            </View>
          </View>
          <Controller
            control={control}
            name="tags"
            render={({ field: { onChange, value } }) => (
              <TagSelector
                selectedTags={value || []}
                onTagsChange={onChange}
              />
            )}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={handleCancel}
            disabled={isSubmitting}
            style={styles.cancelButton}
          />
          <Button
            title={mode === 'create' ? 'Create Recipe' : 'Save Changes'}
            variant="primary"
            onPress={handleSubmit(onSubmit) as any}
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
            style={styles.saveButton}
          />
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Task 9.3: Toast notification for success and error feedback */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </KeyboardAvoidingView>
  );
}

// Task 11.1: Memoize the component to prevent unnecessary re-renders
export const RecipeFormScreenOptimized = React.memo(RecipeFormScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollViewDark: {
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingContainerDark: {
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  loadingTextDark: {
    color: '#8E8E93',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionDark: {
    backgroundColor: '#1C1C1E',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionIconContainerDark: {
    backgroundColor: '#3A2A20',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.4,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  sectionTitleInHeader: {
    marginBottom: 0,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000000',
  },
  labelDark: {
    color: '#FFFFFF',
  },
  imageSection: {
    marginTop: 8,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  imageLabelDark: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});
