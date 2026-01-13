import { MeasurementUnit } from '@/constants/enums';
import { Ingredient } from '@/lib/db/schema/recipe';
import {
  CreateShoppingListItemInput,
  ShoppingListCategory,
} from '@/lib/db/schema/shopping-list';
import { classifyIngredient } from '@/lib/utils/category-classifier';
import { normalizeIngredientName } from '@/lib/utils/ingredient-normalizer';
import {
  aggregateQuantities,
  areUnitsCompatible,
  getUnitType,
} from '@/lib/utils/unit-converter';

interface IngredientWithSource {
  ingredient: Ingredient;
  recipeId: string;
}

interface AggregatedIngredient {
  normalizedName: string;
  originalNames: string[];
  quantity: number | null;
  unit: MeasurementUnit | null;
  recipeIds: string[];
  category: ShoppingListCategory;
}

interface IngredientGroup {
  normalizedName: string;
  items: IngredientWithSource[];
}

function groupIngredientsByNormalizedName(
  ingredients: IngredientWithSource[]
): Map<string, IngredientGroup> {
  const groups = new Map<string, IngredientGroup>();

  for (const item of ingredients) {
    const normalizedName = normalizeIngredientName(item.ingredient.name);

    if (!groups.has(normalizedName)) {
      groups.set(normalizedName, {
        normalizedName,
        items: [],
      });
    }

    groups.get(normalizedName)!.items.push(item);
  }

  return groups;
}

function aggregateGroup(group: IngredientGroup): AggregatedIngredient[] {
  const { normalizedName, items } = group;

  if (items.length === 0) {
    return [];
  }

  const originalNames = [...new Set(items.map((i) => i.ingredient.name))];
  const recipeIds = [...new Set(items.map((i) => i.recipeId))];
  const category = classifyIngredient(normalizedName);

  const itemsWithQuantity = items.filter(
    (i) => i.ingredient.quantity !== null && i.ingredient.quantity > 0
  );

  const itemsWithoutQuantity = items.filter(
    (i) => i.ingredient.quantity === null || i.ingredient.quantity <= 0
  );

  if (itemsWithQuantity.length === 0) {
    return [
      {
        normalizedName,
        originalNames,
        quantity: null,
        unit: items[0].ingredient.unit,
        recipeIds,
        category,
      },
    ];
  }

  const unitGroups = new Map<string, IngredientWithSource[]>();

  for (const item of itemsWithQuantity) {
    const unitType = getUnitType(item.ingredient.unit);
    const key = `${unitType}-${item.ingredient.unit || 'none'}`;

    if (!unitGroups.has(key)) {
      unitGroups.set(key, []);
    }
    unitGroups.get(key)!.push(item);
  }

  const compatibleGroups: IngredientWithSource[][] = [];
  const processedKeys = new Set<string>();

  for (const [key1, group1] of unitGroups) {
    if (processedKeys.has(key1)) continue;

    const compatibleGroup = [...group1];
    processedKeys.add(key1);

    for (const [key2, group2] of unitGroups) {
      if (processedKeys.has(key2)) continue;

      const unit1 = group1[0].ingredient.unit;
      const unit2 = group2[0].ingredient.unit;

      if (areUnitsCompatible(unit1, unit2)) {
        compatibleGroup.push(...group2);
        processedKeys.add(key2);
      }
    }

    compatibleGroups.push(compatibleGroup);
  }

  const results: AggregatedIngredient[] = [];

  for (const compatibleGroup of compatibleGroups) {
    const quantities = compatibleGroup.map((i) => ({
      quantity: i.ingredient.quantity,
      unit: i.ingredient.unit,
    }));

    const aggregated = aggregateQuantities(quantities);

    if (aggregated) {
      results.push({
        normalizedName,
        originalNames,
        quantity: aggregated.quantity,
        unit: aggregated.unit,
        recipeIds: [...new Set(compatibleGroup.map((i) => i.recipeId))],
        category,
      });
    } else {
      for (const item of compatibleGroup) {
        results.push({
          normalizedName,
          originalNames: [item.ingredient.name],
          quantity: item.ingredient.quantity,
          unit: item.ingredient.unit,
          recipeIds: [item.recipeId],
          category,
        });
      }
    }
  }

  if (itemsWithoutQuantity.length > 0 && results.length === 0) {
    results.push({
      normalizedName,
      originalNames,
      quantity: null,
      unit: itemsWithoutQuantity[0].ingredient.unit,
      recipeIds,
      category,
    });
  }

  return results;
}

export function aggregateIngredients(
  ingredientsWithSource: IngredientWithSource[]
): AggregatedIngredient[] {
  const groups = groupIngredientsByNormalizedName(ingredientsWithSource);

  const results: AggregatedIngredient[] = [];

  for (const group of groups.values()) {
    const aggregated = aggregateGroup(group);
    results.push(...aggregated);
  }

  return results;
}

export function createShoppingListInputsFromRecipes(
  recipes: Array<{ id: string; ingredients: Ingredient[] }>
): CreateShoppingListItemInput[] {
  const ingredientsWithSource: IngredientWithSource[] = [];

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      ingredientsWithSource.push({
        ingredient,
        recipeId: recipe.id,
      });
    }
  }

  const aggregated = aggregateIngredients(ingredientsWithSource);

  return aggregated.map((item) => ({
    name: item.normalizedName,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    source: 'recipe' as const,
    originalName: item.originalNames[0] || null,
    recipeId: item.recipeIds[0] || null,
  }));
}

export function extractIngredientsFromRecipe(
  recipe: { id: string; ingredients: Ingredient[] }
): IngredientWithSource[] {
  return recipe.ingredients.map((ingredient) => ({
    ingredient,
    recipeId: recipe.id,
  }));
}

export type {
  IngredientWithSource,
  AggregatedIngredient,
  IngredientGroup,
};
