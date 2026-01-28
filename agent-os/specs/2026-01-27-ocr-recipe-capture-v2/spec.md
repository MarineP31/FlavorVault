# OCR Recipe Capture - Feature Specification

## Summary

Enable users to digitize physical recipes from cookbooks, magazines, and handwritten cards by scanning photos and extracting text using `expo-text-extractor`. The extracted text is parsed into structured recipe fields with confidence indicators, then presented in a review screen for user correction before saving.

---

## Scope

**What we're building:**
- Camera capture and photo library selection for recipe images
- OCR text extraction using `expo-text-extractor`
- Smart parsing to extract title, ingredients, instructions, and metadata
- OCR Review screen with confidence indicators (yellow highlights for uncertain fields)
- Integration with existing recipe form for editing and saving

**Key decisions:**
- Use `expo-text-extractor` instead of Tesseract.js (user preference)
- Follow visual mockup from `assets/images/ui/PhotoCaptureOCR.png`
- Single photo = single recipe (MVP approach)
- Local processing (offline capable)

---

## Visual Reference

**OCR Review Screen (from PhotoCaptureOCR.png):**
- Header: "OCR Review" with back arrow and info icon
- Warning banner: "Low confidence detected - Some text may need manual correction" (dismissible)
- Image preview section with "Tap to expand image" caption
- Confidence score display: "OCR Confidence 78%" with progress bar
- Section label: "Moderate confidence - review highlighted sections"
- "Extracted Text" header with "Re-parse" button
- Parsed recipe sections:
  - **Recipe Title** (purple left border): "Grandmother's Apple Pie" with "Recipe Title - High confidence" label
  - **Ingredients** (yellow highlights on uncertain items): List with yellow background on low-confidence items
  - **Instructions** (yellow highlights): Numbered steps with uncertain ones highlighted
- Bottom buttons: "Edit Text" (outline) and "Continue" (primary orange)

---

## Technical Approach

### File Structure
```
app/
├── ocr/
│   ├── _layout.tsx           # Stack navigator for OCR flow
│   ├── capture.tsx           # Photo capture/selection screen
│   └── review.tsx            # OCR review screen

components/
├── ocr/
│   ├── PhotoSourcePicker.tsx     # Camera vs Library action sheet
│   ├── ImagePreview.tsx          # Expandable image preview
│   ├── ConfidenceBar.tsx         # Progress bar with percentage
│   ├── ConfidenceBanner.tsx      # Warning banner for low confidence
│   ├── ParsedRecipeSection.tsx   # Section container with confidence border
│   └── HighlightedText.tsx       # Text with yellow highlight for low confidence

lib/
├── ocr/
│   ├── text-extractor-service.ts # expo-text-extractor wrapper
│   ├── recipe-parser.ts          # Smart parsing algorithms
│   ├── confidence-scorer.ts      # Confidence calculation
│   └── ingredient-parser.ts      # Ingredient text parsing
```

### expo-text-extractor Integration

```typescript
import TextExtractor from 'expo-text-extractor';

interface ExtractionResult {
  text: string;
  blocks: TextBlock[];
  confidence: number;
}

interface TextBlock {
  text: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
}

export async function extractTextFromImage(imageUri: string): Promise<ExtractionResult> {
  const result = await TextExtractor.extractText(imageUri);
  return {
    text: result.text,
    blocks: result.blocks,
    confidence: calculateOverallConfidence(result.blocks)
  };
}
```

### Smart Parsing
- **Title detection**: First large text block or line before ingredients
- **Ingredient parsing**: Regex for quantities, units, names (e.g., "2 cups flour")
- **Instruction parsing**: Numbered/bulleted lists or paragraphs
- **Metadata**: Prep time, cook time, servings patterns

### Confidence Scoring
- High (>80%): Green/purple left border, no highlight
- Medium (60-80%): Yellow left border, subtle highlight
- Low (<60%): Yellow background highlight, warning icon

---

## Out of Scope (MVP)

- Multi-photo capture for single recipe
- Image pre-processing (crop, rotate, contrast)
- Handwritten recipe recognition
- Multi-language OCR
- Cloud-based OCR fallback
- Recipe duplicate detection
