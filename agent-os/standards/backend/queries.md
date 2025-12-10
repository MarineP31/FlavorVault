## Database query best practices

> **Note:** This project uses expo-sqlite for local storage.

### Core Principles

- **SQL Injection**: Use parameterized queries; never interpolate user input
- **Select Specific**: Request only needed columns (avoid `SELECT *`)
- **Index**: Index columns in WHERE, JOIN, ORDER BY clauses
- **Transactions**: Wrap related operations to maintain consistency

### expo-sqlite Specific

- **Async Operations**: Use `withExclusiveTransactionAsync` for transactional safety
- **JSON Columns**: Store arrays/objects as JSON text, parse on read
- **Batch Operations**: Group multiple INSERTs in a single transaction
- **Query Performance**: Use indexed lookups and LIMIT for pagination

### Query Patterns

- **N+1 Prevention**: Use JOINs or batch queries instead of loops
- **Pagination**: Use LIMIT/OFFSET for small datasets, cursor-based for large
- **Soft Deletes**: Filter with `WHERE deleted_at IS NULL` in queries
- **Date Queries**: Use ISO 8601 format for date comparisons
