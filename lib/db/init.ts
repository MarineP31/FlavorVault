import { dbConnection, DatabaseError } from './connection';
import { migration as initialSchemaMigration } from './migrations/001_initial_schema';
import { migration as indexesMigration } from './migrations/002_add_indexes';
import { migration as tagManagementMigration } from './migrations/003_tag_management';
import { migration as shoppingListFieldsMigration } from './migrations/004_add_shopping_list_fields';
import { migrationRunner } from './migrations/index';
import { seedDatabase, needsSeeding } from './seed';

/**
 * Register all migrations with the migration runner
 */
export const registerMigrations = (): void => {
  migrationRunner.register(initialSchemaMigration);
  migrationRunner.register(indexesMigration);
  migrationRunner.register(tagManagementMigration);
  migrationRunner.register(shoppingListFieldsMigration);

  console.log('All migrations registered successfully');
};

/**
 * Initialize database with migrations and seed data
 */
export const initializeDatabase = async (): Promise<void> => {
  const startTime = Date.now();

  try {
    console.log('Starting database initialization...');

    // Initialize database connection
    await dbConnection.initialize();
    console.log('Database connection established');

    // Register all migrations
    registerMigrations();

    // Run pending migrations
    await migrationRunner.runMigrations();
    console.log('Migrations completed');

    // Check if seeding is needed
    const shouldSeed = await needsSeeding();

    if (shouldSeed) {
      console.log('Database is empty, starting seed process...');
      await seedDatabase();
    } else {
      console.log('Database already has data, skipping seed');
    }

    const elapsedTime = Date.now() - startTime;
    console.log(
      `Database initialization completed successfully in ${elapsedTime}ms`
    );

    if (elapsedTime > 2000) {
      console.warn(
        `Database initialization took longer than 2 seconds (${elapsedTime}ms)`
      );
    }
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    console.error(
      `Database initialization failed after ${elapsedTime}ms:`,
      error
    );

    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'INIT_FAILED',
      'Database initialization failed',
      error
    );
  }
};

/**
 * Get database status
 */
export const getDatabaseStatus = async () => {
  return await migrationRunner.getStatus();
};

/**
 * Check if database is ready
 */
export const isDatabaseReady = (): boolean => {
  return dbConnection.isReady();
};

/**
 * Health check for database
 */
export const healthCheck = async (): Promise<boolean> => {
  return await dbConnection.healthCheck();
};
