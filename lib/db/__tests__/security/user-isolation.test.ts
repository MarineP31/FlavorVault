/**
 * User Isolation Security Tests
 *
 * These tests verify that users cannot access, modify, or delete
 * data belonging to other users. This is a critical security feature
 * enforced by Row Level Security (RLS) in Supabase.
 */

import { DishCategory, MeasurementUnit, MealType } from '@/constants/enums';

const mockGetCurrentUserId = jest.fn();

interface ChainableMock {
  setResolveValue: (value: unknown) => void;
  [key: string]: jest.Mock | ((value: unknown) => void);
}

const createChainableMock = (): ChainableMock => {
  let resolveValue: unknown = { data: [], error: null };

  const mock: ChainableMock = {} as ChainableMock;

  mock.setResolveValue = (value: unknown) => {
    resolveValue = value;
  };

  const createChainMethod = (): jest.Mock => jest.fn(() => mock);

  mock.select = createChainMethod();
  mock.insert = createChainMethod();
  mock.update = createChainMethod();
  mock.delete = createChainMethod();
  mock.eq = createChainMethod();
  mock.neq = createChainMethod();
  mock.is = createChainMethod();
  mock.ilike = createChainMethod();
  mock.contains = createChainMethod();
  mock.order = createChainMethod();
  mock.range = createChainMethod();
  mock.gte = createChainMethod();
  mock.lte = createChainMethod();
  mock.limit = createChainMethod();
  mock.single = jest.fn(() => Promise.resolve(resolveValue));
  mock.maybeSingle = jest.fn(() => Promise.resolve(resolveValue));
  mock.then = jest.fn((resolve: (value: unknown) => unknown) => Promise.resolve(resolve(resolveValue)));

  return mock;
};

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => createChainableMock()),
  },
  getCurrentUserId: () => mockGetCurrentUserId(),
  SupabaseError: class SupabaseError extends Error {
    public readonly code: string;
    public readonly originalError?: unknown;
    constructor(code: string, message: string, originalError?: unknown) {
      super(message);
      this.name = 'SupabaseError';
      this.code = code;
      this.originalError = originalError;
    }
  },
}));

import { RecipeService } from '@/lib/db/services/recipe-service';
import { MealPlanService } from '@/lib/db/services/meal-plan-service';
import { ShoppingListService } from '@/lib/db/services/shopping-list-service';
import { TagService } from '@/lib/db/services/tag-service';
import { supabase } from '@/lib/supabase/client';

describe('User Isolation Security Tests', () => {
  const userA = 'user-a-123';
  const userB = 'user-b-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Recipe Isolation', () => {
    let recipeService: RecipeService;

    beforeEach(() => {
      recipeService = new RecipeService();
    });

    describe('User A cannot read User B recipes', () => {
      it('should filter recipes by current user ID', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.setResolveValue({ data: [], error: null });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        await recipeService.getAllRecipes();

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
        expect(chainMock.eq).not.toHaveBeenCalledWith('user_id', userB);
      });

      it('should not return recipes from other users', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        const result = await recipeService.getRecipeById('recipe-owned-by-user-b');

        expect(result).toBeNull();
        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });

    describe('User A cannot update User B recipes', () => {
      it('should include user_id filter in update query', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        try {
          await recipeService.updateRecipe({
            id: 'recipe-owned-by-user-b',
            title: 'Hacked Title',
          });
        } catch (e) {
          // Expected to fail
        }

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });

    describe('User A cannot delete User B recipes', () => {
      it('should include user_id filter in delete query', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        try {
          await recipeService.deleteRecipe('recipe-owned-by-user-b');
        } catch (e) {
          // Expected to fail
        }

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });

    describe('Search respects user isolation', () => {
      it('should only search within current user recipes', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.setResolveValue({ data: [], error: null });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        await recipeService.searchRecipes('test');

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });
  });

  describe('MealPlan Isolation', () => {
    let mealPlanService: MealPlanService;

    beforeEach(() => {
      mealPlanService = new MealPlanService();
    });

    describe('User A cannot read User B meal plans', () => {
      it('should filter meal plans by current user ID', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.setResolveValue({ data: [], error: null });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        await mealPlanService.getMealPlansByDate('2025-01-15');

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });

      it('should not return meal plans from other users', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        const result = await mealPlanService.getMealPlanById('meal-plan-owned-by-user-b');

        expect(result).toBeNull();
      });
    });

    describe('User A cannot update User B meal plans', () => {
      it('should include user_id filter in update query', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        try {
          await mealPlanService.updateMealPlan({
            id: 'meal-plan-owned-by-user-b',
            date: '2025-12-31',
          });
        } catch (e) {
          // Expected to fail
        }

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });

    describe('User A cannot delete User B meal plans', () => {
      it('should include user_id filter in delete query', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.setResolveValue({ error: null });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        await mealPlanService.deleteMealPlan('meal-plan-owned-by-user-b');

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });

    describe('Date range queries respect user isolation', () => {
      it('should filter date range results by user', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.setResolveValue({ data: [], error: null });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        await mealPlanService.getMealPlansByDateRange('2025-01-01', '2025-01-31');

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });
  });

  describe('ShoppingList Isolation', () => {
    let shoppingListService: ShoppingListService;

    beforeEach(() => {
      shoppingListService = new ShoppingListService();
    });

    describe('User A cannot read User B shopping items', () => {
      it('should filter shopping items by current user ID', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.setResolveValue({ data: [], error: null });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        await shoppingListService.getAll();

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });

      it('should not return shopping items from other users', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        const result = await shoppingListService.getShoppingListItemById('item-owned-by-user-b');

        expect(result).toBeNull();
      });
    });

    describe('User A cannot update User B shopping items', () => {
      it('should include user_id filter in update query', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        try {
          await shoppingListService.updateShoppingItem({
            id: 'item-owned-by-user-b',
            name: 'Hacked Item',
          });
        } catch (e) {
          // Expected to fail
        }

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });

    describe('User A cannot delete User B shopping items', () => {
      it('should include user_id filter in delete query', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.setResolveValue({ error: null });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        await shoppingListService.deleteItem('item-owned-by-user-b');

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });

    describe('Clear operations respect user isolation', () => {
      it('clearAll should only affect current user items', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.setResolveValue({ error: null });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        await shoppingListService.clearAll();

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });

      it('deleteAllCheckedItems should only affect current user items', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.setResolveValue({ error: null });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        await shoppingListService.deleteAllCheckedItems();

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });
  });

  describe('Tag Isolation', () => {
    let tagService: TagService;

    beforeEach(() => {
      tagService = new TagService();
    });

    describe('User A cannot read User B tags', () => {
      it('should filter tags by current user ID', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.setResolveValue({ data: [], error: null });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        await tagService.getAllTags();

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });

    describe('User A cannot read User B custom categories', () => {
      it('should filter custom categories by current user ID', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.setResolveValue({ data: [], error: null });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        await tagService.getAllTags();

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });

    describe('User A cannot delete User B custom categories', () => {
      it('should include user_id filter when fetching category to delete', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        try {
          await tagService.deleteCategory('category-owned-by-user-b');
        } catch (e) {
          // Expected to fail
        }

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });

    describe('Recipe tags respect user isolation', () => {
      it('should filter recipe tags by current user ID', async () => {
        mockGetCurrentUserId.mockResolvedValue(userA);
        const chainMock = createChainableMock();
        chainMock.setResolveValue({ data: [], error: null });
        (supabase.from as jest.Mock).mockReturnValue(chainMock);

        await tagService.getTagsForRecipe('recipe-123');

        expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);
      });
    });
  });

  describe('Cross-User Data Creation', () => {
    it('should create recipes with current user ID', async () => {
      mockGetCurrentUserId.mockResolvedValue(userA);
      const recipeService = new RecipeService();
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: {
          id: 'new-recipe',
          user_id: userA,
          title: 'Test',
          servings: 4,
          category: 'dinner',
          ingredients: [{ name: 'test', quantity: 1, unit: 'cup' }],
          steps: ['Step 1'],
          image_uri: null,
          prep_time: null,
          cook_time: null,
          tags: [],
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
          deleted_at: null,
        },
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await recipeService.createRecipe({
        title: 'Test',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'test', quantity: 1, unit: MeasurementUnit.CUP }],
        steps: ['Step 1'],
      });

      expect(chainMock.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userA,
        })
      );
    });

    it('should create meal plans with current user ID', async () => {
      mockGetCurrentUserId.mockResolvedValue(userA);
      const mealPlanService = new MealPlanService();
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: {
          id: 'new-meal-plan',
          user_id: userA,
          recipe_id: 'recipe-123',
          date: '2025-01-15',
          meal_type: 'dinner',
          created_at: '2025-01-01T00:00:00.000Z',
        },
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await mealPlanService.createMealPlan({
        recipeId: 'recipe-123',
        date: '2025-01-15',
        mealType: MealType.DINNER,
      });

      expect(chainMock.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userA,
        })
      );
    });

    it('should create shopping list items with current user ID', async () => {
      mockGetCurrentUserId.mockResolvedValue(userA);
      const shoppingListService = new ShoppingListService();
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: {
          id: 'new-item',
          user_id: userA,
          name: 'Milk',
          quantity: 1,
          unit: 'cup',
          checked: false,
          recipe_id: null,
          meal_plan_id: null,
          category: 'Dairy',
          source: 'manual',
          original_name: null,
          created_at: '2025-01-01T00:00:00.000Z',
        },
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await shoppingListService.createItem({
        name: 'Milk',
        quantity: 1,
        unit: MeasurementUnit.CUP,
        category: 'Dairy',
        source: 'manual',
      });

      expect(chainMock.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userA,
        })
      );
    });
  });

  describe('User Context Switching', () => {
    it('should use correct user ID after context switch', async () => {
      const recipeService = new RecipeService();
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      mockGetCurrentUserId.mockResolvedValue(userA);
      await recipeService.getAllRecipes();
      expect(chainMock.eq).toHaveBeenCalledWith('user_id', userA);

      jest.clearAllMocks();
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      mockGetCurrentUserId.mockResolvedValue(userB);
      await recipeService.getAllRecipes();
      expect(chainMock.eq).toHaveBeenCalledWith('user_id', userB);
    });
  });

  describe('Authentication Required', () => {
    it('should throw error when user is not authenticated', async () => {
      mockGetCurrentUserId.mockRejectedValue(new Error('Not authenticated'));

      const recipeService = new RecipeService();

      await expect(recipeService.getAllRecipes()).rejects.toThrow('Not authenticated');
    });
  });
});
