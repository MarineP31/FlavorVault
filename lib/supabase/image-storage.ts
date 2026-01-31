import { v4 as uuidv4 } from 'uuid';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase, getCurrentUserId, SupabaseError } from './client';
import { optimizeImage } from '@/lib/utils/image-processor';

const BUCKET_NAME = 'recipe-images';

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

async function readImageAsBase64(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}

export async function uploadRecipeImage(localUri: string): Promise<string> {
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

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new SupabaseError('UPLOAD_FAILED', `Failed to upload image: ${uploadError.message}`);
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
    throw new SupabaseError(
      'UPLOAD_FAILED',
      `Failed to upload recipe image: ${error}`,
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

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new SupabaseError('DELETE_FAILED', `Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof SupabaseError) throw error;
    throw new SupabaseError(
      'DELETE_FAILED',
      `Failed to delete recipe image: ${error}`,
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
