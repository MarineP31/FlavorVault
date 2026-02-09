import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useRecipeShoppingList } from '../use-recipe-shopping-list';
import { shoppingListService } from '@/lib/db/services/shopping-list-service';
import { shoppingListGenerator } from '@/lib/services/shopping-list-generator';
import { recipeService } from '@/lib/db/services/recipe-service';

jest.mock('@/lib/db/services/shopping-list-service');
jest.mock('@/lib/services/shopping-list-generator');
jest.mock('@/lib/db/services/recipe-service');
jest.mock('@/lib/contexts/shopping-list-context', () => ({
  useShoppingList: () => ({
    flatItems: [],
    refreshList: jest.fn(),
  }),
}));
jest.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));
jest.mock('@/lib/contexts/meal-plan-context', () => ({
  useMealPlan: () => ({
    queue: [],
    addToQueue: jest.fn(),
    removeFromQueue: jest.fn(),
    isInQueue: jest.fn(() => false),
    notifyRecipeAdded: jest.fn(),
    notifyRecipeRemoved: jest.fn(),
  }),
}));

const mockShoppingListService = shoppingListService as jest.Mocked<typeof shoppingListService>;
const mockShoppingListGenerator = shoppingListGenerator as jest.Mocked<typeof shoppingListGenerator>;
const mockRecipeService = recipeService as jest.Mocked<typeof recipeService>;

describe('useRecipeShoppingList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isRecipeInShoppingList state', () => {
    it('should return true when recipe items exist in shopping list', async () => {
      mockShoppingListService.isRecipeInShoppingList.mockResolvedValue(true);

      const { result } = renderHook(() =>
        useRecipeShoppingList('recipe-123', 'Test Recipe')
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInShoppingList).toBe(true);
    });

    it('should return false when no items exist for recipe', async () => {
      mockShoppingListService.isRecipeInShoppingList.mockResolvedValue(false);

      const { result } = renderHook(() =>
        useRecipeShoppingList('recipe-456', 'Another Recipe')
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInShoppingList).toBe(false);
    });
  });

  describe('toggleShoppingList', () => {
    it('should add ingredients when recipe is not in list', async () => {
      mockShoppingListService.isRecipeInShoppingList.mockResolvedValue(false);
      mockRecipeService.getRecipeById.mockResolvedValue({
        id: 'recipe-123',
        title: 'Test Recipe',
        servings: 4,
        category: 'dinner',
        ingredients: [{ name: 'Eggs', quantity: 2, unit: null }],
        steps: ['Step 1'],
        imageUri: null,
        prepTime: 10,
        cookTime: 20,
        tags: [],
        source: null,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        deletedAt: null,
      } as any);
      mockShoppingListGenerator.addRecipeToShoppingList.mockResolvedValue([]);

      const { result } = renderHook(() =>
        useRecipeShoppingList('recipe-123', 'Test Recipe')
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleShoppingList();
      });

      expect(mockShoppingListGenerator.addRecipeToShoppingList).toHaveBeenCalled();
    });

    it('should remove ingredients when recipe is in list', async () => {
      mockShoppingListService.isRecipeInShoppingList.mockResolvedValue(true);
      mockShoppingListService.deleteByRecipeId.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useRecipeShoppingList('recipe-123', 'Test Recipe')
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleShoppingList();
      });

      expect(mockShoppingListService.deleteByRecipeId).toHaveBeenCalledWith('recipe-123');
    });
  });
});
