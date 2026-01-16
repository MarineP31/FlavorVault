# Specification: Horizontal Tag Filter

## Goal
Replace the current hardcoded preset filter chips (All, Favorites, Quick, Healthy) with a dynamic horizontal scrollable tag filter showing the top 10 most-used tags from the user's recipes, plus a filter button to access all tags in a modal.

## User Stories
- As a user, I want to filter recipes by any tag I've used so that I can quickly find specific types of recipes
- As a user, I want to see my most frequently used tags readily accessible so that common filtering is fast
- As a user, I want to access all my tags through a modal so that I can filter by less common tags
- As a user, I want an "All" option to clear tag selection and see all recipes
- As a user, I want to keep the "Quick" filter to find recipes under 20 minutes

## Core Requirements
- Display horizontal scrollable tag filter at top of recipe list
- "All" tag always first (clears selection, shows all recipes)
- "Quick" special filter retained (recipes with prepTime + cookTime <= 20 min)
- Show up to 10 most frequently used tags sorted by usage count
- Display tag names only (no recipe counts visible)
- Filter button at end of scroll opens modal with complete tag list
- Modal selections directly filter recipes (horizontal scroll remains static)
- Multiple tag selections use AND logic (recipes must have ALL selected tags)
- Remove "Favorites" filter and all related logic
- Remove "Healthy" filter

## Visual Design
No mockups provided. Follow existing styling patterns:
- Chip styling matches current `RecipeRepositoryScreen` segment chips
- Selected state: `bg-primary` (#FF6B35), white text
- Unselected state: `bg-surface-light` (#F2F2F7), black text
- Modal follows `TagManagementModal` pattern (slide-up page sheet)
- Filter button uses Ionicons filter icon

## Reusable Components

### Existing Code to Leverage
- **TagFilter component** (`components/ui/TagFilter.tsx`): Already implements horizontal scroll with tag frequency sorting - can be adapted
- **Dialog/Modal patterns** (`components/ui/Dialog.tsx`, `components/tags/TagManagementModal.tsx`): Use same Modal structure with `presentationStyle="pageSheet"`
- **Button component** (`components/ui/Button.tsx`): For modal actions
- **SearchBar** (`components/ui/SearchBar.tsx`): If search in modal is needed
- **useRecipeRepository hook** (`lib/hooks/use-recipe-repository.ts`): Existing filter state management with `selectedTags`, `toggleTag`, `clearFilters`
- **Recipe filtering logic** in hook: AND-based multi-tag filtering already implemented
- **Chip styling** from `RecipeRepositoryScreen.tsx` styles (segmentChip, segmentChipActive)

### New Components Required
- **HorizontalTagFilter**: New component replacing preset segment chips
  - Reason: Current TagFilter shows all tags with counts; new component needs static top-10 display, special filters ("Quick"), and filter button
- **TagFilterModal**: New modal component for complete tag selection
  - Reason: Existing TagManagementModal is for CRUD operations; new modal is simpler selection-only interface

## Technical Approach

### State Management
- Extend `useRecipeRepository` hook to provide:
  - `allUniqueTags`: Complete list of unique tags from recipes
  - `topTags`: Top 10 tags sorted by frequency
  - `selectedTags`: Currently selected tags (existing)
  - `toggleTag`: Tag selection handler (existing)
- Add `presetFilter` state management for "Quick" filter (special case, not a tag)
- Remove `presetFilter` options for 'favorites' and 'healthy'

### Tag Frequency Calculation
- Extract tags from loaded recipes using existing pattern from `TagFilter.tsx`
- Normalize tags to lowercase for consistent counting
- Sort by frequency descending, take top 10
- Calculation performed in `useMemo` for performance

### Filter Modal Behavior
- Opens via filter button at end of horizontal scroll
- Displays all unique tags grouped alphabetically or by frequency
- Selected tags shown with checkmarks or highlighted state
- Selections immediately update `selectedTags` in repository state
- Modal does NOT modify which tags appear in horizontal scroll
- Close button and backdrop tap dismiss modal

### Removing Favorites/Healthy Logic
- Remove 'favorites' and 'healthy' from `presetFilter` type union in `RecipeRepositoryScreen`
- Remove corresponding filter logic in `applyPresetFilter` function
- Clean up segment chip mapping to only include 'all' and 'quick' (but 'quick' moves to horizontal scroll area)
- Note: Keep "Quick" as special filter in horizontal scroll, not a preset chip

## Out of Scope
- OR logic for tag selection (future enhancement)
- Tag creation/management in filter modal
- Saved filter presets
- Tag counts display in horizontal scroll
- Search functionality within filter modal (keep simple for MVP)

## Success Criteria
- User can filter by any of their top 10 tags with single tap
- User can access and filter by any tag via modal
- "Quick" filter correctly shows recipes <= 20 min total time
- Multi-tag selection correctly filters with AND logic
- No traces of "Favorites" or "Healthy" filter logic remain
- Horizontal scroll performance smooth with React Native ScrollView
- Modal opens/closes smoothly with slide animation
- Dark mode styling consistent throughout
