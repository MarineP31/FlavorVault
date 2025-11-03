## Coding style best practices

- **Meaningful Names**: Descriptive names that reveal intent; avoid abbreviations
- **Small Functions**: Keep functions focused on a single task
- **Automated Formatting**: Maintain consistent code style
- **Remove Dead Code**: Delete unused code and commented-out blocks
- **DRY Principle**: Extract common logic into reusable functions
- **No Backward Compatibility**: Unless instructed otherwise, don't add backward compatibility logic

## Naming Conventions

- **Variables**: camelCase, descriptive of purpose not implementation
- **Collections**: Plural names for arrays/collections
- **Components/Types**: PascalCase with nouns (e.g., `UserCard`, `UserCardProps`)
- **Functions**: Verbs for actions (e.g., `fetchData`), nouns for getters (e.g., `getUserById`)
- **Booleans**: Prefix with `is`, `has`, `should` (e.g., `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Config Objects**: camelCase (e.g., `appConfig`)

## TypeScript

- **Type Inference**: Use when possible; don't add explicit function return types
- **Avoid any/unknown**: Never use without proper type guards
- **Type Guards**: Use instead of `as` for type conversion
- **Generics**: Use for reusable functions
- **Strict Mode**: Enable in `tsconfig.json`
- **Utility Types**: Use `Partial<T>`, `Required<T>`, `Pick<T>`, `Omit<T>`, `Record<K, V>`

## Null & Undefined

- **Avoid in Returns**: Don't return `null` or `undefined`
- **Optional Properties**: Use `?:` instead of union with `undefined`
- **Optional Chaining**: Prefer `?.` and `??`

## Exports & Imports

- **Named Exports**: Use only (except Expo screens and Next.js App Router)
- **Import Separation**: Keep `import type` separated
- **String Literal Unions**: Prefer over enums

## File Organization

- **Kebab Case**: For folder names
- **React Component Files**: PascalCase for file names (e.g., `UserCard.tsx`, `RecipeList.tsx`) matching the component name
- **Component Organization**: By use case (components/actions, components/cards)
- **Feature Grouping**: By domain (features/auth, features/dashboard)
- **Shared Code**: In lib/ folders (lib/services, lib/types, lib/utils)
- **Tests**: In `__tests__` folders adjacent to code
