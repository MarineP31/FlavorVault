# OCR Recipe Capture - Implementation Tasks

## Task 1: Save Spec Documentation ✅
- [x] Create spec directory structure
- [x] Create spec.md with full specification
- [x] Create tasks.md (this file)
- [x] Copy visual reference to visuals/

## Task 2: Install Dependencies ✅
- [x] Install `expo-text-extractor` package
- [x] Verify expo-image-picker is installed (already present)
- [x] Update app.json with any required permissions

## Task 3: Create Text Extractor Service ✅
- [x] Create `lib/ocr/text-extractor-service.ts`
- [x] Wrapper around expo-text-extractor
- [x] Error handling and timeout management
- [x] Return structured ExtractionResult

## Task 4: Create Recipe Parser Service ✅
- [x] Create `lib/ocr/recipe-parser.ts`
- [x] Title detection algorithm
- [x] Ingredient parsing with quantity/unit extraction
- [x] Instruction step parsing
- [x] Metadata extraction (times, servings)

## Task 5: Create Confidence Scorer ✅
- [x] Create `lib/ocr/confidence-scorer.ts`
- [x] Per-field confidence aggregation
- [x] Threshold-based categorization (high/medium/low)
- [x] Overall recipe confidence calculation

## Task 6: Build OCR Capture Screen ✅
- [x] Create `app/ocr/_layout.tsx`
- [x] Create `app/ocr/capture.tsx`
- [x] Photo source selection (camera/library)
- [x] Image preview before processing
- [x] Loading state during OCR
- [x] Navigate to review screen with results

## Task 7: Build OCR Review Screen (Main UI) ✅
- [x] Create `app/ocr/review.tsx`
- [x] Match mockup design:
  - [x] Confidence banner (dismissible)
  - [x] Image preview (expandable)
  - [x] Confidence bar with percentage
  - [x] Parsed sections with color-coded borders
  - [x] Yellow highlights on low-confidence text
  - [x] "Edit Text" and "Continue" buttons

## Task 8: Build Supporting Components ✅
- [x] Create `components/ocr/ConfidenceBanner.tsx`
- [x] Create `components/ocr/ConfidenceBar.tsx`
- [x] Create `components/ocr/ParsedRecipeSection.tsx`
- [x] Create `components/ocr/HighlightedText.tsx`
- [x] Create `components/ocr/ImagePreview.tsx`

## Task 9: Update Add Recipe Tab ✅
- [x] Modify `app/(tabs)/add-recipe.tsx`
- [x] Replace "Coming Soon" alert with navigation to OCR flow
- [x] "Scan Recipe" card navigates to `/ocr/capture`

## Task 10: Integrate with Recipe Form ✅
- [x] Update `app/recipe-form/create.tsx` to accept initial data
- [x] Pass parsed data to `/recipe-form/create`
- [x] Pre-fill form fields with extracted data

## Verification Checklist
- [x] TypeScript compilation passes for OCR files
- [ ] After Task 3: Test text extraction with sample images
- [ ] After Task 5: Verify confidence scores are calculated correctly
- [ ] After Task 7: Visual comparison with mockup - UI should match
- [ ] After Task 9: "Scan Recipe" card navigates correctly
- [ ] Final: Complete flow test - capture → extract → review → edit → save recipe
