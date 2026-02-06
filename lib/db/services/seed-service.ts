import AsyncStorage from '@react-native-async-storage/async-storage';
import { recipeService } from './recipe-service';
import { DEFAULT_RECIPES, SeedRecipe } from '../seeds/default-recipes';
import { CreateRecipeInput } from '../schema/recipe';

const SEEDING_COMPLETE_KEY = '@flavorvault:seeding_complete';

class SeedService {
  private seedingInProgress = false;

  async shouldSeedRecipes(): Promise<boolean> {
    try {
      const seedingComplete = await AsyncStorage.getItem(SEEDING_COMPLETE_KEY);
      if (seedingComplete === 'true') {
        return false;
      }

      const recipeCount = await recipeService.getRecipeCount();
      return recipeCount === 0;
    } catch (error) {
      console.error('Error checking if seeding is needed:', error);
      return false;
    }
  }

  async seedDefaultRecipes(): Promise<void> {
    if (this.seedingInProgress) {
      return;
    }

    try {
      this.seedingInProgress = true;

      const shouldSeed = await this.shouldSeedRecipes();
      if (!shouldSeed) {
        return;
      }

      console.log('Seeding default recipes for first-time user...');

      let successCount = 0;
      for (const seedRecipe of DEFAULT_RECIPES) {
        try {
          await this.createSeedRecipe(seedRecipe);
          successCount++;
        } catch (error) {
          console.error(`Failed to seed recipe "${seedRecipe.title}":`, error);
        }
      }

      if (successCount > 0) {
        await AsyncStorage.setItem(SEEDING_COMPLETE_KEY, 'true');
        console.log(`Successfully seeded ${successCount}/${DEFAULT_RECIPES.length} recipes`);
      }
    } catch (error) {
      console.error('Error during recipe seeding:', error);
    } finally {
      this.seedingInProgress = false;
    }
  }

  private async createSeedRecipe(seedRecipe: SeedRecipe): Promise<void> {
    const input: CreateRecipeInput = {
      title: seedRecipe.title,
      servings: seedRecipe.servings,
      category: seedRecipe.category,
      ingredients: seedRecipe.ingredients,
      steps: seedRecipe.steps,
      prepTime: seedRecipe.prepTime,
      cookTime: seedRecipe.cookTime,
      tags: seedRecipe.tags,
      imageUri: seedRecipe.imageUri,
    };

    await recipeService.createRecipe(input);
  }

  async resetSeedingStatus(): Promise<void> {
    await AsyncStorage.removeItem(SEEDING_COMPLETE_KEY);
    console.log('Seeding status reset');
  }
}

export const seedService = new SeedService();
