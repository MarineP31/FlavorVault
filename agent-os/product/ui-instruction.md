# Recipe Keeper V2 - UI Design Implementation Guide

## Mission
Implement the Recipe Keeper V2 mobile app UI based on the provided design files, creating pixel-perfect React Native components that match the visual specifications.

## Design Assets Location
All UI design files are located in: `assets/images/ui/`

Available design screens:
- **HomeScreen.png** - Recipe repository grid/list view
- **RecipeDetails.png** - Individual recipe display screen
- **RecipeCapture.png** - Camera/upload interface for capturing recipes
- **PhotoCaptureOCR.png** - OCR processing and recipe extraction screen

## Product Context

### Main Idea
Recipe Keeper V2 is a mobile recipe management app with OCR technology that helps meal preppers consolidate recipes from diverse sources (cookbooks, websites, handwritten cards, screenshots) into one organized system.

### Key Features
1. **Recipe Repository** - Grid/list views of recipe cards with thumbnails, title, source, and prep time
2. **OCR Digitization** - Camera/upload functionality to capture and extract recipe text from physical sources
3. **Recipe Editor** - Form with fields for ingredients, instructions, cooking time, servings, and tags
4. **Meal Planning** - Calendar interface to drag-and-drop recipes into weekly/monthly meal plans
5. **Shopping List Generator** - Auto-compile ingredients from planned meals with edit and check-off capabilities

### Target Users
Meal preppers who need to organize recipes from various sources and plan their meals efficiently.

### Tech Stack
- **Framework**: Expo (React Native) with TypeScript
- **Navigation**: Expo Router
- **Styling**: Nativewind (Tailwind CSS for React Native)
- **UI Components**: React Native Reusables
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod validation
- **Storage**: expo-sqlite (local storage)
- **OCR**: expo-camera + Google Cloud Vision API

## Implementation Steps

### 1. Analyze Design Files
For each design file in `assets/images/ui/`:
- Use vision capabilities to analyze the PNG designs
- Extract key UI elements: colors, typography, spacing, layout structure, icons, and components
- Document design tokens (color palette, font sizes, spacing units, border radius, shadows)
- Identify reusable components (buttons, cards, input fields, navigation elements)

### 2. Create Design System
Based on design analysis, create:
- `lib/constants/colors.ts` - Color palette extracted from designs
- `lib/constants/typography.ts` - Font families, sizes, and weights
- `lib/constants/spacing.ts` - Spacing scale for margins and padding
- `tailwind.config.js` - Configure NativeWind with extracted design tokens

### 3. Build Component Library
Create reusable components matching the designs in `components/`:
- **RecipeCard** - Card component for recipe grid/list items (`components/recipes/`)
- **RecipeForm** - Form components for recipe editing (`components/recipes/`)
- **CameraCapture** - Camera interface for recipe scanning (`components/ocr/`)
- **OCRProcessor** - OCR result display and editing interface (`components/ocr/`)
- **Navigation components** - Tab bar, headers, buttons (`components/ui/`)

### 4. Implement Screens
Create screen components matching each design file:
- `app/(tabs)/index.tsx` - Home screen (recipe repository)
- `app/recipe/[id].tsx` - Recipe details screen
- `app/recipe/capture.tsx` - Recipe capture screen
- `app/recipe/ocr.tsx` - OCR processing screen

### 5. Match Visual Specifications
For each component and screen:
- Match exact colors, fonts, and spacing from designs
- Implement proper layout structure (flex, grid patterns)
- Add appropriate touch interactions and animations
- Ensure responsive behavior for different device sizes
- Test on both iOS and Android for platform consistency

### 6. Validation Checklist
- [ ] All design screens have corresponding implemented components
- [ ] Color palette matches design files exactly
- [ ] Typography (font family, sizes, weights) matches designs
- [ ] Spacing and layout match pixel-perfect specifications
- [ ] Icons and images are properly integrated
- [ ] Touch targets meet mobile accessibility standards (min 44x44pt)
- [ ] Animations and transitions feel native and smooth
- [ ] Components are reusable and follow React Native best practices
- [ ] Code uses TypeScript with proper type definitions
- [ ] Nativewind classes are used consistently for styling

## Design Analysis Template

For each design file, document:

```markdown
### [Screen Name] - [DesignFile.png]

**Layout Structure:**
- [Describe overall layout: header, body, footer sections]

**Color Palette:**
- Primary: #[hex]
- Secondary: #[hex]
- Background: #[hex]
- Text: #[hex]
- Accent: #[hex]

**Typography:**
- Headings: [font-family, size, weight]
- Body: [font-family, size, weight]
- Labels: [font-family, size, weight]

**Key Components:**
1. [Component name] - [Description and specifications]
2. [Component name] - [Description and specifications]

**Spacing:**
- Container padding: [value]
- Element gaps: [value]
- Section margins: [value]

**Interactive Elements:**
- Buttons: [style, size, states]
- Input fields: [style, validation states]
- Cards: [style, touch feedback]
```

## Output Files

After implementation, ensure these files exist:
- Design system constants in `lib/constants/`
- Reusable UI components in `components/ui/`
- Feature components in `components/recipes/`, `components/ocr/`, etc.
- Screen implementations in `app/` directory
- Documentation of design tokens and component usage

## Success Criteria

Implementation is complete when:
1. All 4 design screens are implemented with pixel-perfect accuracy
2. Design system is extracted and documented
3. Components are reusable and properly typed
4. App runs smoothly on both iOS and Android
5. Visual comparison shows <5% deviation from original designs
6. Code follows all tech stack conventions from `agent-os/product/tech-stack.md`
