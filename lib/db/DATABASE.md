# FlavorVault - Database Documentation

## Overview

FlavorVault uses a local SQLite database with expo-sqlite for offline-first, privacy-focused data storage. The database layer provides type-safe operations, automatic migrations, and comprehensive error handling.

## Architecture

```
lib/db/
├── connection.ts           # Database connection management
├── init.ts                 # Database initialization
├── index.ts               # Main exports
├── migrations/            # Schema migrations
│   ├── index.ts          # Migration runner
│   ├── 001_initial_schema.ts
│   └── 002_add_indexes.ts
├── schema/                # TypeScript interfaces and utilities
│   ├── recipe.ts
│   ├── recipe-validation.ts
│   ├── meal-plan.ts
│   ├── meal-plan-validation.ts
│   ├── shopping-list.ts
│   └── shopping-list-validation.ts
├── services/              # CRUD operations
│   ├── recipe-service.ts
│   ├── meal-plan-service.ts
│   └── shopping-list-service.ts
└── seed/                  # Sample data
    ├── index.ts
    └── recipes.ts
```

## Database Schema

### Tables

#### recipes
Stores complete recipe information with soft delete support.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID identifier |
| title | TEXT | NOT NULL | Recipe name (max 200 chars) |
| servings | INTEGER | NOT NULL, CHECK(1-50) | Number of servings |
| category | TEXT | NOT NULL | DishCategory enum value |
| ingredients | TEXT | NOT NULL | JSON array of Ingredient objects |
| steps | TEXT | NOT NULL | JSON array of instruction strings |
| imageUri | TEXT | NULL | Local file path to recipe image |
| prepTime | INTEGER | NULL, CHECK(0-1440) | Preparation time in minutes |
| cookTime | INTEGER | NULL, CHECK(0-1440) | Cooking time in minutes |
| tags | TEXT | NULL | JSON array of tag strings |
| createdAt | TEXT | NOT NULL | ISO 8601 datetime |
| updatedAt | TEXT | NOT NULL | ISO 8601 datetime |
| deletedAt | TEXT | NULL | ISO 8601 datetime (soft delete) |

**Indexes:**
- `idx_recipes_deleted_at` - Filter soft-deleted recipes
- `idx_recipes_category` - Filter by category
- `idx_recipes_title` - Search by title
- `idx_recipes_created_at` - Sort by creation date
- `idx_recipes_updated_at` - Sort by modification date
- `idx_recipes_active` - Composite (deletedAt, createdAt) for active recipes

#### meal_plans
Stores meal planning assignments linking recipes to dates and meal types.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID identifier |
| recipeId | TEXT | NOT NULL, FOREIGN KEY | References recipes(id) |
| date | TEXT | NOT NULL, CHECK(YYYY-MM-DD) | ISO 8601 date |
| mealType | TEXT | NOT NULL, CHECK(enum) | breakfast, lunch, dinner, snack |
| createdAt | TEXT | NOT NULL | ISO 8601 datetime |

**Indexes:**
- `idx_meal_plans_date_meal_type` - Composite for calendar queries
- `idx_meal_plans_recipe_id` - Find meals using a recipe
- `idx_meal_plans_date` - Query by date

#### shopping_list_items
Stores shopping list items (both auto-generated from meal plans and manual).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID identifier |
| name | TEXT | NOT NULL, CHECK(1-100 chars) | Ingredient/item name |
| quantity | REAL | NULL, CHECK(0-1000) | Numeric amount |
| unit | TEXT | NULL | MeasurementUnit enum value |
| checked | INTEGER | NOT NULL, DEFAULT 0 | Boolean (0/1) checked state |
| recipeId | TEXT | NULL | References recipes(id) for auto-generated items |
| mealPlanId | TEXT | NULL | References meal_plans(id) |
| createdAt | TEXT | NOT NULL | ISO 8601 datetime |

**Indexes:**
- `idx_shopping_list_items_checked` - Filter by checked status
- `idx_shopping_list_items_recipe_id` - Find items for a recipe
- `idx_shopping_list_items_meal_plan_id` - Find items for a meal plan
- `idx_shopping_list_items_name` - Search by name

## Data Types & Enums

### DishCategory
```typescript
enum DishCategory {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  DESSERT = 'dessert',
  APPETIZER = 'appetizer',
  BEVERAGE = 'beverage',
  OTHER = 'other',
}
```

### MealType
```typescript
enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}
```

### MeasurementUnit
```typescript
enum MeasurementUnit {
  // Volume
  TSP = 'tsp',
  TBSP = 'tbsp',
  CUP = 'cup',
  FL_OZ = 'fl oz',
  ML = 'ml',
  LITER = 'l',

  // Weight
  OZ = 'oz',
  LB = 'lb',
  GRAM = 'g',
  KG = 'kg',

  // Count
  UNIT = 'unit',
  PIECE = 'piece',
  SLICE = 'slice',
  CLOVE = 'clove',
  HEAD = 'head',
  BUNCH = 'bunch',
  CAN = 'can',
  BOTTLE = 'bottle',
  PACKAGE = 'package',
  BAG = 'bag',
  BOX = 'box',
}
```

## Getting Started

### Initialization

The database automatically initializes on first app launch:

```typescript
import { initializeDatabase } from '@/lib/db';

// Initialize database with migrations and seed data
await initializeDatabase();
```

This will:
1. Create database connection
2. Enable foreign keys and WAL mode
3. Run pending migrations
4. Seed sample recipes if database is empty
5. Complete in <2 seconds (success criteria)

### Using Services

#### Recipe Service

```typescript
import { recipeService } from '@/lib/db';

// Create a recipe
const recipe = await recipeService.createRecipe({
  title: 'Spaghetti Carbonara',
  servings: 4,
  category: DishCategory.DINNER,
  ingredients: [
    { name: 'spaghetti', quantity: 1, unit: MeasurementUnit.LB },
    { name: 'eggs', quantity: 4, unit: MeasurementUnit.UNIT },
    { name: 'bacon', quantity: 8, unit: MeasurementUnit.OZ },
    { name: 'parmesan cheese', quantity: 1, unit: MeasurementUnit.CUP },
  ],
  steps: [
    'Cook spaghetti according to package directions.',
    'Fry bacon until crispy, then chop.',
    'Beat eggs and mix with parmesan cheese.',
    'Drain pasta and toss with bacon fat.',
    'Remove from heat and stir in egg mixture.',
    'Add bacon and serve immediately.',
  ],
  prepTime: 10,
  cookTime: 15,
  tags: ['quick', 'Italian', 'pasta'],
});

// Get all recipes
const recipes = await recipeService.getAllRecipes();

// Search recipes
const italianRecipes = await recipeService.searchRecipes('pasta');

// Update recipe
await recipeService.updateRecipe({
  id: recipe.id,
  servings: 6,
  prepTime: 15,
});

// Delete recipe (soft delete)
await recipeService.deleteRecipe(recipe.id);

// Get recipes by category
const dinners = await recipeService.getRecipesByCategory(DishCategory.DINNER);
```

#### Meal Plan Service

```typescript
import { mealPlanService, MealType } from '@/lib/db';

// Create a meal plan
const mealPlan = await mealPlanService.createMealPlan({
  recipeId: recipe.id,
  date: '2025-10-28',
  mealType: MealType.DINNER,
});

// Get meal plans for a specific date
const todaysMeals = await mealPlanService.getMealPlansByDate('2025-10-28');

// Get meal plans for a date range (e.g., weekly view)
const weekMeals = await mealPlanService.getMealPlansByDateRange(
  '2025-10-27',
  '2025-11-02'
);

// Get meal plans with recipe details
const mealsWithRecipes = await mealPlanService.getMealPlansWithRecipe(
  '2025-10-27',
  '2025-11-02'
);

// Check if a meal slot is available
const isAvailable = await mealPlanService.isMealSlotAvailable(
  '2025-10-28',
  MealType.LUNCH
);

// Batch create meal plans
await mealPlanService.createMealPlansBatch([
  { recipeId: recipe1.id, date: '2025-10-28', mealType: MealType.BREAKFAST },
  { recipeId: recipe2.id, date: '2025-10-28', mealType: MealType.LUNCH },
  { recipeId: recipe3.id, date: '2025-10-28', mealType: MealType.DINNER },
]);

// Delete meal plan
await mealPlanService.deleteMealPlan(mealPlan.id);
```

#### Shopping List Service

```typescript
import { shoppingListService, MeasurementUnit } from '@/lib/db';

// Create a shopping list item (manual)
const item = await shoppingListService.createShoppingListItem({
  name: 'Milk',
  quantity: 2,
  unit: MeasurementUnit.LITER,
  checked: false,
});

// Create auto-generated items from recipe
const recipeItems = recipe.ingredients.map(ing => ({
  name: ing.name,
  quantity: ing.quantity,
  unit: ing.unit,
  recipeId: recipe.id,
  mealPlanId: mealPlan.id,
}));
await shoppingListService.createShoppingItemsBatch(recipeItems);

// Get all items
const allItems = await shoppingListService.getAllShoppingItems();

// Get unchecked items only
const activeItems = await shoppingListService.getAllShoppingItems({
  uncheckedOnly: true,
});

// Get items with recipe details
const itemsWithRecipes = await shoppingListService.getShoppingItemsWithRecipe();

// Update checked state
await shoppingListService.updateCheckedState(item.id, true);

// Check all items
await shoppingListService.checkAllItems();

// Delete checked items
await shoppingListService.deleteAllCheckedItems();

// Delete item
await shoppingListService.deleteShoppingItem(item.id);
```

## Validation

All services use Zod for runtime validation:

```typescript
import { RecipeValidation } from '@/lib/db';

// Validate recipe input
try {
  const validatedInput = RecipeValidation.createRecipeInputSchema.parse({
    title: 'Test Recipe',
    servings: 4,
    category: DishCategory.DINNER,
    ingredients: [],
    steps: [],
  });
} catch (error) {
  // Handle validation errors
  console.error('Validation failed:', error);
}
```

### Validation Constraints

- **Recipe Title**: 1-200 characters
- **Servings**: 1-50
- **Prep/Cook Time**: 0-1440 minutes (24 hours)
- **Ingredients**: At least 1 required
- **Steps**: At least 1 required
- **Shopping Item Name**: 1-100 characters
- **Shopping Item Quantity**: 0-1000

## Transactions

Use transactions for operations that involve multiple steps:

```typescript
// Using recipe service transaction
await recipeService.executeInTransaction(async (service) => {
  const recipe = await service.createRecipe(recipeData);
  // Additional operations...
  return recipe;
});

// Using database connection directly
import { dbConnection } from '@/lib/db';

await dbConnection.executeTransaction(async (db) => {
  // Multiple database operations
  await db.runAsync('INSERT INTO ...');
  await db.runAsync('UPDATE ...');
});
```

## Migrations

### Creating a New Migration

1. Create a new file: `lib/db/migrations/00X_migration_name.ts`

```typescript
import { dbConnection } from '../connection';

export const up = async (): Promise<void> => {
  const db = dbConnection.getDatabase();

  // Your migration code
  await db.execAsync(`
    ALTER TABLE recipes ADD COLUMN newField TEXT NULL;
  `);

  console.log('Migration completed successfully');
};

export const down = async (): Promise<void> => {
  const db = dbConnection.getDatabase();

  // Rollback code
  await db.execAsync(`
    ALTER TABLE recipes DROP COLUMN newField;
  `);

  console.log('Migration rolled back successfully');
};

export const migration = {
  version: X, // Increment from previous
  name: '00X_migration_name',
  description: 'Description of what this migration does',
  up,
  down,
};
```

2. Register in `lib/db/init.ts`:

```typescript
import { migration as newMigration } from './migrations/00X_migration_name';

export const registerMigrations = (): void => {
  migrationRunner.register(initialSchemaMigration);
  migrationRunner.register(indexesMigration);
  migrationRunner.register(newMigration); // Add new migration
};
```

### Migration Best Practices

- Always provide both `up` and `down` functions
- Use transactions for complex migrations
- Test rollback scenarios
- Version migrations sequentially
- Document schema changes clearly
- Never modify existing migrations that have been deployed

## Error Handling

All database operations throw `DatabaseError` with specific error codes:

```typescript
import { DatabaseError } from '@/lib/db';

try {
  await recipeService.createRecipe(invalidData);
} catch (error) {
  if (error instanceof DatabaseError) {
    console.error('Database error:', error.code);
    console.error('Message:', error.message);
    console.error('Original error:', error.originalError);
  }
}
```

### Error Codes

- `CONNECTION_FAILED` - Database connection issues
- `NOT_INITIALIZED` - Database not initialized
- `QUERY_FAILED` - SQL query execution failed
- `VALIDATION_ERROR` - Input validation failed
- `CREATE_FAILED` - Create operation failed
- `UPDATE_FAILED` - Update operation failed
- `DELETE_FAILED` - Delete operation failed
- `NOT_FOUND` - Record not found
- `SEED_FAILED` - Seeding operation failed
- `INIT_FAILED` - Initialization failed

## Performance Considerations

### Query Optimization

All common query patterns are indexed:
- Recipe searches by title, category, and active status
- Meal plan queries by date and recipe
- Shopping list filtering by checked status and recipe

### Best Practices

1. **Use pagination** for large result sets:
   ```typescript
   const recipes = await recipeService.getAllRecipes({
     limit: 20,
     offset: 0,
   });
   ```

2. **Batch operations** for multiple inserts:
   ```typescript
   await shoppingListService.createShoppingItemsBatch(items);
   ```

3. **Soft deletes** for recipes to maintain referential integrity

4. **Avoid N+1 queries** by using joins:
   ```typescript
   const mealsWithRecipes = await mealPlanService.getMealPlansWithRecipe();
   ```

### Performance Targets

- Database initialization: <2 seconds
- Single CRUD operation: <100ms
- Recipe list query (100+ records): <200ms
- Database file size: <10MB with 200 recipes

## Seed Data

The database automatically seeds 8 sample recipes on first launch:
- 2 Breakfast recipes
- 2 Lunch recipes
- 3 Dinner recipes
- 1 Dessert recipe

To manually reseed:

```typescript
import { resetDatabase, seedDatabase } from '@/lib/db';

// Clear and reseed
await resetDatabase();

// Or just seed (if empty)
await seedDatabase();
```

## Troubleshooting

### Database won't initialize
- Check that expo-sqlite is properly installed
- Verify device/emulator has storage permissions
- Check console for specific error messages

### Queries are slow
- Verify indexes exist: `PRAGMA index_list('table_name')`
- Check query plans: `EXPLAIN QUERY PLAN SELECT ...`
- Ensure WAL mode is enabled: `PRAGMA journal_mode`

### Type errors in queries
- Ensure TypeScript strict mode is enabled
- Regenerate types after schema changes
- Check that Zod schemas match TypeScript interfaces

### Foreign key violations
- Verify foreign keys are enabled: `PRAGMA foreign_keys`
- Check that referenced records exist
- Use transactions for multi-step operations

### Database corruption
- Check device storage space
- Verify proper app shutdown (no force kills during writes)
- Consider implementing database backups

## Testing

### Unit Tests

Test validation logic and utility functions:

```typescript
import { RecipeUtils, DishCategory } from '@/lib/db';

describe('RecipeUtils', () => {
  it('validates recipe with valid data', () => {
    const recipe = {
      id: 'test-id',
      title: 'Test Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [{ name: 'Test', quantity: 1, unit: null }],
      steps: ['Step 1'],
      // ... other fields
    };

    const errors = RecipeUtils.validate(recipe);
    expect(errors).toHaveLength(0);
  });

  it('catches validation errors', () => {
    const invalidRecipe = { /* missing required fields */ };
    const errors = RecipeUtils.validate(invalidRecipe);
    expect(errors.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

Test complete service operations:

```typescript
import { recipeService, initializeDatabase } from '@/lib/db';

describe('Recipe Service', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  it('creates and retrieves recipe', async () => {
    const recipe = await recipeService.createRecipe({
      // ... recipe data
    });

    const retrieved = await recipeService.getRecipeById(recipe.id);
    expect(retrieved?.title).toBe(recipe.title);
  });

  it('updates recipe', async () => {
    const recipe = await recipeService.createRecipe({ /* ... */ });
    await recipeService.updateRecipe({
      id: recipe.id,
      title: 'Updated Title',
    });

    const updated = await recipeService.getRecipeById(recipe.id);
    expect(updated?.title).toBe('Updated Title');
  });
});
```

## API Reference

See JSDoc comments in each service file for detailed API documentation:
- [RecipeService](./services/recipe-service.ts)
- [MealPlanService](./services/meal-plan-service.ts)
- [ShoppingListService](./services/shopping-list-service.ts)

## Additional Resources

- [expo-sqlite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Zod Documentation](https://zod.dev/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
