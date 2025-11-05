# Tech Stack

## Mobile Framework & Core

- **Platform**: Expo (React Native)
- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js (LTS)
- **Package Manager**: yarn
- **Navigation**: Expo Router (file-based routing)

## State Management & Data

- **State Management**: React Context API
- **Local Storage**: expo-sqlite (for structured recipe data, meal plans, shopping lists)
- **Local-First Sync**: Legend-state (future cloud sync implementation)
- **Form Management**: React Hook Form
- **Schema Validation**: Zod

## UI & Styling

- **UI Component Library**: React Native Reusables
- **CSS Framework**: Nativewind (Tailwind for React Native)
- **Icons**: @expo/vector-icons
- **Images**: expo-image (with lazy loading and blurhash placeholders)
- **Animations**: react-native-reanimated
- **Gestures**: react-native-gesture-handler

## Lists & Performance

- **List Rendering**: FlatList, SectionList, VirtualizedList (not map())
- **Heavy List Optimization**: @legendapp/list (for recipe grid/list views)
- **Keyboard Handling**: react-native-keyboard-controller

## Camera & OCR

- **Camera Access**: expo-camera
- **Image Picker**: expo-image-picker
- **OCR Service Options**:
  - **Primary**: Google Cloud Vision API (high accuracy, robust text extraction)
  - **Alternative**: Azure Computer Vision (comparable accuracy, Microsoft ecosystem)
  - **Local Option**: Tesseract.js (offline processing, lower accuracy, no API costs)
- **Image Optimization**: WebP format for photos, compression for thumbnails

## Future Features (Phase 2+)

- **Cloud Storage**: Amazon S3 (for recipe image backup)
- **Authentication**: Better Auth
- **Data Fetching**: TanStack Query (for cloud sync)
- **HTTP Client**: Apisauce
- **Backend**: Next.js Route Handlers (for cloud features)

## Development & Quality

- **Linting/Formatting**: Biome, Ultracite
- **Type Safety**: TypeScript strict mode
- **Git Hooks**: Lefthook
- **Environment Variables**: expo-constants

## Testing

- **Unit Testing**: Jest
- **Component Testing**: React Native Testing Library (@testing-library/react-native)
- **E2E Testing**: Maestro
- **Performance Testing**: Flashlight

## Deployment & Distribution

- **OTA Updates**: expo-updates
- **App Store Distribution**: EAS Build (Expo Application Services)
- **CI/CD**: GitHub Actions
- **Analytics**: PostHog (user behavior tracking)
- **Error Monitoring**: Sentry

## Third-Party Services (Future)

- **Nutrition API**: Spoonacular or Edamam (for nutrition information)
- **Web Scraping**: Custom implementation or recipe parsing libraries
- **Grocery Integration**: Instacart API or similar (Phase 3)

## Project Structure

```
recipe_keeper_v2/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Recipe list
│   │   ├── meal-plan.tsx  # Meal planning calendar
│   │   └── shopping.tsx   # Shopping list
│   ├── recipe/            # Recipe routes
│   │   ├── [id].tsx       # Recipe detail
│   │   └── new.tsx        # Add/edit recipe
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── recipe/           # Recipe-specific components
│   ├── meal-plan/        # Meal planning components
│   └── ui/               # Shared UI components
├── lib/                   # Business logic
│   ├── db/               # SQLite database schema & queries
│   ├── ocr/              # OCR service integration
│   └── utils/            # Helper functions
├── hooks/                 # Custom React hooks
├── contexts/              # React Context providers
├── constants/             # App constants, types
└── assets/               # Images, fonts, icons
```

## Key Dependencies (package.json)

### Core Expo & React Native

```json
{
  "expo": "^54.0.20",
  "expo-router": "~6.0.13",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo-constants": "~18.0.10"
}
```

### Navigation & UI

```json
{
  "@react-navigation/native": "^7.1.8",
  "@react-navigation/bottom-tabs": "^7.4.0",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-reanimated": "~4.1.1",
  "react-native-screens": "~4.16.0",
  "nativewind": "^latest"
}
```

### Data & Storage (to be added)

```json
{
  "expo-sqlite": "^latest",
  "react-hook-form": "^latest",
  "zod": "^latest",
  "@legendapp/state": "^latest"
}
```

### Camera & OCR (to be added)

```json
{
  "expo-camera": "^latest",
  "expo-image-picker": "^latest",
  "@google-cloud/vision": "^latest" // or tesseract.js
}
```

### Development

```json
{
  "typescript": "~5.9.2",
  "@types/react": "~19.1.0",
  "eslint": "^9.25.0",
  "eslint-config-expo": "~10.0.0"
}
```

## Architecture Decisions

### Mobile-Only Focus

- No web support in MVP to prioritize mobile UX and camera-based OCR
- Leverage native device capabilities (camera, local storage, gestures)
- Optimize for mobile performance and offline-first usage

### Local Storage First

- Start with expo-sqlite for MVP to avoid backend complexity
- No authentication or cloud sync required initially
- Faster development, simpler architecture, complete privacy
- Migration path to cloud sync in Phase 2 using Legend-state

### OCR Implementation Strategy

1. **MVP**: Integrate Google Cloud Vision API for highest accuracy
2. **Cost Optimization**: Implement request throttling and image preprocessing
3. **Future**: Consider hybrid approach with local Tesseract.js fallback
4. **Post-Processing**: Custom parsing logic to structure extracted text into recipe fields

### Performance Priorities

- Use FlatList with proper keyExtractor for recipe lists
- Implement @legendapp/list for grid views with many recipes
- Lazy load images with expo-image and blurhash placeholders
- Optimize SQLite queries with proper indexing on frequently searched fields
- Cache OCR results to avoid duplicate API calls for same images
