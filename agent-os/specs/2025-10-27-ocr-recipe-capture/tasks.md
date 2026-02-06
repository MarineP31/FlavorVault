# Tasks: OCR Recipe Capture

## Overview

Enable users to digitize physical recipes from cookbooks, magazines, and printed materials through camera or photo library selection, automatically extracting and parsing recipe information using Tesseract.js OCR with confidence indicators for review before saving.

## Task Groups

### Group 1: Dependencies & Setup

**Priority: Critical**

#### Task 1.1: Package Installation & Configuration

- [ ] Install `tesseract.js` package
- [ ] Install `@types/tesseract.js` for TypeScript support
- [ ] Install `expo-image-picker` for camera/library access
- [ ] Install `expo-camera` permissions (if needed)
- [ ] Update package.json with new dependencies
- [ ] Configure TypeScript types for Tesseract.js

#### Task 1.2: Project Structure Setup

- [ ] Create `app/ocr/` directory structure
- [ ] Create `components/ocr/` directory structure
- [ ] Create `lib/ocr/` directory structure
- [ ] Set up OCR-specific navigation routes
- [ ] Configure file structure for OCR components
- [ ] Add OCR assets and language data setup

#### Task 1.3: Permission Configuration

- [ ] Configure camera permissions in app.json
- [ ] Configure photo library permissions in app.json
- [ ] Set up permission request handlers
- [ ] Add permission denial handling
- [ ] Test permissions on iOS and Android
- [ ] Add permission status checking utilities

### Group 2: Tesseract.js Service Implementation

**Priority: Critical**

#### Task 2.1: Tesseract Service Core

- [ ] Create `lib/ocr/tesseract-service.ts`
- [ ] Implement TesseractService class with worker management
- [ ] Configure Tesseract.js for React Native environment
- [ ] Set up English language data (eng.traineddata)
- [ ] Configure PSM (Page Segmentation Mode) 3
- [ ] Configure OEM (OCR Engine Mode) 3 for LSTM

#### Task 2.2: Worker Thread Management

- [ ] Implement worker initialization on app startup
- [ ] Add worker lifecycle management (initialize, terminate)
- [ ] Implement worker error handling and restart
- [ ] Add worker queue system for multiple requests
- [ ] Implement memory management for workers
- [ ] Add worker status monitoring

#### Task 2.3: OCR Processing Methods

- [ ] Implement `recognizeImage(imageUri: string)` method
- [ ] Add progress tracking during OCR processing
- [ ] Implement timeout handling (30 seconds)
- [ ] Add error handling for processing failures
- [ ] Implement image preprocessing before OCR
- [ ] Add result validation and cleanup

#### Task 2.4: Recognition Result Interface

- [ ] Define `RecognitionResult` interface
- [ ] Define `WordData` interface with confidence scores
- [ ] Implement confidence score aggregation
- [ ] Add bounding box data handling
- [ ] Implement text extraction utilities
- [ ] Add result formatting methods

### Group 3: Smart Parsing Algorithms

**Priority: High**

#### Task 3.1: Recipe Parser Service

- [ ] Create `lib/ocr/recipe-parser.ts`
- [ ] Implement main parsing orchestration
- [ ] Add section detection logic (ingredients, instructions, metadata)
- [ ] Implement parsing result validation
- [ ] Add error handling for parsing failures
- [ ] Create parsing result interface

#### Task 3.2: Title Detection Algorithm

- [ ] Implement title detection logic
- [ ] Add font size and bold detection
- [ ] Implement fallback title detection
- [ ] Add title validation and cleaning
- [ ] Handle edge cases (short titles, ingredient patterns)
- [ ] Test with various recipe formats

#### Task 3.3: Ingredient Parsing Algorithm

- [ ] Create `lib/ocr/ingredient-parser.ts`
- [ ] Implement ingredient section detection
- [ ] Add list pattern recognition (bullets, dashes, numbers)
- [ ] Implement quantity extraction with regex patterns
- [ ] Add unit extraction matching MeasurementUnit enum
- [ ] Implement ingredient name extraction
- [ ] Handle various formats ("2 cups flour", "flour (2 cups)")

#### Task 3.4: Instruction Step Parsing

- [ ] Implement instruction section detection
- [ ] Add numbered list parsing ("1.", "Step 1")
- [ ] Implement bulleted list parsing
- [ ] Add paragraph format parsing
- [ ] Implement step cleaning and formatting
- [ ] Handle multi-line instruction steps

#### Task 3.5: Metadata Extraction

- [ ] Implement prep time extraction with regex
- [ ] Add cook time extraction patterns
- [ ] Implement serving size extraction
- [ ] Add source/cookbook name detection
- [ ] Handle various time formats ("30 min", "1 hour 15 min")
- [ ] Handle serving formats ("Serves 4", "4 servings")

#### Task 3.6: Text Utilities

- [ ] Create `lib/utils/text-utils.ts`
- [ ] Implement string cleaning utilities
- [ ] Add regex pattern definitions
- [ ] Implement text normalization functions
- [ ] Add pattern matching utilities
- [ ] Create text validation helpers

### Group 4: Confidence Scoring System

**Priority: High**

#### Task 4.1: Confidence Scorer Service

- [ ] Create `lib/ocr/confidence-scorer.ts`
- [ ] Implement word-level confidence aggregation
- [ ] Add field-level confidence calculation
- [ ] Implement confidence threshold logic
- [ ] Add confidence score validation
- [ ] Create confidence result interface

#### Task 4.2: Confidence Calculation Logic

- [ ] Implement average confidence calculation per field
- [ ] Add weighted confidence scoring
- [ ] Implement confidence threshold levels (High >80%, Medium 60-80%, Low <60%)
- [ ] Add field-specific confidence adjustments
- [ ] Implement overall recipe confidence scoring
- [ ] Add confidence validation and edge case handling

#### Task 4.3: Confidence Indicator Components

- [ ] Create `components/ocr/confidence-indicator.tsx`
- [ ] Implement yellow highlight wrapper for low confidence
- [ ] Add warning icon component for low confidence fields
- [ ] Implement confidence badge component
- [ ] Add confidence score display utilities
- [ ] Create confidence styling system

### Group 5: Camera & Photo Library Integration

**Priority: High**

#### Task 5.1: Photo Source Picker Component

- [ ] Create `components/ocr/photo-source-picker.tsx`
- [ ] Implement action sheet for camera vs library selection
- [ ] Add permission request handling
- [ ] Implement camera launch functionality
- [ ] Add photo library launch functionality
- [ ] Handle permission denial scenarios

#### Task 5.2: Image Capture Implementation

- [ ] Implement camera capture with expo-image-picker
- [ ] Add photo library selection functionality
- [ ] Implement image quality and size optimization
- [ ] Add image format conversion (JPEG)
- [ ] Implement image resizing (max 1600px width)
- [ ] Add image validation and error handling

#### Task 5.3: Image Preview Component

- [ ] Create `components/ocr/image-preview.tsx`
- [ ] Implement image preview display
- [ ] Add "Process" and "Retake" buttons
- [ ] Implement image aspect ratio handling
- [ ] Add image loading states
- [ ] Implement image error handling

#### Task 5.4: Permission Handling

- [ ] Implement camera permission request
- [ ] Add photo library permission request
- [ ] Create permission denial alert dialogs
- [ ] Add permission status checking
- [ ] Implement permission retry logic
- [ ] Add permission explanation text

### Group 6: OCR Capture Flow Screen

**Priority: High**

#### Task 6.1: OCR Capture Screen

- [ ] Create `app/ocr/capture.tsx` screen
- [ ] Implement photo source selection flow
- [ ] Add image capture/selection handling
- [ ] Implement image preview functionality
- [ ] Add OCR processing initiation
- [ ] Implement navigation to recipe form

#### Task 6.2: OCR Loading Overlay

- [ ] Create `components/ocr/ocr-loading-overlay.tsx`
- [ ] Implement full-screen loading overlay
- [ ] Add progress indicator during OCR processing
- [ ] Implement cancel button during processing
- [ ] Add loading animation and feedback
- [ ] Implement timeout handling

#### Task 6.3: Error Handling & Retry

- [ ] Implement OCR failure error handling
- [ ] Add retry functionality with same photo
- [ ] Implement "Try Different Photo" option
- [ ] Add error message display
- [ ] Implement graceful degradation
- [ ] Add error recovery mechanisms

#### Task 6.4: Navigation Integration

- [ ] Create `app/ocr/_layout.tsx` stack navigator
- [ ] Implement OCR flow navigation
- [ ] Add back button handling
- [ ] Implement flow cancellation
- [ ] Add navigation state management
- [ ] Test navigation flows

### Group 7: Recipe Form Integration

**Priority: High**

#### Task 7.1: Add Recipe Modal

- [ ] Create `components/recipes/add-recipe-modal.tsx`
- [ ] Implement "Add Recipe Manually" vs "Scan Recipe" options
- [ ] Add modal presentation logic
- [ ] Implement option selection handling
- [ ] Add modal styling and animations
- [ ] Integrate with bottom tab plus button

#### Task 7.2: Recipe Form Pre-filling

- [ ] Implement OCR data passing to recipe form
- [ ] Add React Hook Form reset with OCR data
- [ ] Implement confidence score integration
- [ ] Add form field population logic
- [ ] Implement OCR data validation
- [ ] Add form state management for OCR data

#### Task 7.3: Confidence Integration in Form

- [ ] Integrate confidence indicators in recipe form
- [ ] Add yellow highlighting for low confidence fields
- [ ] Implement warning icons for review fields
- [ ] Add confidence score display at form top
- [ ] Implement field-level confidence display
- [ ] Add confidence-based form validation

#### Task 7.4: Form State Management

- [ ] Implement OCR data storage in form state
- [ ] Add user edit tracking for OCR fields
- [ ] Implement "Edited" badge for modified fields
- [ ] Add original OCR text preservation
- [ ] Implement form data validation with OCR context
- [ ] Add form submission handling with OCR data

### Group 8: Bottom Tab Integration

**Priority: Medium**

#### Task 8.1: Plus Button Enhancement

- [ ] Modify center plus button behavior
- [ ] Implement options modal trigger
- [ ] Add button styling for options
- [ ] Implement button press handling
- [ ] Add button accessibility support
- [ ] Test button behavior across platforms

#### Task 8.2: Options Modal Implementation

- [ ] Implement modal presentation from plus button
- [ ] Add "Add Recipe Manually" option
- [ ] Add "Scan Recipe" option
- [ ] Implement option selection handling
- [ ] Add modal styling and animations
- [ ] Implement modal dismissal

#### Task 8.3: Navigation Flow Integration

- [ ] Integrate OCR flow with existing navigation
- [ ] Implement seamless transition to OCR capture
- [ ] Add back navigation handling
- [ ] Implement flow cancellation
- [ ] Add navigation state preservation
- [ ] Test complete navigation flows

### Group 9: Performance & Memory Management

**Priority: Medium**

#### Task 9.1: Image Optimization

- [ ] Implement image compression before OCR
- [ ] Add image resizing to optimal dimensions
- [ ] Implement JPEG format conversion
- [ ] Add aspect ratio preservation
- [ ] Implement temporary file management
- [ ] Add image cleanup after processing

#### Task 9.2: Memory Management

- [ ] Implement worker memory cleanup
- [ ] Add image memory management
- [ ] Implement processing timeout handling
- [ ] Add memory usage monitoring
- [ ] Implement garbage collection optimization
- [ ] Add low-memory device handling

#### Task 9.3: Background Processing

- [ ] Implement non-blocking OCR processing
- [ ] Add progress updates during processing
- [ ] Implement UI responsiveness during OCR
- [ ] Add processing cancellation
- [ ] Implement background task management
- [ ] Add processing queue management

### Group 10: Error Handling & Validation

**Priority: Medium**

#### Task 10.1: OCR Error Handling

- [ ] Implement OCR processing error handling
- [ ] Add image quality validation
- [ ] Implement text extraction validation
- [ ] Add parsing error handling
- [ ] Implement confidence threshold validation
- [ ] Add comprehensive error recovery

#### Task 10.2: Input Validation

- [ ] Implement image format validation
- [ ] Add image size validation
- [ ] Implement OCR result validation
- [ ] Add parsed data validation
- [ ] Implement field completeness validation
- [ ] Add data quality validation

#### Task 10.3: User Feedback

- [ ] Implement clear error messages
- [ ] Add retry option implementation
- [ ] Implement user guidance for better photos
- [ ] Add success feedback for OCR completion
- [ ] Implement progress feedback
- [ ] Add troubleshooting guidance

### Group 11: Testing & Quality Assurance

**Priority: Medium**

#### Task 11.1: Unit Tests

- [ ] Create tests for Tesseract service
- [ ] Test recipe parsing algorithms
- [ ] Test confidence scoring system
- [ ] Test ingredient parsing logic
- [ ] Test instruction step parsing
- [ ] Test metadata extraction

#### Task 11.2: Integration Tests

- [ ] Test complete OCR capture flow
- [ ] Test camera and photo library integration
- [ ] Test recipe form pre-filling
- [ ] Test confidence indicator display
- [ ] Test error handling scenarios
- [ ] Test navigation flows

#### Task 11.3: Performance Tests

- [ ] Test OCR processing speed
- [ ] Test memory usage during processing
- [ ] Test image processing performance
- [ ] Test worker thread performance
- [ ] Test UI responsiveness during OCR
- [ ] Validate success criteria performance targets

#### Task 11.4: Real-world Testing

- [ ] Test with various recipe formats
- [ ] Test with different lighting conditions
- [ ] Test with various fonts and text sizes
- [ ] Test with blurry or low-quality photos
- [ ] Test offline functionality
- [ ] Test on low-end devices

## Success Criteria Checklist

- [ ] User can capture and process a recipe photo in under 30 seconds
- [ ] OCR extracts recipe title with >75% success rate on clear printed recipes
- [ ] OCR extracts ingredients with >70% success rate (name, quantity, unit)
- [ ] OCR extracts instruction steps with >70% success rate
- [ ] Confidence indicators accurately highlight fields needing review
- [ ] User can edit all OCR-extracted fields before saving
- [ ] OCR processing doesn't block UI or cause app freeze
- [ ] Clear error messages with retry options for failed OCR
- [ ] Form pre-fills correctly with all extracted data
- [ ] Worker threads properly initialize and terminate without memory leaks
- [ ] Permission requests work correctly on iOS and Android
- [ ] Camera and photo library access function smoothly
- [ ] All navigation flows work without unexpected behavior
- [ ] Saved recipes from OCR match manual entry quality after review
- [ ] Zero crashes during OCR capture flow in testing

## Dependencies

- Local Storage Foundation (database schema and services)
- Recipe CRUD Operations (recipe form and validation)
- Recipe Repository UI (navigation integration)
- expo-image-picker package
- tesseract.js package
- Camera and photo library permissions

## Notes

- This is a complex feature requiring careful attention to performance and memory management
- Tesseract.js processing can be resource-intensive on mobile devices
- Focus on user experience during OCR processing with clear feedback
- Test thoroughly with various recipe formats and photo qualities
- Ensure proper error handling and recovery mechanisms
- Optimize for offline functionality and local processing
