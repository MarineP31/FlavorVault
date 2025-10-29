# Database Troubleshooting Guide

## Common Issues and Solutions

### Initialization Issues

#### Database fails to initialize

**Symptoms:**
- Error: "Failed to initialize database connection"
- App crashes on startup
- Initialization takes longer than 2 seconds

**Possible Causes and Solutions:**

1. **expo-sqlite not installed properly**
   ```bash
   # Reinstall expo-sqlite
   yarn add expo-sqlite@latest

   # Clear cache and rebuild
   npx expo start -c
   ```

2. **Device storage issues**
   - Check available storage space
   - Clear app data and retry
   - On iOS: Reset simulator (Device > Erase All Content and Settings)
   - On Android: Clear app data in Settings

3. **Permission issues**
   - Ensure app has storage permissions
   - Check app.json for required permissions
   - On Android, add to AndroidManifest.xml:
     ```xml
     <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
     <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
     ```

4. **Migration errors**
   ```typescript
   // Check migration status
   import { getDatabaseStatus } from '@/lib/db';

   const status = await getDatabaseStatus();
   console.log('Migration status:', status);
   ```

**Debug Steps:**
```typescript
import { dbConnection, migrationRunner } from '@/lib/db';

// Test connection
try {
  await dbConnection.initialize();
  const isHealthy = await dbConnection.healthCheck();
  console.log('Connection healthy:', isHealthy);
} catch (error) {
  console.error('Connection error:', error);
}

// Check current version
const version = await dbConnection.getUserVersion();
console.log('Current schema version:', version);
```

---

### Migration Issues

#### Migration fails to execute

**Symptoms:**
- Error: "Migration execution failed"
- Database stuck at old version
- Data loss after migration

**Solutions:**

1. **Check migration sequence**
   - Ensure migrations are numbered sequentially (001, 002, 003...)
   - Verify all migrations are registered in init.ts
   - Check for gaps in version numbers

2. **Review migration SQL**
   ```typescript
   // Test migration SQL manually
   import { dbConnection } from '@/lib/db';

   const db = dbConnection.getDatabase();
   try {
     await db.execAsync('YOUR_MIGRATION_SQL');
     console.log('Migration SQL is valid');
   } catch (error) {
     console.error('Invalid SQL:', error);
   }
   ```

3. **Rollback failed migration**
   ```typescript
   import { migrationRunner } from '@/lib/db';

   // Rollback last migration
   await migrationRunner.rollbackMigration();
   ```

4. **Reset database** (CAUTION: Deletes all data)
   ```typescript
   import { dbConnection } from '@/lib/db';

   const db = dbConnection.getDatabase();
   await db.execAsync('DROP TABLE IF EXISTS recipes;');
   await db.execAsync('DROP TABLE IF EXISTS meal_plans;');
   await db.execAsync('DROP TABLE IF EXISTS shopping_list_items;');
   await db.execAsync('PRAGMA user_version = 0;');

   // Reinitialize
   await initializeDatabase();
   ```

---

### Query Performance Issues

#### Queries are slow

**Symptoms:**
- Operations take >100ms
- UI feels sluggish
- App freezes during database operations

**Solutions:**

1. **Verify indexes exist**
   ```typescript
   const db = dbConnection.getDatabase();
   const indexes = await db.getAllAsync(`
     SELECT name FROM sqlite_master
     WHERE type='index'
   `);
   console.log('Indexes:', indexes);
   ```

2. **Analyze query plan**
   ```typescript
   const plan = await db.getAllAsync(`
     EXPLAIN QUERY PLAN
     SELECT * FROM recipes WHERE deletedAt IS NULL
   `);
   console.log('Query plan:', plan);
   // Look for "USING INDEX" in the plan
   ```

3. **Use pagination**
   ```typescript
   // BAD: Loading all recipes
   const recipes = await recipeService.getAllRecipes();

   // GOOD: Load in pages
   const recipes = await recipeService.getAllRecipes({
     limit: 20,
     offset: 0,
   });
   ```

4. **Batch operations**
   ```typescript
   // BAD: Multiple individual inserts
   for (const item of items) {
     await shoppingListService.createShoppingListItem(item);
   }

   // GOOD: Batch insert
   await shoppingListService.createShoppingItemsBatch(items);
   ```

5. **Check WAL mode**
   ```typescript
   const walMode = await db.getFirstAsync('PRAGMA journal_mode;');
   console.log('Journal mode:', walMode);
   // Should be "wal"
   ```

---

### Validation Errors

#### Input validation fails

**Symptoms:**
- Error: "Recipe validation failed"
- Zod validation errors
- Data rejected by database

**Solutions:**

1. **Check validation constraints**
   ```typescript
   import { RecipeUtils } from '@/lib/db';

   const errors = RecipeUtils.validate(recipe);
   if (errors.length > 0) {
     console.log('Validation errors:', errors);
     // Fix each error listed
   }
   ```

2. **Common validation issues:**
   - Title: Must be 1-200 characters
   - Servings: Must be 1-50
   - Prep/Cook time: Must be 0-1440 minutes
   - Ingredients: At least 1 required
   - Steps: At least 1 required
   - Date format: Must be YYYY-MM-DD

3. **Test with Zod schema**
   ```typescript
   import { RecipeValidation } from '@/lib/db';

   try {
     const validated = RecipeValidation.createRecipeInputSchema.parse(input);
     console.log('Input is valid');
   } catch (error) {
     console.error('Zod validation failed:', error.errors);
   }
   ```

---

### Foreign Key Violations

#### Foreign key constraint error

**Symptoms:**
- Error: "FOREIGN KEY constraint failed"
- Cannot create meal plan or shopping list item
- Cascade deletes not working

**Solutions:**

1. **Verify foreign keys are enabled**
   ```typescript
   const fkStatus = await db.getFirstAsync('PRAGMA foreign_keys;');
   console.log('Foreign keys enabled:', fkStatus);
   // Should be { foreign_keys: 1 }
   ```

2. **Check referenced record exists**
   ```typescript
   // Before creating meal plan
   const recipe = await recipeService.getRecipeById(recipeId);
   if (!recipe) {
     console.error('Recipe does not exist');
     return;
   }
   ```

3. **Use transactions for related operations**
   ```typescript
   await dbConnection.executeTransaction(async () => {
     const recipe = await recipeService.createRecipe(recipeData);
     const mealPlan = await mealPlanService.createMealPlan({
       recipeId: recipe.id,
       date: '2025-10-28',
       mealType: MealType.DINNER,
     });
   });
   ```

---

### JSON Parsing Errors

#### Invalid JSON in database

**Symptoms:**
- Error: "Unexpected token in JSON"
- Cannot retrieve recipes
- Ingredients/steps array corruption

**Solutions:**

1. **Validate before insert**
   ```typescript
   // The services handle this automatically, but if manually inserting:
   const ingredientsJson = JSON.stringify(ingredients);
   JSON.parse(ingredientsJson); // Will throw if invalid
   ```

2. **Fix corrupted data**
   ```typescript
   import { dbConnection } from '@/lib/db';

   const db = dbConnection.getDatabase();
   const recipes = await db.getAllAsync('SELECT id, ingredients FROM recipes');

   for (const recipe of recipes) {
     try {
       JSON.parse(recipe.ingredients);
     } catch (error) {
       console.error(`Recipe ${recipe.id} has invalid JSON`);
       // Fix or delete corrupted recipe
     }
   }
   ```

---

### Memory Issues

#### App runs out of memory

**Symptoms:**
- App crashes with large datasets
- Memory warnings in console
- Slow performance with many recipes

**Solutions:**

1. **Use pagination everywhere**
   ```typescript
   // Load recipes in chunks
   async function loadAllRecipesInChunks() {
     const pageSize = 50;
     let offset = 0;
     let hasMore = true;

     while (hasMore) {
       const recipes = await recipeService.getAllRecipes({
         limit: pageSize,
         offset,
       });

       // Process chunk
       processRecipes(recipes);

       hasMore = recipes.length === pageSize;
       offset += pageSize;
     }
   }
   ```

2. **Limit concurrent operations**
   ```typescript
   // Instead of Promise.all() for large arrays
   async function processInBatches<T>(
     items: T[],
     batchSize: number,
     processor: (item: T) => Promise<void>
   ) {
     for (let i = 0; i < items.length; i += batchSize) {
       const batch = items.slice(i, i + batchSize);
       await Promise.all(batch.map(processor));
     }
   }
   ```

3. **Clear unused data**
   ```typescript
   // Clear completed shopping items regularly
   await shoppingListService.deleteAllCheckedItems();

   // Delete old meal plans
   const oldDate = new Date();
   oldDate.setDate(oldDate.getDate() - 30);
   // Implement custom query to delete meal plans before oldDate
   ```

---

### Type Errors

#### TypeScript compilation errors

**Symptoms:**
- Type errors in IDE
- Compilation fails
- Runtime type mismatches

**Solutions:**

1. **Update TypeScript types**
   ```bash
   yarn add --dev @types/uuid@latest
   ```

2. **Enable strict mode**
   Ensure tsconfig.json has:
   ```json
   {
     "compilerOptions": {
       "strict": true
     }
   }
   ```

3. **Check path aliases**
   Verify tsconfig.json has:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

4. **Import from correct paths**
   ```typescript
   // CORRECT
   import { recipeService } from '@/lib/db';

   // INCORRECT
   import { recipeService } from '../../lib/db';
   ```

---

### Seed Data Issues

#### Seed data not inserting

**Symptoms:**
- Database empty after initialization
- Error during seeding
- Some recipes missing

**Solutions:**

1. **Check if seeding is skipped**
   ```typescript
   import { needsSeeding } from '@/lib/db';

   const shouldSeed = await needsSeeding();
   console.log('Should seed:', shouldSeed);
   ```

2. **Force reseed** (CAUTION: Deletes existing data)
   ```typescript
   import { resetDatabase } from '@/lib/db';
   await resetDatabase();
   ```

3. **Check seed data validity**
   ```typescript
   import { sampleRecipes } from '@/lib/db/seed/recipes';
   import { RecipeValidation } from '@/lib/db';

   sampleRecipes.forEach((recipe, index) => {
     try {
       RecipeValidation.createRecipeInputSchema.parse(recipe);
       console.log(`Recipe ${index} is valid`);
     } catch (error) {
       console.error(`Recipe ${index} is invalid:`, error);
     }
   });
   ```

---

### Transaction Rollback Issues

#### Transactions not rolling back

**Symptoms:**
- Partial data persists after errors
- Database in inconsistent state
- Expected rollback didn't happen

**Solutions:**

1. **Always use transaction wrapper**
   ```typescript
   // CORRECT
   await dbConnection.executeTransaction(async () => {
     await operation1();
     await operation2();
     throw new Error('Test'); // Will rollback both operations
   });

   // INCORRECT - No automatic rollback
   await operation1();
   await operation2();
   ```

2. **Check for nested transactions**
   SQLite doesn't support nested transactions. Use savepoints instead:
   ```typescript
   // If you need nested behavior, structure code to avoid it
   // or implement savepoint logic manually
   ```

3. **Verify transaction completion**
   ```typescript
   const db = dbConnection.getDatabase();
   const inTransaction = await db.getFirstAsync('PRAGMA in_transaction;');
   console.log('In transaction:', inTransaction);
   // Should be 0 when not in transaction
   ```

---

## Performance Monitoring

### Enable Performance Logging

```typescript
// Add to services for monitoring
class MonitoredRecipeService extends RecipeService {
  async getAllRecipes(options?: any) {
    const start = Date.now();
    const result = await super.getAllRecipes(options);
    const elapsed = Date.now() - start;

    if (elapsed > 100) {
      console.warn(`Slow query: getAllRecipes took ${elapsed}ms`);
    }

    return result;
  }
}
```

### Database Size Monitoring

```typescript
import * as FileSystem from 'expo-file-system';

async function checkDatabaseSize() {
  const dbPath = `${FileSystem.documentDirectory}SQLite/recipe_keeper.db`;
  const info = await FileSystem.getInfoAsync(dbPath);

  if (info.exists) {
    const sizeMB = info.size / (1024 * 1024);
    console.log(`Database size: ${sizeMB.toFixed(2)} MB`);

    if (sizeMB > 10) {
      console.warn('Database exceeds 10MB target');
    }
  }
}
```

---

## Emergency Recovery

### Backup Database

```typescript
import * as FileSystem from 'expo-file-system';

async function backupDatabase() {
  const dbPath = `${FileSystem.documentDirectory}SQLite/recipe_keeper.db`;
  const backupPath = `${FileSystem.documentDirectory}SQLite/recipe_keeper_backup_${Date.now()}.db`;

  await FileSystem.copyAsync({
    from: dbPath,
    to: backupPath,
  });

  console.log('Backup created:', backupPath);
}
```

### Restore Database

```typescript
async function restoreDatabase(backupPath: string) {
  const dbPath = `${FileSystem.documentDirectory}SQLite/recipe_keeper.db`;

  // Close connection first
  await dbConnection.close();

  // Restore backup
  await FileSystem.copyAsync({
    from: backupPath,
    to: dbPath,
  });

  // Reinitialize
  await dbConnection.initialize();
  console.log('Database restored');
}
```

### Export Data as JSON

```typescript
async function exportAllData() {
  const recipes = await recipeService.getAllRecipes({ includeDeleted: true });
  const mealPlans = await mealPlanService.getMealPlansByDateRange(
    '2020-01-01',
    '2030-12-31'
  );
  const shoppingItems = await shoppingListService.getAllShoppingItems();

  const exportData = {
    version: 1,
    exportDate: new Date().toISOString(),
    recipes,
    mealPlans,
    shoppingItems,
  };

  const json = JSON.stringify(exportData, null, 2);

  // Save to file or share
  const path = `${FileSystem.documentDirectory}recipe_keeper_export.json`;
  await FileSystem.writeAsStringAsync(path, json);

  return path;
}
```

---

## Getting Help

If you're still experiencing issues:

1. **Check logs**: Review console output for error messages
2. **Verify setup**: Ensure all dependencies are installed correctly
3. **Test with fresh database**: Try resetting the database
4. **Check device**: Test on different devices/simulators
5. **Review code**: Double-check your implementation against examples

### Useful Debug Commands

```typescript
// Get database info
const db = dbConnection.getDatabase();
const tables = await db.getAllAsync(`
  SELECT name FROM sqlite_master WHERE type='table'
`);
console.log('Tables:', tables);

// Get table schema
const schema = await db.getAllAsync(`
  PRAGMA table_info(recipes)
`);
console.log('Recipe table schema:', schema);

// Get database statistics
const stats = {
  recipeCount: await recipeService.getRecipeCount(),
  mealPlanCount: await mealPlanService.getMealPlanCount(),
  shoppingItemCount: await shoppingListService.getShoppingItemCount(),
};
console.log('Database statistics:', stats);
```

---

## Additional Resources

- [expo-sqlite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Zod Documentation](https://zod.dev/)
- [Database Documentation](./DATABASE.md)
- [Usage Examples](./EXAMPLES.md)
