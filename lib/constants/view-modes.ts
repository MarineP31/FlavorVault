/**
 * View Mode Constants
 * Defines view mode types and constants for recipe repository display
 * Task 1.2 & 2.4: Project Structure Setup & View Mode Constants
 */

/**
 * View mode type definition
 */
export type ViewMode = 'grid' | 'list';

/**
 * View mode constants
 */
export const VIEW_MODES = {
  GRID: 'grid' as ViewMode,
  LIST: 'list' as ViewMode,
} as const;

/**
 * Default view mode
 */
export const DEFAULT_VIEW_MODE: ViewMode = VIEW_MODES.GRID;

/**
 * AsyncStorage key for view mode persistence
 */
export const VIEW_MODE_STORAGE_KEY = '@recipe_keeper:view_mode';

/**
 * Validate if a string is a valid view mode
 * @param mode - String to validate
 * @returns True if valid view mode, false otherwise
 */
export function isValidViewMode(mode: string): mode is ViewMode {
  return mode === VIEW_MODES.GRID || mode === VIEW_MODES.LIST;
}

/**
 * Get view mode with fallback to default
 * @param mode - View mode to validate
 * @returns Valid view mode or default
 */
export function getValidViewMode(mode: string | null | undefined): ViewMode {
  if (mode && isValidViewMode(mode)) {
    return mode;
  }
  return DEFAULT_VIEW_MODE;
}

/**
 * View mode display names
 */
export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  grid: 'Grid View',
  list: 'List View',
};

/**
 * View mode icons
 */
export const VIEW_MODE_ICONS: Record<ViewMode, string> = {
  grid: 'grid-outline',
  list: 'list-outline',
};

/**
 * View mode accessibility labels
 */
export const VIEW_MODE_A11Y_LABELS: Record<ViewMode, string> = {
  grid: 'Switch to grid view',
  list: 'Switch to list view',
};

/**
 * View mode descriptions for accessibility
 */
export const VIEW_MODE_DESCRIPTIONS: Record<ViewMode, string> = {
  grid: 'Display recipes in a 2-column grid layout with larger images',
  list: 'Display recipes in a single-column list layout with compact cards',
};
