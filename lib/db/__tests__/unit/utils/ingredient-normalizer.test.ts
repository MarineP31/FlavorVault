import {
  normalizeIngredientName,
  createNormalizationKey,
  areIngredientsSimilar,
  extractBaseIngredient,
} from '@/lib/utils/ingredient-normalizer';

describe('ingredient-normalizer', () => {
  describe('normalizeIngredientName', () => {
    describe('basic normalization', () => {
      it('should convert to lowercase', () => {
        expect(normalizeIngredientName('TOMATO')).toBe('tomato');
        expect(normalizeIngredientName('Onion')).toBe('onion');
        expect(normalizeIngredientName('GaRLiC')).toBe('garlic');
      });

      it('should trim whitespace', () => {
        expect(normalizeIngredientName('  tomato  ')).toBe('tomato');
        expect(normalizeIngredientName('\t onion \n')).toBe('onion');
      });

      it('should normalize multiple spaces', () => {
        expect(normalizeIngredientName('olive   oil')).toBe('olive oil');
        expect(normalizeIngredientName('bell   pepper')).toBe('bell pepper');
      });
    });

    describe('plural handling', () => {
      it('should convert common plurals to singular', () => {
        expect(normalizeIngredientName('eggs')).toBe('egg');
        expect(normalizeIngredientName('tomatoes')).toBe('tomato');
        expect(normalizeIngredientName('potatoes')).toBe('potato');
        expect(normalizeIngredientName('onions')).toBe('onion');
        expect(normalizeIngredientName('carrots')).toBe('carrot');
      });

      it('should handle irregular plurals', () => {
        expect(normalizeIngredientName('berries')).toBe('berry');
        expect(normalizeIngredientName('cherries')).toBe('cherry');
        expect(normalizeIngredientName('leaves')).toBe('leaf');
      });

      it('should handle plural at end of compound words', () => {
        expect(normalizeIngredientName('green onions')).toBe('green onion');
        expect(normalizeIngredientName('tomatoes')).toBe('tomato');
      });
    });

    describe('descriptor removal', () => {
      it('should remove freshness descriptors', () => {
        expect(normalizeIngredientName('fresh basil')).toBe('basil');
        expect(normalizeIngredientName('dried oregano')).toBe('oregano');
        expect(normalizeIngredientName('frozen peas')).toBe('peas');
      });

      it('should remove preparation descriptors', () => {
        expect(normalizeIngredientName('chopped tomato')).toBe('tomato');
        expect(normalizeIngredientName('minced garlic')).toBe('garlic');
        expect(normalizeIngredientName('diced onion')).toBe('onion');
        expect(normalizeIngredientName('sliced mushroom')).toBe('mushroom');
      });

      it('should remove size descriptors', () => {
        expect(normalizeIngredientName('large egg')).toBe('egg');
        expect(normalizeIngredientName('medium onion')).toBe('onion');
        expect(normalizeIngredientName('small potato')).toBe('potato');
      });

      it('should remove temperature descriptors', () => {
        expect(normalizeIngredientName('cold butter')).toBe('butter');
        expect(normalizeIngredientName('room temperature egg')).toBe('egg');
        expect(normalizeIngredientName('melted butter')).toBe('butter');
      });

      it('should preserve important compound names', () => {
        expect(normalizeIngredientName('olive oil')).toBe('olive oil');
        expect(normalizeIngredientName('soy sauce')).toBe('soy sauce');
        expect(normalizeIngredientName('baking powder')).toBe('baking powder');
        expect(normalizeIngredientName('brown sugar')).toBe('brown sugar');
      });
    });

    describe('special character handling', () => {
      it('should remove parenthetical content', () => {
        expect(normalizeIngredientName('chicken (boneless)')).toBe('chicken');
        expect(normalizeIngredientName('milk (2%)')).toBe('milk');
      });

      it('should remove commas', () => {
        expect(normalizeIngredientName('salt, to taste')).toBe('salt to taste');
      });
    });

    describe('compound ingredients', () => {
      it('should preserve specific cheese types', () => {
        expect(normalizeIngredientName('parmesan cheese')).toBe('parmesan cheese');
        expect(normalizeIngredientName('mozzarella cheese')).toBe('mozzarella cheese');
        expect(normalizeIngredientName('cheddar cheese')).toBe('cheddar cheese');
      });

      it('should preserve specific flour types', () => {
        expect(normalizeIngredientName('all-purpose flour')).toBe('all-purpose flour');
        expect(normalizeIngredientName('bread flour')).toBe('bread flour');
        expect(normalizeIngredientName('whole wheat flour')).toBe('whole wheat flour');
      });

      it('should preserve broth/stock types', () => {
        expect(normalizeIngredientName('chicken broth')).toBe('chicken broth');
        expect(normalizeIngredientName('beef stock')).toBe('beef stock');
        expect(normalizeIngredientName('vegetable broth')).toBe('vegetable broth');
      });

      it('should preserve vinegar types', () => {
        expect(normalizeIngredientName('apple cider vinegar')).toBe('apple cider vinegar');
        expect(normalizeIngredientName('balsamic vinegar')).toBe('balsamic vinegar');
        expect(normalizeIngredientName('red wine vinegar')).toBe('red wine vinegar');
      });
    });
  });

  describe('createNormalizationKey', () => {
    it('should create consistent keys', () => {
      const key1 = createNormalizationKey('Fresh Tomatoes');
      const key2 = createNormalizationKey('fresh tomato');
      expect(key1).toBe(key2);
    });

    it('should create same key for variations', () => {
      const variations = [
        'eggs',
        'Eggs',
        'EGGS',
        'large eggs',
        'fresh eggs',
      ];
      const keys = variations.map(createNormalizationKey);
      expect(new Set(keys).size).toBe(1);
    });
  });

  describe('areIngredientsSimilar', () => {
    it('should return true for same ingredients', () => {
      expect(areIngredientsSimilar('tomato', 'tomato')).toBe(true);
    });

    it('should return true for case variations', () => {
      expect(areIngredientsSimilar('Tomato', 'TOMATO')).toBe(true);
    });

    it('should return true for plural/singular', () => {
      expect(areIngredientsSimilar('egg', 'eggs')).toBe(true);
      expect(areIngredientsSimilar('tomatoes', 'tomato')).toBe(true);
    });

    it('should return true for descriptor variations', () => {
      expect(areIngredientsSimilar('fresh basil', 'basil')).toBe(true);
      expect(areIngredientsSimilar('chopped onion', 'onion')).toBe(true);
    });

    it('should return false for different ingredients', () => {
      expect(areIngredientsSimilar('tomato', 'potato')).toBe(false);
      expect(areIngredientsSimilar('chicken', 'beef')).toBe(false);
    });
  });

  describe('extractBaseIngredient', () => {
    it('should extract base ingredient from descriptive name', () => {
      expect(extractBaseIngredient('large fresh tomato')).toBe('tomato');
      expect(extractBaseIngredient('minced garlic cloves')).toBe('garlic clove');
    });

    it('should preserve compound ingredient names', () => {
      expect(extractBaseIngredient('extra virgin olive oil')).toBe('extra virgin olive oil');
      expect(extractBaseIngredient('heavy cream')).toBe('heavy cream');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(normalizeIngredientName('')).toBe('');
    });

    it('should handle single character', () => {
      expect(normalizeIngredientName('a')).toBe('a');
    });

    it('should handle numbers in names', () => {
      expect(normalizeIngredientName('2% milk')).toBe('2% milk');
    });

    it('should handle hyphenated words', () => {
      expect(normalizeIngredientName('all-purpose flour')).toBe('all-purpose flour');
      expect(normalizeIngredientName('half-and-half')).toBe('half-and-half');
    });

    it('should handle special characters in names', () => {
      expect(normalizeIngredientName("bay leaf")).toBe("bay leaf");
    });
  });
});
