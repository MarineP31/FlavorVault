## Database model best practices

> **Note:** This project uses expo-sqlite for local storage.

### Naming Conventions

- **Tables**: Plural `snake_case` (e.g., `recipes`, `meal_plans`, `shopping_list_items`)
- **Columns**: `snake_case` (e.g., `created_at`, `recipe_id`)
- **TypeScript Interfaces**: Singular PascalCase (e.g., `Recipe`, `MealPlan`)

### Schema Design

- **Primary Keys**: UUID v4 as TEXT (use `uuid` package for generation)
- **Timestamps**: Include `created_at` and `updated_at` as TEXT (ISO 8601 format)
- **Soft Deletes**: Add nullable `deleted_at TEXT` for data retention
- **JSON Columns**: Store arrays/objects as TEXT (JSON stringified)

### SQLite-Specific Types

- **TEXT**: Strings, UUIDs, dates (ISO 8601), JSON arrays
- **INTEGER**: Numbers, booleans (0/1)
- **REAL**: Decimal numbers (quantities)
- **NULL**: Optional values

### Constraints & Integrity

- **NOT NULL**: Required fields
- **FOREIGN KEY**: Reference relationships (with ON DELETE CASCADE where appropriate)
- **Indexes**: Create for frequently queried columns and foreign keys

### Validation Strategy

- **TypeScript Interfaces**: Compile-time type safety
- **Zod Schemas**: Runtime validation before database operations
- **Database Constraints**: Final enforcement at storage level
