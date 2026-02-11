# FlavorVault

**Your recipes, your plan, your list — one app from photo to grocery store.**

FlavorVault is a mobile recipe management app for iOS and Android that takes you from capturing a recipe to standing in the grocery store with an organized shopping list. Snap a photo, import a URL, or type it in — then plan your meals and let the app build your list automatically.

<p align="center">
  <img src="assets/images/ui/HomeScreen.png" width="200" alt="Home Screen" />
  <img src="assets/images/ui/RecipeDetails.png" width="200" alt="Recipe Details" />
  <img src="assets/images/ui/PhotoCaptureOCR.png" width="200" alt="OCR Capture" />
  <img src="assets/images/ui/RecipeCapture.png" width="200" alt="Recipe Capture" />
</p>

## Features

- **OCR Recipe Capture** — Photograph a cookbook page or handwritten card. On-device ML (Google ML Kit / Apple Vision) extracts the text and parses it into a structured recipe with zero API costs.
- **URL Import** — Share a recipe URL from your browser. FlavorVault parses JSON-LD schema data and pre-fills the recipe form automatically.
- **Recipe Management** — Full CRUD with images, ingredients, step-by-step instructions, prep/cook times, servings, tags, and source attribution.
- **Tag & Filter System** — Organize by cuisine, dietary restriction, meal type, or cooking method. Horizontal tag filter for quick browsing.
- **Meal Planning** — Queue recipes into a meal plan and view everything you're cooking at a glance.
- **Smart Shopping List** — Ingredients from planned meals are auto-compiled, deduplicated, quantity-aggregated, and categorized (Produce, Dairy, Meat, Pantry, Frozen, Bakery). Add manual items and check things off as you shop.
- **Dark Mode** — Full dark mode support across every screen.
- **Cloud Sync** — Supabase backend with row-level security. Your data follows you and stays private.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Expo](https://expo.dev) (React Native) |
| Language | TypeScript (strict mode) |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) |
| Styling | [NativeWind](https://www.nativewind.dev/) (Tailwind CSS) |
| Forms | React Hook Form + Zod |
| Backend | [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage) |
| Local DB | expo-sqlite |
| OCR | Google ML Kit (Android) / Apple Vision (iOS) |
| Payments | [RevenueCat](https://www.revenuecat.com/) |

## Project Structure

```
app/                  # Expo Router screens and layouts
  (auth)/             # Login, signup, forgot password
  (tabs)/             # Main tab navigation (5 tabs)
  recipe/             # Recipe detail view
  recipe-form/        # Create and edit forms
  ocr/                # OCR capture and review flow
  import/             # URL import
components/           # React Native components
  recipes/            # Recipe cards, forms, filters
  shopping-list/      # Shopping list items and dialogs
  meal-plan/          # Meal plan components
  ui/                 # Reusable UI primitives
lib/                  # Core logic
  db/                 # Local database (schema, services, migrations)
  supabase/           # Supabase client, types, image storage
  auth/               # Authentication context
  ocr/                # Text extraction, recipe parsing, confidence scoring
  import/             # URL parsing, JSON-LD extraction
  hooks/              # Custom React hooks
  contexts/           # React Context providers
  validations/        # Zod schemas
```

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/flavorvault.git
cd flavorvault

# Install dependencies
yarn install

# Start the development server
yarn start
```

### Running on Device / Emulator

```bash
# iOS
yarn ios

# Android
yarn android
```

> **Note:** OCR features require a [development build](https://docs.expo.dev/develop/development-builds/introduction/) since they use native modules. Expo Go will not work for the full feature set.

### Environment Variables

Create a `.env` file at the project root with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Scripts

| Command | Description |
|---------|-------------|
| `yarn start` | Start Expo dev server |
| `yarn ios` | Run on iOS simulator |
| `yarn android` | Run on Android emulator |
| `yarn lint` | Run linter |
| `yarn test` | Run tests |
| `yarn test:coverage` | Run tests with coverage report |

## Architecture Highlights

- **On-device OCR** with confidence scoring — no cloud API costs, works offline
- **Ingredient aggregation engine** that deduplicates and sums quantities across multiple recipes
- **Row-level security** on all Supabase tables — users can only access their own data
- **Type-safe end-to-end** — TypeScript strict mode, Zod runtime validation, Supabase generated types
- **Soft deletes** for recipes with cascading cleanup of meal plans and shopping items

## Built With

Expo (React Native), TypeScript, Supabase (PostgreSQL, Auth, Storage), NativeWind, expo-sqlite, React Hook Form, Zod, RevenueCat, Google ML Kit, Apple Vision, and JSON-LD parsing — targeting iOS and Android from a single codebase.

## License

This project is proprietary. All rights reserved.
