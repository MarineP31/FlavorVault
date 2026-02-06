/**
 * Image processing utilities for recipe images
 * Handles optimization, storage, and cleanup
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { v4 as uuidv4 } from 'uuid';

/**
 * Image optimization options
 */
export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Default image optimization settings
 */
const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 1200,
  quality: 0.8,
  format: 'jpeg',
};

/**
 * Optimize and compress an image
 */
export async function optimizeImage(
  uri: string,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  try {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Get image info to check dimensions
    const imageInfo = await FileSystem.getInfoAsync(uri);
    if (!imageInfo.exists) {
      throw new Error('Image file does not exist');
    }

    // Resize image if needed
    const actions: ImageManipulator.Action[] = [];

    if (opts.maxWidth || opts.maxHeight) {
      actions.push({
        resize: {
          width: opts.maxWidth,
          height: opts.maxHeight,
        },
      });
    }

    // Manipulate image
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      {
        compress: opts.quality,
        format: getImageFormat(opts.format),
      }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error(`Failed to optimize image: ${error}`);
  }
}

/**
 * Convert format string to ImageManipulator format
 */
function getImageFormat(
  format?: 'jpeg' | 'png' | 'webp'
): ImageManipulator.SaveFormat {
  switch (format) {
    case 'png':
      return ImageManipulator.SaveFormat.PNG;
    case 'webp':
      return ImageManipulator.SaveFormat.WEBP;
    case 'jpeg':
    default:
      return ImageManipulator.SaveFormat.JPEG;
  }
}

/**
 * Generate unique filename for image
 */
export function generateImageFilename(extension: string = 'jpg'): string {
  const uuid = uuidv4();
  return `recipe_${uuid}.${extension}`;
}

/**
 * Get the app's document directory for image storage
 */
export function getImageStorageDirectory(): string {
  const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  return baseDir.endsWith('/') ? `${baseDir}recipe_images/` : `${baseDir}/recipe_images/`;
}

/**
 * Ensure image storage directory exists
 */
export async function ensureImageDirectoryExists(): Promise<void> {
  const dir = getImageStorageDirectory();
  const dirInfo = await FileSystem.getInfoAsync(dir);

  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

/**
 * Save image to app's document directory
 */
export async function saveImageToStorage(
  sourceUri: string,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  try {
    // Ensure directory exists
    await ensureImageDirectoryExists();

    // Optimize image
    const optimizedUri = await optimizeImage(sourceUri, options);

    // Generate filename
    const filename = generateImageFilename(options.format || 'jpg');
    const destinationUri = `${getImageStorageDirectory()}${filename}`;

    // Copy optimized image to storage
    await FileSystem.copyAsync({
      from: optimizedUri,
      to: destinationUri,
    });

    // Clean up temporary optimized file if it's different from source
    if (optimizedUri !== sourceUri) {
      try {
        await FileSystem.deleteAsync(optimizedUri, { idempotent: true });
      } catch (error) {
        console.warn('Failed to delete temporary file:', error);
      }
    }

    return destinationUri;
  } catch (error) {
    console.error('Error saving image to storage:', error);
    throw new Error(`Failed to save image: ${error}`);
  }
}

/**
 * Delete image from storage
 */
export async function deleteImageFromStorage(uri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error(`Failed to delete image: ${error}`);
  }
}

/**
 * Get image file size in bytes
 */
export async function getImageSize(uri: string): Promise<number> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (fileInfo.exists && 'size' in fileInfo) {
      return fileInfo.size;
    }

    return 0;
  } catch (error) {
    console.error('Error getting image size:', error);
    return 0;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if URI is a valid image file
 */
export async function isValidImageUri(uri: string): Promise<boolean> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists;
  } catch (error) {
    return false;
  }
}

/**
 * Clean up orphaned images (images not referenced by any recipe)
 * This should be called periodically or as part of maintenance
 */
export async function cleanupOrphanedImages(
  referencedUris: string[]
): Promise<number> {
  try {
    const dir = getImageStorageDirectory();
    const dirInfo = await FileSystem.getInfoAsync(dir);

    if (!dirInfo.exists) {
      return 0;
    }

    const files = await FileSystem.readDirectoryAsync(dir);
    let deletedCount = 0;

    for (const file of files) {
      const fileUri = dir.endsWith('/') ? `${dir}${file}` : `${dir}/${file}`;

      const isReferenced = referencedUris.some((uri) => uri === fileUri);

      if (!isReferenced) {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        deletedCount++;
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up orphaned images:', error);
    return 0;
  }
}

/**
 * Get total size of all stored images
 */
export async function getTotalImageStorageSize(): Promise<number> {
  try {
    const dir = getImageStorageDirectory();
    const dirInfo = await FileSystem.getInfoAsync(dir);

    if (!dirInfo.exists) {
      return 0;
    }

    const files = await FileSystem.readDirectoryAsync(dir);
    let totalSize = 0;

    for (const file of files) {
      const fileUri = dir.endsWith('/') ? `${dir}${file}` : `${dir}/${file}`;
      const size = await getImageSize(fileUri);
      totalSize += size;
    }

    return totalSize;
  } catch (error) {
    console.error('Error calculating total image storage size:', error);
    return 0;
  }
}
