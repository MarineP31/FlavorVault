import { DishCategory } from '@/constants/enums';
import { parseIngredient } from '@/lib/ocr/ingredient-parser';
import { extractRecipeJsonLd, SchemaOrgRecipe } from './json-ld-extractor';
import { parseISO8601Duration } from './iso-duration-parser';
import type { RecipeFormData } from '@/lib/validations/recipe-form-schema';

export interface RecipeParseResult {
  success: boolean;
  data?: Partial<RecipeFormData>;
  error?: string;
}

const CATEGORY_KEYWORDS: Record<string, DishCategory> = {
  breakfast: DishCategory.BREAKFAST,
  brunch: DishCategory.BREAKFAST,
  'petit déjeuner': DishCategory.BREAKFAST,
  lunch: DishCategory.LUNCH,
  déjeuner: DishCategory.LUNCH,
  dinner: DishCategory.DINNER,
  dîner: DishCategory.DINNER,
  snack: DishCategory.SNACK,
  goûter: DishCategory.SNACK,
  dessert: DishCategory.DESSERT,
  'desserts': DishCategory.DESSERT,
  appetizer: DishCategory.APPETIZER,
  starter: DishCategory.APPETIZER,
  'entrée': DishCategory.APPETIZER,
  'apéritif': DishCategory.APPETIZER,
  beverage: DishCategory.BEVERAGE,
  drink: DishCategory.BEVERAGE,
  cocktail: DishCategory.BEVERAGE,
  boisson: DishCategory.BEVERAGE,
};

function mapCategory(recipeCategory: string | string[] | undefined): DishCategory {
  if (!recipeCategory) return DishCategory.DINNER;

  const categories = Array.isArray(recipeCategory) ? recipeCategory : [recipeCategory];

  for (const cat of categories) {
    const lower = cat.toLowerCase().trim();
    for (const [keyword, dishCat] of Object.entries(CATEGORY_KEYWORDS)) {
      if (lower.includes(keyword)) return dishCat;
    }
  }

  return DishCategory.DINNER;
}

function extractSteps(
  instructions: SchemaOrgRecipe['recipeInstructions']
): string[] {
  if (!instructions || !Array.isArray(instructions)) return [];

  const steps: string[] = [];

  for (const item of instructions) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed) steps.push(trimmed);
    } else if (item && typeof item === 'object') {
      // HowToStep or HowToSection
      if (item.text) {
        const trimmed = item.text.trim();
        if (trimmed) steps.push(trimmed);
      } else if (item.name) {
        const trimmed = item.name.trim();
        if (trimmed) steps.push(trimmed);
      }
    }
  }

  return steps;
}

function extractServings(recipeYield: SchemaOrgRecipe['recipeYield']): number | null {
  if (!recipeYield) return null;

  const value = Array.isArray(recipeYield) ? recipeYield[0] : recipeYield;
  if (typeof value === 'number') return value > 0 ? Math.round(value) : null;
  if (typeof value !== 'string') return null;

  const match = value.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function extractImageUrl(image: SchemaOrgRecipe['image']): string | null {
  if (!image) return null;

  if (typeof image === 'string') return image;

  if (Array.isArray(image)) {
    const first = image[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && first.url) return first.url;
    return null;
  }

  if (typeof image === 'object' && 'url' in image && image.url) {
    return image.url;
  }

  return null;
}

function extractTags(recipe: SchemaOrgRecipe): string[] {
  const tags: string[] = [];

  if (recipe.recipeCuisine) {
    const cuisines = Array.isArray(recipe.recipeCuisine)
      ? recipe.recipeCuisine
      : [recipe.recipeCuisine];
    tags.push(...cuisines.map((c) => c.trim()).filter(Boolean));
  }

  if (recipe.keywords) {
    if (typeof recipe.keywords === 'string') {
      tags.push(...recipe.keywords.split(',').map((k) => k.trim()).filter(Boolean));
    } else if (Array.isArray(recipe.keywords)) {
      tags.push(...recipe.keywords.map((k) => k.trim()).filter(Boolean));
    }
  }

  return [...new Set(tags)];
}

function mapToRecipeFormData(
  recipe: SchemaOrgRecipe,
  sourceUrl: string
): Partial<RecipeFormData> {
  const ingredients = (recipe.recipeIngredient || []).map((text) => {
    const parsed = parseIngredient(text);
    return {
      name: parsed.name,
      quantity: parsed.quantity,
      unit: parsed.unit,
    };
  });

  const steps = extractSteps(recipe.recipeInstructions);
  const servings = extractServings(recipe.recipeYield);
  const prepTime = recipe.prepTime ? parseISO8601Duration(recipe.prepTime) : null;
  const cookTime = recipe.cookTime ? parseISO8601Duration(recipe.cookTime) : null;
  const category = mapCategory(recipe.recipeCategory);
  const imageUri = extractImageUrl(recipe.image);
  const tags = extractTags(recipe);

  return {
    title: recipe.name?.trim() || '',
    ingredients: ingredients.length > 0 ? ingredients : undefined,
    steps: steps.length > 0 ? steps : undefined,
    servings: servings ?? 4,
    category,
    prepTime: prepTime ?? undefined,
    cookTime: cookTime ?? undefined,
    imageUri: imageUri ?? undefined,
    source: sourceUrl,
    tags: tags.length > 0 ? tags : undefined,
  };
}

export async function parseRecipeFromUrl(url: string): Promise<RecipeParseResult> {
  if (!url.match(/^https?:\/\//i)) {
    return { success: false, error: 'Invalid URL. Must start with http:// or https://' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FlavorVault/1.0 (Recipe Import)',
        Accept: 'text/html',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to load page (${response.status})`,
      };
    }

    const html = await response.text();
    const recipe = extractRecipeJsonLd(html);

    if (!recipe) {
      return {
        success: false,
        error: 'No recipe data found on this page. The site may not include structured recipe data.',
      };
    }

    const data = mapToRecipeFormData(recipe, url);
    return { success: true, data };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request timed out. Please check your connection and try again.' };
    }

    return {
      success: false,
      error: 'Failed to fetch the page. Please check your connection and try again.',
    };
  }
}
