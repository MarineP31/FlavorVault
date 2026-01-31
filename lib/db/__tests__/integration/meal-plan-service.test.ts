import { MealType } from '@/constants/enums';
import type { MealPlan, CreateMealPlanInput, UpdateMealPlanInput } from '@/lib/db/schema/meal-plan';

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

  const createChainMethod = (): jest.Mock =>
    jest.fn(() => mock);

  mock.select = createChainMethod();
  mock.insert = createChainMethod();
  mock.update = createChainMethod();
  mock.delete = createChainMethod();
  mock.eq = createChainMethod();
  mock.neq = createChainMethod();
  mock.gte = createChainMethod();
  mock.lte = createChainMethod();
  mock.gt = createChainMethod();
  mock.lt = createChainMethod();
  mock.in = createChainMethod();
  mock.order = createChainMethod();
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

import { MealPlanService } from '@/lib/db/services/meal-plan-service';
import { supabase, SupabaseError } from '@/lib/supabase/client';

describe('MealPlanService Integration Tests', () => {
  let mealPlanService: MealPlanService;

  const mockUserId = 'user-123';

  const mockMealPlanInput: CreateMealPlanInput = {
    recipeId: 'recipe-123',
    date: '2025-01-15',
    mealType: MealType.DINNER,
  };

  const mockMealPlanRow = {
    id: 'meal-plan-123',
    user_id: mockUserId,
    recipe_id: 'recipe-123',
    date: '2025-01-15',
    meal_type: 'dinner',
    created_at: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mealPlanService = new MealPlanService();
    mockGetCurrentUserId.mockResolvedValue(mockUserId);
  });

  describe('createMealPlan', () => {
    it('should create a meal plan successfully', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockMealPlanRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await mealPlanService.createMealPlan(mockMealPlanInput);

      expect(result.recipeId).toBe('recipe-123');
      expect(result.date).toBe('2025-01-15');
      expect(result.mealType).toBe(MealType.DINNER);
      expect(supabase.from).toHaveBeenCalledWith('meal_plans');
    });

    it('should throw validation error for missing recipe ID', async () => {
      const invalidInput: CreateMealPlanInput = {
        ...mockMealPlanInput,
        recipeId: '',
      };

      await expect(mealPlanService.createMealPlan(invalidInput)).rejects.toThrow(
        'Meal plan validation failed'
      );
    });

    it('should throw validation error for invalid date format', async () => {
      const invalidInput: CreateMealPlanInput = {
        ...mockMealPlanInput,
        date: 'not-a-date',
      };

      await expect(mealPlanService.createMealPlan(invalidInput)).rejects.toThrow(
        'Meal plan validation failed'
      );
    });

    it('should handle database errors', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(mealPlanService.createMealPlan(mockMealPlanInput)).rejects.toThrow(
        'Failed to create meal plan'
      );
    });
  });

  describe('getMealPlanById', () => {
    it('should return meal plan when found', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockMealPlanRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await mealPlanService.getMealPlanById('meal-plan-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('meal-plan-123');
    });

    it('should return null when meal plan not found', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await mealPlanService.getMealPlanById('non-existent');

      expect(result).toBeNull();
    });

    it('should only return meal plans for current user', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockMealPlanRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await mealPlanService.getMealPlanById('meal-plan-123');

      expect(chainMock.eq).toHaveBeenCalledWith('user_id', mockUserId);
    });
  });

  describe('getMealPlansByDate', () => {
    it('should return meal plans for a specific date', async () => {
      const chainMock = createChainableMock();
      chainMock.order.mockResolvedValue({ data: [mockMealPlanRow], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await mealPlanService.getMealPlansByDate('2025-01-15');

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-01-15');
      expect(chainMock.eq).toHaveBeenCalledWith('date', '2025-01-15');
    });

    it('should return empty array when no meal plans exist for date', async () => {
      const chainMock = createChainableMock();
      chainMock.order.mockResolvedValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await mealPlanService.getMealPlansByDate('2025-01-20');

      expect(result).toEqual([]);
    });
  });

  describe('getMealPlansByDateRange', () => {
    it('should return meal plans within date range', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [mockMealPlanRow], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await mealPlanService.getMealPlansByDateRange('2025-01-01', '2025-01-31');

      expect(result).toHaveLength(1);
      expect(chainMock.gte).toHaveBeenCalledWith('date', '2025-01-01');
      expect(chainMock.lte).toHaveBeenCalledWith('date', '2025-01-31');
    });

    it('should return empty array when no meal plans in range', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await mealPlanService.getMealPlansByDateRange('2025-06-01', '2025-06-30');

      expect(result).toEqual([]);
    });
  });

  describe('getMealPlansByRecipe', () => {
    it('should return meal plans for a specific recipe', async () => {
      const chainMock = createChainableMock();
      chainMock.order.mockResolvedValue({ data: [mockMealPlanRow], error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await mealPlanService.getMealPlansByRecipe('recipe-123');

      expect(result).toHaveLength(1);
      expect(result[0].recipeId).toBe('recipe-123');
      expect(chainMock.eq).toHaveBeenCalledWith('recipe_id', 'recipe-123');
    });
  });

  describe('updateMealPlan', () => {
    it('should update meal plan successfully', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValueOnce({ data: mockMealPlanRow, error: null });
      chainMock.single.mockResolvedValueOnce({
        data: { ...mockMealPlanRow, date: '2025-01-20' },
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const updateInput: UpdateMealPlanInput = {
        id: 'meal-plan-123',
        date: '2025-01-20',
      };

      const result = await mealPlanService.updateMealPlan(updateInput);

      expect(result.date).toBe('2025-01-20');
    });

    it('should throw NOT_FOUND when meal plan does not exist', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const updateInput: UpdateMealPlanInput = {
        id: 'non-existent',
        date: '2025-01-20',
      };

      await expect(mealPlanService.updateMealPlan(updateInput)).rejects.toThrow(
        'not found'
      );
    });

    it('should return existing meal plan when no updates provided', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockMealPlanRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const updateInput: UpdateMealPlanInput = {
        id: 'meal-plan-123',
      };

      const result = await mealPlanService.updateMealPlan(updateInput);

      expect(result.id).toBe('meal-plan-123');
    });
  });

  describe('deleteMealPlan', () => {
    it('should delete meal plan successfully', async () => {
      const chainMock = createChainableMock();
      (chainMock.setResolveValue as jest.Mock)({ error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(mealPlanService.deleteMealPlan('meal-plan-123')).resolves.not.toThrow();

      expect(chainMock.delete).toHaveBeenCalled();
      expect(chainMock.eq).toHaveBeenCalledWith('id', 'meal-plan-123');
    });

    it('should handle database errors during delete', async () => {
      const chainMock = createChainableMock();
      (chainMock.setResolveValue as jest.Mock)({ error: { message: 'Database error', code: 'DB_ERROR' } });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(mealPlanService.deleteMealPlan('meal-plan-123')).rejects.toThrow(
        'Failed to delete meal plan'
      );
    });
  });

  describe('deleteMealPlansByDate', () => {
    it('should delete all meal plans for a date', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(mealPlanService.deleteMealPlansByDate('2025-01-15')).resolves.not.toThrow();

      expect(chainMock.delete).toHaveBeenCalled();
      expect(chainMock.eq).toHaveBeenCalledWith('date', '2025-01-15');
    });
  });

  describe('deleteMealPlansByRecipe', () => {
    it('should delete all meal plans for a recipe', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(mealPlanService.deleteMealPlansByRecipe('recipe-123')).resolves.not.toThrow();

      expect(chainMock.delete).toHaveBeenCalled();
      expect(chainMock.eq).toHaveBeenCalledWith('recipe_id', 'recipe-123');
    });
  });

  describe('isMealSlotAvailable', () => {
    it('should return true when slot is available', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ count: 0, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await mealPlanService.isMealSlotAvailable('2025-01-15', MealType.LUNCH);

      expect(result).toBe(true);
    });

    it('should return false when slot is occupied', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ count: 1, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await mealPlanService.isMealSlotAvailable('2025-01-15', MealType.DINNER);

      expect(result).toBe(false);
    });

    it('should check correct date and meal type', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ count: 0, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await mealPlanService.isMealSlotAvailable('2025-01-15', MealType.BREAKFAST);

      expect(chainMock.eq).toHaveBeenCalledWith('date', '2025-01-15');
      expect(chainMock.eq).toHaveBeenCalledWith('meal_type', MealType.BREAKFAST);
    });
  });

  describe('getMealPlanCount', () => {
    it('should return meal plan count', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ count: 10, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await mealPlanService.getMealPlanCount();

      expect(result).toBe(10);
    });

    it('should return 0 when no meal plans exist', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ count: 0, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const result = await mealPlanService.getMealPlanCount();

      expect(result).toBe(0);
    });
  });

  describe('createMealPlansBatch', () => {
    it('should create multiple meal plans', async () => {
      const chainMock = createChainableMock();
      chainMock.single.mockResolvedValue({ data: mockMealPlanRow, error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      const inputs: CreateMealPlanInput[] = [
        mockMealPlanInput,
        { ...mockMealPlanInput, mealType: MealType.LUNCH },
      ];

      const result = await mealPlanService.createMealPlansBatch(inputs);

      expect(result).toHaveLength(2);
    });

    it('should handle empty input array', async () => {
      const result = await mealPlanService.createMealPlansBatch([]);

      expect(result).toEqual([]);
    });
  });

  describe('deleteMealPlansBatch', () => {
    it('should delete multiple meal plans', async () => {
      const chainMock = createChainableMock();
      chainMock.setResolveValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue(chainMock);

      await expect(
        mealPlanService.deleteMealPlansBatch(['meal-plan-1', 'meal-plan-2'])
      ).resolves.not.toThrow();
    });
  });
});
