import {
  classifyIngredient,
  getCategoryKeywords,
  getAllCategories,
  isValidCategory,
} from '@/lib/utils/category-classifier';

describe('category-classifier', () => {
  describe('classifyIngredient', () => {
    describe('Produce', () => {
      it('should classify vegetables as Produce', () => {
        expect(classifyIngredient('tomato')).toBe('Produce');
        expect(classifyIngredient('onion')).toBe('Produce');
        expect(classifyIngredient('garlic')).toBe('Produce');
        expect(classifyIngredient('carrot')).toBe('Produce');
        expect(classifyIngredient('lettuce')).toBe('Produce');
        expect(classifyIngredient('spinach')).toBe('Produce');
        expect(classifyIngredient('broccoli')).toBe('Produce');
      });

      it('should classify fruits as Produce', () => {
        expect(classifyIngredient('apple')).toBe('Produce');
        expect(classifyIngredient('banana')).toBe('Produce');
        expect(classifyIngredient('orange')).toBe('Produce');
        expect(classifyIngredient('lemon')).toBe('Produce');
        expect(classifyIngredient('strawberry')).toBe('Produce');
      });

      it('should classify herbs as Produce', () => {
        expect(classifyIngredient('basil')).toBe('Produce');
        expect(classifyIngredient('cilantro')).toBe('Produce');
        expect(classifyIngredient('parsley')).toBe('Produce');
        expect(classifyIngredient('thyme')).toBe('Produce');
        expect(classifyIngredient('rosemary')).toBe('Produce');
      });

      it('should handle variations', () => {
        expect(classifyIngredient('Fresh Tomatoes')).toBe('Produce');
        expect(classifyIngredient('GARLIC')).toBe('Produce');
        expect(classifyIngredient('  onion  ')).toBe('Produce');
      });
    });

    describe('Dairy', () => {
      it('should classify dairy products', () => {
        expect(classifyIngredient('milk')).toBe('Dairy');
        expect(classifyIngredient('cheese')).toBe('Dairy');
        expect(classifyIngredient('butter')).toBe('Dairy');
        expect(classifyIngredient('yogurt')).toBe('Dairy');
        expect(classifyIngredient('cream')).toBe('Dairy');
      });

      it('should classify specific cheeses', () => {
        expect(classifyIngredient('cheddar cheese')).toBe('Dairy');
        expect(classifyIngredient('mozzarella')).toBe('Dairy');
        expect(classifyIngredient('parmesan')).toBe('Dairy');
        expect(classifyIngredient('feta')).toBe('Dairy');
      });

      it('should classify eggs as Dairy', () => {
        expect(classifyIngredient('egg')).toBe('Dairy');
        expect(classifyIngredient('eggs')).toBe('Dairy');
      });
    });

    describe('Meat & Seafood', () => {
      it('should classify meats', () => {
        expect(classifyIngredient('chicken')).toBe('Meat & Seafood');
        expect(classifyIngredient('beef')).toBe('Meat & Seafood');
        expect(classifyIngredient('pork')).toBe('Meat & Seafood');
        expect(classifyIngredient('turkey')).toBe('Meat & Seafood');
        expect(classifyIngredient('bacon')).toBe('Meat & Seafood');
      });

      it('should classify seafood', () => {
        expect(classifyIngredient('salmon')).toBe('Meat & Seafood');
        expect(classifyIngredient('shrimp')).toBe('Meat & Seafood');
        expect(classifyIngredient('tuna')).toBe('Meat & Seafood');
        expect(classifyIngredient('crab')).toBe('Meat & Seafood');
        expect(classifyIngredient('lobster')).toBe('Meat & Seafood');
      });

      it('should classify specific cuts', () => {
        expect(classifyIngredient('chicken breast')).toBe('Meat & Seafood');
        expect(classifyIngredient('ground beef')).toBe('Meat & Seafood');
        expect(classifyIngredient('pork chops')).toBe('Meat & Seafood');
      });
    });

    describe('Pantry', () => {
      it('should classify dry goods', () => {
        expect(classifyIngredient('flour')).toBe('Pantry');
        expect(classifyIngredient('sugar')).toBe('Pantry');
        expect(classifyIngredient('rice')).toBe('Pantry');
        expect(classifyIngredient('pasta')).toBe('Pantry');
        expect(classifyIngredient('oats')).toBe('Pantry');
      });

      it('should classify oils and condiments', () => {
        expect(classifyIngredient('olive oil')).toBe('Pantry');
        expect(classifyIngredient('vegetable oil')).toBe('Pantry');
        expect(classifyIngredient('soy sauce')).toBe('Pantry');
        expect(classifyIngredient('vinegar')).toBe('Pantry');
      });

      it('should classify spices', () => {
        expect(classifyIngredient('cinnamon')).toBe('Pantry');
        expect(classifyIngredient('cumin')).toBe('Pantry');
        expect(classifyIngredient('paprika')).toBe('Pantry');
        expect(classifyIngredient('salt')).toBe('Pantry');
        expect(classifyIngredient('black pepper')).toBe('Pantry');
      });

      it('should classify broth and stock', () => {
        expect(classifyIngredient('chicken broth')).toBe('Pantry');
        expect(classifyIngredient('vegetable stock')).toBe('Pantry');
      });

      it('should classify beans and legumes', () => {
        expect(classifyIngredient('black bean')).toBe('Pantry');
        expect(classifyIngredient('lentil')).toBe('Pantry');
        expect(classifyIngredient('chickpea')).toBe('Pantry');
      });

      it('should classify baking items', () => {
        expect(classifyIngredient('baking powder')).toBe('Pantry');
        expect(classifyIngredient('baking soda')).toBe('Pantry');
        expect(classifyIngredient('yeast')).toBe('Pantry');
        expect(classifyIngredient('vanilla extract')).toBe('Pantry');
      });
    });

    describe('Frozen', () => {
      it('should classify frozen items', () => {
        expect(classifyIngredient('frozen vegetable')).toBe('Frozen');
        expect(classifyIngredient('frozen fruit')).toBe('Frozen');
        expect(classifyIngredient('ice cream')).toBe('Frozen');
        expect(classifyIngredient('frozen pizza')).toBe('Frozen');
        expect(classifyIngredient('frozen dinner')).toBe('Frozen');
      });
    });

    describe('Bakery', () => {
      it('should classify bakery items', () => {
        expect(classifyIngredient('bread')).toBe('Bakery');
        expect(classifyIngredient('baguette')).toBe('Bakery');
        expect(classifyIngredient('tortilla')).toBe('Bakery');
        expect(classifyIngredient('bagel')).toBe('Bakery');
        expect(classifyIngredient('croissant')).toBe('Bakery');
      });
    });

    describe('Other', () => {
      it('should classify unrecognized items as Other', () => {
        expect(classifyIngredient('random item')).toBe('Other');
        expect(classifyIngredient('xyz123')).toBe('Other');
        expect(classifyIngredient('paper towels')).toBe('Other');
      });
    });

    describe('Edge cases', () => {
      it('should handle empty string', () => {
        expect(classifyIngredient('')).toBe('Other');
      });

      it('should handle whitespace only', () => {
        expect(classifyIngredient('   ')).toBe('Other');
      });

      it('should handle case insensitivity', () => {
        expect(classifyIngredient('TOMATO')).toBe('Produce');
        expect(classifyIngredient('Milk')).toBe('Dairy');
      });
    });
  });

  describe('getCategoryKeywords', () => {
    it('should return keywords for Produce', () => {
      const keywords = getCategoryKeywords('Produce');
      expect(keywords).toContain('tomato');
      expect(keywords).toContain('apple');
      expect(keywords).toContain('basil');
    });

    it('should return keywords for Dairy', () => {
      const keywords = getCategoryKeywords('Dairy');
      expect(keywords).toContain('milk');
      expect(keywords).toContain('cheese');
      expect(keywords).toContain('butter');
    });

    it('should return empty array for Other', () => {
      const keywords = getCategoryKeywords('Other');
      expect(keywords).toHaveLength(0);
    });

    it('should return a copy of keywords array', () => {
      const keywords1 = getCategoryKeywords('Produce');
      const keywords2 = getCategoryKeywords('Produce');
      expect(keywords1).not.toBe(keywords2);
      expect(keywords1).toEqual(keywords2);
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories in correct order', () => {
      const categories = getAllCategories();
      expect(categories).toEqual([
        'Produce',
        'Dairy',
        'Meat & Seafood',
        'Pantry',
        'Frozen',
        'Bakery',
        'Other',
      ]);
    });

    it('should return 7 categories', () => {
      expect(getAllCategories()).toHaveLength(7);
    });
  });

  describe('isValidCategory', () => {
    it('should return true for valid categories', () => {
      expect(isValidCategory('Produce')).toBe(true);
      expect(isValidCategory('Dairy')).toBe(true);
      expect(isValidCategory('Meat & Seafood')).toBe(true);
      expect(isValidCategory('Pantry')).toBe(true);
      expect(isValidCategory('Frozen')).toBe(true);
      expect(isValidCategory('Bakery')).toBe(true);
      expect(isValidCategory('Other')).toBe(true);
    });

    it('should return false for invalid categories', () => {
      expect(isValidCategory('Invalid')).toBe(false);
      expect(isValidCategory('produce')).toBe(false);
      expect(isValidCategory('')).toBe(false);
      expect(isValidCategory('Meat')).toBe(false);
    });
  });
});
