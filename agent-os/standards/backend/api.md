## API & Service Layer Standards

> **Note:** This project is mobile-only with local storage (expo-sqlite). For Phase 2+ cloud features, REST API standards will apply.

### Service Layer Pattern (Current MVP)

- **Service Classes**: One service per entity (RecipeService, MealPlanService, TagService)
- **Method Naming**: Verbs for actions (createRecipe, deleteRecipe, getAllRecipes)
- **Type Safety**: All methods should be fully typed with TypeScript
- **Validation**: Validate input with Zod before database operations
- **Error Handling**: Throw typed errors with meaningful messages

### Data Operations

- **CRUD Operations**: Create, Read, Update, Delete for each entity
- **Query Methods**: getById, getAll (with pagination), search, filter
- **Batch Operations**: Support bulk creates/updates where needed
- **Transactions**: Use for multi-step operations

### File & Media Handling

- **Blurhash**: Generate for images to enable placeholder display
- **Local Storage**: Store images on device, reference by URI
- **Image Optimization**: Compress and generate thumbnails for performance

### Future API Standards (Phase 2+)

- **RESTful**: Resource-based URLs with appropriate HTTP methods
- **Authentication**: JWT or OAuth with HTTPS
- **Rate Limiting**: Per-user limits with headers
- **HTTPS**: Enforce for all network requests
