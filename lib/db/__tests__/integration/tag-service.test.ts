import type {
  CustomCategory,
  RecipeTag,
  CreateCustomCategoryInput,
  CreateTagInput,
  CategoryWithTags,
} from '@/lib/db/schema/tags';

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

import { TagService } from '@/lib/db/services/tag-service';
import { supabase, SupabaseError } from '@/lib/supabase/client';

describe('TagService Integration Tests', () => {
  let tagService: TagService;

  const mockUserId = 'user-123';

  const mockCustomCategoryRow = {
    id: 'category-123',
    user_id: mockUserId,
    name: 'My Custom Category',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    deleted_at: null,
  };

  const mockRecipeTagRow = {
    id: 'tag-123',
    user_id: mockUserId,
    recipe_id: 'recipe-123',
    category_type: 'default',
    category_name: 'Cuisine',
    tag_value: 'Italian',
    created_at: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    tagService = new TagService();
    mockGetCurrentUserId.mockResolvedValue(mockUserId);
  });

  describe('getAllTags', () => {
    it('should return all tags including predefined categories', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await tagService.getAllTags();

      expect(result).toBeInstanceOf(Array);
      expect(result.some((c) => c.name === 'Cuisine')).toBe(true);
      expect(result.some((c) => c.name === 'Dietary')).toBe(true);
      expect(result.some((c) => c.name === 'Meal Type')).toBe(true);
      expect(result.some((c) => c.name === 'Cooking Method')).toBe(true);
    });

    it('should include custom categories', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [mockCustomCategoryRow], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await tagService.getAllTags();

      expect(result.some((c) => c.name === 'My Custom Category')).toBe(true);
    });

    it('should include predefined tags in default categories', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await tagService.getAllTags();

      const cuisineCategory = result.find((c) => c.name === 'Cuisine');
      expect(cuisineCategory?.tags).toContain('Italian');
      expect(cuisineCategory?.tags).toContain('Mexican');
    });
  });

  describe('getTagsByCategory', () => {
    it('should return predefined tags for default category', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await tagService.getTagsByCategory('Cuisine');

      expect(result).toContain('Italian');
      expect(result).toContain('Mexican');
    });

    it('should include custom tags added to default category', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({
        data: [{ tag_value: 'Custom Cuisine' }],
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await tagService.getTagsByCategory('Cuisine');

      expect(result).toContain('Custom Cuisine');
    });

    it('should return empty array for empty custom category', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await tagService.getTagsByCategory('Custom Category');

      expect(result).toEqual([]);
    });
  });

  describe('createTag', () => {
    it('should create a tag successfully', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ count: 0, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const input: CreateTagInput = {
        recipeId: 'recipe-123',
        categoryType: 'default',
        categoryName: 'Cuisine',
        tagValue: 'New Tag',
      };

      const result = await tagService.createTag(input);

      expect(result.tagValue).toBe('New Tag');
      expect(result.categoryName).toBe('Cuisine');
    });

    it('should throw validation error for empty tag value', async () => {
      const input: CreateTagInput = {
        recipeId: 'recipe-123',
        categoryType: 'default',
        categoryName: 'Cuisine',
        tagValue: '',
      };

      await expect(tagService.createTag(input)).rejects.toThrow(
        'Tag validation failed'
      );
    });

    it('should throw validation error for tag value over 30 characters', async () => {
      const input: CreateTagInput = {
        recipeId: 'recipe-123',
        categoryType: 'default',
        categoryName: 'Cuisine',
        tagValue: 'a'.repeat(31),
      };

      await expect(tagService.createTag(input)).rejects.toThrow(
        'Tag validation failed'
      );
    });

    it('should throw error for duplicate tag', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ count: 1, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const input: CreateTagInput = {
        recipeId: 'recipe-123',
        categoryType: 'default',
        categoryName: 'Cuisine',
        tagValue: 'Italian',
      };

      await expect(tagService.createTag(input)).rejects.toThrow('already exists');
    });
  });

  describe('updateTag', () => {
    it('should update tag value successfully', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ count: 0, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(tagService.updateTag('Old Tag', 'New Tag')).resolves.not.toThrow();

      expect(chainMock.update).toHaveBeenCalledWith({ tag_value: 'New Tag' });
    });

    it('should throw validation error for empty new value', async () => {
      await expect(tagService.updateTag('Old Tag', '')).rejects.toThrow(
        'Tag validation failed'
      );
    });

    it('should throw error when new value already exists', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ count: 1, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(tagService.updateTag('Old Tag', 'Existing Tag')).rejects.toThrow(
        'already exists'
      );
    });

    it('should skip duplicate check when value unchanged', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await tagService.updateTag('Same Tag', 'Same Tag');

      expect(chainMock.update).toHaveBeenCalled();
    });
  });

  describe('deleteTag', () => {
    it('should delete tag successfully', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(tagService.deleteTag('Tag to Delete')).resolves.not.toThrow();

      expect(chainMock.delete).toHaveBeenCalled();
      expect(chainMock.eq).toHaveBeenCalledWith('tag_value', 'Tag to Delete');
    });

    it('should handle database errors', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({
        error: { message: 'Database error', code: 'DB_ERROR' },
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(tagService.deleteTag('Tag')).rejects.toThrow('Failed to delete tag');
    });
  });

  describe('createCategory', () => {
    it('should create custom category successfully', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ count: 0, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const input: CreateCustomCategoryInput = {
        name: 'New Category',
      };

      const result = await tagService.createCategory(input);

      expect(result.name).toBe('New Category');
    });

    it('should throw validation error for empty category name', async () => {
      const input: CreateCustomCategoryInput = {
        name: '',
      };

      await expect(tagService.createCategory(input)).rejects.toThrow(
        'Category validation failed'
      );
    });

    it('should throw validation error for category name over 30 characters', async () => {
      const input: CreateCustomCategoryInput = {
        name: 'a'.repeat(31),
      };

      await expect(tagService.createCategory(input)).rejects.toThrow(
        'Category validation failed'
      );
    });

    it('should throw error for duplicate category name', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ count: 1, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const input: CreateCustomCategoryInput = {
        name: 'Existing Category',
      };

      await expect(tagService.createCategory(input)).rejects.toThrow('already exists');
    });

    it('should throw error when using default category name', async () => {
      const input: CreateCustomCategoryInput = {
        name: 'Cuisine',
      };

      await expect(tagService.createCategory(input)).rejects.toThrow(
        'Category validation failed'
      );
    });
  });

  describe('deleteCategory', () => {
    it('should soft delete custom category', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockCustomCategoryRow, error: null });
      chainMock.setResolveValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(tagService.deleteCategory('category-123')).resolves.not.toThrow();

      expect(chainMock.update).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND for non-existent category', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(tagService.deleteCategory('non-existent')).rejects.toThrow(
        'not found'
      );
    });

    it('should delete associated tags when deleting category', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockCustomCategoryRow, error: null });
      chainMock.setResolveValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await tagService.deleteCategory('category-123');

      expect(supabase.from).toHaveBeenCalledWith('recipe_tags');
      expect(chainMock.delete).toHaveBeenCalled();
    });
  });

  describe('getTagsForRecipe', () => {
    it('should return tags for a recipe', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [mockRecipeTagRow], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await tagService.getTagsForRecipe('recipe-123');

      expect(result).toHaveLength(1);
      expect(result[0].tagValue).toBe('Italian');
    });

    it('should return empty array when recipe has no tags', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await tagService.getTagsForRecipe('recipe-without-tags');

      expect(result).toEqual([]);
    });
  });

  describe('addTagsToRecipe', () => {
    it('should add tags to recipe', async () => {
      const chainMock = createChainableMock();
            (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const tags = [
        { categoryName: 'Cuisine', tagValue: 'Italian', categoryType: 'default' as const },
        { categoryName: 'Dietary', tagValue: 'Vegetarian', categoryType: 'default' as const },
      ];

      await expect(tagService.addTagsToRecipe('recipe-123', tags)).resolves.not.toThrow();

      expect(chainMock.insert).toHaveBeenCalledTimes(2);
    });

    it('should handle empty tags array', async () => {
      await expect(tagService.addTagsToRecipe('recipe-123', [])).resolves.not.toThrow();

      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('removeAllTagsFromRecipe', () => {
    it('should remove all tags from recipe', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(tagService.removeAllTagsFromRecipe('recipe-123')).resolves.not.toThrow();

      expect(chainMock.delete).toHaveBeenCalled();
      expect(chainMock.eq).toHaveBeenCalledWith('recipe_id', 'recipe-123');
    });
  });

  describe('searchTags', () => {
    it('should return matching tags across categories', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await tagService.searchTags('ital');

      const cuisineResult = result.find((c) => c.name === 'Cuisine');
      expect(cuisineResult?.tags).toContain('Italian');
    });

    it('should return empty array when no tags match', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await tagService.searchTags('xyz123nonexistent');

      expect(result.every((c) => c.tags.length === 0)).toBe(true);
    });

    it('should be case-insensitive', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await tagService.searchTags('ITALIAN');

      const cuisineResult = result.find((c) => c.name === 'Cuisine');
      expect(cuisineResult?.tags).toContain('Italian');
    });
  });

  describe('validateTagName', () => {
    it('should return true for valid new tag name', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ count: 0, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await tagService.validateTagName('New Tag');

      expect(result).toBe(true);
    });

    it('should return false for existing tag name', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ count: 1, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await tagService.validateTagName('Existing Tag');

      expect(result).toBe(false);
    });
  });
});
