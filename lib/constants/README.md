# Application Constants

This directory contains application-wide constants, type definitions, and configuration values.

## Purpose

Centralized constants ensure:
- Consistent values across the application
- Type safety for configuration options
- Easy maintenance and updates
- Single source of truth for application settings

## Files

### view-modes.ts
View mode constants for recipe repository display.

**Exports:**
- `ViewMode` - Type definition for view modes ('grid' | 'list')
- `VIEW_MODES` - Constant object with view mode values
- `DEFAULT_VIEW_MODE` - Default view mode ('grid')
- `VIEW_MODE_STORAGE_KEY` - AsyncStorage key for persistence
- `isValidViewMode()` - Validation utility
- `getValidViewMode()` - Validation with fallback
- `VIEW_MODE_LABELS` - Display names for UI
- `VIEW_MODE_ICONS` - Icon names for each mode
- `VIEW_MODE_A11Y_LABELS` - Accessibility labels
- `VIEW_MODE_DESCRIPTIONS` - Accessibility descriptions

**Usage:**
```typescript
import { ViewMode, VIEW_MODES, DEFAULT_VIEW_MODE } from '@/lib/constants';

// Use in state
const [viewMode, setViewMode] = useState<ViewMode>(DEFAULT_VIEW_MODE);

// Switch view mode
setViewMode(VIEW_MODES.LIST);

// Validate view mode
if (isValidViewMode(userInput)) {
  setViewMode(userInput);
}
```

## Adding New Constants

When adding new constants:

1. Create a new file with descriptive name (e.g., `theme-colors.ts`)
2. Export constants with clear naming
3. Include JSDoc comments for documentation
4. Add type definitions where appropriate
5. Update this README with usage examples
6. Export from `index.ts` for clean imports

## Best Practices

- Use SCREAMING_SNAKE_CASE for constant values
- Use PascalCase for type definitions
- Group related constants together
- Provide validation utilities where needed
- Document all exports with JSDoc comments
- Keep constants immutable (use `as const` assertions)
