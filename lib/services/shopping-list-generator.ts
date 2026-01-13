import { MeasurementUnit } from '@/constants/enums';
import { shoppingListService } from '@/lib/db/services/shopping-list-service';
import {
  CreateShoppingListItemInput,
  ManualItemInput,
  ShoppingListItem,
  ShoppingListCategory,
} from '@/lib/db/schema/shopping-list';
import { Recipe } from '@/lib/db/schema/recipe';
import { createShoppingListInputsFromRecipes } from './ingredient-aggregator';
import { classifyIngredient } from '@/lib/utils/category-classifier';

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
