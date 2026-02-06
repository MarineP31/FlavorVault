/**
 * Task 14.1: Unit Tests - Recipe Formatting Utilities
 */

import {
  formatIngredient,
  formatTime,
  formatServings,
  formatInstructionStep,
  getTotalTime,
} from '@/lib/utils/recipe-formatter';
import { MeasurementUnit } from '@/constants/enums';
import { Ingredient } from '@/lib/db/schema/recipe';

describe('recipe-formatter', () => {
  describe('formatIngredient', () => {
    it('should format ingredient with quantity, unit, and name', () => {
      const ingredient: Ingredient = {
        name: 'flour',
        quantity: 2,
        unit: MeasurementUnit.CUP,
      };
      expect(formatIngredient(ingredient)).toBe('2 cup flour');
    });

    it('should format ingredient with decimal quantity as fraction', () => {
      const ingredient: Ingredient = {
        name: 'sugar',
        quantity: 0.5,
        unit: MeasurementUnit.CUP,
      };
      expect(formatIngredient(ingredient)).toBe('1/2 cup sugar');
    });

    it('should format ingredient with mixed number', () => {
      const ingredient: Ingredient = {
        name: 'butter',
        quantity: 1.5,
        unit: MeasurementUnit.CUP,
      };
      expect(formatIngredient(ingredient)).toBe('1 1/2 cup butter');
    });

    it('should format ingredient without quantity', () => {
      const ingredient: Ingredient = {
        name: 'salt',
        quantity: null,
        unit: MeasurementUnit.TSP,
      };
      expect(formatIngredient(ingredient)).toBe('tsp salt');
    });

    it('should format ingredient without unit', () => {
      const ingredient: Ingredient = {
        name: 'eggs',
        quantity: 3,
        unit: null,
      };
      expect(formatIngredient(ingredient)).toBe('3 eggs');
    });

    it('should format ingredient with only name', () => {
      const ingredient: Ingredient = {
        name: 'vanilla extract',
        quantity: null,
        unit: null,
      };
      expect(formatIngredient(ingredient)).toBe('vanilla extract');
    });

    it('should format ingredient with clove unit', () => {
      const ingredient: Ingredient = {
        name: 'garlic',
        quantity: 2,
        unit: MeasurementUnit.CLOVE,
      };
      expect(formatIngredient(ingredient)).toBe('2 clove garlic');
    });
  });

  describe('formatTime', () => {
    it('should format minutes correctly', () => {
      expect(formatTime(30)).toBe('30 min');
      expect(formatTime(45)).toBe('45 min');
    });

    it('should format hours correctly', () => {
      expect(formatTime(60)).toBe('1 hr');
      expect(formatTime(120)).toBe('2 hr');
    });

    it('should format hours and minutes correctly', () => {
      expect(formatTime(75)).toBe('1 hr 15 min');
      expect(formatTime(150)).toBe('2 hr 30 min');
    });

    it('should handle null and undefined', () => {
      expect(formatTime(null)).toBe('N/A');
      expect(formatTime(undefined)).toBe('N/A');
      expect(formatTime(0)).toBe('N/A');
    });
  });

  describe('formatServings', () => {
    it('should format single serving', () => {
      expect(formatServings(1)).toBe('1 serving');
    });

    it('should format multiple servings', () => {
      expect(formatServings(4)).toBe('4 servings');
      expect(formatServings(8)).toBe('8 servings');
    });
  });

  describe('formatInstructionStep', () => {
    it('should format instruction step with number', () => {
      const result = formatInstructionStep('Mix ingredients', 0);
      expect(result).toEqual({
        number: 1,
        text: 'Mix ingredients',
      });
    });

    it('should format multiple steps with correct numbering', () => {
      const step1 = formatInstructionStep('Preheat oven', 0);
      const step2 = formatInstructionStep('Mix ingredients', 1);
      const step3 = formatInstructionStep('Bake', 2);

      expect(step1.number).toBe(1);
      expect(step2.number).toBe(2);
      expect(step3.number).toBe(3);
    });

    it('should trim whitespace from step text', () => {
      const result = formatInstructionStep('  Mix ingredients  ', 0);
      expect(result.text).toBe('Mix ingredients');
    });
  });

  describe('getTotalTime', () => {
    it('should calculate total time from prep and cook', () => {
      expect(getTotalTime(15, 30)).toBe(45);
      expect(getTotalTime(20, 40)).toBe(60);
    });

    it('should handle null prep time', () => {
      expect(getTotalTime(null, 30)).toBe(30);
    });

    it('should handle null cook time', () => {
      expect(getTotalTime(15, null)).toBe(15);
    });

    it('should handle both null', () => {
      expect(getTotalTime(null, null)).toBe(null);
    });

    it('should handle zero values', () => {
      expect(getTotalTime(0, 0)).toBe(null);
      expect(getTotalTime(0, 30)).toBe(30);
      expect(getTotalTime(15, 0)).toBe(15);
    });
  });
});
