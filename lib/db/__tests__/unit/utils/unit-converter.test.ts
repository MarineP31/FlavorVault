import { MeasurementUnit } from '@/constants/enums';
import {
  getUnitType,
  isVolumeUnit,
  isWeightUnit,
  isCountUnit,
  areUnitsCompatible,
  convertToBaseUnit,
  convertToDisplayUnit,
  convertUnit,
  formatQuantity,
  aggregateQuantities,
} from '@/lib/utils/unit-converter';

describe('unit-converter', () => {
  describe('getUnitType', () => {
    it('should return volume for volume units', () => {
      expect(getUnitType(MeasurementUnit.TSP)).toBe('volume');
      expect(getUnitType(MeasurementUnit.TBSP)).toBe('volume');
      expect(getUnitType(MeasurementUnit.CUP)).toBe('volume');
      expect(getUnitType(MeasurementUnit.FL_OZ)).toBe('volume');
      expect(getUnitType(MeasurementUnit.ML)).toBe('volume');
      expect(getUnitType(MeasurementUnit.LITER)).toBe('volume');
    });

    it('should return weight for weight units', () => {
      expect(getUnitType(MeasurementUnit.OZ)).toBe('weight');
      expect(getUnitType(MeasurementUnit.LB)).toBe('weight');
      expect(getUnitType(MeasurementUnit.GRAM)).toBe('weight');
      expect(getUnitType(MeasurementUnit.KG)).toBe('weight');
    });

    it('should return count for count units', () => {
      expect(getUnitType(MeasurementUnit.UNIT)).toBe('count');
      expect(getUnitType(MeasurementUnit.PIECE)).toBe('count');
      expect(getUnitType(null)).toBe('count');
    });
  });

  describe('isVolumeUnit', () => {
    it('should return true for volume units', () => {
      expect(isVolumeUnit(MeasurementUnit.CUP)).toBe(true);
      expect(isVolumeUnit(MeasurementUnit.TBSP)).toBe(true);
    });

    it('should return false for non-volume units', () => {
      expect(isVolumeUnit(MeasurementUnit.LB)).toBe(false);
      expect(isVolumeUnit(null)).toBe(false);
    });
  });

  describe('isWeightUnit', () => {
    it('should return true for weight units', () => {
      expect(isWeightUnit(MeasurementUnit.LB)).toBe(true);
      expect(isWeightUnit(MeasurementUnit.OZ)).toBe(true);
    });

    it('should return false for non-weight units', () => {
      expect(isWeightUnit(MeasurementUnit.CUP)).toBe(false);
      expect(isWeightUnit(null)).toBe(false);
    });
  });

  describe('isCountUnit', () => {
    it('should return true for count units', () => {
      expect(isCountUnit(MeasurementUnit.UNIT)).toBe(true);
      expect(isCountUnit(MeasurementUnit.PIECE)).toBe(true);
      expect(isCountUnit(null)).toBe(true);
    });

    it('should return false for non-count units', () => {
      expect(isCountUnit(MeasurementUnit.CUP)).toBe(false);
    });
  });

  describe('areUnitsCompatible', () => {
    it('should return true for compatible volume units', () => {
      expect(areUnitsCompatible(MeasurementUnit.CUP, MeasurementUnit.TBSP)).toBe(true);
      expect(areUnitsCompatible(MeasurementUnit.TSP, MeasurementUnit.LITER)).toBe(true);
    });

    it('should return true for compatible weight units', () => {
      expect(areUnitsCompatible(MeasurementUnit.LB, MeasurementUnit.OZ)).toBe(true);
      expect(areUnitsCompatible(MeasurementUnit.GRAM, MeasurementUnit.KG)).toBe(true);
    });

    it('should return false for incompatible units', () => {
      expect(areUnitsCompatible(MeasurementUnit.CUP, MeasurementUnit.LB)).toBe(false);
      expect(areUnitsCompatible(MeasurementUnit.OZ, MeasurementUnit.TBSP)).toBe(false);
    });

    it('should handle null units', () => {
      expect(areUnitsCompatible(null, null)).toBe(true);
      expect(areUnitsCompatible(null, MeasurementUnit.UNIT)).toBe(true);
    });
  });

  describe('convertToBaseUnit', () => {
    it('should convert volume units to base (tsp)', () => {
      const result = convertToBaseUnit(1, MeasurementUnit.TBSP);
      expect(result.value).toBe(3);
      expect(result.type).toBe('volume');

      const cupResult = convertToBaseUnit(1, MeasurementUnit.CUP);
      expect(cupResult.value).toBe(48);
    });

    it('should convert weight units to base (oz)', () => {
      const result = convertToBaseUnit(1, MeasurementUnit.LB);
      expect(result.value).toBe(16);
      expect(result.type).toBe('weight');
    });

    it('should handle null unit', () => {
      const result = convertToBaseUnit(5, null);
      expect(result.value).toBe(5);
      expect(result.type).toBe('count');
    });
  });

  describe('convertToDisplayUnit', () => {
    it('should convert volume to cups when >= 48 tsp', () => {
      const result = convertToDisplayUnit(48, 'volume');
      expect(result.quantity).toBe(1);
      expect(result.unit).toBe(MeasurementUnit.CUP);

      const twoAndHalfCups = convertToDisplayUnit(120, 'volume');
      expect(twoAndHalfCups.quantity).toBe(2.5);
      expect(twoAndHalfCups.unit).toBe(MeasurementUnit.CUP);
    });

    it('should convert volume to tbsp when >= 3 tsp and < 48 tsp', () => {
      const result = convertToDisplayUnit(6, 'volume');
      expect(result.quantity).toBe(2);
      expect(result.unit).toBe(MeasurementUnit.TBSP);
    });

    it('should keep volume as tsp when < 3 tsp', () => {
      const result = convertToDisplayUnit(2, 'volume');
      expect(result.quantity).toBe(2);
      expect(result.unit).toBe(MeasurementUnit.TSP);
    });

    it('should convert weight to lbs when >= 16 oz', () => {
      const result = convertToDisplayUnit(16, 'weight');
      expect(result.quantity).toBe(1);
      expect(result.unit).toBe(MeasurementUnit.LB);

      const twoLbs = convertToDisplayUnit(32, 'weight');
      expect(twoLbs.quantity).toBe(2);
      expect(twoLbs.unit).toBe(MeasurementUnit.LB);
    });

    it('should keep weight as oz when < 16 oz', () => {
      const result = convertToDisplayUnit(8, 'weight');
      expect(result.quantity).toBe(8);
      expect(result.unit).toBe(MeasurementUnit.OZ);
    });
  });

  describe('convertUnit', () => {
    it('should convert between compatible volume units', () => {
      const result = convertUnit(1, MeasurementUnit.TBSP, MeasurementUnit.TSP);
      expect(result).toBe(3);

      const cupToTbsp = convertUnit(1, MeasurementUnit.CUP, MeasurementUnit.TBSP);
      expect(cupToTbsp).toBe(16);
    });

    it('should convert between compatible weight units', () => {
      const result = convertUnit(1, MeasurementUnit.LB, MeasurementUnit.OZ);
      expect(result).toBe(16);
    });

    it('should return null for incompatible units', () => {
      const result = convertUnit(1, MeasurementUnit.CUP, MeasurementUnit.LB);
      expect(result).toBeNull();
    });

    it('should return null when from unit is null', () => {
      const result = convertUnit(1, null, MeasurementUnit.CUP);
      expect(result).toBeNull();
    });
  });

  describe('formatQuantity', () => {
    it('should format quantity with unit', () => {
      expect(formatQuantity(2, MeasurementUnit.CUP)).toBe('2 cup');
    });

    it('should format quantity without unit', () => {
      expect(formatQuantity(3, null)).toBe('3');
    });

    it('should format null quantity with unit', () => {
      expect(formatQuantity(null, MeasurementUnit.CUP)).toBe('(cup)');
    });

    it('should format null quantity without unit', () => {
      expect(formatQuantity(null, null)).toBe('');
    });

    it('should format decimal quantities', () => {
      expect(formatQuantity(1.5, MeasurementUnit.CUP)).toBe('1.5 cup');
      expect(formatQuantity(0.25, MeasurementUnit.CUP)).toBe('0.25 cup');
    });
  });

  describe('aggregateQuantities', () => {
    it('should aggregate compatible volume units', () => {
      const quantities = [
        { quantity: 8, unit: MeasurementUnit.TBSP },
        { quantity: 8, unit: MeasurementUnit.TBSP },
      ];
      const result = aggregateQuantities(quantities);

      expect(result).not.toBeNull();
      expect(result!.quantity).toBe(1);
      expect(result!.unit).toBe(MeasurementUnit.CUP);
    });

    it('should aggregate compatible weight units', () => {
      const quantities = [
        { quantity: 8, unit: MeasurementUnit.OZ },
        { quantity: 8, unit: MeasurementUnit.OZ },
      ];
      const result = aggregateQuantities(quantities);

      expect(result).not.toBeNull();
      expect(result!.quantity).toBe(1);
      expect(result!.unit).toBe(MeasurementUnit.LB);
    });

    it('should return null for incompatible units', () => {
      const quantities = [
        { quantity: 1, unit: MeasurementUnit.CUP },
        { quantity: 1, unit: MeasurementUnit.LB },
      ];
      const result = aggregateQuantities(quantities);

      expect(result).toBeNull();
    });

    it('should return null for empty array', () => {
      const result = aggregateQuantities([]);
      expect(result).toBeNull();
    });

    it('should filter out null quantities', () => {
      const quantities = [
        { quantity: null, unit: MeasurementUnit.CUP },
        { quantity: 1, unit: MeasurementUnit.CUP },
      ];
      const result = aggregateQuantities(quantities);

      expect(result).not.toBeNull();
      expect(result!.quantity).toBe(1);
    });

    it('should aggregate mixed volume units', () => {
      const quantities = [
        { quantity: 1, unit: MeasurementUnit.CUP },
        { quantity: 8, unit: MeasurementUnit.TBSP },
      ];
      const result = aggregateQuantities(quantities);

      expect(result).not.toBeNull();
      expect(result!.quantity).toBe(1.5);
      expect(result!.unit).toBe(MeasurementUnit.CUP);
    });
  });
});
