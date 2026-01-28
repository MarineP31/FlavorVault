/**
 * Text Extractor Service
 * Wrapper around expo-text-extractor for OCR functionality
 *
 * Uses Google ML Kit on Android and Apple Vision on iOS.
 * @see https://github.com/zhanziyang/expo-text-extractor
 */

import { Platform } from 'react-native';
import {
  isSupported,
  extractTextFromImage as extractText,
  getSupportedLanguages as getLanguages,
  TextRecognitionScript,
  RecognitionLevel,
} from 'expo-text-extractor';

interface RecognitionOptions {
  script?: TextRecognitionScript;
  languages?: string[];
  automaticallyDetectsLanguage?: boolean;
  usesLanguageCorrection?: boolean;
  customWords?: string[];
  minimumTextHeight?: number;
  recognitionLevel?: RecognitionLevel;
}

export interface TextBlock {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ExtractionResult {
  text: string;
  blocks: TextBlock[];
  confidence: number;
  success: boolean;
  error?: string;
}

export interface ExtractionOptions {
  language?: 'auto' | 'french' | 'english' | 'multilingual';
  recognitionLevel?: 'fast' | 'accurate';
  customWords?: string[];
}

const EXTRACTION_TIMEOUT_MS = 30000;

const RECIPE_CUSTOM_WORDS = [
  'cuisson',
  'préparation',
  'ingrédients',
  'personnes',
  'préchauffer',
  'mélanger',
  'incorporer',
  'enfourner',
  'déguster',
  'cuillère',
  'café',
  'soupe',
  'beurre',
  'farine',
  'sucre',
  'oeufs',
  'œufs',
  'lait',
  'vanille',
  'pruneaux',
];

function buildRecognitionOptions(options?: ExtractionOptions): RecognitionOptions {
  const recognitionOptions: RecognitionOptions = {};

  if (Platform.OS === 'ios') {
    recognitionOptions.recognitionLevel =
      options?.recognitionLevel === 'fast' ? RecognitionLevel.FAST : RecognitionLevel.ACCURATE;
    recognitionOptions.usesLanguageCorrection = true;
    recognitionOptions.minimumTextHeight = 0.02;

    switch (options?.language) {
      case 'french':
        recognitionOptions.languages = ['fr-FR'];
        break;
      case 'english':
        recognitionOptions.languages = ['en-US'];
        break;
      case 'multilingual':
        recognitionOptions.languages = ['fr-FR', 'en-US', 'es-ES', 'de-DE', 'it-IT'];
        break;
      case 'auto':
      default:
        recognitionOptions.automaticallyDetectsLanguage = true;
        break;
    }

    recognitionOptions.customWords = [...RECIPE_CUSTOM_WORDS, ...(options?.customWords ?? [])];
  } else {
    recognitionOptions.script = TextRecognitionScript.LATIN;
  }

  return recognitionOptions;
}

export async function extractTextFromImage(
  imageUri: string,
  options?: ExtractionOptions
): Promise<ExtractionResult> {
  try {
    if (!isSupported) {
      return {
        text: '',
        blocks: [],
        confidence: 0,
        success: false,
        error:
          'Text extraction is not supported. Please run a development build (not Expo Go) to use OCR.',
      };
    }

    const recognitionOptions = buildRecognitionOptions(options);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('OCR extraction timed out')), EXTRACTION_TIMEOUT_MS);
    });

    const extractionPromise = extractText(imageUri, recognitionOptions);
    const result = await Promise.race([extractionPromise, timeoutPromise]);

    if (!result || !Array.isArray(result) || result.length === 0) {
      return {
        text: '',
        blocks: [],
        confidence: 0,
        success: false,
        error: 'No text extracted from image',
      };
    }

    const text = result.join('\n');

    const blocks: TextBlock[] = result.map((line, index) => ({
      text: line,
      confidence: 0.8,
      boundingBox: { x: 0, y: index * 20, width: 100, height: 20 },
    }));

    if (!text || text.trim().length === 0) {
      return {
        text: '',
        blocks: [],
        confidence: 0,
        success: false,
        error: 'No readable text found in image',
      };
    }

    const avgLineLength = text.length / result.length;
    const hasRecipeKeywords = /ingredient|instruction|prep|cook|cuisson|préparation/i.test(text);
    const hasNumbers = /\d+\s*(?:g|kg|ml|l|min|cup|tsp|tbsp)/i.test(text);

    let confidence = 0.5;
    if (avgLineLength > 10) confidence += 0.15;
    if (result.length > 3) confidence += 0.1;
    if (hasRecipeKeywords) confidence += 0.15;
    if (hasNumbers) confidence += 0.1;

    return {
      text,
      blocks,
      confidence: Math.min(confidence, 0.95),
      success: true,
    };
  } catch (error) {
    console.error('OCR extraction error:', error);
    return {
      text: '',
      blocks: [],
      confidence: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown OCR error occurred',
    };
  }
}

export async function getSupportedLanguages(): Promise<string[]> {
  try {
    return await getLanguages();
  } catch (error) {
    console.error('Failed to get supported languages:', error);
    return [];
  }
}

export function isOcrSupported(): boolean {
  return isSupported;
}

export function isLowConfidence(confidence: number): boolean {
  return confidence < 0.6;
}

export function isMediumConfidence(confidence: number): boolean {
  return confidence >= 0.6 && confidence < 0.8;
}

export function isHighConfidence(confidence: number): boolean {
  return confidence >= 0.8;
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (isHighConfidence(confidence)) return 'high';
  if (isMediumConfidence(confidence)) return 'medium';
  return 'low';
}
