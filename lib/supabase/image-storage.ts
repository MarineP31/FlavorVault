import { v4 as uuidv4 } from 'uuid';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase, getCurrentUserId, SupabaseError } from './client';
import { optimizeImage, formatFileSize } from '@/lib/utils/image-processor';
import { VALIDATION_CONSTRAINTS } from '@/constants/enums';

const BUCKET_NAME = 'recipe-images';

export type ImageErrorCode =
  | 'IMAGE_TOO_LARGE'
  | 'IMAGE_NOT_FOUND'
  | 'UPLOAD_FAILED'
  | 'NETWORK_ERROR'
  | 'DELETE_FAILED';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: ImageErrorCode;
  fileSize?: number;
}

export function isLocalFileUri(uri: string | null | undefined): boolean {
  if (!uri) return false;
  return (
    uri.startsWith('file://') ||
    uri.startsWith('/') ||
    uri.startsWith(FileSystem.documentDirectory || '') ||
    uri.startsWith(FileSystem.cacheDirectory || '')
  );
}

export function isSupabaseStorageUrl(uri: string | null | undefined): boolean {
  if (!uri) return false;
  return uri.includes('supabase') && uri.includes('/storage/');
}

export async function validateImageFile(uri: string): Promise<ImageValidationResult> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      return {
        valid: false,
        error: 'Image file not found. Please select another image.',
        errorCode: 'IMAGE_NOT_FOUND',
      };
    }

    const fileSize = 'size' in fileInfo ? fileInfo.size : 0;

    if (fileSize > VALIDATION_CONSTRAINTS.IMAGE_MAX_FILE_SIZE) {
      const maxSizeFormatted = formatFileSize(VALIDATION_CONSTRAINTS.IMAGE_MAX_FILE_SIZE);
      const actualSizeFormatted = formatFileSize(fileSize);
      return {
        valid: false,
        error: `Image is too large (${actualSizeFormatted}). Maximum size is ${maxSizeFormatted}.`,
        errorCode: 'IMAGE_TOO_LARGE',
        fileSize,
      };
    }

    return { valid: true, fileSize };
  } catch (error) {
    return {
      valid: false,
      error: 'Unable to read image file. Please try again.',
      errorCode: 'IMAGE_NOT_FOUND',
    };
  }
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('fetch') ||
      message.includes('socket')
    );
  }
  return false;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isNetworkError(error) || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

async function readImageAsBase64(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}

export async function uploadRecipeImage(localUri: string): Promise<string> {
  const validation = await validateImageFile(localUri);
  if (!validation.valid) {
    throw new SupabaseError(
      validation.errorCode || 'UPLOAD_FAILED',
      validation.error || 'Invalid image file'
    );
  }

  try {
    const userId = await getCurrentUserId();

    const optimizedUri = await optimizeImage(localUri, {
      maxWidth: 1200,
      quality: 0.8,
      format: 'jpeg',
    });

    const base64Data = await readImageAsBase64(optimizedUri);
    const arrayBuffer = decode(base64Data);

    const filename = `${userId}/${uuidv4()}.jpg`;

    const uploadResult = await withRetry(async () => {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filename, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      return true;
    });

    if (!uploadResult) {
      throw new SupabaseError('UPLOAD_FAILED', 'Failed to upload image after multiple attempts');
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);

    if (optimizedUri !== localUri) {
      try {
        await FileSystem.deleteAsync(optimizedUri, { idempotent: true });
      } catch {
        // Ignore cleanup errors
      }
    }

    return urlData.publicUrl;
  } catch (error) {
    if (error instanceof SupabaseError) throw error;

    if (isNetworkError(error)) {
      throw new SupabaseError(
        'NETWORK_ERROR',
        'Network error. Please check your connection and try again.',
        error
      );
    }

    throw new SupabaseError(
      'UPLOAD_FAILED',
      'Failed to upload image. Please try again.',
      error
    );
  }
}

function extractStoragePath(imageUrl: string): string | null {
  try {
    const match = imageUrl.match(/\/storage\/v1\/object\/public\/recipe-images\/(.+)$/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    return null;
  } catch {
    return null;
  }
}

export async function deleteRecipeImage(imageUrl: string): Promise<void> {
  if (!isSupabaseStorageUrl(imageUrl)) {
    return;
  }

  try {
    const filePath = extractStoragePath(imageUrl);
    if (!filePath) {
      console.warn('Could not extract file path from URL:', imageUrl);
      return;
    }

    await withRetry(async () => {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof SupabaseError) throw error;

    if (isNetworkError(error)) {
      throw new SupabaseError(
        'NETWORK_ERROR',
        'Network error while deleting image. Please check your connection.',
        error
      );
    }

    throw new SupabaseError(
      'DELETE_FAILED',
      'Failed to delete image. Please try again.',
      error
    );
  }
}

export async function uploadImageIfLocal(
  imageUri: string | null | undefined
): Promise<string | null> {
  if (!imageUri) return null;

  if (isLocalFileUri(imageUri)) {
    return await uploadRecipeImage(imageUri);
  }

  return imageUri;
}
