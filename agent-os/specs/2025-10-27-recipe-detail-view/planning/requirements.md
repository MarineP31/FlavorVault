# Spec Requirements: Recipe Detail View

## Initial Description
Recipe Detail View

Create a comprehensive recipe detail screen that displays full recipe information including ingredients, step-by-step instructions, cooking times, servings, tags, source attribution, and action buttons for editing, deleting, and adding to meal plans.

## Product Context

### Product Mission Alignment
This feature aligns with FlavorVault's mission to help meal preppers organize recipes from diverse sources. The detail view serves as the primary interface for users to:
- View complete recipe information in a clear, readable format
- Access recipes from their consolidated digital collection
- Take actions on recipes (edit, delete, add to meal planning)
- Navigate seamlessly between recipe viewing and meal planning workflows

### Roadmap Position
This is feature #8 in Phase 1 (MVP), sized as Small (S). It follows the Recipe Repository UI and Recipe Editor features, and works alongside the Meal Planning Calendar. This is a foundational viewing interface that enables the core recipe management workflow.

## Requirements Discussion

### First Round Questions

**Q1:** How should the recipe image be displayed? Should it be a full-width hero image at the top, or a smaller thumbnail alongside the title?
**Answer:** Recipe image should be displayed as a full-width hero image at the top of the screen.

**Q2:** What's the priority order for displaying information? I'm assuming: Image → Title → Source/Tags → Prep/Cook Time + Servings → Ingredients → Instructions. Is that correct?
**Answer:** Image → Title → Source/Tags → Prep/Cook Time + Servings → Ingredients → Instructions

**Q3:** For the action buttons (edit, delete, add to meal plan), should they be in a fixed header/footer, or inline with the content? I'm thinking fixed header with icon buttons for easy access while scrolling.
**Answer:** Three action buttons: "Edit", "Delete", and "Add to Queue" in the header.

**Q4:** How should ingredients be displayed? As a simple list, or with interactive checkboxes for users to mark off while cooking?
**Answer:** Ingredients should display as a simple formatted list showing "quantity unit name" (e.g., "2 cups flour"). Keep it as static display for MVP.

**Q5:** Should instruction steps be numbered automatically, or display exactly as entered in the editor? I'm assuming we auto-number for consistency.
**Answer:** Instructions should be numbered steps in a clean vertical list format. Keep it simple for MVP.

**Q6:** For the metadata (prep time, cook time, servings), should this be displayed in a structured info bar or inline with the text? I'm thinking a horizontal info bar with icons for visual clarity.
**Answer:** Display this in a horizontal info bar below the title (with icons for visual clarity).

**Q7:** For source attribution, should we handle URLs differently from text sources (e.g., make URLs tappable links)?
**Answer:** Always plain text for MVP.

**Q8:** How should we handle recipes without images? Show a placeholder, or collapse that section entirely?
**Answer:** Handle missing images with a default placeholder image.

**Q9:** Where do users access this screen from? I'm assuming from the recipe list (tap a card), but should it also be accessible after creating/editing a recipe?
**Answer:** Users access this screen from the recipe list (tap card), after creating/editing a recipe, or from the queue screen. The action buttons adapt based on context.

**Q10:** Should the screen support any special gestures (swipe to next recipe, pinch to zoom image)?
**Answer:** Single ScrollView with the image scrolling up with the content.

**Q11:** Are there any cooking-mode specific features needed (e.g., keep screen awake, timer integration, voice control)?
**Answer:** Keep it simple for MVP (no cooking mode features, timers, stay-awake, voice control, scaling servings).

**Q12:** What should we explicitly exclude from this feature to keep scope manageable?
**Answer:** Not explicitly answered - assume exclude all Phase 3 features (cooking mode, timers, voice control, servings scaling, ingredient checkboxes, step completion).

### Existing Code to Reference
No similar existing features identified for reference. This is a foundational MVP feature being built from scratch.

### Visual Assets
No visual assets provided.

## Requirements Summary

### Functional Requirements

**Core Display Functionality:**
- Display recipe information in a single scrollable view with clear hierarchy
- Show full-width hero image at the top (or placeholder if missing)
- Display recipe title prominently below the image
- Show source attribution and tags in a grouped section
- Present cooking metadata (prep time, cook time, servings) in a horizontal info bar with icons
- List ingredients in a simple formatted list showing "quantity unit name" format
- Display instructions as automatically numbered steps in vertical list format
- Enable smooth scrolling through all content with image scrolling with content

**Action Buttons:**
- Three primary actions in header: "Edit", "Delete", "Add to Queue"
- Context-aware button visibility based on navigation source:
  - From recipe list: Show all three buttons
  - After creating recipe: Possibly hide "Add to Queue" or adjust wording
  - From queue screen: Adjust button behavior/visibility appropriately
- Fixed header position for easy access while scrolling

**Navigation Entry Points:**
- From Recipe Repository (tap recipe card)
- After creating new recipe (redirect to detail view)
- After editing recipe (return to detail view)
- From meal planning queue screen (view recipe details)

**Empty State Handling:**
- Display default placeholder image when recipe has no photo
- Handle missing optional fields gracefully (tags, source, times)

**Data Display:**
- Recipe title
- Recipe image or placeholder
- Source attribution (plain text only for MVP)
- Tags (visual display)
- Prep time, cook time, servings (horizontal info bar with icons)
- Ingredients list (formatted as "quantity unit name")
- Instructions (auto-numbered vertical list)

### Reusability Opportunities
- Default placeholder image component (could be reused across app)
- Recipe card component patterns from Recipe Repository UI (for consistency)
- Tag display components (if created for Recipe Repository)
- Icon set for metadata info bar (prep time, cook time, servings icons)
- Header action button patterns (for consistent UI across screens)

### Scope Boundaries

**In Scope:**
- Full-width hero image display with scrolling content
- Complete recipe information display (title, image, source, tags, times, servings, ingredients, instructions)
- Three action buttons in header (Edit, Delete, Add to Queue)
- Context-aware button behavior based on navigation source
- Default placeholder for missing images
- Horizontal metadata info bar with icons
- Simple formatted ingredient list (quantity unit name)
- Auto-numbered instruction steps
- Single ScrollView for all content
- Plain text source attribution
- Navigation from recipe list, after create/edit, and from queue

**Out of Scope (MVP):**
- Interactive ingredient checkboxes for marking off while cooking
- Step completion tracking or progress indicators
- Cooking mode features (large text, hands-free interface)
- Timer integration or alerts
- Keep-screen-awake functionality
- Voice control or voice commands
- Servings scaling with automatic quantity adjustment
- Pinch-to-zoom gesture on images
- Swipe gestures for next/previous recipe navigation
- Tappable URL links for source attribution
- Nutrition information display
- Recipe sharing functionality
- Print or export options
- Recipe collections or related recipes
- Comments or notes section

**Future Enhancements (Phase 2+):**
- Cooking mode with hands-free interface (Phase 3)
- Integrated timers and alerts (Phase 3)
- Smart ingredient scaling when adjusting servings (Phase 3)
- Interactive checkboxes for ingredients and step completion (Phase 3)
- Tappable links for web sources (Phase 2)
- Recipe sharing and export (Phase 2)

### Technical Considerations

**React Native Components:**
- ScrollView for main content container
- Image component with fallback to placeholder
- Header with fixed positioning for action buttons
- Icon components for metadata info bar
- Text components with appropriate styling for hierarchy

**Navigation:**
- React Navigation integration for routing from multiple entry points
- Context parameters to determine button visibility/behavior
- Back navigation to appropriate source screen

**Data Integration:**
- Receive recipe ID as navigation parameter
- Fetch complete recipe data from local SQLite storage
- Handle missing/optional fields gracefully

**Image Handling:**
- Support for local image URIs from device storage
- Default placeholder asset for recipes without images
- Full-width responsive image display

**Action Button Behavior:**
- Edit: Navigate to Recipe Editor with pre-populated data
- Delete: Show confirmation dialog, then remove from storage and navigate back
- Add to Queue: Add recipe to meal planning queue (integration with meal planning feature)

**Performance:**
- Optimize large instruction lists with appropriate rendering
- Handle image loading states smoothly
- Ensure scroll performance with long content

### Visual Design Notes

**Layout Structure:**
```
┌─────────────────────────┐
│ [Header: Edit Delete Queue] │
├─────────────────────────┤
│                         │
│    Full-Width Hero      │
│       Image or          │
│     Placeholder         │
│                         │
├─────────────────────────┤
│   Recipe Title          │
├─────────────────────────┤
│   Source | Tags         │
├─────────────────────────┤
│ [icon] Prep  [icon] Cook  [icon] Servings │
│   15min      30min         4               │
├─────────────────────────┤
│   Ingredients           │
│   • 2 cups flour        │
│   • 1 tsp salt          │
│   • ...                 │
├─────────────────────────┤
│   Instructions          │
│   1. First step...      │
│   2. Second step...     │
│   3. ...                │
└─────────────────────────┘
```

**Visual Hierarchy:**
- Hero image dominates top of screen (full-width)
- Title is large and bold
- Metadata info bar is visually grouped with icons
- Clear section breaks between ingredients and instructions
- Consistent spacing and typography throughout

**Design Principles:**
- Clean, readable layout optimized for recipe viewing
- Static display (no interactive cooking features)
- Sufficient white space for comfortable reading
- Clear visual grouping of related information
- Mobile-first responsive design
- Accessibility: good contrast, readable font sizes, clear tap targets

**Color and Typography:**
- Follow app's existing design system
- Use icons to reinforce metadata meaning (clock for times, serving dish for servings)
- Consistent with Recipe Repository card design for brand continuity

### Component Structure Recommendations

**Screen Component:**
- `RecipeDetailScreen` - Main screen component

**Sub-Components:**
- `RecipeHeader` - Fixed header with action buttons
- `RecipeHeroImage` - Full-width image with placeholder fallback
- `RecipeTitle` - Styled title text
- `RecipeMetaInfo` - Source and tags display
- `RecipeInfoBar` - Horizontal bar with prep/cook/servings icons
- `IngredientsList` - Formatted ingredient list
- `InstructionsList` - Auto-numbered instruction steps

**Shared Components:**
- `IconButton` - For header actions
- `PlaceholderImage` - Default recipe image
- `Tag` - Tag display component (if exists)
- `Icon` - Icon components for info bar

### Context-Aware Behavior Details

**Navigation Context Handling:**

1. **From Recipe List:**
   - Show all three buttons: Edit, Delete, Add to Queue
   - Back navigation returns to recipe list

2. **After Creating Recipe:**
   - Show all three buttons: Edit, Delete, Add to Queue
   - Back navigation may return to recipe list or editor depending on flow

3. **After Editing Recipe:**
   - Show all three buttons: Edit, Delete, Add to Queue
   - Back navigation may return to recipe list or previous screen

4. **From Queue Screen:**
   - Consider hiding "Add to Queue" button (already in queue)
   - Or change button to "Remove from Queue"
   - Edit and Delete remain available
   - Back navigation returns to queue screen

**Implementation Note:** Navigation parameters should include source context to enable appropriate button configuration.
