## Database migration best practices

> **Note:** This project uses expo-sqlite with custom migration runner.

### Migration Structure

- **Numbered Files**: Sequential naming (001_initial_schema.ts, 002_add_indexes.ts)
- **Up/Down Methods**: Each migration exports `up()` and `down()` functions
- **Version Tracking**: Use SQLite `PRAGMA user_version` to track applied migrations
- **Small Changes**: One logical change per migration

### Implementation

- **Transactions**: Wrap migrations in transactions for atomic execution
- **Rollback**: Implement down() for reversibility (important for development)
- **Error Handling**: Log failures and rollback automatically on error

### Best Practices

- **Clear Names**: Descriptive names indicating what migration does
- **Version Control**: Commit all migrations; never modify applied migrations
- **Test First**: Test migrations on clean database before release
- **Data Migrations**: Keep schema changes separate from data transformations

### expo-sqlite Specific

- **App Startup**: Run migration runner on app initialization
- **Index Creation**: Add indexes in separate migration after table creation
- **Foreign Keys**: Enable with `PRAGMA foreign_keys = ON`
