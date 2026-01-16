# Task Breakdown: Horizontal Tag Filter

## Overview
Total Tasks: 27

This feature replaces the hardcoded preset filter chips (All, Favorites, Quick, Healthy) with a dynamic horizontal scrollable tag filter showing the top 10 most-used tags, plus a filter button to access all tags in a modal.

## Task List

### Hook Enhancement Layer

#### Task Group 1: Extend useRecipeRepository Hook
**Dependencies:** None

- [x] 1.0 Complete hook enhancement for tag filtering
  - [x] 1.1 Write 4-6 focused tests for tag frequency and filter logic
    - Test `topTags` returns max 10 tags sorted by frequency
    - Test `allUniqueTags` extracts all unique tags from recipes
    - Test tag normalization (lowercase consistency)
    - Test "Quick" filter logic (prepTime + cookTime <= 20 min)
    - Test AND logic with multiple selected tags
  - [x] 1.2 Add `allUniqueTags` computed property to hook
    - Extract unique tags from all loaded recipes
    - Normalize to lowercase for consistent counting
    - Return alphabetically sorted array for modal display
  - [x] 1.3 Add `topTags` computed property to hook
    - Calculate tag frequency using `useMemo`
    - Return top 10 tags sorted by usage count descending
    - Reuse pattern from existing `TagFilter.tsx` tagCounts logic
  - [x] 1.4 Add `presetFilter` state for "Quick" special filter
    - Type: `'all' | 'quick'` (removed 'favorites' and 'healthy')
    - Add `setPresetFilter` action to hook return
    - Implement Quick filter: `(prepTime || 0) + (cookTime || 0) <= 20`
  - [x] 1.5 Update `filteredRecipes` to apply preset filter
    - Apply tag filtering first (existing AND logic)
    - Apply preset filter second ("Quick" time-based filter)
    - Ensure filters combine correctly
  - [x] 1.6 Ensure hook enhancement tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify all computed properties return correct values
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- `topTags` returns maximum 10 tags sorted by frequency
- `allUniqueTags` returns complete unique tag list
- "Quick" preset filter correctly filters recipes by time
- Existing tag selection and AND logic unchanged

### UI Components Layer

#### Task Group 2: HorizontalTagFilter Component
**Dependencies:** Task Group 1

- [x] 2.0 Complete HorizontalTagFilter component
  - [x] 2.1 Write 4-6 focused tests for HorizontalTagFilter
    - Test "All" chip renders first and clears selections on press
    - Test "Quick" chip renders second with correct toggle behavior
    - Test top 10 tags render in correct order
    - Test filter button renders at end of scroll
    - Test selected state styling (bg-primary vs bg-surface-light)
  - [x] 2.2 Create HorizontalTagFilter component structure
    - File: `components/recipes/HorizontalTagFilter.tsx`
    - Props: `topTags`, `selectedTags`, `onToggleTag`, `presetFilter`, `onPresetChange`, `onFilterPress`
    - Use `ScrollView` with `horizontal={true}` from existing TagFilter pattern
  - [x] 2.3 Implement "All" and "Quick" special filter chips
    - "All" chip always first, clears all tag/preset selections
    - "Quick" chip second, toggles preset filter
    - Use existing segment chip styling from `RecipeRepositoryScreen`
  - [x] 2.4 Implement dynamic tag chips rendering
    - Map over `topTags` array (max 10)
    - Display tag name only (no counts per spec)
    - Apply selected/unselected styling per spec visual design
  - [x] 2.5 Add filter button at end of scroll
    - Use `Ionicons` filter icon ("filter" or "filter-outline")
    - Position after last tag chip
    - Trigger `onFilterPress` callback for modal opening
  - [x] 2.6 Apply styling and dark mode support
    - Selected: `bg-primary` (#FF6B35), white text
    - Unselected: `bg-surface-light` (#F2F2F7), black text
    - Dark mode: use existing dark mode patterns
    - Touch targets minimum 44x44 points
  - [x] 2.7 Ensure HorizontalTagFilter tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify component renders all elements correctly
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 4-6 tests written in 2.1 pass
- Component renders All, Quick, top tags, and filter button in correct order
- Selected/unselected states display correct styling
- Horizontal scroll performs smoothly
- Dark mode styling consistent

#### Task Group 3: TagFilterModal Component
**Dependencies:** Task Group 1

- [x] 3.0 Complete TagFilterModal component
  - [x] 3.1 Write 4-6 focused tests for TagFilterModal
    - Test modal opens when visible prop is true
    - Test all unique tags display (not just top 10)
    - Test tag selection toggles selectedTags correctly
    - Test close button and backdrop tap dismiss modal
    - Test selected tags show visual indicator (checkmark or highlight)
  - [x] 3.2 Create TagFilterModal component structure
    - File: `components/recipes/TagFilterModal.tsx`
    - Props: `visible`, `onClose`, `allTags`, `selectedTags`, `onToggleTag`
    - Use `Modal` with `presentationStyle="pageSheet"` and `animationType="slide"`
    - Follow pattern from `TagManagementModal.tsx`
  - [x] 3.3 Implement modal header with close button
    - Title: "Filter by Tags" or similar
    - Close button (X icon) top-right
    - Use existing header pattern from TagManagementModal
  - [x] 3.4 Implement tag list display
    - Use `ScrollView` for tag list
    - Display all unique tags from recipes
    - Group alphabetically or show frequency-sorted (decide based on UX)
  - [x] 3.5 Implement tag selection UI
    - Touchable tag items with selected state indicator
    - Checkmark icon or highlighted background for selected tags
    - Immediate selection (no "Apply" button needed per spec)
  - [x] 3.6 Apply styling and dark mode support
    - Match TagManagementModal visual patterns
    - Consistent spacing and typography
    - Dark mode support using existing patterns
  - [x] 3.7 Ensure TagFilterModal tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify modal opens/closes and selections work
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 4-6 tests written in 3.1 pass
- Modal slides up with page sheet presentation
- All unique tags display (not limited to top 10)
- Tag selection immediately updates filter state
- Modal dismisses on close button or backdrop tap

### Integration Layer

#### Task Group 4: RecipeRepositoryScreen Integration
**Dependencies:** Task Groups 1, 2, 3

- [x] 4.0 Complete integration in RecipeRepositoryScreen
  - [x] 4.1 Write 4-6 focused tests for integration
    - Test HorizontalTagFilter replaces old segment chips
    - Test tag selection filters recipe list correctly
    - Test modal opens on filter button press
    - Test Quick filter shows only recipes <= 20 min
    - Test multi-tag AND logic filters correctly
  - [x] 4.2 Remove old preset filter chips and related code
    - Remove segment chip mapping for 'all', 'favorites', 'quick', 'healthy'
    - Remove `presetFilter` state from component (now in hook)
    - Remove `applyPresetFilter` function (logic moved to hook)
    - Remove 'favorites' and 'healthy' filter logic entirely
  - [x] 4.3 Integrate HorizontalTagFilter component
    - Replace segment row with HorizontalTagFilter
    - Connect to hook: `topTags`, `selectedTags`, `toggleTag`, `presetFilter`, `setPresetFilter`
    - Add modal visibility state: `const [filterModalVisible, setFilterModalVisible] = useState(false)`
  - [x] 4.4 Integrate TagFilterModal component
    - Add TagFilterModal to render tree
    - Pass `allUniqueTags` from hook
    - Connect `selectedTags` and `toggleTag` for modal selections
    - Handle modal open/close via filter button
  - [x] 4.5 Update header styles for new layout
    - Adjust spacing for HorizontalTagFilter
    - Ensure dark mode header background works correctly
    - Maintain search row layout above filter row
  - [x] 4.6 Verify end-to-end filtering flow
    - Test: Select tag from horizontal scroll -> recipes filter
    - Test: Select tag from modal -> recipes filter
    - Test: Clear with "All" -> all recipes show
    - Test: "Quick" filter -> only fast recipes show
  - [x] 4.7 Ensure integration tests pass
    - Run ONLY the 4-6 tests written in 4.1
    - Verify complete filtering flow works
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 4-6 tests written in 4.1 pass
- Old preset chips completely removed
- HorizontalTagFilter renders in place of old chips
- Modal accessible via filter button
- All filtering scenarios work correctly

### Code Cleanup Layer

#### Task Group 5: Remove Favorites/Healthy Code
**Dependencies:** Task Group 4

- [x] 5.0 Complete cleanup of deprecated filter code
  - [x] 5.1 Write 2-3 focused tests for cleanup verification
    - Test no "Favorites" option exists in filter UI
    - Test no "Healthy" option exists in filter UI
    - Test presetFilter type only allows 'all' | 'quick'
  - [x] 5.2 Remove Favorites filter logic from codebase
    - Search for all 'favorites' references in filter context
    - Remove any `r.tags.includes('favorite')` filter logic
    - Remove from type definitions
  - [x] 5.3 Remove Healthy filter logic from codebase
    - Search for all 'healthy' references in filter context
    - Remove any healthy tag-based filter logic
    - Remove from type definitions
  - [x] 5.4 Update type definitions
    - Update PresetFilter type: `type PresetFilter = 'all' | 'quick'`
    - Remove deprecated options from any enums or constants
    - Ensure TypeScript compilation succeeds
  - [x] 5.5 Verify no traces of removed filters remain
    - Search codebase for "favorites" and "healthy" in filter contexts
    - Ensure no dead code paths
    - Run TypeScript compilation check
  - [x] 5.6 Ensure cleanup tests pass
    - Run ONLY the 2-3 tests written in 5.1
    - Verify removed filters don't appear in UI
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 2-3 tests written in 5.1 pass
- No "Favorites" or "Healthy" filter options in UI
- No related filter logic in codebase
- TypeScript compiles without errors
- Clean git diff showing removed code

### Testing

#### Task Group 6: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-5

- [x] 6.0 Review existing tests and fill critical gaps
  - [x] 6.1 Review tests from Task Groups 1-5
    - Review 4-6 tests from hook enhancement (Task 1.1)
    - Review 4-6 tests from HorizontalTagFilter (Task 2.1)
    - Review 4-6 tests from TagFilterModal (Task 3.1)
    - Review 4-6 tests from integration (Task 4.1)
    - Review 2-3 tests from cleanup verification (Task 5.1)
    - Total existing tests: approximately 18-27 tests
  - [x] 6.2 Analyze test coverage gaps for this feature only
    - Identify critical user workflows lacking coverage
    - Focus on edge cases: empty tag list, single recipe, many tags
    - Prioritize end-to-end filtering workflows
  - [x] 6.3 Write up to 8 additional tests maximum if needed
    - Edge case: No tags in any recipe (empty state)
    - Edge case: Recipe with no prep/cook time for Quick filter
    - Edge case: Tag appears in only one recipe
    - Integration: Search + tag filter combination
    - Integration: Multiple modal selections then horizontal scroll
    - Performance: Scroll with many tags renders smoothly
    - Do NOT write exhaustive coverage for all scenarios
  - [x] 6.4 Run feature-specific tests only
    - Run ONLY tests related to horizontal tag filter feature
    - Expected total: approximately 26-35 tests maximum
    - Verify all critical workflows pass
    - Do NOT run entire application test suite

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 26-35 tests)
- Critical user workflows covered
- No more than 8 additional tests added
- Testing focused exclusively on horizontal tag filter feature

## Execution Order

Recommended implementation sequence:

1. **Hook Enhancement Layer (Task Group 1)** - Foundation for all UI work
   - Provides `topTags`, `allUniqueTags`, preset filter state
   - Must complete before UI components can integrate

2. **UI Components Layer (Task Groups 2-3)** - Can run in parallel
   - HorizontalTagFilter (Task Group 2)
   - TagFilterModal (Task Group 3)
   - Both depend on hook but not on each other

3. **Integration Layer (Task Group 4)** - Connects everything
   - Requires Groups 1, 2, and 3 complete
   - Replaces old UI with new components

4. **Code Cleanup Layer (Task Group 5)** - Final cleanup
   - Safe to remove old code after integration verified
   - Ensures no dead code remains

5. **Test Review (Task Group 6)** - Quality assurance
   - Final verification of all functionality
   - Fill any critical test gaps

## File Changes Summary

### New Files
- `components/recipes/HorizontalTagFilter.tsx`
- `components/recipes/TagFilterModal.tsx`
- `__tests__/components/recipes/HorizontalTagFilter.test.tsx`
- `__tests__/components/recipes/TagFilterModal.test.tsx`
- `__tests__/components/recipes/RecipeRepositoryScreen.test.tsx`
- `__tests__/components/recipes/FilterCleanup.test.tsx`
- `__tests__/lib/hooks/use-recipe-repository.test.ts`

### Modified Files
- `lib/hooks/use-recipe-repository.ts` - Add topTags, allUniqueTags, presetFilter
- `components/recipes/RecipeRepositoryScreen.tsx` - Replace preset chips, integrate new components
- `jest.setup.js` - Add Ionicons and Modal mocks

### Patterns to Reuse
- `components/ui/TagFilter.tsx` - Tag frequency calculation, horizontal scroll
- `components/tags/TagManagementModal.tsx` - Modal structure, pageSheet presentation
- `components/recipes/RecipeRepositoryScreen.tsx` - Segment chip styling
