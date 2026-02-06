# References: Current Database Architecture

## Current SQLite Schema

### recipes table
```sql
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  servings INTEGER NOT NULL CHECK (servings >= 1 AND servings <= 50),
  category TEXT NOT NULL,
  ingredients TEXT NOT NULL, -- JSON array
  steps TEXT NOT NULL, -- JSON array
  imageUri TEXT NULL,
  prepTime INTEGER NULL CHECK (prepTime >= 0 AND prepTime <= 1440),
  cookTime INTEGER NULL CHECK (cookTime >= 0 AND cookTime <= 1440),
  tags TEXT NULL, -- JSON array
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  deletedAt TEXT NULL
);
```

### meal_plans table
```sql
CREATE TABLE meal_plans (
  id TEXT PRIMARY KEY,
  recipeId TEXT NOT NULL,
  date TEXT NOT NULL CHECK (date LIKE '____-__-__'),
  mealType TEXT NOT NULL CHECK (mealType IN ('breakfast', 'lunch', 'dinner', 'snack')),
  createdAt TEXT NOT NULL,
  FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
);
```

### shopping_list_items table
```sql
CREATE TABLE shopping_list_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  quantity REAL NULL,
  unit TEXT NULL,
  checked INTEGER NOT NULL DEFAULT 0,
  recipeId TEXT NULL,
  mealPlanId TEXT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  source TEXT NOT NULL DEFAULT 'recipe',
  originalName TEXT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (mealPlanId) REFERENCES meal_plans(id) ON DELETE CASCADE
);
```

### custom_categories table
```sql
CREATE TABLE custom_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  deletedAt TEXT NULL
);
```

### recipe_tags table
```sql
CREATE TABLE recipe_tags (
  id TEXT PRIMARY KEY,
  recipeId TEXT NOT NULL,
  categoryType TEXT NOT NULL CHECK (categoryType IN ('default', 'custom')),
  categoryName TEXT NOT NULL,
  tagValue TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
);
```

## Current Services

### RecipeService
Location: `lib/db/services/recipe-service.ts`

Methods:
- `createRecipe(input)` - Create new recipe
- `getRecipeById(id)` - Get single recipe
- `getAllRecipes(options)` - List recipes with pagination
- `updateRecipe(input)` - Update recipe
- `deleteRecipe(id)` - Soft delete
- `searchRecipes(term)` - Search by title
- `getRecipeCount()` - Count recipes
- `getRecipesByCategory(category)` - Filter by category
- `getRecipesByTag(tag)` - Filter by tag

### MealPlanService
Location: `lib/db/services/meal-plan-service.ts`

Methods:
- `createMealPlan(input)` - Create meal plan
- `getMealPlanById(id)` - Get single plan
- `getMealPlansByDate(date)` - Get plans for date
- `getMealPlansByDateRange(start, end)` - Get plans in range
- `getMealPlansWithRecipe(start, end)` - Get with recipe details
- `updateMealPlan(input)` - Update plan
- `deleteMealPlan(id)` - Delete plan
- `deleteMealPlansByRecipe(recipeId)` - Delete by recipe

### ShoppingListService
Location: `lib/db/services/shopping-list-service.ts`

Methods:
- `createItem(input)` - Create item
- `createBulk(inputs)` - Batch create
- `getAll()` - Get all items
- `getAllByCategory()` - Get grouped by category
- `updateCheckedState(id, checked)` - Toggle checked
- `deleteItem(id)` - Delete item
- `deleteByRecipeId(recipeId)` - Delete by recipe
- `clearAll()` - Clear all items

### TagService
Location: `lib/db/services/tag-service.ts`

Methods:
- `getAllTags()` - Get all tags organized by category
- `getTagsByCategory(name)` - Get tags for category
- `createTag(input)` - Create tag
- `updateTag(value, newValue)` - Rename tag
- `deleteTag(value)` - Delete tag
- `createCategory(input)` - Create custom category
- `updateCategory(input)` - Update category
- `deleteCategory(id)` - Delete category
- `getTagsForRecipe(recipeId)` - Get recipe's tags

## Current Connection Pattern

Location: `lib/db/connection.ts`

Uses singleton `dbConnection` with methods:
- `initialize()` - Open database
- `getDatabase()` - Get SQLite instance
- `executeQuery(query, params)` - Run mutation
- `executeSelect(query, params)` - Run query
- `executeTransaction(operation)` - Transaction wrapper

## Database Error Class

```typescript
export class DatabaseError extends Error {
  public readonly code: string;
  public readonly originalError?: any;
}
```

Error codes used:
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CREATE_FAILED`
- `UPDATE_FAILED`
- `DELETE_FAILED`
- `QUERY_FAILED`
