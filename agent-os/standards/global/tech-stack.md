## Tech Stack (Recipe Keeper V2 - Mobile App)

> **Note:** This file is aligned with product/tech-stack.md for this mobile-only Expo project.

### Framework & Runtime

- **Platform:** Expo (React Native)
- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js (LTS)
- **Package Manager:** Yarn
- **Navigation:** Expo Router (file-based routing)

### AI Development Tools

- **IDE:** Cursor
- **AI Coding Assistant:** Claude Code

### State Management & Data

- **State Management:** React Context API
- **Local Storage:** expo-sqlite (recipes, meal plans, shopping lists)
- **Local-First Sync:** Legend-state (future cloud sync)
- **Form Management:** React Hook Form
- **Schema Validation:** Zod

### UI & Styling

- **UI Component Library:** React Native Reusables
- **CSS Framework:** NativeWind (Tailwind for React Native)
- **Icons:** @expo/vector-icons
- **Images:** expo-image (with lazy loading and blurhash)
- **Animations:** react-native-reanimated
- **Gestures:** react-native-gesture-handler

### Lists & Performance

- **List Rendering:** FlatList, SectionList, VirtualizedList
- **Heavy List Optimization:** @legendapp/list
- **Keyboard Handling:** react-native-keyboard-controller

### Camera & OCR

- **Camera Access:** expo-camera
- **Image Picker:** expo-image-picker
- **OCR Service:** Google Cloud Vision API (primary), Tesseract.js (offline fallback)

### Testing & Quality

- **Unit Testing:** Jest, React Native Testing Library
- **E2E Testing:** Maestro
- **Performance:** Flashlight
- **Type Safety:** TypeScript strict mode
- **Linting/Formatting:** Biome
- **Git Hooks:** Lefthook

### Future Features (Phase 2+)

- **Cloud Storage:** Amazon S3 (recipe image backup)
- **Authentication:** Better Auth
- **Data Fetching:** TanStack Query (cloud sync)
- **Analytics:** PostHog
- **Error Monitoring:** Sentry

### Deployment

- **OTA Updates:** expo-updates
- **App Store Distribution:** EAS Build
- **CI/CD:** GitHub Actions
