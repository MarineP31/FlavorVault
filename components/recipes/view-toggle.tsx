/**
 * ViewToggle component - Re-export wrapper
 *
 * Task 5.1: View Toggle Component
 *
 * This is a re-export wrapper for the ViewModeToggle component located in
 * components/ui/ViewModeToggle.tsx. The primary implementation is built as
 * a reusable UI component following architectural best practices.
 *
 * This wrapper file satisfies the exact task requirement while maintaining
 * code organization and reusability.
 *
 * Primary Implementation: /components/ui/ViewModeToggle.tsx
 *
 * Features (from primary implementation):
 * - Grid and list view toggle buttons with icons
 * - Visual indication of active mode
 * - Smooth animations when switching modes (spring animations)
 * - Full accessibility support with ARIA labels and hints
 * - Dark mode support with proper color schemes
 * - Touch-friendly button sizes (minimum 44x44 points)
 * - Disabled state for currently active button
 * - Uses view mode constants from lib/constants/view-modes.ts
 *
 * @example
 * ```tsx
 * import { ViewToggle } from '@/components/recipes/view-toggle';
 *
 * <ViewToggle
 *   viewMode={viewMode}
 *   onToggle={setViewMode}
 * />
 * ```
 */

export { ViewModeToggle as ViewToggle } from '@/components/ui/ViewModeToggle';
export type { ViewMode } from '@/lib/constants/view-modes';
