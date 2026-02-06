# Spec Requirements: Horizontal Tag Filter

## Initial Description
The user wants to replace the current preset filter chips (All, Favorites, Quick, Healthy) with a horizontal scrollable list showing ALL tags from their recipes. This will allow users to filter recipes by any tag they have in their collection, using a horizontal scroll effect.

Currently there are only 4 hardcoded preset filters. The new feature should:
- Display all unique tags from the user's recipes
- Show them in a horizontal scrollable row
- Allow filtering recipes by selecting a tag
- Include an "All" option to show all recipes

## Requirements Discussion

### First Round Questions

**Q1:** Should the "All" option remain as the first item to clear any tag selection?
**Answer:** Yes, keep "All" as a way to clear any tag selection (showing all recipes)

**Q2:** Should tag names display with recipe counts (e.g., "Italian (5)")?
**Answer:** No, show only tag names without counts

**Q3:** How should tags be sorted in the horizontal scroll?
**Answer:** Sort by frequency (most-used tags first)

**Q4:** Should there be a limit on visible tags in the horizontal scroll?
**Answer:** Yes, show only the first 10 most-used tags

**Q5:** How should users access tags beyond the visible limit?
**Answer:** Add a filter button after the 10 tags to open a modal with ALL tags

**Q6:** How should the filter modal behave when selecting tags?
**Answer:** Directly filter recipes from the modal without affecting the horizontal scroll list (the 10 tags remain static based on frequency)

**Q7:** What should happen to the existing preset filters (Favorites, Quick, Healthy)?
**Answer:** Remove "Favorites" filter entirely AND all logic connecting to it. Keep "Quick" filter (recipes under 20 min). Remove "Healthy" filter.

**Q8:** What selection logic should apply when multiple tags are selected?
**Answer:** Continue with existing AND logic (selecting multiple tags shows recipes with ALL selected tags)

### Existing Code to Reference
No specific similar features were identified by the user for reference. However, the existing filter chip implementation in the recipe list view should be referenced for understanding the current filtering logic.

### Follow-up Questions
None required - requirements were comprehensive.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Requirements Summary

### Functional Requirements
- Display a horizontal scrollable tag filter row at the top of the recipe list
- First item is always "All" to clear tag selection and show all recipes
- Include "Quick" special filter tag (recipes under 20 minutes)
- Show up to 10 most frequently used tags after the special filters
- Tags sorted by usage frequency (most-used first)
- Display tag names only (no recipe counts)
- Add a filter button at the end of the scroll to access a modal with all tags
- Modal allows selecting any tag from the complete tag list
- Modal selections directly filter recipes without modifying the horizontal scroll list
- Multiple tag selections use AND logic (recipes must have ALL selected tags)
- Remove "Favorites" filter and all associated logic entirely
- Remove "Healthy" filter

### UI Components
1. **Horizontal Tag Scroll Row**
   - "All" tag (first position, always visible)
   - "Quick" special filter tag
   - Up to 10 most frequent user tags
   - Filter button (last position) to open modal

2. **Tag Filter Modal**
   - Displays ALL tags from user's recipes
   - Allows selecting tags not visible in horizontal scroll
   - Filtering is immediate upon selection
   - Does not modify the horizontal scroll list contents

### Reusability Opportunities
- Existing filter chip styling from current preset filters
- Current recipe filtering logic for AND-based multi-tag selection
- Modal patterns from other parts of the application (if any exist)

### Scope Boundaries
**In Scope:**
- Horizontal scrollable tag filter component
- Filter modal for accessing all tags
- Integration with recipe list filtering
- Removal of Favorites filter and all related logic
- Removal of Healthy filter
- Keeping Quick filter functionality

**Out of Scope:**
- OR logic for tag selection (future enhancement)
- Tag management/creation in this feature
- Saved filter presets
- Tag counts display

### Technical Considerations
- Tags must be fetched from the database with usage frequency
- Horizontal scroll should use FlatList for performance per tech stack
- Modal should efficiently handle potentially large tag lists
- Filtering state needs to handle both horizontal scroll selections and modal selections
- Database query optimization for frequency-based tag sorting
- Clean removal of Favorites-related code without breaking existing functionality
