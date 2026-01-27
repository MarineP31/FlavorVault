import {
  isShoppingListEmpty,
  getEmptyStateMessage,
  shouldShowAddButton,
  getEmptyStateIcon,
  determineEmptyStateType,
  getEmptyStateContent,
  EmptyStateType,
} from '@/components/shopping-list/EmptyShoppingList';

describe('EmptyShoppingList utility functions', () => {
  describe('isShoppingListEmpty', () => {
    it('should return true for zero items', () => {
      expect(isShoppingListEmpty(0)).toBe(true);
    });

    it('should return false for non-zero items', () => {
      expect(isShoppingListEmpty(1)).toBe(false);
      expect(isShoppingListEmpty(10)).toBe(false);
    });
  });

  describe('getEmptyStateMessage', () => {
    it('should return correct message when has queued recipes', () => {
      const result = getEmptyStateMessage(true);
      expect(result.title).toBe('No Items Yet');
      expect(result.message).toContain('Pull down to refresh');
    });

    it('should return correct message when no queued recipes', () => {
      const result = getEmptyStateMessage(false);
      expect(result.title).toBe('Your List is Empty');
      expect(result.message).toContain('Add recipes to your meal plan');
    });
  });

  describe('shouldShowAddButton', () => {
    it('should return true when has queued recipes', () => {
      expect(shouldShowAddButton(true)).toBe(true);
    });

    it('should return true when no queued recipes', () => {
      expect(shouldShowAddButton(false)).toBe(true);
    });
  });

  describe('getEmptyStateIcon', () => {
    it('should return refresh icon when has queued recipes', () => {
      expect(getEmptyStateIcon(true)).toBe('refresh-outline');
    });

    it('should return cart icon when no queued recipes', () => {
      expect(getEmptyStateIcon(false)).toBe('cart-outline');
    });
  });

  describe('determineEmptyStateType', () => {
    it('should return no-recipes when no items and no queued recipes', () => {
      const result = determineEmptyStateType(false, 0, 0);
      expect(result).toBe('no-recipes');
    });

    it('should return no-items when no items but has queued recipes', () => {
      const result = determineEmptyStateType(true, 0, 0);
      expect(result).toBe('no-items');
    });

    it('should return all-checked when all items are checked', () => {
      const result = determineEmptyStateType(false, 5, 5);
      expect(result).toBe('all-checked');
    });

    it('should return no-items when has items but not all checked', () => {
      const result = determineEmptyStateType(false, 5, 3);
      expect(result).toBe('no-items');
    });
  });

  describe('getEmptyStateContent', () => {
    it('should return correct content for no-recipes', () => {
      const content = getEmptyStateContent('no-recipes');
      expect(content.title).toBe('Your List is Empty');
      expect(content.icon).toBe('cart-outline');
    });

    it('should return correct content for no-items', () => {
      const content = getEmptyStateContent('no-items');
      expect(content.title).toBe('No Items Yet');
      expect(content.icon).toBe('refresh-outline');
    });

    it('should return correct content for all-checked', () => {
      const content = getEmptyStateContent('all-checked');
      expect(content.title).toBe('All Done!');
      expect(content.icon).toBe('checkmark-circle-outline');
    });

    it('should return default content for unknown type', () => {
      const content = getEmptyStateContent('unknown' as EmptyStateType);
      expect(content.title).toBe('Your List is Empty');
      expect(content.icon).toBe('cart-outline');
    });
  });
});
