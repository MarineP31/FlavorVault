# Spec Requirements: Recipe Repository UI

## Initial Description

Recipe Repository UI

Build grid and list view interfaces with recipe cards showing thumbnails, titles, servings, prep time, and cook time with search and tag filtering capabilities, replacing the current HomeScreen.

## Product Context

### Product Mission Alignment

This feature aligns with FlavorVault's mission to help meal preppers organize recipes from diverse sources. The recipe repository serves as the main interface that enables users to:

- Browse their complete recipe collection in an organized, visual format
- Quickly find recipes using search and tag filtering
- Switch between grid and list views based on their preference
- Access recipe details and management functions efficiently

### Roadmap Position

This is feature #2 in Phase 1 (MVP), sized as Medium (M). It follows the Local Storage Foundation and works alongside Recipe CRUD Operations, Tag Management System, and Recipe Detail View. This is the primary navigation interface that users will see when opening the app.

## Requirements Discussion

### First Round Questions

**Q1:** View Modes - Should users be able to switch between grid and list views?
**Answer:** C) Default to one view with option to switch.

**Q2:** Recipe Card Information - What information should be displayed on each recipe card?
**Answer:** Thumbnail, title, servings, prep time, cook time.

**Q3:** Search Functionality - How should the search work?
**Answer:** A) Search by recipe title only.

**Q4:** Tag Filtering - How should tag filtering be implemented?
**Answer:** A) Filter chips/tags at the top of the screen.

**Q5:** Sorting Options - Should users be able to sort recipes?
**Answer:** A) No sorting options (just chronological order).

**Q6:** Empty State - What should be displayed when there are no recipes?
**Answer:** A) Simple "No recipes found" message.

**Q7:** Navigation Integration - How should this integrate with existing tab navigation?
**Answer:** A) Replace the current HomeScreen (index.tsx) with recipe repository.

**Q8:** Performance Considerations - For large recipe collections, should we implement?
**Answer:** B) Infinite scroll with lazy loading.

### Existing Code to Reference

- **Database Schema**: Use Recipe interfaces from Local Storage Foundation spec (lib/db/schema/recipe.ts)
- **Database Service**: Leverage RecipeService operations (lib/db/services/recipe-service.ts)
- **UI Foundation**: Build on existing ThemedText, ThemedView components in components/ directory
- **Navigation Patterns**: Follow Expo Router file-based routing already configured in app/\_layout.tsx
- **Tab Navigation**: Replace existing HomeScreen content in app/(tabs)/index.tsx
- **UI Components**: Use React Native Reusables components and Nativewind styling

### Visual Assets

Visual design file available: `assets/images/ui/HomeScreen.png`

## Requirements Summary

### Functional Requirements

**Core Display Functionality:**

- Replace current HomeScreen (app/(tabs)/index.tsx) with recipe repository interface
- Display recipes in chronological order (newest first)
- Default to grid view with option to switch to list view
- Recipe cards show: thumbnail image, title, servings, prep time, cook time
- Infinite scroll with lazy loading for performance
- Handle missing images with placeholder

**Search Functionality:**

- Search bar at top of screen
- Search by recipe title only
- Real-time search results as user types
- Clear search functionality
- Search state persistence during session

**Tag Filtering:**

- Filter chips/tags displayed at top of screen below search
- Filter by individual tags across all categories
- Multiple tag selection (AND logic - recipes must have ALL selected tags)
- Clear all filters functionality
- Visual indication of active filters
- Filter state persistence during session

**View Mode Switching:**

- Toggle button to switch between grid and list views
- Grid view: 2-column layout with larger cards
- List view: single-column layout with compact cards
- View preference persistence across app sessions
- Smooth transition between view modes

**Navigation Integration:**

- Tap recipe card navigates to Recipe Detail View
- Integration with Recipe CRUD Operations (FAB for adding recipes)
- Integration with Tag Management System (filter chips)
- Integration with Meal Planning (add to queue functionality)

**Empty State Handling:**

- Simple "No recipes found" message when no recipes exist
- "No recipes found" message when search/filters return no results
- Differentiate between empty collection vs. filtered results

### Reusability Opportunities

- Recipe card component (reusable for grid/list views and other screens)
- Search bar component (reusable across app)
- Filter chip components (reusable for tag filtering)
- View toggle component (reusable for other list/grid interfaces)
- Infinite scroll pattern (reusable for other data lists)
- Placeholder image component (reusable across app)

### Scope Boundaries

**In Scope:**

- Grid and list view interfaces with toggle
- Recipe cards with thumbnail, title, servings, prep time, cook time
- Search by recipe title
- Tag filtering with chips at top of screen
- Infinite scroll with lazy loading
- Chronological ordering (newest first)
- Simple empty state messages
- Integration with existing tab navigation
- Navigation to Recipe Detail View
- Integration with Recipe CRUD Operations
- Integration with Tag Management System
- View mode preference persistence
- Search and filter state persistence

**Out of Scope (MVP):**

- Advanced search (ingredients, source, instructions)
- Sorting options (by title, prep time, etc.)
- Recipe collections or folders
- Favorites or starred recipes
- Recipe sharing functionality
- Bulk operations (multi-select, bulk delete)
- Recipe duplication
- Advanced filtering (date ranges, cooking time ranges)
- Recipe recommendations
- Recently viewed recipes
- Recipe statistics or analytics
- Custom view layouts beyond grid/list
- Drag-and-drop reordering
- Recipe comparison features
- Export or backup functionality

**Future Enhancements (Phase 2+):**

- Advanced search and filtering (Phase 2)
- Sorting options (Phase 2)
- Recipe collections and folders (Phase 2)
- Favorites system (Phase 2)
- Recently viewed recipes (Phase 2)
- Recipe recommendations (Phase 3)
- Advanced analytics and insights (Phase 3)
- Custom view layouts (Phase 3)
- Drag-and-drop functionality (Phase 3)

### Technical Considerations

**Database Integration:**

- Use RecipeService.getAllRecipes() for fetching recipes
- Implement pagination for infinite scroll
- Handle search queries efficiently
- Filter recipes by tags using database queries
- Optimize queries for performance with large datasets

**UI Components:**

- FlatList for recipe display with infinite scroll
- SearchBar component for search functionality
- Chip components for tag filtering
- Toggle button for view mode switching
- Recipe card components for both grid and list views
- Placeholder image component

**Performance Optimization:**

- Lazy loading for recipe images
- Virtual scrolling for large lists
- Debounced search input
- Memoized recipe cards
- Efficient re-rendering on view mode changes
- Image caching and optimization

**State Management:**

- Search query state
- Active filter tags state
- View mode preference state
- Pagination state for infinite scroll
- Loading states for data fetching

### Visual Design Notes

**Layout Structure:**

```
┌─────────────────────────┐
│ [🔍 Search recipes...]   │
├─────────────────────────┤
│ [Tag] [Tag] [Tag] [+More]│
├─────────────────────────┤
│ [Grid] [List] [+ Add]    │
├─────────────────────────┤
│ ┌─────┐ ┌─────┐         │
│ │ IMG │ │ IMG │         │
│ │Title│ │Title│         │
│ │Time │ │Time │         │
│ └─────┘ └─────┘         │
│ ┌─────┐ ┌─────┐         │
│ │ IMG │ │ IMG │         │
│ │Title│ │Title│         │
│ │Time │ │Time │         │
│ └─────┘ └─────┘         │
└─────────────────────────┘
```

**Grid View:**

- 2-column layout with equal-width cards
- Larger thumbnail images
- Card height based on content
- Consistent spacing between cards

**List View:**

- Single-column layout
- Horizontal card layout with image on left
- Compact information display
- Consistent row height

**Search and Filtering:**

- Search bar with clear icon
- Filter chips with remove functionality
- Active state indication for filters
- Smooth animations for filter changes

**Integration Points:**

- FAB button for adding new recipes
- Recipe card tap navigation to detail view
- Tag management integration for filter chips
- Meal planning integration for queue actions
