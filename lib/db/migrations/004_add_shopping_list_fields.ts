import { dbConnection } from '../connection';

/**
 * Shopping list fields migration
 * Adds category, source, and originalName columns to shopping_list_items table
 */
export const up = async (): Promise<void> => {
  const db = dbConnection.getDatabase();

  await db.execAsync(`
    ALTER TABLE shopping_list_items ADD COLUMN category TEXT NOT NULL DEFAULT 'Other';
  `);

  await db.execAsync(`
    ALTER TABLE shopping_list_items ADD COLUMN source TEXT NOT NULL DEFAULT 'recipe';
  `);

  await db.execAsync(`
    ALTER TABLE shopping_list_items ADD COLUMN originalName TEXT NULL;
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_shopping_list_items_category
    ON shopping_list_items(category);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_shopping_list_items_source
    ON shopping_list_items(source);
  `);

  console.log('Shopping list fields migration completed successfully');
};

/**
 * Rollback shopping list fields migration
 */
export const down = async (): Promise<void> => {
  const db = dbConnection.getDatabase();

  await db.execAsync('DROP INDEX IF EXISTS idx_shopping_list_items_source;');
  await db.execAsync('DROP INDEX IF EXISTS idx_shopping_list_items_category;');

  console.log('Shopping list fields migration rolled back successfully');
};

/**
 * Migration metadata
 */
export const migration = {
  version: 4,
  name: '004_add_shopping_list_fields',
  description:
    'Add category, source, and originalName columns to shopping_list_items table for shopping list generation',
  up,
  down,
};
