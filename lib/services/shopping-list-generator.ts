import { MeasurementUnit } from '@/constants/enums';
import { shoppingListService } from '@/lib/db/services/shopping-list-service';
import {
  CreateShoppingListItemInput,
  ManualItemInput,
  ShoppingListItem,
  ShoppingListCategory,
} from '@/lib/db/schema/shopping-list';
import { Recipe } from '@/lib/db/schema/recipe';
import { createShoppingListInputsFromRecipes, aggregateIngredients, IngredientWithSource } from './ingredient-aggregator';
import { classifyIngredient } from '@/lib/utils/category-classifier';
import { normalizeIngredientName } from '@/lib/utils/ingredient-normalizer';
import { aggregateQuantities, areUnitsCompatible } from '@/lib/utils/unit-converter';

export class ShoppingListGenerator {
  async generateFromQueue(
    queuedRecipes: Recipe[]
  ): Promise<ShoppingListItem[]> {
    if (queuedRecipes.length === 0) {
      return [];
    }

    const recipesWithIngredients = queuedRecipes.map((recipe) => ({
      id: recipe.id,
      ingredients: recipe.ingredients,
    }));

    const inputs = createShoppingListInputsFromRecipes(recipesWithIngredients);

    if (inputs.length === 0) {
      return [];
    }

    const items = await shoppingListService.createBulk(inputs);

    return items;
  }

  async regenerateList(
    queuedRecipes: Recipe[]
  ): Promise<ShoppingListItem[]> {
    await shoppingListService.deleteBySource('recipe');

    const newItems = await this.generateFromQueue(queuedRecipes);

    const allItems = await shoppingListService.getAll();

    return allItems;
  }

  async addManualItem(input: ManualItemInput): Promise<ShoppingListItem> {
    const category: ShoppingListCategory = input.category || classifyIngredient(input.name);

    const createInput: CreateShoppingListItemInput = {
      name: input.name,
      quantity: input.quantity ?? null,
      unit: input.unit ?? null,
      category,
      source: 'manual',
      originalName: input.name,
    };

    return await shoppingListService.createItem(createInput);
  }

  async addRecipeToShoppingList(recipe: Recipe): Promise<ShoppingListItem[]> {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return [];
    }

    const existingItems = await shoppingListService.getAll();
    const itemsToCreate: CreateShoppingListItemInput[] = [];
    const itemsToUpdate: { id: string; quantity: number }[] = [];

    for (const ingredient of recipe.ingredients) {
      const normalizedName = normalizeIngredientName(ingredient.name);
      const category = classifyIngredient(normalizedName);

      const existingItem = existingItems.find((item) => {
        const existingNormalized = normalizeIngredientName(item.name);
        return existingNormalized === normalizedName;
      });

      if (existingItem && existingItem.quantity !== null && ingredient.quantity !== null) {
        if (areUnitsCompatible(existingItem.unit, ingredient.unit)) {
          const aggregated = aggregateQuantities([
            { quantity: existingItem.quantity, unit: existingItem.unit },
            { quantity: ingredient.quantity, unit: ingredient.unit },
          ]);

          if (aggregated) {
            itemsToUpdate.push({
              id: existingItem.id,
              quantity: aggregated.quantity,
            });
            continue;
          }
        }
      }

      itemsToCreate.push({
        name: normalizedName,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category,
        source: 'recipe',
        originalName: ingredient.name,
        recipeId: recipe.id,
      });
    }

    for (const update of itemsToUpdate) {
      await shoppingListService.updateShoppingItem({
        id: update.id,
        quantity: update.quantity,
      });
    }

    if (itemsToCreate.length > 0) {
      return await shoppingListService.createBulk(itemsToCreate);
    }

    return [];
  }

  async removeRecipeIngredients(recipeId: string): Promise<void> {
    await shoppingListService.deleteByRecipeId(recipeId);
  }

  async clearRecipeItems(): Promise<void> {
    await shoppingListService.deleteBySource('recipe');
  }

  async clearAllItems(): Promise<void> {
    await shoppingListService.clearAll();
  }
}

export const shoppingListGenerator = new ShoppingListGenerator();
