# Spec Requirements: Tag Management System

## Initial Description

Tag Management System

Create a comprehensive tag management system that allows users to organize recipes with predefined and custom tags across multiple categories (Cuisine, Dietary, Meal Type, Cooking Method), integrated into the recipe creation/editing flow.

## Product Context

### Product Mission Alignment

This feature aligns with FlavorVault's mission to help meal preppers organize recipes from diverse sources. The tag management system serves as the organizational backbone that enables users to:

- Categorize recipes with meaningful tags for easy discovery
- Create custom tags and categories that match their personal cooking style
- Maintain consistent tagging across their recipe collection
- Quickly filter and find recipes based on their preferences

### Roadmap Position

This is feature #7 in Phase 1 (MVP), sized as Small (S). It follows the Recipe CRUD Operations and works alongside the Recipe Repository UI for filtering. This is a foundational organizational feature that enables efficient recipe discovery and management.

## Requirements Discussion

### First Round Questions

**Q1:** Scope and Integration - Should the Tag Management System focus on:
**Answer:** Both predefined tag management AND custom tag creation.

**Q2:** User Interface - Where should users access tag management?
**Answer:** Integrated into the Recipe Creation/Editing flow.

**Q3:** Tag Categories - Should users be able to:
**Answer:**

1. Manage tags within existing categories
2. Create entirely new tag categories
3. Rename or delete existing categories

**Q4:** Bulk Operations - Should the system support managing tags across multiple recipes?
**Answer:** No bulk operations across multiple recipes for MVP.

**Q5:** Tag Usage Analytics - Should the system show usage statistics?
**Answer:** Not explicitly answered - assume no analytics for MVP.

**Q6:** Tag Search and Filtering - Should tag management include search/filter capabilities?
**Answer:** Not explicitly answered - assume basic search within tag management interface.

**Q7:** Data Migration - How should we handle existing recipes when tags change?
**Answer:** Not explicitly answered - assume automatic updates for consistency.

**Q8:** Custom Tag Limits - Should there be limits on custom tags?
**Answer:** Not explicitly answered - assume reasonable limits to prevent UI clutter.

### Follow-up Questions

**Follow-up 1:** Tag Management Interface Integration - Since tag management is integrated into the recipe creation/editing flow, should users access it via:
**Answer:** A) A "Manage Tags" button within the tag selection section of the recipe form AND B) A separate modal/screen accessible from the recipe form.

**Follow-up 2:** Custom Tag Limits - To prevent UI clutter and maintain performance, what should be the limits for:
**Answer:**

- A) Maximum custom tags per category: 20
- B) Maximum total custom categories: 10
- C) Maximum characters per custom tag name: 30 characters

**Follow-up 3:** Category Management - When users rename or delete existing categories, should the system:
**Answer:** B) Allow deletion and automatically remove those tags from all recipes.

**Follow-up 4:** Tag Validation - For custom tags, should the system:
**Answer:** B) Prevent duplicate tag names globally.

**Follow-up 5:** Default Categories - Should the four default categories be:
**Answer:** A) Always present and cannot be deleted.

### Existing Code to Reference

- **Database Schema**: Use recipe_tags table structure from Local Storage Foundation spec (lib/db/schema/recipe.ts)
- **Database Service**: Leverage RecipeService operations (lib/db/services/recipe-service.ts)
- **Predefined Tags**: Use existing tag categories and options from Recipe CRUD Operations spec
- **UI Components**: Build on React Native Reusables components and existing form patterns
- **Navigation Patterns**: Follow Expo Router file-based routing already configured

### Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements

**Core Tag Management:**

- Manage predefined tags within existing categories (Cuisine, Dietary, Meal Type, Cooking Method)
- Create custom tags within existing categories (max 20 per category)
- Create entirely new custom tag categories (max 10 total custom categories)
- Rename existing custom categories
- Delete custom categories (automatically removes tags from all recipes)
- Prevent duplicate tag names globally across all categories
- Enforce tag name length limit (max 30 characters)
- Keep default categories always present and non-deletable

**User Interface Integration:**

- Access tag management via "Manage Tags" button in recipe form tag selection section
- Separate modal/screen for comprehensive tag management
- Search functionality within tag management interface
- Visual organization by category with clear section breaks
- Intuitive add/edit/delete controls for tags and categories

**Data Management:**

- Automatic updates to all recipes when tags are renamed or deleted
- Validation to prevent duplicate tag names
- Enforce limits on custom tags and categories
- Maintain referential integrity between tags and recipes

**Integration Points:**

- Seamless integration with Recipe CRUD Operations form
- Support for Recipe Repository UI filtering functionality
- Database operations through existing service layer
- Consistent with existing UI/UX patterns

### Reusability Opportunities

- Tag management modal component (reusable across app)
- Tag input/selection components (for recipe forms)
- Category management patterns (for future features)
- Search and filter components (for recipe repository)
- Validation patterns (for other form features)

### Scope Boundaries

**In Scope:**

- Manage predefined tags within existing categories
- Create custom tags (max 20 per category, max 30 characters)
- Create custom categories (max 10 total)
- Rename/delete custom categories
- Tag management modal/screen accessible from recipe form
- Search within tag management interface
- Automatic recipe updates when tags change
- Global duplicate tag name prevention
- Default categories always present and protected

**Out of Scope (MVP):**

- Bulk tag operations across multiple recipes
- Tag usage analytics or statistics
- Advanced search/filtering beyond basic tag search
- Tag import/export functionality
- Tag sharing between users
- Tag templates or presets
- Tag color coding or visual customization
- Tag hierarchy or subcategories
- Tag usage recommendations
- Tag cleanup or maintenance tools

**Future Enhancements (Phase 2+):**

- Bulk tag operations (Phase 2)
- Tag usage analytics (Phase 2)
- Advanced search and filtering (Phase 2)
- Tag templates and presets (Phase 2)
- Tag import/export (Phase 2)
- Tag color coding (Phase 2)
- Tag hierarchy/subcategories (Phase 3)

### Technical Considerations

**Database Schema Updates:**

- Extend recipe_tags table to support custom categories
- Add category management table for custom categories
- Implement proper foreign key relationships
- Support for category renaming and deletion

**UI Components:**

- Tag management modal/screen component
- Category management interface
- Tag input with validation
- Search and filter components
- Add/edit/delete controls

**Validation and Limits:**

- Tag name uniqueness validation
- Character length limits (30 characters)
- Category limits (max 10 custom categories)
- Tag limits per category (max 20 custom tags)
- Default category protection

**Data Migration:**

- Handle existing recipes when tags are modified
- Automatic cleanup when categories are deleted
- Maintain data integrity during tag operations
- Support for tag renaming across all recipes

### Visual Design Notes

**Tag Management Modal:**

- Clean, organized layout by category
- Clear visual separation between predefined and custom categories
- Intuitive add/edit/delete controls
- Search bar at top for quick tag finding
- Consistent with app's design system

**Integration with Recipe Form:**

- "Manage Tags" button clearly visible in tag selection section
- Seamless transition to tag management modal
- Return to form with updated tag selections
- Visual feedback for tag changes

**Category Management:**

- Visual distinction between default and custom categories
- Clear indicators for non-deletable default categories
- Confirmation dialogs for destructive actions
- Success/error feedback for all operations
