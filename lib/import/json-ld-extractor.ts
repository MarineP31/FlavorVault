export interface SchemaOrgRecipe {
  '@type': string;
  name?: string;
  recipeIngredient?: string[];
  recipeInstructions?: (string | { '@type': string; text?: string; name?: string })[];
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string | string[] | number;
  recipeCategory?: string | string[];
  image?: string | string[] | { url?: string; '@type'?: string }[] | { url?: string; '@type'?: string };
  recipeCuisine?: string | string[];
  keywords?: string | string[];
}

function isRecipeType(obj: Record<string, unknown>): boolean {
  const type = obj['@type'];
  if (typeof type === 'string') {
    return type === 'Recipe' || type.endsWith('/Recipe');
  }
  if (Array.isArray(type)) {
    return type.some((t) => t === 'Recipe' || (typeof t === 'string' && t.endsWith('/Recipe')));
  }
  return false;
}

function findRecipeInObject(obj: unknown): SchemaOrgRecipe | null {
  if (!obj || typeof obj !== 'object') return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findRecipeInObject(item);
      if (found) return found;
    }
    return null;
  }

  const record = obj as Record<string, unknown>;

  if (isRecipeType(record)) {
    return record as unknown as SchemaOrgRecipe;
  }

  // Handle @graph arrays
  if (Array.isArray(record['@graph'])) {
    for (const item of record['@graph']) {
      const found = findRecipeInObject(item);
      if (found) return found;
    }
  }

  return null;
}

export function extractRecipeJsonLd(html: string): SchemaOrgRecipe | null {
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      const recipe = findRecipeInObject(parsed);
      if (recipe) return recipe;
    } catch {
      // Skip malformed JSON-LD blocks
    }
  }

  return null;
}
