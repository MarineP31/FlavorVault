/**
 * OCR Module Exports
 */

export {
  extractTextFromImage,
  getSupportedLanguages,
  isOcrSupported,
  isLowConfidence,
  isMediumConfidence,
  isHighConfidence,
  getConfidenceLevel,
  type TextBlock,
  type ExtractionResult,
  type ExtractionOptions,
  type ConfidenceLevel,
} from './text-extractor-service';

export * from './recipe-parser';
export * from './ingredient-parser';
export * from './confidence-scorer';
