import { MeasurementUnit } from '@/constants/enums';

export type UnitType = 'volume' | 'weight' | 'count';

interface ConversionResult {
  value: number;
  type: UnitType;
}

interface DisplayResult {
  quantity: number;
  unit: MeasurementUnit;
}

const VOLUME_CONVERSIONS: Record<string, number> = {
  [MeasurementUnit.TSP]: 1,
  [MeasurementUnit.TBSP]: 3,
  [MeasurementUnit.CUP]: 48,
  [MeasurementUnit.FL_OZ]: 6,
  [MeasurementUnit.ML]: 0.202884,
  [MeasurementUnit.LITER]: 202.884,
};

const WEIGHT_CONVERSIONS: Record<string, number> = {
  [MeasurementUnit.OZ]: 1,
  [MeasurementUnit.LB]: 16,
  [MeasurementUnit.GRAM]: 0.035274,
  [MeasurementUnit.KG]: 35.274,
};

const COUNT_UNITS: MeasurementUnit[] = [
  MeasurementUnit.UNIT,
  MeasurementUnit.PIECE,
  MeasurementUnit.SLICE,
  MeasurementUnit.CLOVE,
  MeasurementUnit.HEAD,
  MeasurementUnit.BUNCH,
  MeasurementUnit.CAN,
  MeasurementUnit.BOTTLE,
  MeasurementUnit.PACKAGE,
  MeasurementUnit.BAG,
  MeasurementUnit.BOX,
];

export function getUnitType(unit: MeasurementUnit | null): UnitType {
  if (unit === null) {
    return 'count';
  }

  if (VOLUME_CONVERSIONS[unit] !== undefined) {
    return 'volume';
  }

  if (WEIGHT_CONVERSIONS[unit] !== undefined) {
    return 'weight';
  }

  return 'count';
}

export function isVolumeUnit(unit: MeasurementUnit | null): boolean {
  return unit !== null && VOLUME_CONVERSIONS[unit] !== undefined;
}

export function isWeightUnit(unit: MeasurementUnit | null): boolean {
  return unit !== null && WEIGHT_CONVERSIONS[unit] !== undefined;
}

export function isCountUnit(unit: MeasurementUnit | null): boolean {
  return unit === null || COUNT_UNITS.includes(unit);
}

export function areUnitsCompatible(
  unit1: MeasurementUnit | null,
  unit2: MeasurementUnit | null
): boolean {
  const type1 = getUnitType(unit1);
  const type2 = getUnitType(unit2);
  return type1 === type2;
}

export function convertToBaseUnit(
  quantity: number,
  unit: MeasurementUnit | null
): ConversionResult {
  if (unit === null) {
    return { value: quantity, type: 'count' };
  }

  if (VOLUME_CONVERSIONS[unit] !== undefined) {
    return {
      value: quantity * VOLUME_CONVERSIONS[unit],
      type: 'volume',
    };
  }

  if (WEIGHT_CONVERSIONS[unit] !== undefined) {
    return {
      value: quantity * WEIGHT_CONVERSIONS[unit],
      type: 'weight',
    };
  }

  return { value: quantity, type: 'count' };
}

export function convertToDisplayUnit(
  value: number,
  type: UnitType
): DisplayResult {
  if (type === 'volume') {
    if (value >= 48) {
      return {
        quantity: Math.round((value / 48) * 100) / 100,
        unit: MeasurementUnit.CUP,
      };
    }
    if (value >= 3) {
      return {
        quantity: Math.round((value / 3) * 100) / 100,
        unit: MeasurementUnit.TBSP,
      };
    }
    return {
      quantity: Math.round(value * 100) / 100,
      unit: MeasurementUnit.TSP,
    };
  }

  if (type === 'weight') {
    if (value >= 16) {
      return {
        quantity: Math.round((value / 16) * 100) / 100,
        unit: MeasurementUnit.LB,
      };
    }
    return {
      quantity: Math.round(value * 100) / 100,
      unit: MeasurementUnit.OZ,
    };
  }

  return {
    quantity: Math.round(value * 100) / 100,
    unit: MeasurementUnit.UNIT,
  };
}

export function convertUnit(
  quantity: number,
  fromUnit: MeasurementUnit | null,
  toUnit: MeasurementUnit
): number | null {
  if (fromUnit === null) {
    return null;
  }

  const fromType = getUnitType(fromUnit);
  const toType = getUnitType(toUnit);

  if (fromType !== toType) {
    return null;
  }

  if (fromType === 'count') {
    return quantity;
  }

  const base = convertToBaseUnit(quantity, fromUnit);

  if (fromType === 'volume') {
    const toFactor = VOLUME_CONVERSIONS[toUnit];
    if (toFactor === undefined) {
      return null;
    }
    return Math.round((base.value / toFactor) * 100) / 100;
  }

  if (fromType === 'weight') {
    const toFactor = WEIGHT_CONVERSIONS[toUnit];
    if (toFactor === undefined) {
      return null;
    }
    return Math.round((base.value / toFactor) * 100) / 100;
  }

  return null;
}

export function formatQuantity(
  quantity: number | null,
  unit: MeasurementUnit | null
): string {
  if (quantity === null) {
    return unit ? `(${unit})` : '';
  }

  const formatted = Number.isInteger(quantity)
    ? quantity.toString()
    : quantity.toFixed(2).replace(/\.?0+$/, '');

  if (unit === null) {
    return formatted;
  }

  return `${formatted} ${unit}`;
}

export function aggregateQuantities(
  quantities: Array<{ quantity: number | null; unit: MeasurementUnit | null }>
): DisplayResult | null {
  if (quantities.length === 0) {
    return null;
  }

  const validQuantities = quantities.filter(
    (q) => q.quantity !== null && q.quantity > 0
  );

  if (validQuantities.length === 0) {
    return null;
  }

  const firstType = getUnitType(validQuantities[0].unit);

  const allSameType = validQuantities.every(
    (q) => getUnitType(q.unit) === firstType
  );

  if (!allSameType) {
    return null;
  }

  let totalBase = 0;
  for (const q of validQuantities) {
    const base = convertToBaseUnit(q.quantity!, q.unit);
    totalBase += base.value;
  }

  return convertToDisplayUnit(totalBase, firstType);
}
