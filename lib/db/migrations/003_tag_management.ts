import { dbConnection } from '../connection';

/**
 * Tag Management System migration
 * Creates custom_categories table and extends recipe_tags table
 */
export const up = async (): Promise<void> => {
  const db = dbConnection.getDatabase();

  // Create custom_categories table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS custom_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE CHECK (length(name) > 0 AND length(name) <= 30),
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      deletedAt TEXT NULL
    );
  `);

  // Create recipe_tags table (normalized tag storage)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipe_tags (
      id TEXT PRIMARY KEY,
      recipeId TEXT NOT NULL,
      categoryType TEXT NOT NULL CHECK (categoryType IN ('default', 'custom')),
      categoryName TEXT NOT NULL,
      tagValue TEXT NOT NULL CHECK (length(tagValue) > 0 AND length(tagValue) <= 30),
      createdAt TEXT NOT NULL,
      FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
    );
  `);

  // Create indexes for performance
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_recipe_tags_recipeId
    ON recipe_tags(recipeId);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_recipe_tags_categoryName
    ON recipe_tags(categoryName);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_recipe_tags_tagValue
    ON recipe_tags(tagValue);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_custom_categories_name
    ON custom_categories(name);
  `);

  console.log('Tag management schema created successfully');
};

/**
 * Rollback tag management migration
 */
export const down = async (): Promise<void> => {
  const db = dbConnection.getDatabase();

  // Drop indexes
  await db.execAsync('DROP INDEX IF EXISTS idx_custom_categories_name;');
  await db.execAsync('DROP INDEX IF EXISTS idx_recipe_tags_tagValue;');
  await db.execAsync('DROP INDEX IF EXISTS idx_recipe_tags_categoryName;');
  await db.execAsync('DROP INDEX IF EXISTS idx_recipe_tags_recipeId;');

  // Drop tables
  await db.execAsync('DROP TABLE IF EXISTS recipe_tags;');
  await db.execAsync('DROP TABLE IF EXISTS custom_categories;');

  console.log('Tag management schema rolled back successfully');
};

/**
 * Migration metadata
 */
export const migration = {
  version: 3,
  name: '003_tag_management',
  description:
    'Create tag management schema with custom_categories and recipe_tags tables',
  up,
  down,
};
