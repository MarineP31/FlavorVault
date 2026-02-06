# Product Roadmap

## MVP / Phase 1: Core Recipe Management & Planning

1. [ ] **Local Storage Foundation** — Implement local data persistence using expo-sqlite with schema for recipes, meal plans, and shopping lists including migration support

2. [ ] **Recipe Repository UI** — Build grid and list view interfaces with recipe cards showing thumbnails, titles, source, and prep time with search and tag filtering

3. [ ] **Recipe Editor & CRUD Operations** — Create form interface for adding/editing recipes with fields for title, ingredients, instructions, cooking time, servings, tags, and source with image upload capability

4. [ ] **OCR Recipe Capture** — Integrate camera functionality using expo-camera and implement OCR service (Google Cloud Vision or Tesseract.js) to extract recipe text from photos with structured parsing into recipe fields

5. [ ] **Meal Planning Calendar** — Build weekly/monthly calendar view with drag-and-drop functionality to assign recipes to specific dates with visual meal plan overview

6. [ ] **Shopping List Generator** — Implement automatic ingredient compilation from planned meals with quantity aggregation, manual editing, and check-off functionality for shopping

7. [ ] **Tag Management System** — Create tagging interface for categorizing recipes by cuisine, dietary restrictions, meal type, and cooking method with tag-based filtering in recipe list

8. [ ] **Recipe Detail View** — Build comprehensive recipe detail screen showing full ingredients, step-by-step instructions, cooking times, servings, tags, source, and action buttons (edit, delete, add to meal plan)

## Phase 2: Enhanced Features & User Experience

9. [ ] **Advanced Search & Filtering** — Implement multi-criteria search across ingredients, cooking time ranges, servings, and multiple tag combinations with saved search presets

10. [ ] **Recipe Import from URLs** — Add web scraping functionality to extract recipes from popular cooking websites with automatic parsing into structured recipe format

11. [ ] **Bulk Image Optimization** — Implement automatic image compression and thumbnail generation for photos to optimize storage and performance

12. [ ] **Meal Plan Templates** — Create ability to save and reuse weekly meal plans as templates with recipe substitution options

13. [ ] **Cloud Backup & Sync** — Integrate cloud storage (AWS S3 or similar) for recipe backup and cross-device synchronization with conflict resolution

14. [ ] **User Authentication** — Implement authentication system using Better Auth for secure account creation and cloud sync access

15. [ ] **Recipe Export & Sharing** — Add functionality to export recipes as PDF or share via standard sharing protocols with formatted recipe cards

## Phase 3: Advanced Features & Integrations

16. [ ] **Nutrition Information** — Integrate nutrition API to calculate and display nutritional values per serving with dietary goal tracking

17. [ ] **Cooking Mode** — Create hands-free cooking interface with large text, voice commands, and step-by-step progress tracking with timers

18. [ ] **Smart Ingredient Scaling** — Implement automatic ingredient quantity adjustment when changing serving sizes with unit conversion support

19. [ ] **Recipe Collections & Meal Prep** — Add functionality to create recipe collections (e.g., "Summer Grilling", "Quick Weeknight Dinners") and batch cooking workflows

20. [ ] **Grocery Store Integration** — Partner with grocery delivery services or implement store aisle mapping to optimize shopping list order

21. [ ] **Recipe Discovery & Recommendations** — Build recommendation engine suggesting recipes based on available ingredients, past favorites, and dietary preferences

22. [ ] **Social Features** — Add ability to share recipes with friends, follow other users, and discover community-contributed recipes with ratings and reviews

## Notes

- Phase 1 (MVP) focuses on core functionality with local storage only, delivering the essential recipe management and meal planning experience
- Phase 2 introduces enhanced features and cloud capabilities for users who want backup, sync, and advanced organization
- Phase 3 adds premium features and integrations for power users seeking comprehensive meal management
- Each item represents an end-to-end feature with both UI and data persistence implementation
- Cloud sync and authentication are bundled in Phase 2 as they work together to enable cross-device access
