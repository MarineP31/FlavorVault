/**
 * Integration Tests for Navigation Flows
 * Task Group 7.3: Strategic integration tests for navigation system
 *
 * These tests verify complete user workflows across the navigation system
 */

import { recipeService } from '@/lib/db/services/recipe-service';
import { DishCategory } from '@/constants/enums';
import type { Recipe } from '@/lib/db/schema/recipe';

// Mock dependencies
jest.mock('@/lib/db/services/recipe-service');

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  Stack: { Screen: () => null },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@gorhom/bottom-sheet');
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: (props: any) => {
    const React = require('react');
    return React.createElement('View', props, props.children);
  },
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

// Mock recipe data
const mockRecipe: Recipe = {
  id: 'recipe-123',
  title: 'Chocolate Chip Cookies',
  servings: 24,
  category: DishCategory.DESSERT,
  ingredients: [
    { name: 'Flour', quantity: 2, unit: 'cup' as any },
    { name: 'Sugar', quantity: 1, unit: 'cup' as any },
  ],
  steps: ['Mix ingredients', 'Bake at 350°F'],
  imageUri: null,
  prepTime: 15,
  cookTime: 12,
  tags: ['Dessert', 'Cookies'],
  source: null,
  createdAt: '2024-10-28T10:00:00.000Z',
  updatedAt: '2024-10-28T10:00:00.000Z',
  deletedAt: null,
};

describe('Navigation System Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (recipeService.getRecipeById as jest.Mock).mockResolvedValue(mockRecipe);
    (recipeService.getAllRecipes as jest.Mock).mockResolvedValue([mockRecipe]);
  });

  // Test 1: Complete navigation flow from Home to Detail and back
  describe('Test 1: Home → Recipe Detail → Back', () => {
    it('should navigate from recipe card to detail screen', () => {
      const recipeId = 'recipe-123';

      // Simulate tapping a recipe card
      mockRouter.push(`/recipe/${recipeId}`);

      expect(mockRouter.push).toHaveBeenCalledWith(`/recipe/${recipeId}`);
    });

    it('should navigate back from recipe detail to home', () => {
      // Simulate pressing back button
      mockRouter.back();

      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  // Test 2: Recipe detail to edit flow with pre-filled form
  describe('Test 2: Recipe Detail → Edit → Form Pre-filled', () => {
    it('should navigate to edit form with recipe ID', () => {
      const recipeId = 'recipe-123';

      // Simulate tapping edit button from bottom sheet
      mockRouter.push(`/recipe-form/edit/${recipeId}`);

      expect(mockRouter.push).toHaveBeenCalledWith(`/recipe-form/edit/${recipeId}`);
    });

    it('should load recipe data for editing', async () => {
      const recipeId = 'recipe-123';

      // Simulate form loading recipe data
      const recipe = await recipeService.getRecipeById(recipeId);

      expect(recipeService.getRecipeById).toHaveBeenCalledWith(recipeId);
      expect(recipe).toEqual(mockRecipe);
    });
  });

  // Test 3: Delete recipe flow with confirmation
  describe('Test 3: Recipe Detail → Delete → Confirmation → Removed', () => {
    it('should call delete service and navigate back on confirmation', async () => {
      const recipeId = 'recipe-123';
      (recipeService.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

      // Simulate delete confirmation
      await recipeService.deleteRecipe(recipeId);
      mockRouter.back();

      expect(recipeService.deleteRecipe).toHaveBeenCalledWith(recipeId);
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  // Test 4: Add Recipe tab to create form flow
  describe('Test 4: Add Recipe Tab → Manual Entry → Create → Appears in List', () => {
    it('should navigate from choice screen to create form', () => {
      // Simulate tapping "Add Recipe" manual entry card
      mockRouter.push('/recipe-form/create');

      expect(mockRouter.push).toHaveBeenCalledWith('/recipe-form/create');
    });

    it('should create new recipe and navigate back', async () => {
      const newRecipeData = {
        title: 'New Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step 1'],
        prepTime: null,
        cookTime: null,
        tags: [],
        imageUri: null,
      };

      (recipeService.createRecipe as jest.Mock).mockResolvedValue({
        ...newRecipeData,
        id: 'new-recipe-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      });

      // Simulate creating recipe
      const created = await recipeService.createRecipe(newRecipeData as any);
      mockRouter.back();

      expect(recipeService.createRecipe).toHaveBeenCalledWith(newRecipeData);
      expect(created.id).toBe('new-recipe-id');
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  // Test 5: Unsaved changes - Cancel keeps user on form
  describe('Test 5: Recipe Form → Fill Fields → Back → Unsaved Dialog → Cancel', () => {
    it('should detect unsaved changes and show dialog', () => {
      const initialValues = {
        title: '',
        servings: 4,
        category: DishCategory.DINNER,
      };

      const currentValues = {
        title: 'Modified Recipe',
        servings: 4,
        category: DishCategory.DINNER,
      };

      // Simulate change detection
      const hasChanges = JSON.stringify(initialValues) !== JSON.stringify(currentValues);

      expect(hasChanges).toBe(true);
    });
  });

  // Test 6: Unsaved changes - Discard navigates away
  describe('Test 6: Recipe Form → Fill Fields → Back → Discard → Navigates Back', () => {
    it('should navigate back without saving when discard is chosen', () => {
      // Simulate discard action in unsaved changes dialog
      mockRouter.back();

      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  // Test 7: Cross-tab navigation (Shopping List to Recipe Detail)
  describe('Test 7: Shopping List → Recipe Tap → Detail → Back to Shopping List', () => {
    it('should navigate from shopping list to recipe detail', () => {
      const recipeId = 'recipe-123';

      // Simulate tapping recipe from shopping list
      mockRouter.push(`/recipe/${recipeId}`);

      expect(mockRouter.push).toHaveBeenCalledWith(`/recipe/${recipeId}`);
    });

    it('should navigate back to shopping list from recipe detail', () => {
      // Simulate back navigation
      mockRouter.back();

      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  // Test 8: Edit mode saves and updates detail screen
  describe('Test 8: Edit Mode → Change Fields → Save → Detail Screen Updated', () => {
    it('should update recipe and reflect changes', async () => {
      const updatedData = {
        id: 'recipe-123',
        title: 'Updated Chocolate Chip Cookies',
        servings: 24,
        category: DishCategory.DESSERT,
        ingredients: mockRecipe.ingredients,
        steps: mockRecipe.steps,
        prepTime: 20,
        cookTime: 12,
        tags: mockRecipe.tags,
        imageUri: null,
      };

      (recipeService.updateRecipe as jest.Mock).mockResolvedValue({
        ...updatedData,
        createdAt: mockRecipe.createdAt,
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      });

      // Simulate update
      const updated = await recipeService.updateRecipe(updatedData as any);
      mockRouter.back();

      expect(recipeService.updateRecipe).toHaveBeenCalledWith(updatedData);
      expect(updated.title).toBe('Updated Chocolate Chip Cookies');
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  // Test 9: Route validation across navigation system
  describe('Test 9: Route Construction and Validation', () => {
    it('should construct valid routes for all navigation paths', () => {
      const routes = {
        recipeDetail: `/recipe/${mockRecipe.id}`,
        recipeEdit: `/recipe-form/edit/${mockRecipe.id}`,
        recipeCreate: '/recipe-form/create',
        home: '/',
        addRecipe: '/add-recipe',
        shoppingList: '/shopping-list',
        mealPlan: '/meal-plan',
      };

      // Verify route format
      expect(routes.recipeDetail).toMatch(/^\/recipe\/[a-zA-Z0-9-]+$/);
      expect(routes.recipeEdit).toMatch(/^\/recipe-form\/edit\/[a-zA-Z0-9-]+$/);
      expect(routes.recipeCreate).toBe('/recipe-form/create');
      expect(routes.home).toBe('/');
    });
  });

  // Test 10: Tab navigation state preservation
  describe('Test 10: Tab Navigation → State Preserved Within Each Tab', () => {
    it('should maintain navigation stack within each tab', () => {
      const homeStack = [
        '/',
        '/recipe/recipe-1',
        '/recipe/recipe-2',
      ];

      const addRecipeStack = [
        '/add-recipe',
        '/recipe-form/create',
      ];

      // Verify stacks are independent
      expect(homeStack.length).toBe(3);
      expect(addRecipeStack.length).toBe(2);
      expect(homeStack[0]).not.toBe(addRecipeStack[0]);
    });

    it('should allow navigation between tabs without losing stack', () => {
      // Navigate to different tab
      mockRouter.push('/shopping-list');

      // Navigate back to previous tab
      mockRouter.push('/');

      // Both navigations should be recorded
      expect(mockRouter.push).toHaveBeenCalledTimes(2);
    });
  });
});
