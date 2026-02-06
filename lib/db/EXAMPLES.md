# Database Usage Examples

## Complete Application Workflow Examples

### Example 1: Recipe Management Flow

```typescript
import {
  recipeService,
  initializeDatabase,
  DishCategory,
  MeasurementUnit,
} from '@/lib/db';

// Initialize database on app startup
async function initializeApp() {
  try {
    await initializeDatabase();
    console.log('App ready!');
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
}

// Create a new recipe
async function createNewRecipe() {
  try {
    const recipe = await recipeService.createRecipe({
      title: 'Homemade Pizza',
      servings: 8,
      category: DishCategory.DINNER,
      ingredients: [
        { name: 'pizza dough', quantity: 1, unit: MeasurementUnit.LB },
        { name: 'tomato sauce', quantity: 1, unit: MeasurementUnit.CUP },
        { name: 'mozzarella cheese', quantity: 2, unit: MeasurementUnit.CUP },
        { name: 'pepperoni', quantity: 4, unit: MeasurementUnit.OZ },
        { name: 'olive oil', quantity: 2, unit: MeasurementUnit.TBSP },
        { name: 'oregano', quantity: 1, unit: MeasurementUnit.TSP },
      ],
      steps: [
        'Preheat oven to 475°F.',
        'Roll out pizza dough on a floured surface.',
        'Transfer to a pizza pan or stone.',
        'Spread tomato sauce evenly over the dough.',
        'Sprinkle mozzarella cheese on top.',
        'Add pepperoni slices.',
        'Drizzle with olive oil and sprinkle oregano.',
        'Bake for 12-15 minutes until crust is golden.',
        'Let cool for 5 minutes before slicing.',
      ],
      prepTime: 20,
      cookTime: 15,
      tags: ['Italian', 'family-friendly', 'weekend'],
      imageUri: '/path/to/pizza-image.jpg',
    });

    console.log('Recipe created:', recipe.id);
    return recipe;
  } catch (error) {
    console.error('Failed to create recipe:', error);
    throw error;
  }
}

// Search and display recipes
async function searchAndDisplayRecipes(searchTerm: string) {
  try {
    const recipes = await recipeService.searchRecipes(searchTerm);

    if (recipes.length === 0) {
      console.log('No recipes found');
      return;
    }

    console.log(`Found ${recipes.length} recipes:`);
    recipes.forEach((recipe) => {
      const totalTime = recipe.prepTime + recipe.cookTime;
      console.log(`- ${recipe.title} (${totalTime} min, ${recipe.servings} servings)`);
    });

    return recipes;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

// Update recipe with user feedback
async function updateRecipeServings(recipeId: string, newServings: number) {
  try {
    const updated = await recipeService.updateRecipe({
      id: recipeId,
      servings: newServings,
    });

    console.log(`Updated servings to ${updated.servings}`);
    return updated;
  } catch (error) {
    console.error('Failed to update recipe:', error);
    throw error;
  }
}

// Delete a recipe
async function removeRecipe(recipeId: string) {
  try {
    await recipeService.deleteRecipe(recipeId);
    console.log('Recipe deleted');
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    throw error;
  }
}
```

### Example 2: Meal Planning Workflow

```typescript
import {
  mealPlanService,
  recipeService,
  MealType,
  DishCategory,
} from '@/lib/db';

// Plan a week of meals
async function planWeekMeals(startDate: string) {
  try {
    // Get available recipes for different meal types
    const breakfastRecipes = await recipeService.getRecipesByCategory(
      DishCategory.BREAKFAST
    );
    const lunchRecipes = await recipeService.getRecipesByCategory(
      DishCategory.LUNCH
    );
    const dinnerRecipes = await recipeService.getRecipesByCategory(
      DishCategory.DINNER
    );

    const mealPlans = [];

    // Plan 7 days
    for (let day = 0; day < 7; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];

      // Plan breakfast
      const breakfast = breakfastRecipes[day % breakfastRecipes.length];
      mealPlans.push({
        recipeId: breakfast.id,
        date: dateStr,
        mealType: MealType.BREAKFAST,
      });

      // Plan lunch
      const lunch = lunchRecipes[day % lunchRecipes.length];
      mealPlans.push({
        recipeId: lunch.id,
        date: dateStr,
        mealType: MealType.LUNCH,
      });

      // Plan dinner
      const dinner = dinnerRecipes[day % dinnerRecipes.length];
      mealPlans.push({
        recipeId: dinner.id,
        date: dateStr,
        mealType: MealType.DINNER,
      });
    }

    // Create all meal plans in a batch
    const created = await mealPlanService.createMealPlansBatch(mealPlans);
    console.log(`Planned ${created.length} meals for the week`);

    return created;
  } catch (error) {
    console.error('Failed to plan meals:', error);
    throw error;
  }
}

// Get today's meal plan
async function getTodayMeals() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const meals = await mealPlanService.getMealPlansWithRecipe(today, today);

    console.log(`Today's meals (${today}):`);
    meals.forEach((meal) => {
      console.log(
        `${meal.mealType}: ${meal.recipeTitle} (${meal.recipeServings} servings)`
      );
    });

    return meals;
  } catch (error) {
    console.error('Failed to get today\'s meals:', error);
    throw error;
  }
}

// View week calendar
async function getWeekCalendar(startDate: string) {
  try {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const endDateStr = endDate.toISOString().split('T')[0];

    const meals = await mealPlanService.getMealPlansWithRecipe(
      startDate,
      endDateStr
    );

    // Group by date
    const calendar: Record<string, any> = {};
    meals.forEach((meal) => {
      if (!calendar[meal.date]) {
        calendar[meal.date] = {};
      }
      calendar[meal.date][meal.mealType] = {
        title: meal.recipeTitle,
        prepTime: meal.recipePrepTime,
        cookTime: meal.recipeCookTime,
      };
    });

    console.log('Week calendar:', calendar);
    return calendar;
  } catch (error) {
    console.error('Failed to get week calendar:', error);
    throw error;
  }
}

// Replace a meal
async function replaceMeal(
  date: string,
  mealType: MealType,
  newRecipeId: string
) {
  try {
    // Find existing meal plan
    const existingMeals = await mealPlanService.getMealPlansByDate(date);
    const existingMeal = existingMeals.find((m) => m.mealType === mealType);

    if (existingMeal) {
      // Update existing meal
      await mealPlanService.updateMealPlan({
        id: existingMeal.id,
        recipeId: newRecipeId,
      });
      console.log('Meal updated');
    } else {
      // Create new meal plan
      await mealPlanService.createMealPlan({
        recipeId: newRecipeId,
        date,
        mealType,
      });
      console.log('Meal added');
    }
  } catch (error) {
    console.error('Failed to replace meal:', error);
    throw error;
  }
}

// Clear a specific day's meals
async function clearDayMeals(date: string) {
  try {
    await mealPlanService.deleteMealPlansByDate(date);
    console.log(`Cleared all meals for ${date}`);
  } catch (error) {
    console.error('Failed to clear meals:', error);
    throw error;
  }
}
```

### Example 3: Shopping List Management

```typescript
import {
  shoppingListService,
  mealPlanService,
  recipeService,
  MeasurementUnit,
} from '@/lib/db';

// Generate shopping list from meal plans
async function generateShoppingList(startDate: string, endDate: string) {
  try {
    // Get all meal plans for the date range
    const mealPlans = await mealPlanService.getMealPlansByDateRange(
      startDate,
      endDate
    );

    if (mealPlans.length === 0) {
      console.log('No meal plans found for this period');
      return;
    }

    // Get recipes for all meal plans
    const recipeIds = [...new Set(mealPlans.map((mp) => mp.recipeId))];
    const recipes = await Promise.all(
      recipeIds.map((id) => recipeService.getRecipeById(id))
    );

    // Aggregate ingredients
    const ingredientMap = new Map<
      string,
      {
        quantity: number;
        unit: MeasurementUnit | null;
        recipeIds: string[];
      }
    >();

    recipes.forEach((recipe) => {
      if (!recipe) return;

      recipe.ingredients.forEach((ing) => {
        const key = `${ing.name}|${ing.unit || 'none'}`;
        const existing = ingredientMap.get(key);

        if (existing) {
          existing.quantity += ing.quantity || 0;
          existing.recipeIds.push(recipe.id);
        } else {
          ingredientMap.set(key, {
            quantity: ing.quantity || 0,
            unit: ing.unit,
            recipeIds: [recipe.id],
          });
        }
      });
    });

    // Create shopping list items
    const items = Array.from(ingredientMap.entries()).map(
      ([key, value]) => {
        const [name] = key.split('|');
        return {
          name,
          quantity: value.quantity,
          unit: value.unit,
          recipeId: value.recipeIds[0], // Associate with first recipe
        };
      }
    );

    const created = await shoppingListService.createShoppingItemsBatch(items);
    console.log(`Created ${created.length} shopping list items`);

    return created;
  } catch (error) {
    console.error('Failed to generate shopping list:', error);
    throw error;
  }
}

// Add manual item to shopping list
async function addManualItem(name: string, quantity?: number, unit?: string) {
  try {
    const item = await shoppingListService.createShoppingListItem({
      name,
      quantity: quantity || null,
      unit: unit as MeasurementUnit || null,
      checked: false,
    });

    console.log(`Added ${name} to shopping list`);
    return item;
  } catch (error) {
    console.error('Failed to add item:', error);
    throw error;
  }
}

// Get organized shopping list
async function getOrganizedShoppingList() {
  try {
    const items = await shoppingListService.getAllShoppingItems();

    // Separate checked and unchecked
    const unchecked = items.filter((item) => !item.checked);
    const checked = items.filter((item) => item.checked);

    console.log(`Shopping List (${unchecked.length} items to buy):`);
    unchecked.forEach((item) => {
      const qty = item.quantity
        ? `${item.quantity} ${item.unit || ''}`
        : '';
      console.log(`[ ] ${item.name} ${qty}`.trim());
    });

    if (checked.length > 0) {
      console.log(`\nCompleted (${checked.length}):`);
      checked.forEach((item) => {
        const qty = item.quantity
          ? `${item.quantity} ${item.unit || ''}`
          : '';
        console.log(`[✓] ${item.name} ${qty}`.trim());
      });
    }

    return { unchecked, checked };
  } catch (error) {
    console.error('Failed to get shopping list:', error);
    throw error;
  }
}

// Check off an item
async function checkOffItem(itemId: string) {
  try {
    await shoppingListService.updateCheckedState(itemId, true);
    console.log('Item checked off');
  } catch (error) {
    console.error('Failed to check off item:', error);
    throw error;
  }
}

// Clear checked items
async function clearCompletedItems() {
  try {
    await shoppingListService.deleteAllCheckedItems();
    console.log('Cleared all checked items');
  } catch (error) {
    console.error('Failed to clear items:', error);
    throw error;
  }
}

// Get items with recipe context
async function getItemsWithContext() {
  try {
    const items = await shoppingListService.getShoppingItemsWithRecipe();

    console.log('Shopping List with Context:');
    items.forEach((item) => {
      const qty = item.quantity
        ? `${item.quantity} ${item.unit || ''}`
        : '';
      const context = item.recipeTitle
        ? ` (for ${item.recipeTitle})`
        : ' (manual)';
      const check = item.checked ? '[✓]' : '[ ]';
      console.log(`${check} ${item.name} ${qty}${context}`.trim());
    });

    return items;
  } catch (error) {
    console.error('Failed to get items with context:', error);
    throw error;
  }
}
```

### Example 4: Complex Transaction Scenario

```typescript
import {
  recipeService,
  mealPlanService,
  shoppingListService,
  dbConnection,
  DishCategory,
  MealType,
} from '@/lib/db';

// Create recipe and immediately plan it
async function createAndPlanRecipe(recipeData: any, date: string) {
  try {
    const result = await dbConnection.executeTransaction(async () => {
      // Create the recipe
      const recipe = await recipeService.createRecipe(recipeData);

      // Plan it for dinner
      const mealPlan = await mealPlanService.createMealPlan({
        recipeId: recipe.id,
        date,
        mealType: MealType.DINNER,
      });

      // Add ingredients to shopping list
      const shoppingItems = recipe.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        recipeId: recipe.id,
        mealPlanId: mealPlan.id,
      }));

      const items =
        await shoppingListService.createShoppingItemsBatch(shoppingItems);

      return { recipe, mealPlan, items };
    });

    console.log('Recipe created, planned, and added to shopping list');
    return result;
  } catch (error) {
    console.error('Transaction failed, all changes rolled back:', error);
    throw error;
  }
}

// Remove recipe and all related data
async function removeRecipeCompletely(recipeId: string) {
  try {
    await dbConnection.executeTransaction(async () => {
      // Delete shopping list items
      await shoppingListService.deleteShoppingItemsByRecipe(recipeId);

      // Delete meal plans
      await mealPlanService.deleteMealPlansByRecipe(recipeId);

      // Delete recipe
      await recipeService.deleteRecipe(recipeId);
    });

    console.log('Recipe and all related data removed');
  } catch (error) {
    console.error('Failed to remove recipe:', error);
    throw error;
  }
}
```

### Example 5: Error Handling Patterns

```typescript
import { recipeService, DatabaseError } from '@/lib/db';

// Robust error handling
async function safeCreateRecipe(recipeData: any) {
  try {
    const recipe = await recipeService.createRecipe(recipeData);
    return { success: true, data: recipe };
  } catch (error) {
    if (error instanceof DatabaseError) {
      switch (error.code) {
        case 'VALIDATION_ERROR':
          console.error('Invalid recipe data:', error.message);
          return { success: false, error: 'Please check your input' };

        case 'CREATE_FAILED':
          console.error('Database error:', error.message);
          return {
            success: false,
            error: 'Failed to save recipe',
          };

        default:
          console.error('Unexpected error:', error);
          return {
            success: false,
            error: 'Something went wrong',
          };
      }
    }

    // Non-database error
    console.error('Unknown error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Retry logic for network-dependent operations
async function initWithRetry(maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await initializeDatabase();
      console.log('Database initialized successfully');
      return;
    } catch (error) {
      lastError = error;
      console.error(`Initialization attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to initialize database after ${maxRetries} attempts: ${lastError}`
  );
}
```

### Example 6: Performance Optimization

```typescript
import { recipeService } from '@/lib/db';

// Paginated recipe loading
async function loadRecipesPaginated(page = 0, pageSize = 20) {
  try {
    const offset = page * pageSize;
    const recipes = await recipeService.getAllRecipes({
      limit: pageSize,
      offset,
    });

    const totalCount = await recipeService.getRecipeCount();
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      recipes,
      currentPage: page,
      totalPages,
      hasMore: page < totalPages - 1,
    };
  } catch (error) {
    console.error('Failed to load recipes:', error);
    throw error;
  }
}

// Efficient batch loading
async function loadRecipesByIds(recipeIds: string[]) {
  try {
    // Load all recipes in parallel
    const recipes = await Promise.all(
      recipeIds.map((id) => recipeService.getRecipeById(id))
    );

    // Filter out nulls (recipes not found)
    return recipes.filter((recipe) => recipe !== null);
  } catch (error) {
    console.error('Failed to load recipes:', error);
    throw error;
  }
}

// Cached search
const searchCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function cachedSearch(searchTerm: string) {
  const cacheKey = searchTerm.toLowerCase();
  const cached = searchCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Returning cached results');
    return cached.results;
  }

  const results = await recipeService.searchRecipes(searchTerm);
  searchCache.set(cacheKey, {
    results,
    timestamp: Date.now(),
  });

  return results;
}
```

## React Native Component Integration

```typescript
// Example: Recipe List Component
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { recipeService, Recipe } from '@/lib/db';

export function RecipeListScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  async function loadRecipes() {
    try {
      setLoading(true);
      const data = await recipeService.getAllRecipes({ limit: 50 });
      setRecipes(data);
    } catch (err) {
      setError('Failed to load recipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.title}</Text>
          <Text>
            {item.prepTime + item.cookTime} min | {item.servings} servings
          </Text>
        </View>
      )}
    />
  );
}
```

These examples cover the most common use cases and patterns for working with the FlavorVault database layer.
